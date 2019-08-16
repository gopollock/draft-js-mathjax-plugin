'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _isAlpha = function _isAlpha(key) {
  return key.length === 1 && /[a-z]/.test(key.toLowerCase());
};

function indent(_ref) {
  var text = _ref.text,
      start = _ref.start,
      end = _ref.end;
  var unindent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var nl0 = text.slice(0, start).split('\n').length - 1;
  var nl1 = nl0 + (text.slice(start, end).split('\n').length - 1);
  var nStart = start;
  var nEnd = end;
  var nText = text.split('\n').map(function (l, i) {
    if (i < nl0 || i > nl1) {
      return l;
    }
    if (!unindent) {
      if (i === nl0) {
        nStart += 2;
      }
      nEnd += 2;
      return '  ' + l;
    }
    if (l.startsWith('  ')) {
      if (i === nl0) {
        nStart -= 2;
      }
      nEnd -= 2;
      return l.slice(2);
    }
    if (l.startsWith(' ')) {
      if (i === nl0) {
        nStart -= 1;
      }
      nEnd -= 1;
      return l.slice(1);
    }
    return l;
  }).join('\n');
  return { text: nText, start: nStart, end: nEnd };
}

var closeDelim = {
  '{': '}',
  '(': ')',
  '[': ']',
  '|': '|'
};

var TeXInput = function (_React$Component) {
  _inherits(TeXInput, _React$Component);

  function TeXInput(props) {
    _classCallCheck(this, TeXInput);

    var _this = _possibleConstructorReturn(this, (TeXInput.__proto__ || Object.getPrototypeOf(TeXInput)).call(this, props));

    _initialiseProps.call(_this);

    var onChange = props.onChange,
        caretPosFn = props.caretPosFn;


    var pos = caretPosFn();
    _this.state = {
      start: pos,
      end: pos
    };

    _this.completionList = [];
    // index of the current autosuggestion visible from the whole list of suggestions
    _this.index = 0;

    _this._onChange = function () {
      return onChange({
        teX: _this.teXinput.value
      });
    };

    _this._onSelect = function () {
      var _this$teXinput = _this.teXinput,
          start = _this$teXinput.selectionStart,
          end = _this$teXinput.selectionEnd;

      _this.setState({ start: start, end: end });
    };

    _this._insertText = function (text) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var value = _this.props.teX;
      var _this$state = _this.state,
          start = _this$state.start,
          end = _this$state.end;

      value = value.slice(0, start) + text + value.slice(end);
      start += text.length + offset;
      if (start < 0) {
        start = 0;
      } else if (start > value.length) {
        start = value.length;
      }
      end = start;
      onChange({ teX: value });
      _this.setState({ start: start, end: end });
    };

    _this.onBlur = function () {};
    return _this;
  }

  _createClass(TeXInput, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      var _state = this.state,
          start = _state.start,
          end = _state.end;

      setTimeout(function () {
        if (_this2.teXinput) {
          _this2.teXinput.focus();
          _this2.teXinput.setSelectionRange(start, end);
        }
      }, 0);
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      if (this.props.teX !== nextProps.teX) {
        return true;
      }
      var start = nextState.start,
          end = nextState.end;
      var _teXinput = this.teXinput,
          selectionStart = _teXinput.selectionStart,
          selectionEnd = _teXinput.selectionEnd;

      return start !== selectionStart || end !== selectionEnd;
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      var _state2 = this.state,
          start = _state2.start,
          end = _state2.end;

      if (prevState.start !== start || prevState.end !== end) {
        this.teXinput.setSelectionRange(start, end);
      }
    }
  }, {
    key: '_handleCompletion',
    value: function _handleCompletion(evt) {
      var _this3 = this;

      var _props = this.props,
          completion = _props.completion,
          teX = _props.teX,
          onChange = _props.onChange;
      var _state3 = this.state,
          start = _state3.start,
          end = _state3.end;

      var key = evt.key;
      var prefix = completion.getLastTeXCommand(teX.slice(0, start));
      var pl = prefix.length;
      var startCmd = start - pl;
      var isAlpha = _isAlpha(key);
      var ns = start;
      var offset = void 0;

      if (!pl) {
        return;
      }

      if (isAlpha || evt.ctrlKey && key === ' ') {
        this.completionList = completion.computeCompletionList(prefix + (isAlpha ? key : ''));
      }

      var L = this.completionList.length;

      var SWITCH_TO_NEXT_SUGGESTION = 'Tab';

      if (L === 0) {
        return;
      }

      if (key === SWITCH_TO_NEXT_SUGGESTION) {
        offset = evt.shiftKey ? -1 : 1;
        this.index += offset;
        this.index = this.index === -1 ? L - 1 : this.index % L;
      } else {
        this.index = 0;
        ns = isAlpha ? ns + 1 : ns;
      }
      var cmd = this.completionList[this.index];
      var endCmd = startCmd + cmd.length;
      var teXUpdated = teX.slice(0, startCmd) + cmd + teX.slice(end);

      //uncomment to turn on annoying jump to end of suggestion
      //ns = L === 1 ? endCmd : ns;

      evt.preventDefault();
      onChange({ teX: teXUpdated });
      setTimeout(function () {
        return _this3.setState({
          start: ns,
          end: endCmd
        });
      }, 0);
    }
  }, {
    key: 'render',
    value: function render() {
      var _props2 = this.props,
          teX = _props2.teX,
          finishEdit = _props2.finishEdit;

      var teXArray = teX.split('\n');
      var rows = teXArray.length;
      var cols = teXArray.map(function (tl) {
        return tl.length;
      }).reduce(function (acc, size) {
        return size > acc ? size : acc;
      }, 1);

      return _react2.default.createElement(
        'div',
        { className: 'mathjax-input-container' },
        _react2.default.createElement(
          'a',
          {
            className: 'mathjax-help',
            target: '_blank',
            href: this.props.helpLink.url
          },
          _react2.default.createElement(
            'span',
            null,
            this.props.helpLink.message
          )
        ),
        _react2.default.createElement('textarea', {
          rows: rows,
          cols: cols,
          className: 'mathjax-textarea',
          value: teX,
          onChange: this._onChange,
          onSelect: this._onSelect,
          onBlur: this.onBlur,
          onKeyDown: this.handleKey,
          ref: this.handleTexRef,
          placeholder: 'Example: x^2 + \\frac{1}{2}x + \\sqrt{24} = 0'
        }),
        _react2.default.createElement(
          'div',
          { className: 'mathjax-actions' },
          _react2.default.createElement(
            'button',
            { onClick: finishEdit, className: 'mathjax-action mathjax-done' },
            'Done'
          )
        )
      );
    }
  }]);

  return TeXInput;
}(_react2.default.Component);

var _initialiseProps = function _initialiseProps() {
  var _this4 = this;

  this.handleKey = function (evt) {
    var _props3 = _this4.props,
        teX = _props3.teX,
        finishEdit = _props3.finishEdit,
        onChange = _props3.onChange,
        displaystyle = _props3.displaystyle,
        completion = _props3.completion;
    var _state4 = _this4.state,
        start = _state4.start,
        end = _state4.end;

    var inlineMode = displaystyle !== undefined;
    var isCompletionDisabled = completion.status === 'none';
    var key = evt.key;

    if (!isCompletionDisabled && key !== 'Tab' && key !== 'Shift') {
      _this4.completionList = [];
      _this4.index = 0;
    }

    if (key === 'Escape') {
      evt.preventDefault();
      evt.stopPropagation();
      return finishEdit(1);
    }

    if (!!(0, _lodash.get)(closeDelim, key)) {
      evt.preventDefault();
      return _this4._insertText(key + closeDelim[key], -1);
    }

    if (!isCompletionDisabled && (_isAlpha(key) && completion.status === 'auto' || key === 'Tab' && _this4.completionList.length > 1 || completion.status === 'manual' && evt.ctrlKey && key === ' ')) {
      return _this4._handleCompletion(evt);
    }

    if (key === 'Tab') {
      evt.preventDefault();
      var lines = teX.split('\n');
      if (inlineMode || lines.length <= 1) {
        return finishEdit(evt.shiftKey ? 0 : 1);
      } else {
        var _indent = indent({ text: teX, start: start, end: end }, evt.shiftKey),
            text = _indent.text,
            newStart = _indent.start,
            newEnd = _indent.end;

        onChange({ teX: text });
        setTimeout(function () {
          return _this4.setState({
            start: newStart,
            end: newEnd
          });
        }, 0);
      }
    }
  };

  this.handleTexRef = function (ref) {
    if (ref) _this4.teXinput = ref;
  };
};

exports.default = TeXInput;