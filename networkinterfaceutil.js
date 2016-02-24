'use strict';

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

module.exports.flattenNetworkInterfaces = flattenNetworkInterfaces;
module.exports.getAddresses = getAddresses;
module.exports.getNextInterfaceName = getNextInterfaceName;
