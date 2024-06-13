const BROADCAST_MODE = {
    FULL: 0,
    ANY: 1,
    FIRST: 2,
    LAST: 3,
    NOT: 4,
    LAST_VISIBLE: 5,
}

const portList = [];
const websocketState = {
    socket: null,
    pingTimer: null,
    pingMessage: JSON.stringify({ type: "ping" })
}

self.onconnect = function (event) {
    const port = event.ports[0];
    port.__last_visible_time__ = new Date().getTime();
    port.onmessage = function (e) {
        const handler = messageHandlerRegistry[e.data.type];
        if (handler) {
            handler(e);
        }
    }

    portList.push(port);
};

function broadcast(mode, type, message) {
    let toSend = [];
    switch (mode) {
        case BROADCAST_MODE.LAST_VISIBLE:
            let time = portList[0].__last_visible_time__;
            let lastVisiblePort = portList[0];
            for (const port of portList) {
                if (port.__last_visible_time__ > time) {
                    time = port.__last_visible_time__;
                    lastVisiblePort = port;
                }
            }
            toSend = [lastVisiblePort];
            break;
        case BROADCAST_MODE.LAST:
            toSend = [portList[portList.length - 1]];
            break;
        case BROADCAST_MODE.FIRST:
            toSend = [portList[0]];
            break;
        case BROADCAST_MODE.ANY:
            toSend = [portList[Math.floor(Math.random() * arr.length)]];
            break;
        case BROADCAST_MODE.FULL:
            toSend = portList;
            break;
        default:
            return
    }
    toSend.forEach(port => {
        port.postMessage({ type, message });
    })

}

function connentWebSocket(url) {
    //关闭之前连接
    closeWebsocket();
    websocketState.socket = new WebSocket(url);
    websocketState.socket.reconnectOnClose = true;

    websocketState.socket.onopen = function () {
        //连接成功后定时发送ping
        if (websocketState.pingTimer) {
            clearInterval(websocketState.pingTimer);
        }
        websocketState.pingTimer = setInterval(() => {
            websocketState.socket.send(websocketState.pingMessage);
        }, 15000);
    }

    websocketState.socket.onmessage = function (event) {
        const message = JSON.parse(event.data);
        const preHandler = webSocketMessagePreHandlerRegistry[message.type];
        let broadcasMode = BROADCAST_MODE.FULL;
        if (preHandler) {
            broadcasMode = preHandler(message);
        }
        const type = "websocket-" + message.type;
        broadcast(broadcasMode, type, message);
    }

    websocketState.socket.onerror = function (event) {
        console.error("websocket-onerror", event);
    }

    websocketState.socket.onclose = function () {
        if (!this.reconnectOnClose) {
            return
        }
        //重新连接
        connentWebSocket(this.url);
    }
}

function portCloseHandler(event) {
    const index = portList.findIndex(item => item === event.target);
    if (index >= 0) {
        portList.splice(index, 1);
    }
    if (portList.length === 0) {
        closeWebsocket();
    }
}

function portVisibilityChangeHandler(event) {
    if (event.data.value) {
        event.target.__last_visible_time__ = new Date().getTime();
    }
}

function closeWebsocket(event) {
    if (websocketState.pingTimer) {
        clearInterval(websocketState.pingTimer);
    }
    if (websocketState.socket) {
        websocketState.socket.reconnectOnClose = false;
        websocketState.socket.close();
    }
}

function authenticationSuccessHandler(event) {
    //建立websocket连接
    const url = event.data.websocketUrl;
    if (websocketState.socket && websocketState.socket.url === url) {
        //相同url, 不处理,可能是打开多个tab页
        return
    }
    connentWebSocket(url);
}

const messageHandlerRegistry = {
    "close": portCloseHandler,
    "authentication-logout": closeWebsocket,
    "authentication-success": authenticationSuccessHandler,
    "visibilitychange": portVisibilityChangeHandler
}

/**
 * websocket消息预处理，返回值决定是否广播给客户端
 */
const webSocketMessagePreHandlerRegistry = {
    "notification": (message) => {
        return BROADCAST_MODE.LAST_VISIBLE;
    }
}