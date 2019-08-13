import { EditorState, Modifier } from 'draft-js';
import decorateComponentWithProps from 'decorate-component-with-props';
import {
  myKeyBindingFn,
  findInlineTeXEntities,
  insertTeXToState,
} from './utils';
import { loadMathJax, defaultConfig } from './mathjax/loadMathJax';
import { initCompletion } from './mathjax/completion';
import InlineTeX from './components/InlineTeX';
import TeXBlock from './components/TeXBlock';
import MathButton from './components/MathButton';

export const createMathjaxPlugin = (config = {}) => {
  const {
    macros,
    completion,
    helpLink,
  } = Object.assign(defaultConfig, config);

  loadMathJax();

  //store values get updated on initialize call
  let store = {
    getEditorState: undefined,
    setEditorState: undefined,
    getReadOnly: undefined,
    setReadOnly: undefined,
    getEditorRef: undefined,
    completion: initCompletion(completion, macros),
    teXToUpdate: {},
  };

  const initialize = (pluginStateFunctions) => {
    store = {
      ...store,
      ...pluginStateFunctions,
      completion: store.completion(pluginStateFunctions.getEditorState())
    };
  };

  // this is the function that opens the editor. gets invoked when button with tex symbol is clicked
  const _insertTeX = (block = false) => {
    const { getEditorState, setEditorState } = store;
    if ( getEditorState && setEditorState ) {
      insertTeXToState(getEditorState, setEditorState, block);
    }
  };

  const insertChar = (char) => {
    const editorState = store.getEditorState();
    const sel = editorState.getSelection();
    const offset = sel.getStartOffset() - 1;
    const newContentState = Modifier.replaceText(
      editorState.getCurrentContent(),
      sel.merge({
        anchorOffset: offset,
        focusOffset: offset + 1,
      }),
      char,
    );
    store.setEditorState(
      EditorState.push(editorState, newContentState, 'insert-characters'),
    );
  };

  const keyBindingFn = (e, { getEditorState, setEditorState }) => myKeyBindingFn(getEditorState, setEditorState)(e);

  const blockRendererFn = (block) => {
    if (
      block.getType() === 'atomic' && block.getData().get('mathjax')
    ) {
      return {
        component: TeXBlock,
        editable: false,
        props: { getStore: () => store },
      };
    }
    return null;
  };

  const updateTeX = (key, dir) => {
    store.teXToUpdate = { key, dir };
    const editorState = store.getEditorState();
    store.setEditorState(
      EditorState.forceSelection(
        editorState,
        editorState.getSelection(),
      ),
    );
  };

  const handleKeyCommand = (command) => {
    if (command === 'insert-texblock') {
      _insertTeX(true);
      return 'handled';
    }
    if (command === 'insert-inlinetex') {
      _insertTeX();
      return 'handled';
    }
    if (command.slice(0, 16) === 'update-inlinetex') {
      const dir = command.slice(17, 18);
      const entityKey = command.slice(19);
      updateTeX(entityKey, dir);
      return 'handled';
    }
    if (command.slice(0, 15) === 'update-texblock') {
      const dir = command.slice(16, 17);
      const blockKey = command.slice(18);

      updateTeX(blockKey, dir);
      return 'handled';
    }
    if (command.slice(0, 11) === 'insert-char') {
      const char = command.slice(12);
      insertChar(char);
      return 'handled';
    }
    return 'not-handled';
  };

  return {
    initialize,
    decorators: [{
      strategy: findInlineTeXEntities,
      component: InlineTeX,
      props: {
        helpLink,
        getStore: () => store,
      },
    }],
    keyBindingFn,
    handleKeyCommand,
    blockRendererFn,
    MathButton: decorateComponentWithProps(MathButton, { _insertTeX }),
  };
};
