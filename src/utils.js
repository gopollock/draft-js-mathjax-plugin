import {
  getDefaultKeyBinding,
  KeyBindingUtil,
  EditorState,
} from 'draft-js';

import { insertTeX } from './modifiers/insertTeX';

const { hasCommandModifier } = KeyBindingUtil;

export const insertTeXToState = (
  getEditorState,
  setEditorState,
  block = false
) => {
  const editorState = getEditorState();
  setEditorState(
    insertTeX(editorState, block),
  );
};

const KEY_CODES = {
  m: 77,
  l: 76
};

export const myKeyBindingFn = (getEditorState, setEditorState) => (e) => {
  if (e.keyCode === KEY_CODES.m && hasCommandModifier(e)) {
    return 'insert-texblock';
  }

  if (e.key === '$') {
    const c = getEditorState().getCurrentContent();
    const s = getEditorState().getSelection();
    const bk = s.getStartKey();
    const b = c.getBlockForKey(bk);
    const offset = s.getStartOffset() - 1;
    if (b.getText()[offset] === '\\') {
      return `insert-char-${e.key}`;
    }
  }

  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    const d = e.key === 'ArrowRight' ? 'r' : 'l';
    const s = getEditorState().getSelection();
    const c = getEditorState().getCurrentContent();
    if (!s.isCollapsed()) { return undefined; }
    const offset = s.getStartOffset();
    const blockKey = s.getStartKey();
    const cb = c.getBlockForKey(blockKey);
    if (cb.getLength() === offset && d === 'r') {
      const b = c.getBlockAfter(blockKey);
      if (b && b.getType() === 'atomic' && b.getData().get('mathjax')) { return `update-texblock-${d}-${b.getKey()}`; }
    }
    if (offset === 0 && d === 'l') {
      const b = c.getBlockBefore(blockKey);
      if (b && b.getType() === 'atomic' && b.getData().get('mathjax')) { return `update-texblock-${d}-${b.getKey()}`; }
    }
    const ek = cb.getEntityAt(offset - (e.key === 'ArrowLeft' ? 1 : 0));
    if (ek && c.getEntity(ek).getType() === 'INLINETEX') {
      return `update-inlinetex-${d}-${ek}`;
    }
  }

  if (e.keyCode === KEY_CODES.l && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    insertTeXToState(getEditorState, setEditorState, false)
  }

  return getDefaultKeyBinding(e);
};

export function findInlineTeXEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'INLINETEX'
      );
    },
    callback,
  );
}

export function changeDecorator(editorState, decorator) {
  return EditorState.create({
    allowUndo: true,
    currentContent: editorState.getCurrentContent(),
    decorator,
    selection: editorState.getSelection(),
  });
}
