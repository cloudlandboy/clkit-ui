<template>
    <el-tabs tabPosition="top" class="clkit-user-info-container">
        <el-tab-pane label="个人信息">
            <el-form ref="personalInfoFormRef" class="clkit-personal-info-form" :model="personalInfoForm"
                :rules="personalInfoFormRule" :inline-message="true">
                <el-descriptions :column="1" size="large" border>
                    <el-descriptions-item label="用户名">{{ authStore.authInfo.user.name }}</el-descriptions-item>
                    <el-descriptions-item label="真实姓名">{{ authStore.authInfo.user.realName }}</el-descriptions-item>
                    <el-descriptions-item label="角色">
                        <el-tag class="clkit-role-tag" v-for="role in authStore.authInfo.user.roleNameList"
                            :color="getRoleTagColor()" :key="role" effect="dark">
                            {{ role }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="昵称">
                        <el-form-item prop="nickname">
                            <el-input v-model="personalInfoForm.nickname" :validate-event="false" />
                        </el-form-item>
                    </el-descriptions-item>
                    <el-descriptions-item label="邮箱">
                        <el-form-item prop="email">
                            <el-input v-model="personalInfoForm.email" />
                        </el-form-item>
                    </el-descriptions-item>
                    <el-descriptions-item>
                        <el-button type="primary">保存</el-button>
                    </el-descriptions-item>
                </el-descriptions>
            </el-form>
        </el-tab-pane>
        <el-tab-pane label="帐号密码">
            <el-form ref="passwordFormRef" class="clkit-password-form" :model="passwordForm" label-width="8em"
                :rules="passwordFormRule">
                <el-form-item label="旧密码" prop="oldPassword">
                    <el-input v-model="passwordForm.oldPassword" type="password" :validate-event="false" />
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                    <el-input v-model="passwordForm.newPassword" type="password" :validate-event="false" />
                </el-form-item>
                <el-form-item label="确认新密码" prop="rePassword">
                    <el-input v-model="passwordForm.rePassword" type="password" :validate-event="false" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitPasswordForm">保存</el-button>
                </el-form-item>
            </el-form>
        </el-tab-pane>
    </el-tabs>
</template>
<script setup>
import { updatePassword } from '@/api/app/user';
import { useAuthStore } from '@/stores/auth';
import { operationSuccessNotify } from '@/util/clkil-utils';
import randomColor from 'randomcolor';
import { onBeforeMount, ref } from 'vue';

const authStore = useAuthStore();

const personalInfoFormRef = ref();
const personalInfoForm = ref({
    nickname: '',
    email: ''
})

const passwordFormRef = ref();
const passwordForm = ref({
    oldPassword: '',
    newPassword: '',
    rePassword: '',
});


const personalInfoFormRule = {
    nickname: [{ required: true, whitespace: true, message: '昵称不能为空' }]
}

const passwordFormRule = {
    oldPassword: [
        { required: true, message: '原密码不能为空' },
    ],
    newPassword: [
        { required: true, message: '密码不能为空' },
        { min: 6, max: 16, message: '密码需6到16位' }
    ],
    rePassword: [
        { required: true, message: '确认密码不能为空' },
        {
            validator: (rule, value, callback) => {
                if (value === passwordForm.value.newPassword) {
                    callback();
                    return
                }
                callback(new Error('两次密码输入不一致'));
            }
        }
    ]
}

function submitPasswordForm() {
    passwordFormRef.value.validate(valid => {
        if (!valid) {
            return
        }
        updatePassword(passwordForm.value).then(() => operationSuccessNotify('修改密码成功'))
    })
}


function getRoleTagColor() {
    return randomColor({
        luminosity: 'dark'
    });
}

onBeforeMount(() => {
    authStore.refreshUserInfo().then((userInfo) => {
        personalInfoForm.value.nickname = userInfo.nickname;
        personalInfoForm.value.email = userInfo.email;
    })
})
</script>

<style>
.clkit-user-info-container .clkit-role-tag {
    border-style: none
}

.clkit-user-info-container .clkit-password-form {
    width: 420px;
}

.clkit-personal-info-form .el-descriptions__label {
    width: 15em;
}

.clkit-personal-info-form .el-form-item {
    margin-bottom: 0;
}

.clkit-personal-info-form .el-input {
    width: 250px;
}
</style>