<template>
    <el-card class="box-card">
        <template #header>
            <div class="card-header">
                <span>JSON工具</span>
            </div>
        </template>
        <el-row :gutter="20">
            <el-col :span="18">
                <codemirror v-model="jsonCode" placeholder="Write json form here" @change="jsonCodeChanged"
                    :style="{ height: '580px', width: '100%' }" :autofocus="true" :indent-with-tab="true" :tab-size="2"
                    :extensions="codemirrorExtensions" />
            </el-col>
            <el-col :span="6">
                <el-button @click="format">格式化</el-button>
                <el-button @click="compress">压缩</el-button>
                <el-button @click="escape">转义</el-button>
                <el-button @click="unescape">去转义</el-button>
                <div class="clkit-btn-group">
                    <el-button @click="openGenJavaClassDialog">转为JAVA类</el-button>
                </div>
            </el-col>
        </el-row>

        <!-- gen java form dialog -->
        <el-dialog v-model="genJavaClassDialogVisible" title="生成JAVA类" width="40%">
            <el-form :inline="false" :model="genJavaClassForm">
                <el-form-item label="包名">
                    <el-input v-model="genJavaClassForm.packagePath" />
                </el-form-item>
                <el-form-item label="类名">
                    <el-input v-model="genJavaClassForm.className" />
                </el-form-item>
                <el-form-item label="包含">
                    <el-checkbox-group v-model="genJavaClassForm.includeList">
                        <el-checkbox v-for="include in javaClassIncludeList" :key="include" :label="include"
                            :value="include">
                            {{ include }}
                        </el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="Lombok">
                    <el-switch v-model="genJavaClassForm.useLombok" />
                </el-form-item>
                <el-form-item label="Serializable">
                    <el-switch v-model="genJavaClassForm.serializable" />
                </el-form-item>
                <el-form-item class="el-form-right-btn-group">
                    <el-button @click="submitGenJavaClass(true)">预览</el-button>
                    <el-button type="primary" @click="submitGenJavaClass(false)">生成</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>

        <!-- gen java preview dialog -->
        <el-dialog v-model="javaClassPreviewDialogVisible" title="JAVA类预览" width="52%" :destroy-on-close="true"
            @open="highlightJavaCode">
            <pre style="height: 600px;overflow: auto;"><code ref="javaClassPreviewRef" class="language-java"
            v-html="previewJavaCode"></code></pre>
        </el-dialog>
    </el-card>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from 'element-plus'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import Prism from "prismjs";
import "prismjs/themes/prism-okaidia.css";
import { genJavaClass } from "@/api/gen/gen";
import { downloadAxiosResponse } from "@/util/web-file-utils";
import { prefixLocalStore } from "@/util/local-store";

const localStore = prefixLocalStore('jsonUtils');
const codemirrorExtensions = [json(), oneDark];
const jsonCode = ref('');
const jsonState = {
    obj: null,
    format: null, //F:格式化,C:压缩
    escaped: false, //已转义
    reset: function () {
        this.obj = null;
        this.format = null;
        this.escaped = false;
    }
};
const genJavaClassDialogVisible = ref(false);
const javaClassPreviewDialogVisible = ref(false);
const javaClassIncludeList = ['setter', 'getter', 'toString', 'hashcodeAndEquals'];
const genJavaClassForm = ref(localStore.getJsonOrDefault('genJavaClassForm', {
    className: 'Clkit',
    packagePath: 'cn.clboy',
    useLombok: true,
    serializable: true,
    includeList: [].concat(javaClassIncludeList)
}));
const previewJavaCode = ref('');
const javaClassPreviewRef = ref();

function getJsonState() {
    if (jsonState.obj) {
        return jsonState;
    }
    try {
        jsonState.obj = JSON.parse(jsonCode.value);
        return jsonState;
    } catch (error) {
        const lineColumn = error.message.match(/line (\d+) column (\d+)/);
        if (!lineColumn) {
            ElMessage.error(`JSON格式有误`);
            throw error;
        }
        const line = lineColumn[1];
        const column = lineColumn[2];
        ElMessage.error(`JSON格式有误：第${line}行,第${column}列`);
        throw error;
    }
}

function jsonCodeChanged(value) {
    jsonState.reset();
}

function format() {
    const state = getJsonState();
    if (state.format === 'F') {
        return;
    }
    jsonCode.value = JSON.stringify(state.obj, null, 2)
    state.format = 'F';
    if (state.escaped) {
        state.escaped = false;
        escape();
    }
}

function compress() {
    const state = getJsonState();
    if (state.format === 'C') {
        return;
    }
    jsonCode.value = JSON.stringify(state.obj)
    state.format = 'C';
    if (state.escaped) {
        state.escaped = false;
        escape();
    }
}

function escape() {
    const state = getJsonState();
    if (state.escaped) {
        return;
    }
    jsonCode.value = jsonCode.value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    state.escaped = true;
}

function unescape() {
    //const inputJsonCode = jsonCode.value;
    jsonCode.value = jsonCode.value.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    jsonState.escaped = false;
}

function openGenJavaClassDialog() {
    getJsonState();
    genJavaClassDialogVisible.value = true;
}

function submitGenJavaClass(forPreview) {
    localStore.set('genJavaClassForm', genJavaClassForm.value);
    const state = getJsonState();
    const data = Object.assign({}, genJavaClassForm.value, { forPreview, sourceType: 'JSON', sourceCode: JSON.stringify(state.obj) });
    genJavaClass(data).then(res => {
        if (forPreview) {
            const data = res.data.data;
            const parts = [];
            for (const classFileName in data) {
                parts.push(`//-------------------------${classFileName}-------------------------\n${data[classFileName].trim()}`);
            }
            previewJavaCode.value = parts.join('\n\n');
            //  Prism.highlight(, Prism.languages.java, 'java');
            javaClassPreviewDialogVisible.value = true;
            return
        }
        downloadAxiosResponse(res);
    })
}

function highlightJavaCode() {
    Prism.highlightElement(javaClassPreviewRef.value);
}
</script>

<style scoped>
.clkit-btn-group {
    margin-top: 16px
}
</style>