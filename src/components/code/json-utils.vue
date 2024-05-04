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
                <el-button @click="showTree">可视化</el-button>
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

        <!-- json tree dialog -->
        <el-dialog v-model="treeDialogVisible" title="JSON树" :fullscreen="true">
            <el-tree-v2 ref="treeRef" style="width: 100%;overflow: auto;" :height="800" :data="jsonTreeData"
                @node-click="treeNodeClickHandle">
                <template #default="{ node, data }">
                    <div class="clkit-json-tree-node">
                        <span :style="{ 'color': getTypeConfig(data.type).color }" class="clkit-json-tree-node-flag">
                            {{ getTypeConfig(data.type).flag }}
                        </span>
                        <span :style="{ 'font-weight': 'bold', 'color': data.isArrayElement ? '#aaa' : '#4a0' }">
                            {{ node.label }}
                        </span>
                        <span v-if="data.isSimpeType">
                            <span> : </span>
                            <span :style="{ 'margin-left': '16px', 'color': getTypeConfig(data.type).color }"
                                class="clkit-json-tree-node-value">
                                {{ data.value == null ? "null" : data.value }}
                            </span>
                        </span>
                    </div>
                </template>
            </el-tree-v2>
            <div class="clkit-json-tree-toobar-btn">
                <el-icon @click="treeDialogToolbarVisible = true" :size="32">
                    <Fold />
                </el-icon>
            </div>

            <div class="clkit-json-tree-toobar" v-show="treeDialogToolbarVisible">
                <el-icon @click="treeDialogToolbarVisible = false" :size="32"
                    style="vertical-align: middle;margin-right: 16px;">
                    <Expand />
                </el-icon>
                <el-button @click="treeRef.setExpandedKeys([])">折叠全部</el-button>

                <el-form :model="treeActiveNodeData" label-width="auto" style="margin-top: 16px;">
                    <el-form-item label="Path">
                        <el-input v-model="treeActiveNodeData.path" :readonly="true" />
                    </el-form-item>
                    <el-form-item label="Key">
                        <el-input v-model="treeActiveNodeData.label" :readonly="true" />
                    </el-form-item>
                    <el-form-item label="Value">
                        <el-input v-model="treeActiveNodeData.stringifyValue" :readonly="true" :rows="15"
                            type="textarea" />
                    </el-form-item>
                </el-form>
            </div>
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
const jsonTreeData = ref([]);
const jsonState = {
    obj: null,
    format: null, //F:格式化,C:压缩
    escaped: false, //已转义
    treeData: null,
    reset: function () {
        this.obj = null;
        this.format = null;
        this.escaped = false;
        this.treeData = null;
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

const treeDialogVisible = ref(false);
const treeDialogToolbarVisible = ref(false);
const treeRef = ref();
const typeConfig = {
    "string": {
        color: "#f63",
        flag: "str"
    },
    "number": {
        color: "#cc00ff",
        flag: "num"
    },
    "boolean": {
        color: "#09c",
        flag: "bol"
    },
    "null": {
        color: "#bb4",
        flag: "nul"
    },
    "array": {
        color: "#FF1493",
        flag: "[arr]"
    },
    "object": {
        color: "#808000",
        flag: "{obj}"
    }
}

const treeActiveNodeData = ref({});
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
            javaClassPreviewDialogVisible.value = true;
            return
        }
        downloadAxiosResponse(res);
    })
}

function showTree() {
    const state = getJsonState();
    if (!state.treeData) {
        state.treeData = toElTree(state.obj);
        jsonTreeData.value = state.treeData;
    }
    treeActiveNodeData.value = {};
    treeDialogToolbarVisible.value = false;
    treeDialogVisible.value = true;
}

function highlightJavaCode() {
    Prism.highlightElement(javaClassPreviewRef.value);
}

function toElTree(obj, parent) {
    const dataList = [];
    const parentPath = parent ? parent.path : 'root';
    const isArray = Array.isArray(obj);
    for (const key in obj) {
        const value = obj[key];
        const data = {
            label: key,
            value: value,
            stringifyValue: JSON.stringify(value, null, 2),
            type: value == null ? 'null' : (typeof value),
            isSimpeType: value == null || (typeof value) !== 'object',
            isArrayElement: isArray,
            path: isArray ? `${parentPath}[${key}]` : `${parentPath}.${key}`,
            children: []
        }
        if (data.type === 'object') {
            if (Array.isArray(value)) {
                data.type = 'array';
            }
            data.children = toElTree(value, data);
        }
        data.id = data.path;
        dataList.push(data);
    }
    return dataList;
}

function getTypeConfig(type) {
    return typeConfig[type] || { color: '#333', flag: 'unknow' }
}

function treeNodeClickHandle(data) {
    treeActiveNodeData.value = data;
}
</script>

<style scoped>
.clkit-btn-group {
    margin-top: 16px
}

.clkit-json-tree-node-flag {
    width: 28px;
    display: inline-block;
    font-size: 10px;
    opacity: 0.8;
}

.clkit-json-tree-node:hover .clkit-json-tree-node-value {
    font-weight: bold;
}

.clkit-json-tree-toobar-btn {
    position: absolute;
    top: 50px;
    right: 32px;
}

.clkit-json-tree-toobar {
    overflow: auto;
    width: 560px;
    height: 500px;
    position: absolute;
    top: 50px;
    right: 16px;
    padding: 8px;
    padding-right: 32px;
    background: rgb(230, 227, 227);
    border-radius: 4px;
}
</style>