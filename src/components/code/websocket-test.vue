<template>
    <el-card header="Websocket连接测试">
        <div class="clkit-websocket-test-container">
            <el-form class="clkit-send-container">
                <el-form-item label="连接地址">
                    <el-input style="width: 460px;" v-model="socketState.url"></el-input>
                    <el-button v-if="socketState.status === 1" type="danger" @click="disconnect">断开连接</el-button>
                    <el-button v-else type="success" @click="connect">开启连接</el-button>
                </el-form-item>
                <el-form-item>
                    <el-input type="number" style="width: 220px" v-model="socketState.intervalSecond"
                        :disabled="intervalEnabled">
                        <template #prepend>每隔</template>
                        <template #append>秒发送</template>
                    </el-input>
                    <el-input style="width: 292px;" v-model="socketState.intervalContent" :disabled="intervalEnabled" />
                    <el-button :type="intervalEnabled ? 'danger' : 'info'" @click="intervalEnabled = !intervalEnabled">
                        {{ intervalEnabled ? "停止发送" : "开始发送" }}
                    </el-button>
                </el-form-item>
                <el-form-item>
                    <el-input type="textarea" placeholder="发送到服务端的内容" resize="none" v-model="socketState.inputContent"
                        :rows="4" :disabled="socketState.status !== 1" />
                    <el-button type="primary" :disabled="socketState.status !== 1"
                        @click="sendMessage(socketState.inputContent)">发送消息</el-button>
                </el-form-item>
                <div ref="trackListRef" class="clkit-track-list clkit-custom-scrollbar">
                    <p v-for="message in trackList">
                        <span class="clkit-message-time" :style="{ color: message.color }">{{ message.time }} => </span>
                        <span class="clkit-message-content">{{ message.content }}</span>
                    </p>
                </div>
            </el-form>
            <div class="clkit-message-container">
                <div>
                    <b>消息记录</b>
                    <el-button text type="primary" @click="messageList = []" style="margin: 0 8px;">清空消息</el-button>
                    <el-switch v-model="socketState.highlightJson" active-text="json格式"
                        @change="highlightJson"></el-switch>
                </div>
                <div ref="messageListRef" class="clkit-message-list clkit-custom-scrollbar">
                    <div v-for="message in messageList"
                        :class="{ 'clkit-message-item': true, 'clkit-message-right': !message.isSend }">
                        <div>
                            <div class="clkit-message-time" :style="{ color: message.color }">{{ message.time }}</div>
                            <div class="clkit-message-content">
                                <div v-show="socketState.highlightJson">
                                    <pre><code class="language-json">{{ message.content }}</code></pre>
                                </div>
                                <div v-show="!socketState.highlightJson">
                                    <pre>{{ message.content }}</pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </el-card>

</template>
<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';
import dayjs from 'dayjs';
import { NORM_TIME_PATTERN } from '@/constants/common';
import { useAuthStore } from '@/stores/auth';
import { getLocalStore } from '@/util/local-store';
import axios from 'axios';
import Prism from "prismjs";

var socket = null;
var timer = null;

const trackListRef = ref();
const messageListRef = ref();
const trackList = ref([]);
const messageList = ref([]);

const localStore = getLocalStore("websocketTest");
//状态，0:未连接,1:已连接,2:已断开
const socketState = ref(localStore.getJsonOrDefault({
    status: 0,
    inputContent: '',
    intervalSecond: 30,
    intervalContent: '{"type":"0"}',
    highlightJson: false,
    url: '',
}));

localStore.vueWatch(socketState);

const intervalEnabled = ref(false);

function connect() {
    try {
        socket = new WebSocket(socketState.value.url);
        socket.onopen = function () {
            socketState.value.status = 1;
            trackList.value.push(buildMessage("green", "连接成功"));
        }
        socket.onmessage = function (event) {
            messageList.value.push(buildMessage("green", event.data, false));
        }
        socket.onerror = function (event) {
            trackList.value.push(buildMessage("red", "连接失败"));
        }
        socket.onclose = function () {
            socketState.value.status = 2;
            intervalEnabled.value = false;
            trackList.value.push(buildMessage("#eebe77", "断开连接"));
        }
    } catch (err) {
        trackList.value.push(buildMessage("red", "发生错误：" + err.message));
    }

}

function disconnect() {
    socket.close();
    intervalEnabled.value = false;
}

function sendMessage(message) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        return
    }
    messageList.value.push(buildMessage("#73767a", message, true));
    socket.send(message);
}

function buildMessage(color, content, isSend) {
    if (socketState.value.highlightJson) {
        try {
            //格式化
            content = JSON.stringify(JSON.parse(content), null, 2);
        } catch (err) {
            //ignore
        }
    }

    return Object.freeze({
        color,
        isSend,
        content,
        time: dayjs().format(NORM_TIME_PATTERN)
    })
}

watch(trackList, () => {
    nextTick().then(() => {
        trackListRef.value.scrollTop = trackListRef.value.scrollHeight
    })
}, {
    deep: true
})

watch(messageList, () => {
    nextTick().then(() => {
        if (socketState.value.highlightJson) {
            highlightJson(true);
        }
        messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    })
}, {
    deep: true
})

watch(intervalEnabled, (value) => {
    if (timer) {
        clearInterval(timer);
    }
    if (!value) {
        return
    }
    timer = setInterval(() => {
        sendMessage(socketState.value.intervalContent);
    }, socketState.value.intervalSecond * 1000);

})

function highlightJson(enable) {
    if (enable) {
        nextTick().then(() => {
            Prism.highlightAllUnder(messageListRef.value);
            messageListRef.value.scrollTop = messageListRef.value.scrollHeight
        })
    }
}

onMounted(() => {
    if (socketState.value.url) {
        return
    }
    const authStore = useAuthStore();
    if (!authStore.authInfo.token) {
        return
    }
    const apiPath = axios.defaults.baseURL.substring(axios.defaults.baseURL.indexOf('://'));
    socketState.value.url = "ws" + apiPath + "/websocket?accessToken=" + authStore.authInfo.token.accessToken;
})

</script>

<style scoped>
.el-form-item .el-input,
.el-form-item .el-textarea {
    margin-right: var(--clkit-margin);
}

.el-form-item .el-textarea {
    width: 528px;
}

.clkit-websocket-test-container {
    display: flex;
    gap: 80px;
}

.clkit-message-container {
    width: 800px;
}

.clkit-track-list {
    padding: 0 16px;
    overflow-y: auto;
    height: 480px;
    width: 600px;
    box-shadow: inset 0px 0px 5px 0px #74787a;
}

.clkit-message-list {
    margin-top: 10px;
    padding: 16px;
    height: 650px;
    overflow-y: auto;
    box-shadow: inset 0px 0px 5px 0px #1ba784;
}

.clkit-message-item {
    display: flex;
}

.clkit-message-right {
    justify-content: flex-end;
}

.clkit-message-right .clkit-message-time {
    text-align: right;
}

.clkit-message-content {
    overflow-wrap: break-word;
    word-break: break-all;
    padding: 8px;
    max-width: 480px;
}

.clkit-message-content pre {
    text-wrap: wrap;
}

.clkit-message-content pre::-webkit-scrollbar {
    width: 3px;
    height: 10px;
}

.clkit-message-content pre::-webkit-scrollbar-thumb {
    background: #b3e19d;
    border-radius: 6px;
}

.clkit-message-content pre::-webkit-scrollbar-track {
    background: #f0f0f0;
    cursor: grab;
}

.clkit-message-time {
    user-select: none;
}
</style>