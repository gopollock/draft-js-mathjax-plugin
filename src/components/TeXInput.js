import React from 'react';
import { get } from 'lodash';

const _isAlpha = (key) => key.length === 1 && /[a-z]/.test(key.toLowerCase());

function indent({ text, start, end }, unindent = false) {
  const nl0 = text.slice(0, start).split('\n').length - 1;
  const nl1 = nl0 + (text.slice(start, end).split('\n').length - 1);
  let nStart = start;
  let nEnd = end;
  const nText = text
    .split('\n')
    .map((l, i) => {
      if (i < nl0 || i > nl1) { return l; }
      if (!unindent) {
        if (i === nl0) { nStart += 2; }
        nEnd += 2;
        return `  ${l}`;
      }
      if (l.startsWith('  ')) {
        if (i === nl0) { nStart -= 2; }
        nEnd -= 2;
        return l.slice(2);
      }
      if (l.startsWith(' ')) {
        if (i === nl0) { nStart -= 1; }
        nEnd -= 1;
        return l.slice(1);
      }
      return l;
    })
    .join('\n');
  return { text: nText, start: nStart, end: nEnd };
}

const closeDelim = {
  '{': '}',
  '(': ')',
  '[': ']',
  '|': '|',
};

class TeXInput extends React.Component {
  constructor(props) {
    super(props);
    const {
      onChange,
      caretPosFn,
    } = props;

    const pos = caretPosFn();
    this.state = {
      start: pos,
      end: pos,
    };

    this.completionList = [];
    this.index = 0; //index of the current autosuggestion visible from the whole list of suggestions

    this._onChange = () => onChange({
      teX: this.teXinput.value,
    });

    this._onSelect = () => {
      const { selectionStart: start, selectionEnd: end } = this.teXinput;
      this.setState({ start, end });
    };

    this._insertText = (text, offset = 0) => {
      let { teX: value } = this.props;
      let { start, end } = this.state;
      value = value.slice(0, start) + text + value.slice(end);
      start += text.length + offset;
      if (start < 0) {
        start = 0;
      } else if (start > value.length) {
        start = value.length;
      }
      end = start;
      onChange({ teX: value });
      this.setState({ start, end });
    };

    this.onBlur = () => {};
  }

  componentDidMount() {
    const { start, end } = this.state;
    setTimeout(() => {
      if (this.teXinput) {
        this.teXinput.focus();
        this.teXinput.setSelectionRange(start, end);
      }
    }, 0);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.teX !== nextProps.teX) {
      return true;
    }
    const { start, end } = nextState;
    const { selectionStart, selectionEnd } = this.teXinput;
    return start !== selectionStart || end !== selectionEnd;
  }

  componentDidUpdate(prevProps, prevState) {
    const { start, end } = this.state;
    if (prevState.start !== start || prevState.end !== end) {
      this.teXinput.setSelectionRange(start, end);
    }
  }

  handleKey = (evt) => {
    const { teX, finishEdit, onChange, displaystyle, completion } = this.props;
    const { start, end } = this.state;
    const inlineMode = displaystyle !== undefined;
    const isCompletionDisabled = completion.status === 'none';
    const key = evt.key;

    if (!isCompletionDisabled && key !== 'Tab' && key !== 'Shift') {
      this.completionList = [];
      this.index = 0;
    }

    if (key === 'Escape') {
      evt.preventDefault();
      evt.stopPropagation();
      return finishEdit(1);
    }

    if (!!get(closeDelim, key)) {
      evt.preventDefault();
      return this._insertText(key + closeDelim[key], -1);
    }

    if (!isCompletionDisabled && (
            (_isAlpha(key) && completion.status === 'auto') ||
            (key === 'Tab' && this.completionList.length > 1) ||
            (completion.status === 'manual' && evt.ctrlKey && key === ' ')
    )) {
      return this._handleCompletion(evt);
    }

    if (key === 'Tab') {
      evt.preventDefault();
      const lines = teX.split('\n');
      if (inlineMode || lines.length <= 1) {
        return finishEdit(evt.shiftKey ? 0 : 1);
      } else {
        const { text, start: newStart, end: newEnd } = indent({ text: teX, start, end }, evt.shiftKey,);
        onChange({ teX: text });
        setTimeout(() => this.setState({
          start: newStart,
          end: newEnd,
        }), 0);
      }
    }
  };

  _handleCompletion(evt) {
    const { completion, teX, onChange } = this.props;
    const { start, end } = this.state;
    const key = evt.key;
    const prefix = completion.getLastTeXCommand(teX.slice(0, start));
    const pl = prefix.length;
    const startCmd = start - pl;
    const isAlpha = _isAlpha(key);
    let ns = start;
    let offset;

    if (!pl) { return; }

    if (isAlpha || (evt.ctrlKey && key === ' ')) {
      this.completionList = completion.computeCompletionList(
        prefix + (isAlpha ? key : ''),
      );
    }

    const L = this.completionList.length;

    const SWITCH_TO_NEXT_SUGGESTION = 'Tab';

    if (L === 0) { return; }

    if (key === SWITCH_TO_NEXT_SUGGESTION) {
      offset = evt.shiftKey ? -1 : 1;
      this.index += offset;
      this.index = (this.index === -1) ? L - 1 : this.index % L;
    } else {
      this.index = 0;
      ns = isAlpha ? ns + 1 : ns;
    }
    const cmd = this.completionList[this.index];
    const endCmd = startCmd + cmd.length;
    const teXUpdated = teX.slice(0, startCmd) +
      cmd + teX.slice(end);

    //uncomment to turn on annoying jump to end of suggestion
    //ns = L === 1 ? endCmd : ns;

    evt.preventDefault();
    onChange({ teX: teXUpdated });
    setTimeout(() => this.setState({
      start: ns,
      end: endCmd,
    }), 0);
  }

  handleTexRef = (ref) => {
    if (ref) this.teXinput = ref;
  };

  render() {
    const { teX, finishEdit } = this.props;
    const teXArray = teX.split('\n');
    const rows = teXArray.length;
    const cols = teXArray
      .map((tl) => tl.length)
      .reduce((acc, size) => (size > acc ? size : acc), 1);

    return (
      <div className="mathjax-input-container">
        <a
          className="mathjax-help"
          target="_blank"
          href={this.props.helpLink.url}
        >
          <span>{this.props.helpLink.message}</span>
        </a>
        <textarea
          rows={rows}
          cols={cols}
          className="mathjax-textarea"
          value={teX}
          onChange={this._onChange}
          onSelect={this._onSelect}
          onBlur={this.onBlur}
          onKeyDown={this.handleKey}
          ref={this.handleTexRef}
          placeholder="Example: x^2 + \frac{1}{2}x + \sqrt{24} = 0"
        />
        <div className="mathjax-actions">
          <button onClick={finishEdit} className="mathjax-action mathjax-done">Done</button>
        </div>
      </div>
    );
  }
}

export default TeXInput;
