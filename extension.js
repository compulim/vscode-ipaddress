'use strict';

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const
  vscode = require('vscode'),
  IPAddressStatusBarItem = require('./ipaddressstatusbaritem');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  // console.log('Congratulations, your extension "vscode-ipaddress" is now active!');

  const statusBarItem = new IPAddressStatusBarItem();

  context.subscriptions.push(statusBarItem);

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  context.subscriptions.push(
    vscode.commands.registerCommand('ipaddress.refreshIPAddresses', () => {
      // The code you place here will be executed every time your command is executed

      statusBarItem.refresh();

      // Display a message box to the user
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('ipaddress.showNextIPAddress', () => {
      statusBarItem.nextAddress();
    })
  );
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}

exports.deactivate = deactivate;
