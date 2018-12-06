/* global console, chrome, TextDecoder, WSC, _ */

const EXTENSION_ID='cndppbofippbaceojanmcndelhdknaag';

// ----- handle http requests ------

const DECODER=new TextDecoder('utf-8');

function bufferToJSON(buffer) {
    const view=new Uint8Array(buffer);
    return JSON.parse(DECODER.decode(view));
}

class RequestHandler extends WSC.BaseHandler {
    constructor() {
        super();
        this.disk=null;
        chrome.runtime.getPackageDirectoryEntry(function(entry) {
            this.disk=entry;
        }.bind(this));
    }
}

const RequestHandlerPrototype={
    get: function(path) {
        let message='stuff';
        try {
            const req=this.request;
            message=JSON.stringify({
                arguments: req.arguments,
                headers: req.headers,
                method: req.method,
                path: req.path,
            }, null, 4);
            this.respond(message, 200);
        } catch (error) {
            this.respond(error, 500);
        }
    },
    put: function(path) {
        try {
            const json=bufferToJSON(this.request.body);
            this.forwardMessageToExtension({
                cmd: 'notification',
                myCustomMessage: json,
            });
            this.respond('ok', 200);
        } catch (error) {
            this.respond(error, 500);
        }
    },
    post: function(path) {
        try {
            const json=bufferToJSON(this.request.body);
            this.forwardMessageToExtension({
                cmd: 'notification',
                myCustomMessage: json,
            });
            this.respond('ok', 200);
        } catch (error) {
            this.respond(error, 500);
        }
    },
    onReadFile: function(evt) {
        if (evt.error) {
            this.respond('disk access error', 500);
        } else {
            this.respond(evt, 200);
        }
    },

    forwardMessageToExtension: function(jsonMessage) {
        console.log('sending to '+EXTENSION_ID);
        chrome.runtime.sendMessage(
            EXTENSION_ID,
            jsonMessage,
            function(response) {
                console.log('response: '+JSON.stringify(response, null, 4));
            });
    },

    respond: function(message, status) {
        console.log(status, message);
        this.write(message, status);
    },
};
RequestHandlerPrototype.respond.bind(RequestHandlerPrototype);

_.extend(RequestHandler.prototype, RequestHandlerPrototype, WSC.BaseHandler.prototype);

// ----- start server -----

const options={
    handlers: [
        ['.*', RequestHandler],
    ],
};
const app=new WSC.WebApplication(options);
app.start();
console.log(app);
