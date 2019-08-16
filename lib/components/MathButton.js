'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MathButton = function (_React$Component) {
  _inherits(MathButton, _React$Component);

  function MathButton() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, MathButton);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = MathButton.__proto__ || Object.getPrototypeOf(MathButton)).call.apply(_ref, [this].concat(args))), _this), _this.handleClick = function (e) {
      e.preventDefault();
      e.stopPropagation();

      _this.props._insertTeX();
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(MathButton, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        { className: this.props.className, onClick: this.handleClick },
        _react2.default.createElement(
          'svg',
          { width: '21px', height: '14px', viewBox: '0 0 21 14' },
          _react2.default.createElement(
            'g',
            { stroke: 'none', strokeWidth: '1', fill: 'none', fillRule: 'evenodd' },
            _react2.default.createElement(
              'g',
              { transform: 'translate(-826.000000, -275.000000)' },
              _react2.default.createElement(
                'g',
                { transform: 'translate(824.000000, 270.000000)' },
                _react2.default.createElement(
                  'g',
                  null,
                  _react2.default.createElement('polygon', { fill: '#8BA1AB', points: '15.9941406 13.734375 17.4882812 11.6601562 19.1113281 11.6601562 16.6855469 14.8476562 18.0976562 18 16.6445312 18 15.7597656 15.8378906 14.2011719 18 12.5839844 18 15.0859375 14.71875 13.7207031 11.6601562 15.1738281 11.6601562' }),
                  _react2.default.createElement('polygon', { fill: '#8BA1AB', fillRule: 'nonzero', points: '3.40466915 12.0071523 7.04145304 19 12.635831 7 22.0155048 7 22.0155048 5 11.3977788 5 6.90112554 14.796651 4.55223633 10.0071523 2 10.0071523 2 12.0071523' })
                )
              )
            )
          )
        )
      );
    }
  }]);

  return MathButton;
}(_react2.default.Component);

exports.default = MathButton;


MathButton.propTypes = {
  className: _propTypes2.default.string,
  _insertTeX: _propTypes2.default.func
};