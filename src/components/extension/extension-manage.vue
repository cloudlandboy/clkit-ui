<template>
    <el-card class="box-card" v-loading.fullscreen="installLoading" element-loading-text="安装扩展中...">
        <template #header>
            <div class="card-header">
                <span>扩展管理 </span>
                <el-icon>
                    <InfoFilled />
                </el-icon>
                <div style="float: right;">
                    <el-button :icon="Paperclip" color="#85ce61" circle @click="openAddOrEdit(null, '0')" />
                    <el-button :icon="Folder" color="#ffa400" circle @click="openAddOrEdit(null, '0', FOLDER_VALUE)" />
                </div>
            </div>
        </template>

        <!-- 列表 -->
        <el-tree :data="treeData" node-key="id" :default-expanded-keys="defaultExpand" :accordion="true"
            @node-expand="nodeExpand" @node-collapse="nodeCollapse"
            :props="{ class: 'clkit-extension-manage-tree-node' }">
            <template #default="{ data }">
                <div class="clkit-extension-folder-tree-node">
                    <div>
                        <el-icon v-if="isFolder(data.type)" size="16" color="#ffa400"
                            class="clkit-extension-folder-tree-icon">
                            <Folder />
                        </el-icon>
                        <el-icon v-else size="16" :color="data.installed ? '#85ce61' : '#909399'"
                            class="clkit-extension-folder-tree-icon">
                            <Paperclip />
                        </el-icon>
                        <span>{{ data.name }}</span>
                    </div>
                    <div>
                        <el-button v-if="data.hide" :icon="View" circle color="#fdf6ec" size="small"
                            @click.stop="updateHide(data, false)" />
                        <el-button v-else :icon="Hide" circle color="#73767a" size="small"
                            @click.stop="updateHide(data, true)" />
                        <span v-if="needInstall(data.type)" style="margin: 0 12px;">
                            <el-button v-if="data.installed" size="small" type="success"
                                @click.stop="doInstall(data.id)">重装</el-button>
                            <el-button v-else size="small" type="info" @click.stop="doInstall(data.id)">安装</el-button>
                        </span>
                        <span v-if="isFolder(data.type)" style="margin: 0 12px;">
                            <el-button :icon="Paperclip" color="#85ce61" circle size="small"
                                @click.stop="openAddOrEdit(null, data.id)" />
                            <el-button :icon="Folder" color="#ffa400" circle size="small"
                                @click.stop="openAddOrEdit(null, data.id, FOLDER_VALUE)" />
                        </span>
                        <el-button :icon="Edit" circle size="small" @click.stop="openAddOrEdit(data, data.folderId)" />
                        <el-button :icon="Right" color="#c0ebd7" circle size="small" @click.stop="doMove(data)" />
                        <el-button v-if="!data.children || data.children.length === 0" type="danger" :icon="Delete"
                            circle size="small" @click.stop="doRemove(data.id)" />
                    </div>
                </div>
            </template>
        </el-tree>

        <!-- add or edit -->
        <el-dialog v-model="formDialogVisible" :title="form.id ? '修改' : '新增'" width="750px"
            :close-on-click-modal="false">
            <el-form ref="formRef" :model="form" :rules="formRules" :validate-on-rule-change="false"
                label-position="right" label-width="120px">
                <el-form-item :label="isFolder(form.type) ? '文件夹名称' : '菜单名称'" prop="name">
                    <el-input v-model="form.name" placeholder="自定义唯一菜单名称" :validate-event="false" clearable />
                </el-form-item>
                <el-form-item label="排序值" prop="sortValue">
                    <el-input-number v-model="form.sortValue" :validate-event="false" />
                </el-form-item>
                <div v-show="!isFolder(form.type)">
                    <el-form-item label="类型">
                        <el-select v-model="form.type">
                            <el-option v-for="(et, value) in extensionTypeMap" v-show="!isFolder(value)" :label="et.label"
                                :value="value" :key="value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="地址" prop="url">
                        <el-input v-model="form.url" :validate-event="false" />
                    </el-form-item>
                    <el-form-item label="主页" prop="index">
                        <el-input v-model="form.index" :validate-event="false" />
                    </el-form-item>
                </div>
                <el-form-item class="el-form-right-btn-group">
                    <el-button type="primary" @click="submitSaveOrUpdate">{{ form.id ? '更新' : '保存' }}</el-button>
                    <el-button @click="formDialogVisible = false">取消</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>

        <!-- move -->
        <el-dialog v-model="moveDialogVisible" title="移动" width="750px">
            <el-tree :data="moveTreeData" node-key="id" :accordion="true" :props="{ class: getMoveNodeClass }"
                :expand-on-click-node="false" style="user-select: none;" @node-click="submitMove">
                <template #default="{ data }">
                    <div>
                        <el-icon size="16" color="#ffa400" style="vertical-align: middle;margin-right: 16px;">
                            <Folder />
                        </el-icon>
                        <span>{{ data.name }}</span>
                    </div>
                </template>
            </el-tree>
        </el-dialog>

    </el-card>
</template>
<script setup>
import { ref, onBeforeMount, computed } from "vue";
import { useAppConfigStore } from "@/stores/app-config";
import { ObjectSupplier, copyProperties } from "@/util/object-utils";
import { create, update, remove, getTree, install, getTypes } from "@/api/extension";
import { ElNotification } from "element-plus";
import { Delete, Edit, Paperclip, Folder, Right, Hide, View } from '@element-plus/icons-vue'

const FOLDER_VALUE = '0';
const expandSet = ref(new Set());
const defaultExpand = computed(() => {
    return Array.from(expandSet.value);
});

const appConfigStore = useAppConfigStore();

const extensionTypeMap = {};
const installLoading = ref(false);

const folderRules = {
    name: [{ required: true, message: '文件夹名称不能为空' }],
}
const menuRules = {
    name: [{ required: true, message: '菜单名称不能为空' }],
    type: [{ required: true, message: '类型必选' }],
    url: [{ required: true, message: '下载地址不能为空' }]
}
const formRules = ref(menuRules);

const treeData = ref([]);
const moveTreeData = computed(() => {
    return [{
        name: "/",
        type: "0",
        id: "0",
        children: treeData.value
    }]
})

const formObjSupplier = new ObjectSupplier(() => {
    return {
        id: null,
        folderId: '0',
        name: '',
        type: '1',
        url: '',
        index: '',
        sortValue: 0,
        hide: false
    }
});

const formRef = ref();
const form = ref(formObjSupplier.getObj());


const formDialogVisible = ref(false);
const moveDialogVisible = ref(false);

async function fetchData() {
    return getTree().then(res => {
        treeData.value = res.data.data;
    })
}

function openAddOrEdit(data, folderId, type) {
    if (data) {
        form.value = copyProperties(data, formObjSupplier.getObj());
    } else {
        form.value = formObjSupplier.getObj();
        if (type) {
            form.value.type = type;
        }
    }
    form.value.folderId = folderId;
    formRules.value = isFolder(form.value.type) ? folderRules : menuRules;
    formDialogVisible.value = true;
}

function submitSaveOrUpdate() {
    formRef.value.validate(isValid => {
        if (!isValid) {
            return;
        }
        const data = form.value;
        if (data.id) {
            update(data.id, data).then(() => fetchData()).then(() => {
                formDialogVisible.value = false;
                appConfigStore.renderMenu();
            });
            return
        }
        create(data).then(() => fetchData()).then(() => {
            formDialogVisible.value = false;
            appConfigStore.renderMenu();
        });
    });
}

function doInstall(id) {
    installLoading.value = true;
    install(id).then(res => fetchData()).then(() => {
        appConfigStore.renderMenu();
        ElNotification.success({
            message: '安装成功'
        });
    }).finally(() => {
        installLoading.value = false;
    })
}

function doRemove(id) {
    remove(id).then(res => {
        expandSet.value.delete(id);
        return fetchData();
    }).then(() => appConfigStore.renderMenu())
}

function doMove(data) {
    form.value = copyProperties(data, formObjSupplier.getObj());
    moveDialogVisible.value = true;
}

function updateHide(data, hide) {
    form.value = copyProperties(data, formObjSupplier.getObj());
    if (form.value.hide !== hide) {
        form.value.hide = hide;
        update(form.value.id, form.value).then(() => fetchData()).then(() => {
            appConfigStore.renderMenu();
        });
    }
}

function isFolder(value) {
    return value == FOLDER_VALUE;
}

function needInstall(value) {
    const type = extensionTypeMap[value];
    return type && type.needInstall;
}

function nodeExpand(data) {
    expandSet.value.add(data.id);
}

function nodeCollapse(data) {
    expandSet.value.delete(data.id);
}

function getMoveNodeClass(data) {
    return (isFolder(data.type) && data.id !== form.value.id) ? '' : 'display-none';
}

function submitMove(data) {
    form.value.folderId = data.id;
    expandSet.value.add(form.value.id);
    update(form.value.id, form.value).then(() => fetchData()).then(() => {
        moveDialogVisible.value = false;
        appConfigStore.renderMenu();
    });
}

onBeforeMount(() => {
    getTypes().then(res => {
        res.data.data.forEach(type => {
            extensionTypeMap[type.value] = type;
        })
    })
    fetchData();
});


</script>

<style>
.clkit-extension-folder-tree-node {
    display: flex;
    width: 100%;
    justify-content: space-between;
}

.clkit-extension-folder-tree-icon {
    vertical-align: middle;
    margin-right: 16px;
}

.clkit-extension-manage-tree-node {
    padding: 8px 0;
}
</style>