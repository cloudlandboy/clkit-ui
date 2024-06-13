import { WEBSOCKET_WORKER_SCRIPT_SRC } from "@/constants/common";
import { ElMessageBox, ElNotification } from "element-plus";

const shardWorker = new SharedWorker(WEBSOCKET_WORKER_SCRIPT_SRC);

window.onbeforeunload = function () {
    shardWorker.port.postMessage({ type: "close" });
}

document.addEventListener("visibilitychange", () => {
    console.log(document.visibilityState);
    shardWorker.port.postMessage({ type: "visibilitychange", value: document.visibilityState === "visible" });
});

shardWorker.port.onmessage = function (event) {
    const handlerChain = messageHandlerRegistry[event.data.type]
    if (handlerChain) {
        new MessageHandlerChain(handlerChain.handlerList).doHandle(event.data.message);
    }
}

const localState = {
    requestNotificationPermission: false
}

class MessageHandlerChain {
    handlerList;
    ops = 0;
    constructor(handlerList) {
        this.handlerList = handlerList || [];
    }

    doHandle(message) {
        if (this.ops < this.handlerList.length) {
            this.handlerList[this.ops++](message, this);
        }
    }

    addFirst(handler) {
        this.handlerList.unshift(handler);
    }

    addLast(handler) {
        this.handlerList.push(handler);
    }

    remove(handler) {
        this.handlerList = this.handlerList.filter(h => h !== handler);
    }
}

async function elNotificationHandler(message, chain) {
    ElNotification({
        type: message.payload.type,
        title: message.payload.title,
        message: message.payload.message
    })
    chain.doHandle(message);
}

async function systemNotificationHandler(message, chain) {
    if (!("Notification" in window)) {
        console.debug("此浏览器不支持通知。");
        chain.doHandle(message);
        return;
    }

    if (Notification.permission == "granted") {
        const notification = new Notification(message.payload.title, {
            icon: "/favicon.ico",
            body: message.payload.message
        });

        notification.onclick = function (event) {
            window.focus();
        }
        return;
    }

    if (Notification.permission == "default") {
        if (localState.requestNotificationPermission) {
            chain.doHandle(message);
            return
        }
        localState.requestNotificationPermission = true;
        ElMessageBox.alert("请求获取系统通知权限", "系统提示", {
            center: true,
            type: 'info',
        }).then(() => {
            Notification.requestPermission();
        })
    }
    chain.doHandle(message);
}

async function notificationClickHandler(message, chain) {
    window.focus();
    chain.doHandle(message);
}

function getMessageHandlerChain(type) {
    if (!messageHandlerRegistry[type]) {
        messageHandlerRegistry[type] = new MessageHandlerChain();
    }
    return messageHandlerRegistry[type];
}

const messageHandlerRegistry = {
    "notification-click": new MessageHandlerChain([notificationClickHandler]),
    "websocket-notification": new MessageHandlerChain([elNotificationHandler, systemNotificationHandler]),
}

export {
    shardWorker,
    getMessageHandlerChain
}