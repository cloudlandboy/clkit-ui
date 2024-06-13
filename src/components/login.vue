<template>
    <el-dialog v-model="authStore.isInLogin" center :align-center="true" :close-on-click-modal="false"
        :close-on-press-escape="false" width="320px" title="密码登录">
        <el-form :model="loginForm" style="margin: 32px 16px 0 16px;" size="large" @change="clearErrorMessage">
            <el-form-item>
                <el-input v-model="loginForm.username" placeholder="请输入账号" />
            </el-form-item>
            <el-form-item :error="errorMessage">
                <el-input v-model="loginForm.password" show-password type="password" placeholder="请输入密码" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button color="var(--clkit-color-pale-purple)" size="large" style="width: 230px;"
                @click="submitLogin">登录</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { loginByUserName } from "@/api/app/auth";
const authStore = useAuthStore();
const loginForm = ref({
    username: '',
    password: ''
});
const errorMessage = ref('');

function clearErrorMessage() {
    errorMessage.value = '';
}
function submitLogin() {
    loginByUserName(loginForm.value.username, loginForm.value.password).then(res => {
        authStore.tokenLocalStore.store(res.data.data);
        //TODO 直接刷新页面
        setTimeout(() => {
            window.location.reload();
        }, 200);
    }).catch(err => {
        if (err.response) {
            errorMessage.value = err.response.data.msg;
        }
    })
}
</script>

<style scoped></style>