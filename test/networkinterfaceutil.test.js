/* global suite, test */

'use strict';

const
  assert = require('assert'),
  NetworkInterfaceUtil = require('../networkinterfaceutil'),
  path = require('path'),
  readFileSync = require('fs').readFileSync,
  testFilesPath = path.resolve(module.filename, '../networkinterfaceutil-test-files/');

function getNetworkInterfaces() {
  return (
    NetworkInterfaceUtil.flattenNetworkInterfaces(
      JSON.parse(
        readFileSync(
          path.resolve(testFilesPath, 'networkinterfaces.json'),
          'utf-8'
        )
      )
    )
  );
}

suite('Network interface util', function () {
  test('Flatten network interface', function () {
    const
      actual = getNetworkInterfaces().toJS(),
      expected = JSON.parse(readFileSync(path.resolve(testFilesPath, 'flatten-test-1-baseline.json'), 'utf-8'));

    assert.deepEqual(expected, actual);
  });

  test('Next network interface from first selection', function () {
    const
      networkInterfaces = getNetworkInterfaces();

    assert.equal(
      'eth0 (IPv6)',
      NetworkInterfaceUtil.getNextInterfaceName(networkInterfaces, 'eth0 (IPv4)')
    );
  });

  test('Next network interface from no selection', function () {
    const
      networkInterfaces = getNetworkInterfaces();

    assert.equal(
      'eth0 (IPv6)',
      NetworkInterfaceUtil.getNextInterfaceName(networkInterfaces, null)
    );
  });

  test('Next network interface from the last selection', function () {
    const
      networkInterfaces = getNetworkInterfaces();

    assert.equal(
      'eth0 (IPv4)',
      NetworkInterfaceUtil.getNextInterfaceName(networkInterfaces, 'eth1 (IPv6)')
    );
  });

  test('Get addresses with name "eth0"', function () {
    const
      networkInterfaces = getNetworkInterfaces(),
      actual = NetworkInterfaceUtil.getAddresses(networkInterfaces, 'eth0').toJS(),
      expected = JSON.parse(readFileSync(path.resolve(testFilesPath, 'get-addresses-test-1-baseline.json'), 'utf-8'));

    assert.deepEqual(
      expected,
      actual
    );
  });
});
