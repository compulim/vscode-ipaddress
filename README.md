# IP address extension for Visual Studio Code

This Visual Studio Code extension helps you to easily view your current IP address from status bar and inserts one into your text, including both IPv4, IPv6, and public IP addresses across multiple active network interfaces.

![Demo showing how IP address show on status bar](https://raw.githubusercontent.com/compulim/vscode-ipaddress/master/demo-status-bar.gif)

![Demo showing how insert IP address works](https://raw.githubusercontent.com/compulim/vscode-ipaddress/master/demo-insert.gif)

## Usage

You can find your IP address on the status bar. Simply click on it to iterate thru all IP addresses.

To insert IP address into the text,

* Bring up Command Palette (`F1`, or `Ctrl+Shift+P` on Windows and Linux, or `Shift+CMD+P` on OSX)
* Type or select "Insert IP Address"

You can also modify keyboard shortcut with JSON below.
```json
{
  "key": "alt+shift+i",
  "command": "ipAddress.insertIPAddress",
  "when": "editorTextFocus"
}
```

### Public IP address

Public IP address is obtained from OpenDNS via [`check-ip`](https://www.npmjs.com/package/public-ip) and updated every minute.

Query public IP address will require sending packets to the Internet and we want to minimize the network traffic. If the public IP address is not shown in the status bar, we will not update the IP address. And even if it is shown, we will not update it more than once every minute.

## Change log

* 1.0.0 (2017-04-15)
  * [public ip] Get public IP address from OpenDNS (via [`check-ip`](https://www.npmjs.com/package/public-ip))
  * [vscode] Updated `^1.11.0`
* 0.0.1 (2016-02-24): First public release

## Contributions

Love this extension? [Star](https://github.com/compulim/vscode-ipaddress/stargazers) us!

Want to make this extension even more awesome? [Send us your wish](https://github.com/compulim/vscode-ipaddress/issues/new/).

Hate how it is working? [File an issue](https://github.com/compulim/vscode-ipaddress/issues/new/) to us.
