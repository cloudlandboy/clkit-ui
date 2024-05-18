<template>
    <!-- page -->
    <div>
        <div style="padding-bottom: 0.6rem;text-align: right;">
            <el-button type="primary" @click="openSaveOrUpdateDb(null)">新增</el-button>
        </div>
        <el-table :data="dataSourceList" border style="width: 100%">
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="platform" label="平台" />
            <el-table-column prop="host" label="主机地址" />
            <el-table-column prop="port" label="端口" />
            <el-table-column :show-overflow-tooltip="true" prop="database" label="数据库" />
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button size="small" @click="openSaveOrUpdateDb(scope.row)">编辑</el-button>
                    <el-button size="small" type="danger" @click="removeDb(scope.row.id)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>

    <!-- add or edit -->
    <el-dialog v-model="dbAddDialogVisible" :title="dbForm.id ? '修改数据源' : '新增数据源'" width="30%"
        :close-on-click-modal="false">
        <el-form ref="dbFormRef" :model="dbForm" :rules="dbFormRules" label-position="right" label-width="80px">
            <el-form-item label="唯一名称" prop="name">
                <el-input v-model="dbForm.name" placeholder="自定义名称" :validate-event="false" clearable />
            </el-form-item>
            <el-form-item label="类型" prop="platform">
                <el-select v-model="dbForm.platform" style="width:100%">
                    <el-option v-for="item in platformList" :key="item" :label="item" :value="item" />
                </el-select>
            </el-form-item>
            <el-form-item label="主机地址" prop="host">
                <el-input v-model="dbForm.host" placeholder="数据库ip地址" :validate-event="false" clearable />
            </el-form-item>
            <el-form-item label="端口" prop="port">
                <el-input-number v-model="dbForm.port" placeholder="数据库端口" :validate-event="false" :controls="false"
                    :min="0" :max="65535" style="width:100%" class="input-content-left" />
            </el-form-item>
            <el-form-item label="用户名" prop="username">
                <el-input v-model="dbForm.username" placeholder="数据库用户名" :validate-event="false" clearable />
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input v-model="dbForm.password" type="password" :validate-event="false" show-password
                    placeholder="数据库密码" />
            </el-form-item>
            <el-form-item label="数据库" prop="database">
                <el-input v-model="dbForm.database" placeholder="数据库名称" :validate-event="false" clearable />
            </el-form-item>
            <el-form-item class="clkit-form-right-btn-group">
                <el-button type="primary" @click="submitSaveOrUpdateDb">{{ dbForm.id ? '更新' : '保存' }}</el-button>
                <el-button @click="dbAddDialogVisible = false">取消</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<script setup>
import { ref, onMounted, onBeforeMount } from "vue";
import * as dbApi from "@/api/gen/db";
import { ElNotification } from 'element-plus'
import { FieldDef } from "@/util/object-utils.js";

const platformList = ref([]);
const dataSourceList = ref([]);
const dbAddDialogVisible = ref(false);

const dbFormRef = ref();
const dbFormFieldDef = new FieldDef({
    name: '',
    platform: null,
    host: '',
    port: 3306,
    username: '',
    password: '',
    database: ''
});
const dbForm = ref(dbFormFieldDef.getObj())

const dbFormRules = ref({
    name: [{ required: true, message: '请输入唯一名称', trigger: 'blur' }],
    platform: [{ required: true, message: '请选择数据库平台', trigger: 'blur' }],
    host: [{ required: true, message: '请输入数据库地址', trigger: 'blur' }],
    port: [{ required: true, message: '请输入数据库端口', trigger: 'blur' }],
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    database: [{ required: true, message: '请输入数据库', trigger: 'blur' }],
});

function openSaveOrUpdateDb(data) {
    if (data) {
        dbForm.value = data;
    } else {
        dbForm.value = dbFormFieldDef.getObj();
        dbForm.value.platform = platformList.value[0];
    }
    dbAddDialogVisible.value = true;
}

function submitSaveOrUpdateDb() {
    dbFormRef.value.validate(valid => {
        if (!valid) {
            return
        }
        if (dbForm.value.id) {
            dbApi.update(dbForm.value.id, dbForm.value).then(res => {
                fetchDataSource();
                dbAddDialogVisible.value = false;
                ElNotification.success({ title: '更新成功' })
            })
        } else {
            dbApi.create(dbForm.value).then(res => {
                dbForm.value = dbFormFieldDef.getObj();
                fetchDataSource();
                dbAddDialogVisible.value = false;
                ElNotification.success({ title: '创建成功' })
            })
        }
    })
}

function removeDb(id) {
    dbApi.remove(id).then(res => {
        fetchDataSource();
        ElNotification.success({ title: '删除成功' })
    });
}

function fetchDataSource() {
    dbApi.listAll().then(res => {
        dataSourceList.value = res.data.data;
    })
}

onBeforeMount(() => {
    dbApi.getSupportedPlatform().then(res => {
        platformList.value = res.data.data;
    })

})

onMounted(() => {
    fetchDataSource();
})
</script>