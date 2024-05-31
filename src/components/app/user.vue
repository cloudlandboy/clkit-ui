<template>
    <el-card class="clkit-card">
        <template #header>
            <div class="clkit-card-header">
                <div class="clkit-card-header-title">用户管理</div>
                <div class="clkit-card-header-btn-area">
                    <el-button type="primary" @click="openAddOrEdit(null)">新增</el-button>
                </div>
            </div>
        </template>
        <el-table :data="pageData" border style="width: 100%">
            <el-table-column prop="nickname" label="昵称" width="240" />
            <el-table-column prop="realName" label="真实姓名" width="240" />
            <el-table-column prop="name" label="用户名" width="240" />
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button size="small" color="#fcd337" icon="Key" circle
                        @click="sumitResetPassword(scope.row)"></el-button>
                    <el-button size="small" @click="openAddOrEdit(scope.row)">编辑</el-button>
                    <el-button size="small" type="danger" @click="submitRemove(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="clkit-pagination-box">
            <el-pagination background layout="prev, pager, next" v-model:current-page="pageState.page"
                v-model:page-size="pageState.size" :total="pageState.total" />
        </div>

        <!-- 新增编辑框 -->
        <el-dialog class="clkit-user-edit-dialog" v-model="addEditDialogVisible" title="新增用户"
            :close-on-click-modal="false" :close-on-press-escape="false">
            <el-form ref="userFormRef" :model="userForm" :rules="userFormRules" label-width="6em"
                :validate-on-rule-change="false">
                <el-form-item label="用户名" prop="name">
                    <el-input v-model="userForm.name" />
                </el-form-item>
                <el-form-item label="真实姓名" prop="realName">
                    <el-input v-model="userForm.realName">
                    </el-input>
                </el-form-item>
                <el-form-item label="昵称" prop="nickname">
                    <el-input v-model="userForm.nickname">
                    </el-input>
                </el-form-item>
                <el-form-item label="初始密码" prop="password" v-show="!userForm.id">
                    <el-input v-model="userForm.password" type="password" show-password>
                    </el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="userForm.email">
                    </el-input>
                </el-form-item>
                <el-form-item label="角色" prop="roleIds">
                    <el-select v-model="userForm.roleIds" multiple collapse-tags :max-collapse-tags="3"
                        placeholder="请选择角色">
                        <el-option v-for="role in roleList" :key="role.id" :label="role.name" :value="role.id" />
                    </el-select>
                </el-form-item>
                <el-form-item class="clkit-form-right-btn-group">
                    <el-button type="primary" @click="submitUserForm">保存</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </el-card>
</template>

<script setup>
import * as userApi from '@/api/app/user'
import { getAll as listRole } from '@/api/app/role'
import { ObjectSupplier } from '@/util/object-utils';
import { ref, onBeforeMount, shallowRef } from 'vue';
import { USERNAME_RULE } from '@/constants/rule';
import { hPointText, operationConfirm, operationResultAlert, operationSuccessNotify } from '@/util/clkil-utils';

const addEditDialogVisible = ref(false)
const pageState = ref({
    page: 1,
    size: 20,
    total: 1000
})
const pageData = ref([]);

const userSupplier = new ObjectSupplier(() => {
    return {
        name: '',
        nickname: '',
        realName: '',
        password: '',
        email: '',
        roleIds: []
    }
})

const userFormRef = ref();
const userForm = ref(userSupplier.getObj());
const userFormRules = ref({
    name: [
        { required: true, whitespace: true, message: '用户名不能为空', trigger: 'blur' },
        { pattern: USERNAME_RULE, message: '用户名为5到16位 (字母，数字，下划线，减号)', trigger: 'blur' },
    ],
    nickname: [
        { required: true, whitespace: true, message: '昵称不能为空', trigger: 'blur' },
    ],
    realName: [
        { required: true, whitespace: true, message: '真实姓名不能为空', trigger: 'blur' },
    ]
})
const roleList = shallowRef([]);

function loadPageData() {
    userApi.getPage({
        page: pageState.value.page,
        size: pageState.value.size
    }).then(res => {
        const data = res.data.data;
        pageData.value = data.content;
        pageState.value.total = data.totalElements;
    })
}

function openAddOrEdit(data) {
    if (userFormRef.value) {
        userFormRef.value.clearValidate();
    }
    if (data) {
        userForm.value = data;
        userForm.value.roleIds = data.role.map(r => r.id);
        delete userFormRules.value.password;
    } else {
        userForm.value = userSupplier.getObj();
        userFormRules.value.password = [
            { required: true, message: '初始密码不能为空', trigger: 'blur' },
            { min: 6, max: 16, message: '密码需6到16位', trigger: 'blur' },
        ]
    }
    addEditDialogVisible.value = true;
}

function submitUserForm() {
    userFormRef.value.validate((valid) => {
        if (!valid) {
            return
        }
        let requestPromise;
        if (userForm.value.id) {
            requestPromise = userApi.updateById(userForm.value.id, userForm.value);
        } else {
            requestPromise = userApi.save(userForm.value);
        }
        requestPromise.then(res => {
            loadPageData();
            addEditDialogVisible.value = false;
            operationSuccessNotify();
        })
    })
}

function submitRemove(data) {
    operationConfirm(hPointText('确认删除', data.realName, '用户吗？')).then(() => {
        userApi.removeById(data.id).then(() => {
            loadPageData();
            operationSuccessNotify();
        });
    })
}

function sumitResetPassword(data) {
    operationConfirm(hPointText('确认重置', data.realName, '的密码吗？')).then(() => {
        userApi.resetUserPassword(data.id).then((res) => {
            operationResultAlert(hPointText('新密码：', res.data.data, '', '#1ba784'));
        });
    })
}

onBeforeMount(() => {
    loadPageData();
    listRole().then(res => {
        roleList.value = res.data.data;
    })
})
</script>

<style>
.clkit-user-edit-dialog {
    width: 500px;
    padding: 16px 32px 8px 16px;
}
</style>