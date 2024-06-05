<template>
    <el-form>
        <el-form-item label="连接地址">
            <el-input v-model="socketState.url"></el-input>
            <el-button>开启连接</el-button>
        </el-form-item>
    </el-form>
</template>
<script setup>
import { ref } from 'vue';

var socket = null;
const socketState = ref({
    url: '',
    status: '',
});

function connect() {
    socket = new WebSocket(socketState.url);
    socket.addEventListener("open", function (event) {
        socket.send("Hello Server!");
    });

    socket.addEventListener("message", function (event) {
        console.log("Message from server ", event.data);
    });
}



</script>