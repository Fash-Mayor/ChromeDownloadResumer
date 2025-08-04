# ChromeDownloadResumer
A chrome extension that automatically resumes downloads when interrupted.

![GitHub last commit](https://img.shields.io/github/last-commit/Fash-Mayor/ChromeDownloadResumer)


This Chrome Extension provides a basic framework for automatically resuming interrupted or paused downloads. It leverages Chrome's downloads API to monitor the state of active downloads.

## How To Use
- Download package 
    - `manifest.json`, `background.js` and `icons`
- Load the extension into Chrome 
    - go to `chrome://extensions/`
    - Turn on `developer mode` using the toggle switch in the top right corner
    - Click on the `Load unpacked` button.
    - Navigate to and select the `ChromeDownloadResumer` folder you downloaded the files into
- It should appear now in the list of extensions.

### The extension does not need any special permissions or control. It starts listening for changes in downloads once it is unpacked.