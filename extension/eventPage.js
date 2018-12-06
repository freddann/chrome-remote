/* global chrome, console, Notification */

const APP_ID='fepgjiacledgmlkobcapbbacgdanjgma';

function focusTabByIndex(index) {
    if (Number.isNaN(index)||index<0) {
        return;
    }

    chrome.windows.getCurrent({ populate: true },
        function(currentWindow) {
            console.log(currentWindow);
            if (index<currentWindow.tabs.length) {
                chrome.tabs.highlight({ windowId: currentWindow.id, tabs: index });
            }
        });
}

console.log('Listening for events');
chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
        console.log(request, sender);
        if (sender.id===APP_ID) {
            switch (request.cmd) {
            case 'focusTabIndex': focusTabByIndex(Number(request.value)); break;
            default: new Notification('Got something from '+sender.id, { body: JSON.stringify(request.myCustomMessage, null, 4) });
            }

            sendResponse({ 'status': 200 });
        } else {
            sendResponse({ 'status': 500 });
        }
    });