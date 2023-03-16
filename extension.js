'use strict';

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const Commands               = require('./commands');
const IPAddressStatusBarItem = require('./ipAddressStatusBarItem2');
const os                     = require('os');
const vscode                 = require('vscode');
const networkInterfaces      = require('./networkInterfaces')();

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  // console.log('Congratulations, your extension "vscode-ipaddress" is now active!');

  const statusBarItem = new IPAddressStatusBarItem(networkInterfaces);

  context.subscriptions.push(statusBarItem);

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(Commands.INSERT_IP_ADDRESS, textEditor => {
      // The code you place here will be executed every time your command is executed

      networkInterfaces.all().then(entries => {
        vscode.window.showQuickPick(
          entries
            .map(entry => ({
              address    : entry.get('address'),
              description: `${ entry.get('interfaceName') } (${ entry.get('family') })`,
              label      : entry.get('address')
            }))
            .valueSeq()
            .toJS(),
          {
            matchOnDescription: true,
            matchOnDetail: true
          }
        ).then(entry => {
          if (!entry) { return; }

          const address = entry.address;

          textEditor.edit(edit => {
            textEditor.selections.map(selection => {
              const { start, end } = selection;

              if (start.line === end.line && start.character === end.character) {
                edit.insert(start, address);
              } else {
                edit.replace(selection, address);
              }
            });
          });
        });
      });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.SHOW_NEXT_IP_ADDRESS, () => {
      statusBarItem.nextAddress();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.GET_SELECTED_IP_ADDRESS, () => {
      return statusBarItem.currentAddress();
    })
  );
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
  networkInterfaces.dispose();
}

exports.deactivate = deactivate;
