'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = customInsertAtomicBlock;

var _draftJs = require('draft-js');

var _utils = require('./utils');

function customInsertAtomicBlock(editorState, data) {
  var contentState = editorState.getCurrentContent();
  var selectionState = editorState.getSelection();

  var afterRemoval = _draftJs.Modifier.removeRange(contentState, selectionState, 'backward');

  var targetSelection = afterRemoval.getSelectionAfter();

  var currentBlockEmpty = (0, _utils.isCurrentBlockEmpty)(afterRemoval, targetSelection);
  var atEndOfBlock = (0, _utils.isAtEndOfBlock)(afterRemoval, targetSelection);
  var atEndOfContent = (0, _utils.isAtEndOfContent)(afterRemoval, targetSelection);

  var afterSplit = !currentBlockEmpty || atEndOfContent ? _draftJs.Modifier.splitBlock(afterRemoval, targetSelection) : afterRemoval;
  var insertionTarget = afterSplit.getSelectionAfter();

  var asAtomicBlock = _draftJs.Modifier.setBlockType(afterSplit, insertionTarget, 'atomic');

  var fragmentArray = [new _draftJs.ContentBlock({
    key: (0, _draftJs.genKey)(),
    type: 'atomic',
    data: data
  })];

  if (!atEndOfBlock || atEndOfContent) {
    fragmentArray.push(new _draftJs.ContentBlock({
      key: (0, _draftJs.genKey)(),
      type: 'unstyled'
    }));
  }

  var fragment = _draftJs.BlockMapBuilder.createFromArray(fragmentArray);

  var withAtomicBlock = _draftJs.Modifier.replaceWithFragment(asAtomicBlock, insertionTarget, fragment);

  var newContent = withAtomicBlock.merge({
    selectionBefore: selectionState,
    selectionAfter: withAtomicBlock.getSelectionAfter().set('hasFocus', false)
  });

  return _draftJs.EditorState.push(editorState, newContent, 'insert-fragment');
}