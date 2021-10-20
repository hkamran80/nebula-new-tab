# Nebula New Tab
## A clean and simple new tab page

[![Get Nebula New Tab on Firefox](docs/get-addon-firefox.png)](https://addons.mozilla.org/en-US/firefox/addon/nebula-new-tab/)

![Nebula screenshot (Firefox)](docs/nebula-new-tab-screenshot-firefox.png)

## Installation
### Firefox-based Browsers
[![Get Nebula New Tab on Firefox](docs/get-addon-firefox.png)](https://addons.mozilla.org/en-US/firefox/addon/nebula-new-tab/)

### Chromium-based Browsers (Chrome, Brave, etc.)
1. Download the `nebula-new-tab.zip` file from the [latest release](https://github.com/hkamran80/nebula-new-tab/releases/latest/download/nebula-new-tab.zip)
2. Unzip the downloaded file
3. Open your browser and in the URL bar, go to `chrome://extensions`
4. Turn the developer mode toggle on
5. Click "Load Unpacked"
6. Select the unzipped Nebula New Tab folder
7. Enjoy Nebula!

### Microsoft Edge
Microsoft is currently reviewing Nebula, this can take up to seven business days.

### Opera and Vivaldi
Not supported

## Building
1. Clone this repository
2. Run `npm install`
3. Run `npm run build:extension`
4. Install the extension with the generated ZIP file

## Preparing for Release
1. Run `npm run build:extension:screenshot`
2. Take screenshots for Chrome, Firefox, Edge, and Brave
3. Run `npm run build:extension`