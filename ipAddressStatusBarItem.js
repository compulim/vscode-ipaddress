'use strict';

const REFRESH_INTERVAL = 5000;

const Commands             = require('./commands');
const freshPublicIP        = require('./freshPublicIP')({ autoRefresh: false });
const NetworkInterfaceUtil = require('./networkInterfaceUtil');
const os                   = require('os');
const vscode               = require('vscode');

const { window } = vscode;

class IPAddressStatusBarItem {
  constructor() {
    this._selectedInterfaceName = 0;
    this._statusBarItem = window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    this._statusBarItem.command = Commands.SHOW_NEXT_IP_ADDRESS;
    this._statusBarItem.show();

    this.refresh();

    this._refreshInterval = setInterval(() => this.refresh(), REFRESH_INTERVAL);
  }

  dispose() {
    this._statusBarItem.dispose();
    clearInterval(this._refreshInterval);
  }

  refresh() {
    this.fetchNetworkInterfaces();
    this.refreshUI();
  }

  getNetworkInterfaces() {
    const networkInterfaces = os.networkInterfaces();

    networkInterfaces['public'] = [{
      address: freshPublicIP.address(),
      // address: Promise.resolve('123.45.67.89'),
      family : 'IPv4',
      type   : 'fresh'
    }];

    return NetworkInterfaceUtil.flattenNetworkInterfaces(networkInterfaces);
  }

  fetchNetworkInterfaces() {
    this._networkInterfaces = this.getNetworkInterfaces();
  }

  refreshUI() {
    let networkInterface;

    if (this._selectedInterfaceName) {
      networkInterface = this._networkInterfaces.get(this._selectedInterfaceName);
    }

    networkInterface || (networkInterface = this._networkInterfaces.first());

    if (networkInterface) {
      const addressesOfSameInterface = NetworkInterfaceUtil.getAddresses(this._networkInterfaces, networkInterface.interfaceName).sort(addr => addr.family);

      this._statusBarItem.text = `$(home) ${ networkInterface.address }`;
      this._statusBarItem.tooltip = `${ networkInterface.interfaceName }\n${ (networkInterface.mac || '').toUpperCase() }\n\n${ addressesOfSameInterface.valueSeq().map(a => `(${ a.family }) ${ a.address }`).toJS().join('\n') }`;
    } else {
      this._statusBarItem.text = `$(unplug)`;
      this._statusBarItem.tooltip = null;
    }
  }

  nextAddress() {
    this.fetchNetworkInterfaces();
    this._selectedInterfaceName = NetworkInterfaceUtil.getNextInterfaceName(this._networkInterfaces, this._selectedInterfaceName);
    this.refreshUI();
  }
}

module.exports = IPAddressStatusBarItem;
