const commonEdit = {
  border: '0.5px solid red',
  outline: 'none',
  fontFamily: '\'Inconsolata\', \'Menlo\', monospace',
  fontSize: '1em',
  boxShadow: '5px 5px 5px rgba(0,0,0,0.7)',
  background: 'yellow',
};

const commonPreview = {
  position: 'absolute',
  left: '50%',
  marginRright: '-50%',
  transform: 'translate(-50%, 0)',

  padding: '10px',
  zIndex: 10,
  background: 'ivory',
  border: '1px solid #ccc',
  borderRadius: '5px',
  boxShadow: '5px 5px 5px rgba(0,0,0,0.7)',
};

const commonRendered = {
  cursor: 'pointer',
};

export default {
  inline: {
    edit: {
      ...commonEdit,
      display: 'inline-block',
      textAlign: 'center',
      padding: '5px',

    },
    preview: {
      ...commonPreview,
      top: '200%', //refers to line height
    },
    rendered: {
      ...commonRendered,
    },
  },
  block: {
    edit: {
      ...commonEdit,
      display: 'block',
      margin: '10px auto 10px',
      padding: '14px',
    },
    preview: {
      ...commonPreview,
      top: 'calc(100%+1em)',
    },
    rendered: {
      ...commonRendered,
    },
  },
};
