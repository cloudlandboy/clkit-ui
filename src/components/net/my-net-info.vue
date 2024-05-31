<template>
    <el-card class="clkit-card" v-show="!loading">
        <template #header>
            <div class="card-header">
                <span>本机网络信息</span>
            </div>
        </template>
        <div class="clkit-ip-group-item">
            <span>内网ip:</span>
            <el-tag size="large" type="info" v-for="ip in info.lanIpList">{{ ip }}</el-tag>
        </div>
        <div class="clkit-ip-group-item">
            <span>公网ip:</span>
            <el-tag size="large" :type="info.internetIp ? 'success' : 'danger'">{{ info.internetIp || '接口异常' }}</el-tag>
        </div>
    </el-card>
</template>

<script setup>
import { onBeforeMount, ref } from "vue";
import { getInfo } from "@/api/net/internet";

const loading = ref(true);
const info = ref({
    internetIp: '',
    lanIpList: [],
});

onBeforeMount(() => {
    getInfo().then(res => {
        info.value = res.data.data;
        loading.value = false;
    })
});

</script>

<style scoped>
.clkit-ip-group-item {
    padding: 16px;
}

.clkit-ip-group-item .el-tag {
    margin-left: 16px;
}
</style>