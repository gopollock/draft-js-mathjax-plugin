'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.loadMathJax = loadMathJax;
var defaultConfig = exports.defaultConfig = {
  macros: {
    lcm: '\\text{lcm}',
    gcf: '\\text{gcf}'
  },
  completion: 'auto',
  helpLink: {
    message: 'Learn how to use LaTeX formula',
    url: '/'
  },
  mathjaxConfig: {
    jax: ['input/TeX', 'input/MathML', 'input/AsciiMath', 'output/CommonHTML'],
    extensions: ['tex2jax.js', 'mml2jax.js', 'asciimath2jax.js', 'MathMenu.js', 'MathZoom.js', 'AssistiveMML.js'],
    TeX: {
      extensions: ['AMSmath.js', 'AMSsymbols.js', 'noErrors.js', 'noUndefined.js']
    }
  }
};

var DEFAULT_SCRIPT = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js';

var ADDITIONAL_OPTIONS = {
  messageStyles: 'none',
  showProcessingMessages: false,
  showMathMenu: false,
  showMathMenuMSIE: false,
  preview: 'none',
  delayStartupTypeset: true
};

var mathScriptPromise = null;

function load() {
  if (!mathScriptPromise) {
    mathScriptPromise = new Promise(function (resolve, reject) {
      if (window.MathJax) {
        return resolve();
      }

      var head = document.head || document.getElementsByTagName('head')[0];
      var script = document.createElement('script');

      script.type = 'text/javascript';
      script.async = true;
      script.src = DEFAULT_SCRIPT;

      script.onload = function () {
        script.onerror = null;
        script.onload = null;
        resolve();
      };

      script.onerror = function () {
        script.onerror = null;
        script.onload = null;
        reject(new Error('Failed to load ' + DEFAULT_SCRIPT));
      };

      return head.appendChild(script);
    });
  }

  return mathScriptPromise.then(function () {
    return window.MathJax;
  });
}

function loadMathJax(cb) {
  if (window.MathJax) {
    return cb ? cb(window.MathJax) : null;
  }
  var Macros = defaultConfig.macros,
      mathjaxConfig = defaultConfig.mathjaxConfig;


  var options = _extends({}, ADDITIONAL_OPTIONS, mathjaxConfig, {
    TeX: _extends({}, mathjaxConfig.TeX, { Macros: Macros })
  });

  return load().then(function (MathJax) {
    MathJax.Hub.Config(options);
    // avoid flickering of the preview
    MathJax.Hub.processSectionDelay = 0; // eslint-disable-line no-param-reassign
    if (cb) cb(MathJax);
  });
}