/* global document, chrome, window */
(function(context) {
    const whitelistedId='cndppbofippbaceojanmcndelhdknaag';

    const logField=document.getElementById('log');
    const sendText=document.getElementById('sendText');
    const sendId={ value: whitelistedId };
    const send=document.getElementById('send');

    send.addEventListener('click', function() {
        appendLog('sending to '+sendId.value);
        if (sendText.value===''||Number.isNaN(Number(sendText.value))) {
            chrome.runtime.sendMessage(
                sendId.value,
                { myCustomMessage: sendText.value, cmd: 'notification' },
                function(response) {
                    appendLog('response: '+JSON.stringify(response, null, 4));
                });
        } else {
            chrome.runtime.sendMessage(
                sendId.value,
                { value: sendText.value, cmd: 'focusTabByIndex', method: 'POST' },
                function(response) {
                    appendLog('response: '+JSON.stringify(response, null, 4));
                });
        }
    });

    chrome.runtime.onMessageExternal.addListener(
        function(request, sender, sendResponse) {
            if (sender.id===whitelistedId) {
                appendLog('from '+sender.id+': '+request.myCustomMessage);
                sendResponse({ 'status': 200 });
            } else if (request.myCustomMessage) {
                sendResponse({ 'status': 400 });
                return; // don't allow this extension access
            } else {
                sendResponse({ 'status': 500 });
            }
        });

    const appendLog=function(message) {
        logField.innerText+='\n'+message;
    };

    context.appendLog=appendLog;
})(window);
