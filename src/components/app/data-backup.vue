<template>
    <el-card class="box-card">
        <template #header>
            <div class="card-header">
                <span>数据备份</span>
            </div>
        </template>
        <el-button @click="submitExportData">导出数据</el-button>



        <el-upload class="upload-demo" action="" :limit="1" style="margin-top: 32px" :before-upload="submitImport">
            <el-button type="primary">导入数据</el-button>
        </el-upload>

    </el-card>
</template>

<script setup>
import { exportData, importData } from "@/api/app";
import { downloadFile } from "@/util/web-file-utils";
import { ElNotification } from 'element-plus'

function submitExportData() {
    exportData([]).then(res => {
        downloadFile(JSON.stringify(res.data), { type: res.headers['content-type'] }, decodeURIComponent(res.headers['content-disposition'].substring(20)))
    })
}

function submitImport(rowFile) {
    importData(rowFile).then(res => {
        ElNotification.success({ title: '导入成功' })
    })
    return false;
}
</script>