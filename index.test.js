const async = require('async');

const errStackLib = require('./index');

const { addCleanStack, ERR } = errStackLib();

test('ERR()', (done) => {
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
  }, function (err) {
    if (ERR(err)) {
      return void done();
    }
    done.fail();
  });
});

test('addCleanStack()', (done) => {
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
  }, function (err) {
    addCleanStack(err);
    try {
      expect(err.stack).toMatchSnapshot();
      done();
    } catch (e) {
      done.fail(e);
    }
  });
});
