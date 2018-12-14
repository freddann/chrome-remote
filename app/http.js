/* global console, chrome, WSC, _ */

const EXTENSION_ID='cndppbofippbaceojanmcndelhdknaag';

const GET_APIS=['/getAllWindows'];
const POST_APIS=[
    '/notification',
    '/focusWindowByIndex',
    '/focusTabByIndex',
    '/focusNextTab', '/focusPreviousTab', '/closeTabByIndex', '/createNewTab', '/setUrl'];

// ----- request validation ------

function isValidPutRequest(json) {
    return false;
}

function isValidGetRequest(request) {
    return GET_APIS.includes(request.path);
}

function isValidPostRequest(request) {
    if (POST_APIS.includes(request.path)) {
        switch (request.path) {
        case '/notification': return request.arguments && typeof request.arguments.message==='string';
        case '/closeTabByIndex':
        case '/focusWindowByIndex':
        case '/focusTabByIndex': return request.arguments && request.arguments.value !== '' && !Number.isNaN(Number(request.arguments.value));
        case '/setUrl': return request.arguments && request.arguments.url !== '';
        case '/createNewTab':
        case '/focusNextTab':
        case '/focusPreviousTab': return true;
        }
    }
    return false;
}

function formatMessage(request) {
    const message = {
        method: request.method,
        cmd: request.path.length ? request.path.substr(1) : request.path,
    };
    switch (request.path) {
    case '/notification': message.message = request.arguments.message; break;
    case '/closeTabByIndex':
    case '/focusWindowByIndex':
    case '/focusTabByIndex': message.value = Number(request.arguments.value); break;
    case '/setUrl': message.url = String(request.arguments.url); break;
    case '/createNewTab':
    case '/focusNextTab':
    case '/focusPreviousTab':
    }
    return message;
}

// ----- handle http requests ------

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
        try {
            if (isValidGetRequest(this.request)) {
                this.forwardRequestAndRespond();
            } else {
                this.respond({ message: 'rejected' }, 400);
            }
        } catch (error) {
            this.respond(error, 500);
        }
    },
    put: function(path) {
        try {
            if (isValidPutRequest(this.request)) {
                this.forwardRequestAndRespond();
            } else {
                this.respond({ message: 'rejected' }, 400);
            }
        } catch (error) {
            this.respond(error, 500);
        }
    },
    post: function(path) {
        try {
            if (isValidPostRequest(this.request)) {
                this.forwardRequestAndRespond();
            } else {
                this.respond({ message: 'rejected' }, 400);
            }
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

    forwardRequestAndRespond: function() {
        console.log('Sending message to', EXTENSION_ID);
        const self = this;
        chrome.runtime.sendMessage(
            EXTENSION_ID,
            formatMessage(this.request),
            function(response) {
                self.respond(JSON.stringify(response.content), response.status);
            });
    },

    respond: function(message, status) {
        console.log('Response', status, message);
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
