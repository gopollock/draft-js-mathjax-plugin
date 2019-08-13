export const defaultConfig = {
  macros: {
    lcm: '\\text{lcm}',
    gcf: '\\text{gcf}',
  },
  completion: 'auto',
  helpLink: {
    message: 'Learn how to use LaTeX formula',
    url: '/',
  },
  mathjaxConfig: {
    jax: ['input/TeX', 'input/MathML', 'input/AsciiMath', 'output/CommonHTML'],
    extensions: ['tex2jax.js', 'mml2jax.js', 'asciimath2jax.js', 'MathMenu.js', 'MathZoom.js', 'AssistiveMML.js'],
    TeX: {
      extensions: ['AMSmath.js', 'AMSsymbols.js', 'noErrors.js', 'noUndefined.js'],
    },
  },
};

const DEFAULT_SCRIPT = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js';

const ADDITIONAL_OPTIONS = {
  messageStyles: 'none',
  showProcessingMessages: false,
  showMathMenu: false,
  showMathMenuMSIE: false,
  preview: 'none',
  delayStartupTypeset: true,
};

let mathScriptPromise = null;

function load() {
  if (!mathScriptPromise) {
    mathScriptPromise = new Promise((resolve, reject) => {
      if (window.MathJax) {
        return resolve();
      }

      const head = document.head || document.getElementsByTagName('head')[0];
      const script = document.createElement('script');

      script.type = 'text/javascript';
      script.async = true;
      script.src = DEFAULT_SCRIPT;

      script.onload = () => {
        script.onerror = null;
        script.onload = null;
        resolve();
      };

      script.onerror = () => {
        script.onerror = null;
        script.onload = null;
        reject(new Error(`Failed to load ${DEFAULT_SCRIPT}`));
      };

      return head.appendChild(script);
    });
  }

  return mathScriptPromise.then(() => window.MathJax);
}

export function loadMathJax(cb) {
  if (window.MathJax) {
    return cb ? cb(window.MathJax) : null;
  }
  const { macros: Macros, mathjaxConfig } = defaultConfig;

  const options = {
    ...ADDITIONAL_OPTIONS,
    ...mathjaxConfig,
    TeX: { ...mathjaxConfig.TeX, Macros }
  };

  return load().then((MathJax) => {
    MathJax.Hub.Config(options);
    // avoid flickering of the preview
    MathJax.Hub.processSectionDelay = 0; // eslint-disable-line no-param-reassign
    if (cb) cb(MathJax);
  });
}
