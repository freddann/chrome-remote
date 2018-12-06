/* global document, chrome, window */
(function(context) {
    const EXTENSION_ID='cndppbofippbaceojanmcndelhdknaag';

    const logField=document.getElementById('log');
    const sendText=document.getElementById('sendText');
    const sendMessageButton=document.getElementById('send');

    const prevTabButton=document.getElementById('prevTab');
    const nextTabButton=document.getElementById('nextTab');
    const focusTabButton=document.getElementById('focusTab');
    const focusTabIndex=document.getElementById('focusTabIndex');
    const focusWindowButton=document.getElementById('focusWindow');
    const focusWindowIndex=document.getElementById('focusWindowIndex');
    const getAllWindows=document.getElementById('getAllWindows');

    sendMessageButton.addEventListener('click', function() {
        chrome.runtime.sendMessage(
            EXTENSION_ID,
            { message: sendText.value, cmd: 'notification', method: 'POST' },
            function(response) {
                appendLog('response: '+JSON.stringify(response));
            });
    });

    focusWindowButton.addEventListener('click', function() {
        const index = focusWindowIndex.value;
        if (index===''||Number.isNaN(Number(index))) {
            return;
        } else {
            chrome.runtime.sendMessage(
                EXTENSION_ID,
                { value: Number(index), cmd: 'focusWindowByIndex', method: 'POST' },
                function(response) {
                    appendLog('response: '+JSON.stringify(response));
                });
        }
    });

    focusTabButton.addEventListener('click', function() {
        const index = focusTabIndex.value;
        if (index===''||Number.isNaN(Number(index))) {
            return;
        } else {
            chrome.runtime.sendMessage(
                EXTENSION_ID,
                { value: Number(index), cmd: 'focusTabByIndex', method: 'POST' },
                function(response) {
                    appendLog('response: '+JSON.stringify(response));
                });
        }
    });

    prevTabButton.addEventListener('click', function() {
        chrome.runtime.sendMessage(
            EXTENSION_ID,
            { cmd: 'focusPreviousTab', method: 'POST' },
            function(response) {
                appendLog('response: '+JSON.stringify(response));
            });
    });

    nextTabButton.addEventListener('click', function() {
        chrome.runtime.sendMessage(
            EXTENSION_ID,
            { cmd: 'focusNextTab', method: 'POST' },
            function(response) {
                appendLog('response: '+JSON.stringify(response));
            });
    });

    chrome.runtime.onMessageExternal.addListener(
        function(request, sender, sendResponse) {
            if (sender.id===EXTENSION_ID) {
                appendLog('from '+sender.id+': '+request.myCustomMessage);
                sendResponse({ 'status': 200 });
            } else if (request.myCustomMessage) {
                sendResponse({ 'status': 400 });
                return; // don't allow this extension access
            } else {
                sendResponse({ 'status': 500 });
            }
        });

    getAllWindows.addEventListener('click', function() {
        chrome.runtime.sendMessage(
            EXTENSION_ID,
            { cmd: 'getAllWindows', method: 'GET' },
            function(response) {
                appendLog('response: '+JSON.stringify(response, null, 4));
            });
    });

    const appendLog=function(message) {
        logField.innerText+='\n'+message;
    };

    context.appendLog=appendLog;
})(window);
