'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createMathjaxPlugin = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _draftJs = require('draft-js');

var _decorateComponentWithProps = require('decorate-component-with-props');

var _decorateComponentWithProps2 = _interopRequireDefault(_decorateComponentWithProps);

var _utils = require('./utils');

var _loadMathJax = require('./mathjax/loadMathJax');

var _completion = require('./mathjax/completion');

var _InlineTeX = require('./components/InlineTeX');

var _InlineTeX2 = _interopRequireDefault(_InlineTeX);

var _TeXBlock = require('./components/TeXBlock');

var _TeXBlock2 = _interopRequireDefault(_TeXBlock);

var _MathButton = require('./components/MathButton');

var _MathButton2 = _interopRequireDefault(_MathButton);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createMathjaxPlugin = exports.createMathjaxPlugin = function createMathjaxPlugin() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var _Object$assign = Object.assign(_loadMathJax.defaultConfig, config),
      macros = _Object$assign.macros,
      completion = _Object$assign.completion,
      helpLink = _Object$assign.helpLink;

  (0, _loadMathJax.loadMathJax)();

  //store values get updated on initialize call
  var store = {
    getEditorState: undefined,
    setEditorState: undefined,
    getReadOnly: undefined,
    setReadOnly: undefined,
    getEditorRef: undefined,
    completion: (0, _completion.initCompletion)(completion, macros),
    teXToUpdate: {}
  };

  var initialize = function initialize(pluginStateFunctions) {
    store = _extends({}, store, pluginStateFunctions, {
      completion: store.completion(pluginStateFunctions.getEditorState())
    });
  };

  // this is the function that opens the editor. gets invoked when button with tex symbol is clicked
  var _insertTeX = function _insertTeX() {
    var block = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var _store = store,
        getEditorState = _store.getEditorState,
        setEditorState = _store.setEditorState;

    if (getEditorState && setEditorState) {
      (0, _utils.insertTeXToState)(getEditorState, setEditorState, block);
    }
  };

  var insertChar = function insertChar(char) {
    var editorState = store.getEditorState();
    var sel = editorState.getSelection();
    var offset = sel.getStartOffset() - 1;
    var newContentState = _draftJs.Modifier.replaceText(editorState.getCurrentContent(), sel.merge({
      anchorOffset: offset,
      focusOffset: offset + 1
    }), char);
    store.setEditorState(_draftJs.EditorState.push(editorState, newContentState, 'insert-characters'));
  };

  var keyBindingFn = function keyBindingFn(e, _ref) {
    var getEditorState = _ref.getEditorState,
        setEditorState = _ref.setEditorState;
    return (0, _utils.myKeyBindingFn)(getEditorState, setEditorState)(e);
  };

  var blockRendererFn = function blockRendererFn(block) {
    if (block.getType() === 'atomic' && block.getData().get('mathjax')) {
      return {
        component: _TeXBlock2.default,
        editable: false,
        props: { getStore: function getStore() {
            return store;
          } }
      };
    }
    return null;
  };

  var updateTeX = function updateTeX(key, dir) {
    store.teXToUpdate = { key: key, dir: dir };
    var editorState = store.getEditorState();
    store.setEditorState(_draftJs.EditorState.forceSelection(editorState, editorState.getSelection()));
  };

  var handleKeyCommand = function handleKeyCommand(command) {
    if (command === 'insert-texblock') {
      _insertTeX(true);
      return 'handled';
    }
    if (command === 'insert-inlinetex') {
      _insertTeX();
      return 'handled';
    }
    if (command.slice(0, 16) === 'update-inlinetex') {
      var dir = command.slice(17, 18);
      var entityKey = command.slice(19);
      updateTeX(entityKey, dir);
      return 'handled';
    }
    if (command.slice(0, 15) === 'update-texblock') {
      var _dir = command.slice(16, 17);
      var blockKey = command.slice(18);

      updateTeX(blockKey, _dir);
      return 'handled';
    }
    if (command.slice(0, 11) === 'insert-char') {
      var char = command.slice(12);
      insertChar(char);
      return 'handled';
    }
    return 'not-handled';
  };

  return {
    initialize: initialize,
    decorators: [{
      strategy: _utils.findInlineTeXEntities,
      component: _InlineTeX2.default,
      props: {
        helpLink: helpLink,
        getStore: function getStore() {
          return store;
        }
      }
    }],
    keyBindingFn: keyBindingFn,
    handleKeyCommand: handleKeyCommand,
    blockRendererFn: blockRendererFn,
    MathButton: (0, _decorateComponentWithProps2.default)(_MathButton2.default, { _insertTeX: _insertTeX })
  };
};