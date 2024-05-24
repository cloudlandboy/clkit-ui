<template>
    <div class="clkit-home-content">
        <div>
            {{ appStore.config.title }}
        </div>
        <ul>
            <li>当前版本: <el-tag type="success" style="margin-left: 1rem;">{{ version }}</el-tag></li>
            <li>博客地址：<a href="https://www.clboy.cn/" target="_blank">https://www.clboy.cn</a></li>
            <li>源码：<a href="https://github.com/cloudlandboy/clkit"
                    target="_blank">https://github.com/cloudlandboy/clkit</a></li>
            <li>前端源码：<a href="https://github.com/cloudlandboy/clkit-ui"
                    target="_blank">https://github.com/cloudlandboy/clkit-ui</a></li>
        </ul>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAppStore } from "@/stores/app";
import { getVersion } from "@/api/app/app";

const appStore = useAppStore();
const version = ref('');

onMounted(() => {
    getVersion().then(res => version.value = res.data.data);
})
</script>

<style scoped>
.clkit-home-content>div:first-child {
    text-align: center;
    margin-top: 1rem;
    font-size: 48px;
    font-weight: 800;
    font-family: "JetBrainsMono";
    color: var(--clkit-color-pale-purple);
}

.clkit-home-content {
    padding: 1rem;
}

.clkit-home-content ul {
    margin-left: 38px;
    list-style-type: disclosure-closed;
}

.clkit-home-content li {
    padding: 1rem;
    color: #337ecc;
}

.clkit-home-content li>a {
    text-decoration: none;
    color: #73767a;
    font-size: 0.8rem;
}
</style>