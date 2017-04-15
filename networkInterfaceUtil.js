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
            Map({
              interfaceName,
              address: entry.address,
              family : entry.family,
              mac    : entry.mac,
              netmask: entry.netmask,
              type   : 'internal'
            })
          );
        }
      }, flattened);
    }, Map());
}

function sortNetworkInterfaces(networkInterfaces) {
  return networkInterfaces
    .sort((x, y) => {
      let vx = x.get('family');
      let vy = y.get('family');

      vx = (vx === 'IPv4' ? 0 : 2) + (x.get('type') === 'public' ? 1 : 0);
      vy = (vy === 'IPv4' ? 0 : 2) + (y.get('type') === 'public' ? 1 : 0);

      if (vx === vy) {
        vx = x.get('address');
        vy = y.get('address');

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

// function getAddresses(networkInterfaces, interfaceName) {
//   return networkInterfaces.filter(networkInterface => networkInterface.get('interfaceName') === interfaceName);
// }

module.exports = {
  flattenNetworkInterfaces,
  // getAddresses,
  getNextInterfaceName,
  sortNetworkInterfaces
};
