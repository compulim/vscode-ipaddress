'use strict';

const Commands             = require('./commands');
const vscode               = require('vscode');

const { window } = vscode;

class IPAddressStatusBarItem {
  constructor(networkInterfaces) {
    this._statusBarItem = window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    this._statusBarItem.command = Commands.SHOW_NEXT_IP_ADDRESS;
    this._statusBarItem.show();

    this._interfaces = networkInterfaces;
    this._interfaces.on('update', () => this.refreshUI());

    this.refreshUI();
  }

  dispose() {
    this._statusBarItem.dispose();
  }

  refreshUI() {
    const networkInterface = this._interfaces.current();

    if (networkInterface) {
      const address = networkInterface.get('address');

      this._statusBarItem.text = `$(${ networkInterface.get('type') === 'public' ? 'globe' : 'home' }) ${ address || 'Checking\u2026' }`;

      if (address) {
        this._statusBarItem.tooltip = networkInterface.get('tooltip');
      } else {
        this._statusBarItem.tooltip = null;
      }
    } else {
      this._statusBarItem.text = `$(unplug)`;
      this._statusBarItem.tooltip = null;
    }
  }

  nextAddress() {
    this._interfaces.next();
  }

  currentAddress() {
    const networkInterface = this._interfaces.current();

    if (networkInterface) {
      const address = networkInterface.get('address');
      return address;
    } else {
      return null;
    }


}

module.exports = IPAddressStatusBarItem;
