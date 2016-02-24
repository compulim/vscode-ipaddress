'use strict';

const
  AUTO_DHCP_PATTERN = /^169\.254\./,
  REFRESH_INTERVAL = 5000;

const
  NetworkInterfaceUtil = require('./networkinterfaceutil'),
  os = require('os'),
  vscode = require('vscode');

const
  window = vscode.window;

class IPAddressStatusBarItem {
  constructor() {
    this._selectedInterfaceName = 0;
    this._statusBarItem = window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    this._statusBarItem.command = 'ipaddress.showNextIPAddress';
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
    return NetworkInterfaceUtil.flattenNetworkInterfaces(os.networkInterfaces()).sort((x, y) => {
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

      this._statusBarItem.text = `$(globe) ${networkInterface.address}`;
      this._statusBarItem.tooltip = `${networkInterface.interfaceName}\n${(networkInterface.mac || '').toUpperCase()}\n\n${addressesOfSameInterface.valueSeq().map(a => `(${a.family}) ${a.address}`).toJS().join('\n')}`;
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
