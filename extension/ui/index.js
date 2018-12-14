/* globals document, window, chrome */
(function(context) {
    const APP_ID='fepgjiacledgmlkobcapbbacgdanjgma';

    const reponseFunc=function(response) {
        if (response.app.opts) {
            checkElement('optAutoStart', response.app.opts.optAutoStart);
            checkElement('optBackground', response.app.opts.optBackground);
            checkElement('optAllInterfaces', response.app.opts.optAllInterfaces);
            document.getElementById('port').value = response.app.opts.port;
        }
        setUrls(response.app.urls);
        document.getElementById('status').innerText = response.app.status;
        document.getElementById('restart').disabled = false;
    };

    chrome.runtime.sendMessage(
        APP_ID,
        {cmd: 'getApp' },
        reponseFunc);

    document.getElementById('restart').disabled = true;
    document.getElementById('restart').onclick = function() {
        document.getElementById('restart').disabled = true;
        chrome.runtime.sendMessage(
            APP_ID,
            {
                cmd: 'setOptions',
                opts: {
                    port: document.getElementById('port').value,
                    optAutoStart: document.getElementById('optAutoStart').checked ? true : false,
                    optBackground: document.getElementById('optBackground').checked ? true : false,
                    optAllInterfaces: document.getElementById('optAllInterfaces').checked ? true : false,
                },
            },
            reponseFunc);
    };

    const setUrls=function(urls) {
        const urlsElement=document.getElementById('urls');
        while (urlsElement.firstChild) {
            urlsElement.removeChild(urlsElement.firstChild);
        }
        urls.forEach((obj) => {
            const liElement = document.createElement('li');
            const aElement = document.createElement('a');
            aElement.setAttribute('href', obj.url);
            aElement.appendChild(document.createTextNode(obj.url));
            liElement.appendChild(aElement);
            urlsElement.appendChild(liElement);
        });
    };

    const checkElement=function(elementId, boolean) {
        if (boolean) {
            document.getElementById(elementId).checked = true;
        } else {
            document.getElementById(elementId).checked = false;
        }
    };

    context.setUrls=setUrls;
})(window);

/**
 send.addEventListener('click', function() {
        const ips = [];

        const RTCPeerConnection = window.RTCPeerConnection ||
            window.webkitRTCPeerConnection || window.mozRTCPeerConnection;

        const pc = new RTCPeerConnection({
            // Don't specify any stun/turn servers, otherwise you will
            // also find your public IP addresses.
            iceServers: [],
        });
        // Add a media line, this is needed to activate candidate gathering.
        pc.createDataChannel('');

        // onicecandidate is triggered whenever a candidate has been found.
        pc.onicecandidate = function(e) {
            if (!e.candidate) { // Candidate gathering completed.
                pc.close();
                appendLog(ips);
                sendText.value = ips;
                return;
            }
            const ip = /^candidate:.+ (\S+) \d+ typ/.exec(e.candidate.candidate)[1];
            if (ips.indexOf(ip) == -1) {// avoid duplicate entries (tcp/udp)
                ips.push(ip);
            }
        };
        pc.createOffer(function(sdp) {
            pc.setLocalDescription(sdp);
        }, function onerror() {});
 */