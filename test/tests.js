/**
 * Nodeunit functional tests.  Requires internet connection to validate phantom
 * functions correctly.
 */

var childProcess = require('child_process')
var fs = require('fs')
var path = require('path')
var phantomjs = require('../lib/phantomjs')
var util = require('../lib/util')


exports.testDownload = function (test) {
  test.expect(1)
  test.ok(fs.existsSync(phantomjs.path), 'Binary file should have been downloaded')
  test.done()
}


exports.testPhantomExecutesTestScript = function (test) {
  test.expect(1)

  var childArgs = [
    path.join(__dirname, 'loadspeed.js'),
    'http://www.google.com/'
  ]

  childProcess.execFile(phantomjs.path, childArgs, function (err, stdout) {
    var value = (stdout.indexOf('msec') !== -1)
    test.ok(value, 'Test script should have executed and returned run time')
    test.done()
  })
}


exports.testPhantomExitCode = function (test) {
  test.expect(1)
  childProcess.execFile(phantomjs.path, [path.join(__dirname, 'exit.js')], function (err) {
    test.equals(err.code, 123, 'Exit code should be returned from phantom script')
    test.done()
  })
}


exports.testBinFile = function (test) {
  test.expect(1)

  var binPath = process.platform === 'win32' ?
      path.join(__dirname, '..', 'lib', 'phantom', 'phantomjs.exe') :
      path.join(__dirname, '..', 'bin', 'phantomjs')

  childProcess.execFile(binPath, ['--version'], function (err, stdout) {
    test.equal(phantomjs.version, stdout.trim(), 'Version should be match')
    test.done()
  })
}


exports.testCleanPath = function (test) {
  test.expect(5)
  test.equal('/Users/dan/bin', phantomjs.cleanPath('/Users/dan/bin:./bin'))
  test.equal('/Users/dan/bin:/usr/bin', phantomjs.cleanPath('/Users/dan/bin:./bin:/usr/bin'))
  test.equal('/usr/bin', phantomjs.cleanPath('./bin:/usr/bin'))
  test.equal('', phantomjs.cleanPath('./bin'))
  test.equal('/Work/bin:/usr/bin', phantomjs.cleanPath('/Work/bin:/Work/phantomjs/node_modules/.bin:/usr/bin'))
  test.done()
}

exports.testBogusReinstallLocation = function (test) {
  util.maybeLinkLibModule('./blargh')
  .then(function (success) {
    test.ok(!success, 'Expected link to fail')
    test.done()
  })
}

exports.testSuccessfulReinstallLocation = function (test) {
  util.maybeLinkLibModule(path.resolve(__dirname, '../lib/location'))
  .then(function (success) {
    test.ok(success, 'Expected link to succeed')
    test.done()
  })
}

exports.testBogusVerifyChecksum = function (test) {
  util.verifyChecksum(path.resolve(__dirname, './exit.js'), 'blargh')
  .then(function (success) {
    test.ok(!success, 'Expected checksum to fail')
    test.done()
  })
}

exports.testSuccessfulVerifyChecksum = function (test) {
  util.verifyChecksum(path.resolve(__dirname, './exit.js'),
                      '217b7bccebefe5f5e267162060660b03de577867b6123ecfd3b26b5c6af2e92b')
  .then(function (success) {
    test.ok(success, 'Expected checksum to succeed')
    test.done()
  })
}
