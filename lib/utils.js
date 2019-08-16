'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.myKeyBindingFn = exports.insertTeXToState = undefined;
exports.findInlineTeXEntities = findInlineTeXEntities;
exports.changeDecorator = changeDecorator;

var _draftJs = require('draft-js');

var _insertTeX = require('./modifiers/insertTeX');

var hasCommandModifier = _draftJs.KeyBindingUtil.hasCommandModifier;
var insertTeXToState = exports.insertTeXToState = function insertTeXToState(getEditorState, setEditorState) {
  var block = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var editorState = getEditorState();
  setEditorState((0, _insertTeX.insertTeX)(editorState, block));
};

var KEY_CODES = {
  m: 77,
  l: 76
};

var myKeyBindingFn = exports.myKeyBindingFn = function myKeyBindingFn(getEditorState, setEditorState) {
  return function (e) {
    if (e.keyCode === KEY_CODES.m && hasCommandModifier(e)) {
      return 'insert-texblock';
    }

    if (e.key === '$') {
      var c = getEditorState().getCurrentContent();
      var s = getEditorState().getSelection();
      var bk = s.getStartKey();
      var b = c.getBlockForKey(bk);
      var offset = s.getStartOffset() - 1;
      if (b.getText()[offset] === '\\') {
        return 'insert-char-' + e.key;
      }
    }

    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      var d = e.key === 'ArrowRight' ? 'r' : 'l';
      var _s = getEditorState().getSelection();
      var _c = getEditorState().getCurrentContent();
      if (!_s.isCollapsed()) {
        return undefined;
      }
      var _offset = _s.getStartOffset();
      var blockKey = _s.getStartKey();
      var cb = _c.getBlockForKey(blockKey);
      if (cb.getLength() === _offset && d === 'r') {
        var _b = _c.getBlockAfter(blockKey);
        if (_b && _b.getType() === 'atomic' && _b.getData().get('mathjax')) {
          return 'update-texblock-' + d + '-' + _b.getKey();
        }
      }
      if (_offset === 0 && d === 'l') {
        var _b2 = _c.getBlockBefore(blockKey);
        if (_b2 && _b2.getType() === 'atomic' && _b2.getData().get('mathjax')) {
          return 'update-texblock-' + d + '-' + _b2.getKey();
        }
      }
      var ek = cb.getEntityAt(_offset - (e.key === 'ArrowLeft' ? 1 : 0));
      if (ek && _c.getEntity(ek).getType() === 'INLINETEX') {
        return 'update-inlinetex-' + d + '-' + ek;
      }
    }

    // insert TeX on `ctrl/cmd+l` shortcut
    if (e.keyCode === KEY_CODES.l && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      insertTeXToState(getEditorState, setEditorState, false);
    }

    return (0, _draftJs.getDefaultKeyBinding)(e);
  };
};

function findInlineTeXEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(function (character) {
    var entityKey = character.getEntity();
    return entityKey !== null && contentState.getEntity(entityKey).getType() === 'INLINETEX';
  }, callback);
}

function changeDecorator(editorState, decorator) {
  return _draftJs.EditorState.create({
    allowUndo: true,
    currentContent: editorState.getCurrentContent(),
    decorator: decorator,
    selection: editorState.getSelection()
  });
}