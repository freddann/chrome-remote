/* global chrome, console, Notification */

const APP_ID='fepgjiacledgmlkobcapbbacgdanjgma';

function formatTab(tab) {
    return {
        index: tab.index,
        title: tab.title,
        url: tab.url,
        favIconUrl: tab.favIconUrl,
        focused: tab.active,
    };
}
function formatWindow(window) {
    return {
        id: window.id,
        tabs: window.tabs.map((tab) => formatTab(tab)),
    };
}

// ----- api tasks ------

function getAllWindows(sendResponse) {
    chrome.windows.getAll({ populate: true },
        function(allWindows) {
            console.log(allWindows);
            sendResponse({
                status: 200,
                windows: allWindows.map((window) => formatWindow(window)),
            });
        });
}

function focusWindowByIndex(index) {
    chrome.windows.getAll({ populate: true },
        function(allWindows) {
            if (index < allWindows.length) {
                chrome.windows.update(allWindows[index].id, { focused: true });
            }
        });
}

function focusTabByIndex(index) {
    if (Number.isNaN(index)||index<0) {
        return;
    }

    chrome.windows.getLastFocused({ populate: true },
        function(currentWindow) {
            if (index<currentWindow.tabs.length) {
                chrome.tabs.highlight({ windowId: currentWindow.id, tabs: index });
            }
        });
}

function focusNextTab() {
    chrome.windows.getLastFocused({ populate: true },
        function(currentWindow) {
            const focusedTab = currentWindow.tabs.find((tab) => tab.active);
            let index = focusedTab.index + 1;
            if (index>=currentWindow.tabs.length) {
                index = 0;
            }
            chrome.tabs.highlight({ windowId: currentWindow.id, tabs: index });
        });
}

function focusPreviousTab() {
    chrome.windows.getLastFocused({ populate: true },
        function(currentWindow) {
            const focusedTab = currentWindow.tabs.find((tab) => tab.active);
            let index = focusedTab.index - 1;
            if (index<0) {
                index = currentWindow.tabs.length - 1;
            }
            chrome.tabs.highlight({ windowId: currentWindow.id, tabs: index });
        });
}

function setUrl(url) {
    chrome.tabs.update({ url: url });
}

function createNewTab() {
    chrome.tabs.create({});
}

function closeTabByIndex(index) {
    chrome.windows.getLastFocused({ populate: true },
        function(currentWindow) {
            if (index < currentWindow.tabs.length) {
                const targetTab = currentWindow.tabs.find((tab) => tab.index === index);
                console.log(targetTab.id);
                chrome.tabs.remove(targetTab.id);
            }
        });
}


// ----- listen for and act on messages ------

function auth(sender) {
    return sender.id === APP_ID;
}

console.log('Listening for events');
chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
        if (auth(sender)) {
            console.log('A message was authenticated', request, sender);
            switch (request.cmd) {
            case 'focusWindowByIndex': focusWindowByIndex(Number(request.value));
                sendResponse({ 'status': 200 });
                break;
            case 'focusTabByIndex': focusTabByIndex(Number(request.value));
                sendResponse({ 'status': 200 });
                break;
            case 'focusNextTab': focusNextTab();
                sendResponse({ 'status': 200 });
                break;
            case 'focusPreviousTab': focusPreviousTab();
                sendResponse({ 'status': 200 });
                break;
            case 'createNewTab': createNewTab();
                sendResponse({ 'status': 200 });
                break;
            case 'closeTabByIndex': closeTabByIndex((Number(request.value)));
                sendResponse({ 'status': 200 });
                break;
            case 'setUrl': setUrl(request.url);
                sendResponse({ 'status': 200 });
                break;
            case 'getAllWindows': getAllWindows(sendResponse);
                return true;
            case 'notification': new Notification('Header', { body: JSON.stringify(request.message, null, 4) });
                sendResponse({ 'status': 200 });
                break;
            default: new Notification('Got something', { body: JSON.stringify(request, null, 4) });
                sendResponse({ 'status': 200 });
            }
        } else {
            console.log('A message was rejected');
            sendResponse({ 'status': 401 });
        }

        return true;
    });
