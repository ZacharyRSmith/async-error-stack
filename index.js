/**
 * @module async-error-stack.
 *
 * For better error stacks in async code.
 *
 * @flow
 */
const ASYNC_ERROR_STACK = String(process.env.ASYNC_ERROR_STACK || 1);


function isDisabled({ disable }) {
  if (disable) return true;
  if (disable === false) return false;
  return ASYNC_ERROR_STACK === '0';
}

const errStackLib = ({ disable, logger = console } = {}) => {
  if (!isDisabled({ disable })) {
    // Longjohn collects a large amount of data in order to provide useful stack traces. While it is very helpful in development and testing environments, it is not recommended to use longjohn in production. The data collection puts a lot of strain on V8's garbage collector and can greatly slow down heavily-loaded applications.
    require('longjohn');
  }
  const addCleanStack = (err) => {
    if (isDisabled({ disable })) return err;
    const filteredStack = (stack) => {
      return stack
        .split('\n')
        .filter(line => !line.includes('node_modules/async/'))
        .join('\n');
    };

    err.stack = `STACK FILTERED BY \`!line.includes('node_modules/async/')\`:`
      + `\n${filteredStack(err.stack)}`
      + '\n---------------------------------------------'
      + '\nFULL STACK:'
      + '\n---------------------------------------------'
      + `\n${err.stack}`;
  };
  const ERR = (err) => {
    if (!err) return false;
    addCleanStack(err);
    logger.error(err);
    return true;
  };

  return {
    ERR,
    addCleanStack
  };
};

module.exports = errStackLib;
