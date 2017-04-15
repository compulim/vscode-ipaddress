'use strict';

const AUTO_DHCP_PATTERN = /^169\.254\./;

const Map = require('immutable').Map;

function getNextInterfaceName(networkInterfaces, currentInterfaceName) {
  const interfaceNames = networkInterfaces.keySeq();
  const currentIndex   = interfaceNames.indexOf(currentInterfaceName);
  const nextIndex      = ~currentIndex ? currentIndex + 1 : 1;

  return interfaceNames.get(nextIndex < networkInterfaces.size ? nextIndex : 0);
}

function flattenNetworkInterfaces(networkInterfaces) {
  return Object.keys(networkInterfaces)
    .reduce((flattened, interfaceName) => {
      const networkInterface = networkInterfaces[interfaceName];

      return networkInterface.reduce((flattened, entry) => {
        if (entry.internal) {
          return flattened;
        } else {
          return flattened.set(
            `${ interfaceName } (${ entry.family })`,
            {
              interfaceName,
              address: entry.address,
              family : entry.family,
              mac    : entry.mac,
              netmask: entry.netmask
            }
          );
        }
      }, flattened);
    }, Map())
    .sort((x, y) => {
      let vx = x.family;
      let vy = y.family;

      if (vx === vy) {
        vx = x.address;
        vy = y.address;

        if (AUTO_DHCP_PATTERN.test(vx)) {
          vx = '9' + vx;
        }

        if (AUTO_DHCP_PATTERN.test(vy)) {
          vy = '9' + vy;
        }
      }

      return vx > vy ? 1 : vx < vy ? -1 : 0;
    });
}

function getAddresses(networkInterfaces, interfaceName) {
  return networkInterfaces.filter(networkInterface => networkInterface.interfaceName === interfaceName);
}

module.exports = {
  flattenNetworkInterfaces,
  getAddresses,
  getNextInterfaceName
};
