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
            sendResponse({
                status: 200,
                content: {
                    action: 'init',
                    windows: allWindows.map((window) => formatWindow(window)),
                },
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

function focusTabByIndex(sendResponse, index) {
    if (Number.isNaN(index)||index<0) {
        sendResponse({
            status: 404,
            content: { error: 'IndexOutOfBounds' },
        });
    }

    chrome.windows.getLastFocused({ populate: true },
        function(currentWindow) {
            if (index<currentWindow.tabs.length) {
                chrome.tabs.highlight({ windowId: currentWindow.id, tabs: index });
                sendResponse({
                    status: 200,
                    content: {
                        action: 'focusTab',
                        index: index,
                    },
                });
            } else {
                sendResponse({
                    status: 404,
                    content: { error: 'IndexOutOfBounds' },
                });
            }
        });
}

function focusNextTab(sendResponse) {
    chrome.windows.getLastFocused({ populate: true },
        function(currentWindow) {
            const focusedTab = currentWindow.tabs.find((tab) => tab.active);
            let index = focusedTab.index + 1;
            if (index>=currentWindow.tabs.length) {
                index = 0;
            }
            chrome.tabs.highlight({ windowId: currentWindow.id, tabs: index });
            sendResponse({
                status: 200,
                content: {
                    action: 'focusTab',
                    index: index,
                },
            });
        });
}

function focusPreviousTab(sendResponse) {
    chrome.windows.getLastFocused({ populate: true },
        function(currentWindow) {
            const focusedTab = currentWindow.tabs.find((tab) => tab.active);
            let index = focusedTab.index - 1;
            if (index<0) {
                index = currentWindow.tabs.length - 1;
            }
            chrome.tabs.highlight({ windowId: currentWindow.id, tabs: index });
            sendResponse({
                status: 200,
                content: {
                    action: 'focusTab',
                    index: index,
                },
            });
        });
}

function setUrl(sendResponse, url) {
    chrome.windows.getLastFocused({ populate: true },
        function(currentWindow) {
            const focusedTab = currentWindow.tabs.find((tab) => tab.active);
            chrome.tabs.update(focusedTab.id, { url: url },
                function(tab) {
                    sendResponse({
                        status: 200,
                        content: {
                            action: 'updateTab',
                            tab: formatTab(tab),
                        },
                    });
                });
        });
}

function createNewTab(sendResponse) {
    chrome.tabs.create({},
        function(tab) {
            sendResponse({
                status: 200,
                content: {
                    action: 'createTab',
                    tab: formatTab(tab),
                },
            });
        });
}

function closeTabByIndex(sendResponse, index) {
    if (Number.isNaN(index)||index<0) {
        sendResponse({
            status: 400,
            content: { error: 'IndexOutOfBounds' },
        });
    }

    chrome.windows.getLastFocused({ populate: true },
        function(currentWindow) {
            if (index < currentWindow.tabs.length) {
                const targetTab = currentWindow.tabs.find((tab) => tab.index === index);
                chrome.tabs.remove(targetTab.id);
                sendResponse({
                    status: 200,
                    content: {
                        action: 'closeTab',
                        index: index,
                    },
                });
            } else {
                sendResponse({
                    status: 400,
                    content: { error: 'IndexOutOfBounds' },
                });
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
            case 'focusTabByIndex': focusTabByIndex(sendResponse, Number(request.value));
                return true;
            case 'focusNextTab': focusNextTab(sendResponse);
                return true;
            case 'focusPreviousTab': focusPreviousTab(sendResponse);
                return true;
            case 'createNewTab': createNewTab(sendResponse);
                return true;
            case 'closeTabByIndex': closeTabByIndex(sendResponse, (Number(request.value)));
                return true;
            case 'setUrl': setUrl(sendResponse, request.url);
                return true;
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
