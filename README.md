# Async Error Stack

For better error stacks in async code.

# Motivation

Problems I want to solve:

1. By default, err stack is limited to 10 lines.
2. the event loop's stack frame context is not maintained in err stacks.
3. [the async module](https://www.npmjs.com/package/async) clutters up err stacks.

Problem #2 is seen in this:

```
const async = require('async');

async.series({
    one: function (callback) {
        setTimeout(function () {
            callback(null, 1);
        }, 200);
    },
    two: function (callback) {
        setTimeout(function () {
            callback(new Error('BOOM!'));
        }, 100);
    }
}, function (err, results) {
    if (err) return void console.error(err);
    /*
    Error: BOOM!
        at Timeout._onTimeout (/Users/zacharyryansmith/Code/sandbox/index.js:26:22)
        at ontimeout (timers.js:475:11)
        at tryOnTimeout (timers.js:310:5)
        at Timer.listOnTimeout (timers.js:270:5)
    */
});
```

This lib uses [longjohn](https://www.npmjs.com/package/longjohn) to solve problems #2 and #3, and own code to solve #1:

```
STACK FILTERED BY !line.includes('node_modules/async/')
Error: BOOM!
    at Timeout.<anonymous> (/Users/zacharyryansmith/Code/sandbox/index.js:35:22)
    at ontimeout (timers.js:475:11)
    at tryOnTimeout (timers.js:310:5)
    at Timer.listOnTimeout (timers.js:270:5)
---------------------------------------------
    at two (/Users/zacharyryansmith/Code/sandbox/index.js:34:9)
    at Timeout.<anonymous> (/Users/zacharyryansmith/Code/sandbox/index.js:30:13)
    at ontimeout (timers.js:475:11)
---------------------------------------------
    at one (/Users/zacharyryansmith/Code/sandbox/index.js:29:9)
    at Object.<anonymous> (/Users/zacharyryansmith/Code/sandbox/index.js:27:7)
---------------------------------------------
FULL STACK
---------------------------------------------
Error: BOOM!
    at Timeout.<anonymous> (/Users/zacharyryansmith/Code/sandbox/index.js:35:22)
    at ontimeout (timers.js:475:11)
    at tryOnTimeout (timers.js:310:5)
    at Timer.listOnTimeout (timers.js:270:5)
---------------------------------------------
    at two (/Users/zacharyryansmith/Code/sandbox/index.js:34:9)
    at /Users/zacharyryansmith/Code/sandbox/node_modules/async/dist/async.js:3866:24
    at replenish (/Users/zacharyryansmith/Code/sandbox/node_modules/async/dist/async.js:998:17)
    at iterateeCallback (/Users/zacharyryansmith/Code/sandbox/node_modules/async/dist/async.js:983:17)
    at /Users/zacharyryansmith/Code/sandbox/node_modules/async/dist/async.js:958:16
    at /Users/zacharyryansmith/Code/sandbox/node_modules/async/dist/async.js:3871:13
    at Timeout.<anonymous> (/Users/zacharyryansmith/Code/sandbox/index.js:30:13)
    at ontimeout (timers.js:475:11)
---------------------------------------------
    at one (/Users/zacharyryansmith/Code/sandbox/index.js:29:9)
    at /Users/zacharyryansmith/Code/sandbox/node_modules/async/dist/async.js:3866:24
    at replenish (/Users/zacharyryansmith/Code/sandbox/node_modules/async/dist/async.js:998:17)
    at /Users/zacharyryansmith/Code/sandbox/node_modules/async/dist/async.js:1002:9
    at eachOfLimit (/Users/zacharyryansmith/Code/sandbox/node_modules/async/dist/async.js:1027:24)
    at /Users/zacharyryansmith/Code/sandbox/node_modules/async/dist/async.js:1032:16
    at _parallel (/Users/zacharyryansmith/Code/sandbox/node_modules/async/dist/async.js:3865:5)
    at Object.series (/Users/zacharyryansmith/Code/sandbox/node_modules/async/dist/async.js:4721:5)
    at Object.<anonymous> (/Users/zacharyryansmith/Code/sandbox/index.js:27:7)
```

# Production Use

Not recommended for use in production, so you can disable it by setting process.env.ASYNC_ERROR_STACK=0 or passing in @disable.

This uses [longjohn](https://www.npmjs.com/package/longjohn), which states:

"Longjohn collects a large amount of data in order to provide useful stack traces. While it is very helpful in development and testing environments, it is not recommended to use longjohn in production. The data collection puts a lot of strain on V8's garbage collector and can greatly slow down heavily-loaded applications."

# Installation
```sh
$ npm install async-error-stack
```

# Usage
```javascript
const async = require('async');
// How to require:
const errStackLib = require('async-error-stack');

// Can also disable by setting process.env.ASYNC_ERROR_STACK=0.
// @disable overrides process.env.ASYNC_ERROR_STACK.
const { addCleanStack, ERR } = errStackLib({
    disable: process.env.NODE_ENV === 'production',
    logger: console /* console is default */
});

async.series({
    one: function (callback) {
        setTimeout(function () {
            callback(null, 1);
        }, 200);
    },
    two: function (callback) {
        setTimeout(function () {
            callback(new Error('BOOM!'));
        }, 100);
    }
}, function (err, results) {
    // Example use of ERR.
    // If err, then calls console.error(err) using @logger (which defaults to console).
    // if (ERR(err)) return;
    if (err) {
        addCleanStack(err);
        console.error(err);
    }
});
```
