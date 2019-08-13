let pendingScripts = [];
let pendingCallbacks = [];
let needsProcess = false;

function doProcess(MathJax) {
  MathJax.Hub.Queue(() => {
    const oldElementScripts = MathJax.Hub.elementScripts;
    // see https://github.com/mathjax/MathJax/blob/master/unpacked/MathJax.js#L2445
    MathJax.Hub.elementScripts = () => pendingScripts;

    try {
      return MathJax.Hub.Process(null, () => {
        pendingCallbacks.forEach((cb) => cb());
        pendingScripts = [];
        pendingCallbacks = [];
        needsProcess = false;
      });
    } catch (e) {
      // IE8 requires `catch` in order to use `finally`
      throw e;
    } finally {
      MathJax.Hub.elementScripts = oldElementScripts;
    }
  });
}

/**
 * Process math in a script node using MathJax
 * @param {MathJax}  MathJax
 * @param {DOMNode}  script
 * @param {Function} callback
 */
export default function processTeX(MathJax, script, callback) {
  pendingScripts.push(script);
  pendingCallbacks.push(callback);
  if (!needsProcess) {
    needsProcess = true;
    setTimeout(() => doProcess(MathJax), 0);
  }
}

