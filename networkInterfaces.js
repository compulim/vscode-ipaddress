'use strict';

const EventEmitter         = require('events');
const freshPublicIP        = require('./freshPublicIP');
const { Map }              = require('immutable');
const NetworkInterfaceUtil = require('./networkInterfaceUtil');
const os                   = require('os');

const PUBLIC_INTERFACE_NAME      = 'public';
const REFRESH_INTERFACE_INTERVAL = 5000;
const UPDATE_EVENT_NAME          = 'update';

class NetworkInterfaces extends EventEmitter {
  constructor() {
    super();

    this._populate();
    this._selectedKey = this._interfaces.keySeq().first();

    this._freshPublicIP = freshPublicIP({ autoRefresh: false }).on('update', nextAddress => {
      const prevAddress = this._interfaces.getIn([PUBLIC_INTERFACE_NAME, 'address']);

      if (prevAddress !== nextAddress) {
        this._interfaces = this._interfaces.setIn([PUBLIC_INTERFACE_NAME, 'address'], nextAddress);
        this._selectedKey === PUBLIC_INTERFACE_NAME && this.emit(UPDATE_EVENT_NAME);
      }
    });

    this._interfaceInterval = setInterval(() => this._populate(), REFRESH_INTERFACE_INTERVAL);
  }

  dispose() {
    clearInterval(this._interfaceInterval);
    this._freshPublicIP.dispose();
  }

  all() {
    return this._freshPublicIP.refresh().then(() => this._interfaces);
  }

  current() {
    return this._interfaces.get(this._selectedKey);
  }

  next() {
    const newKey = NetworkInterfaceUtil.getNextInterfaceName(this._interfaces, this._selectedKey);

    if (this._selectedKey !== newKey) {
      this._selectedKey = newKey;
      this.emit('update');

      this._freshPublicIP.autoRefresh(newKey === PUBLIC_INTERFACE_NAME);
    }
  }

  _populate() {
    const oldInterface       = this._interfaces && this._interfaces.get(this._selectedKey);
    const oldPublicInterface = this._interfaces && this._interfaces.get(PUBLIC_INTERFACE_NAME);
    let newInterfaces        = NetworkInterfaceUtil.flattenNetworkInterfaces(os.networkInterfaces());

    newInterfaces = newInterfaces.map(entry => {
      const interfaceName = entry.get('interfaceName');
      const addressesOfSameInterface = newInterfaces.filter(entry => entry.get('interfaceName') === interfaceName).sortBy(entry => entry.get('family'));

      return entry.set('tooltip', `${ interfaceName }\n${ (entry.get('mac') || '').toUpperCase() }\n\n${ addressesOfSameInterface.valueSeq().map(entry => `(${ entry.get('family') }) ${ entry.get('address') }`).toJS().join('\n') }`);
    });

    newInterfaces = newInterfaces.set(PUBLIC_INTERFACE_NAME, Map({
      address      : oldPublicInterface && oldPublicInterface.get('address'),
      family       : 'IPv4',
      interfaceName: 'Internet',
      tooltip      : 'Update every minute when public IP address is shown in status bar',
      type         : 'public'
    }));

    this._interfaces = NetworkInterfaceUtil.sortNetworkInterfaces(newInterfaces);

    const newInterface = newInterfaces.get(this._selectedKey);

    if (
      !oldInterface
      || !newInterface
      || oldInterface.hashCode() !== newInterface.hashCode()
    ) {
      this.emit('update');
    }
  }
}

module.exports = () => new NetworkInterfaces();
