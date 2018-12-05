/* global console, chrome */

// ----- launch app window ------
console.log('running main.js');
chrome.app.runtime.onLaunched.addListener(function() {
    console.log('main launched');
    const indexWindow=chrome.app.window.create('ui/index.html',
        {
            id: 'messagingEx1ID',
            innerBounds: { width: 800, height: 500 },
        });
    console.log('created window', indexWindow);
});
// function addExternalMessageListener
