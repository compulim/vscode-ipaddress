'use strict';

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const
  Commands = require('./commands'),
  NetworkInterfaceUtil = require('./networkinterfaceutil'),
  os = require('os'),
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
    vscode.commands.registerTextEditorCommand(Commands.INSERT_IP_ADDRESS, (textEditor, edit) => {
      // The code you place here will be executed every time your command is executed

      const entries =
        NetworkInterfaceUtil.sortNetworkInterfaces(
          NetworkInterfaceUtil.flattenNetworkInterfaces(os.networkInterfaces())
        )
          .map(entry => {
            return {
              label: entry.address,
              description: entry.family,
              detail: entry.interfaceName,
              address: entry.address
            };
          })
          .valueSeq()
          .toJS();

      vscode.window.showQuickPick(
        entries
      ).then(entry => {
        if (!entry) { return; }

        const address = entry.address;

        textEditor.edit(edit => {
          textEditor.selections.map(selection => {
            const
              start = selection.start,
              end = selection.end;

            if (start.line === end.line && start.character === end.character) {
              edit.insert(start, address);
            } else {
              edit.replace(selection, address);
            }
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
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}

exports.deactivate = deactivate;
