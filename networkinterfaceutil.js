'use strict';

const AUTO_DHCP_PATTERN = /^169\.254\./;

const Map = require('immutable').Map;

function getNextInterfaceName(networkInterfaces, currentInterfaceName) {
  const
    interfaceNames = networkInterfaces.keySeq(),
    currentIndex = interfaceNames.indexOf(currentInterfaceName),
    nextIndex = ~currentIndex ? currentIndex + 1 : 1;

  return interfaceNames.get(nextIndex < networkInterfaces.size ? nextIndex : 0);
}

function flattenNetworkInterfaces(networkInterfaces) {
  return Object.keys(networkInterfaces).reduce((flattened, interfaceName) => {
    const networkInterface = networkInterfaces[interfaceName];

    return networkInterface.reduce((flattened, entry) => {
      if (entry.internal) {
        return flattened;
      } else {
        return flattened.set(
          `${interfaceName} (${entry.family})`,
          {
            interfaceName,
            address: entry.address,
            netmask: entry.netmask,
            family: entry.family,
            mac: entry.mac
          }
        );
      }
    }, flattened);
  }, Map()).sortBy(entry => `${entry.interfaceName} ${entry.family}`);
}

function getAddresses(networkInterfaces, interfaceName) {
  return networkInterfaces.filter(networkInterface => networkInterface.interfaceName === interfaceName);
}

function sortNetworkInterfaces(networkInterfaces) {
  return networkInterfaces.sort((x, y) => {
    let
      vx = x.family,
      vy = y.family;

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

module.exports.flattenNetworkInterfaces = flattenNetworkInterfaces;
module.exports.getAddresses = getAddresses;
module.exports.getNextInterfaceName = getNextInterfaceName;
module.exports.sortNetworkInterfaces = sortNetworkInterfaces;