/* globals document, chrome, window */
(function(context) {
    const targetId='ohnllfjfjglddkjlglcbdmbgclblhblp';
    const logField=document.getElementById('log');
    const sendText=document.getElementById('sendText');
    const send=document.getElementById('send');

    send.addEventListener('click', function() {
        appendLog('sending to '+targetId);
        chrome.runtime.sendMessage(
            targetId,
            { myCustomMessage: sendText.value },
            function(response) {
                appendLog('response: '+JSON.stringify(response, null, 4));
            });
    });

    const appendLog=function(message) {
        logField.innerText+='\n'+message;
    };

    context.appendLog=appendLog;
})(window);
