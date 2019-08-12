import { Modifier, genKey, EditorState, ContentBlock, BlockMapBuilder } from 'draft-js';
import { isAtEndOfBlock, isAtEndOfContent, isCurrentBlockEmpty } from './utils';

export default function customInsertAtomicBlock(
  editorState,
  data,
) {
  const contentState = editorState.getCurrentContent();
  const selectionState = editorState.getSelection();

  const afterRemoval = Modifier.removeRange(
    contentState,
    selectionState,
    'backward',
  );

  const targetSelection = afterRemoval.getSelectionAfter();

  const currentBlockEmpty = isCurrentBlockEmpty(afterRemoval, targetSelection);
  const atEndOfBlock = isAtEndOfBlock(afterRemoval, targetSelection);
  const atEndOfContent = isAtEndOfContent(afterRemoval, targetSelection);

  const afterSplit = !currentBlockEmpty || atEndOfContent ?
    Modifier.splitBlock(afterRemoval, targetSelection) :
    afterRemoval;
  const insertionTarget = afterSplit.getSelectionAfter();

  const asAtomicBlock = Modifier.setBlockType(
    afterSplit,
    insertionTarget,
    'atomic'
  );

  const fragmentArray = [
    new ContentBlock({
      key: genKey(),
      type: 'atomic',
      data
    }),
  ];

  if (!atEndOfBlock || atEndOfContent) {
    fragmentArray.push(new ContentBlock({
      key: genKey(),
      type: 'unstyled'
    }));
  }

  const fragment = BlockMapBuilder.createFromArray(fragmentArray);

  const withAtomicBlock = Modifier.replaceWithFragment(
    asAtomicBlock,
    insertionTarget,
    fragment,
  );

  const newContent = withAtomicBlock.merge({
    selectionBefore: selectionState,
    selectionAfter: withAtomicBlock.getSelectionAfter().set('hasFocus', false),
  });

  return EditorState.push(editorState, newContent, 'insert-fragment');
}
