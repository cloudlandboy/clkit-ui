<template>
    <el-card class="clkit-card">
        <template #header>
            <div class="card-header">
                <span>增删改查代码生成 </span>
                <el-button style="float: right;margin-left: 1rem;" @click="openDataSourceManage">数据源管理</el-button>
                <el-button style="float: right;" @click="openTemplateManage">模板管理</el-button>
                <el-button style="float: right;" @click="openDbLangTypeManage">类型映射配置</el-button>
            </div>
        </template>
        <div>
            <el-form :inline="true" :model="genForm" class="clkit-gen-from">
                <el-form-item label="数据源" :required="true">
                    <el-select v-model="genForm.dataSource" placeholder="选择数据源" @change="fetchTableList" value-key="id">
                        <el-option v-for="dataSource in dataSourceList" :key="dataSource.id" :label="dataSource.name"
                            :value="dataSource" />
                    </el-select>
                </el-form-item>
                <el-form-item label="模板" :required="true">
                    <el-select v-model="genForm.template" placeholder="选择模板" value-key="id">
                        <el-option v-for="template in templateList" :key="template.id" :label="template.name"
                            :value="template" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button @click="fetchTableList">刷新</el-button>
                </el-form-item>
            </el-form>
            <div style="margin: 16px 0;">
                <el-input v-model="genForm.keyword" style="width: 100%" placeholder="搜索" />
            </div>
            <el-table ref="tableRef" :data="toUserTableList" border style="width: 100%" height="500">
                <el-table-column type="selection" width="60" align="center" />
                <el-table-column prop="name" label="表名称" :show-overflow-tooltip="true" />
                <el-table-column prop="comment" :show-overflow-tooltip="true" label="表注释" />
                <el-table-column label="操作" align="center" width="100">
                    <template #header>
                        <el-button size="small" type="primary" @click="openGenDialog(null)">批量</el-button>
                    </template>
                    <template #default="scope">
                        <el-button size="small" type="primary" @click="openGenDialog(scope.row.name)">生成</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <el-dialog v-model="genDialogVisible" title="生成配置" width="38%" :close-on-click-modal="false"
            :destroy-on-close="true">
            <el-form :model="genForm" label-position="top">
                <el-form-item label="类型映射" required>
                    <el-select v-model="genForm.dbLangTypeId" value-key="id">
                        <el-option v-for="dbLangType in availableTypeMappingList" :key="dbLangType.id"
                            :label="dbLangType.name" :value="dbLangType.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="作者" required>
                    <el-input v-model="genForm.author" />
                </el-form-item>
                <el-form-item v-for="param in genForm.template.extraParams" :label="param.name"
                    :required="param.required">
                    <el-input v-if="param.type === 'input'" v-model="genForm.extraParams[param.key]" />
                    <el-switch v-if="param.type === 'switch'" v-model="genForm.extraParams[param.key]" />
                </el-form-item>
                <div class="clkit-content-right">
                    <el-button type="primary" @click="submitGen">生成</el-button>
                </div>
            </el-form>
        </el-dialog>


        <!-- 数据源管理 -->
        <el-dialog v-model="datasourceManageDialogVisible" title="数据源管理" width="50%" :close-on-click-modal="false"
            :destroy-on-close="true" @close="fetchDbList">
            <datasource-manage></datasource-manage>
        </el-dialog>

        <!-- 类型映射配置 -->
        <el-dialog v-model="dbLangTypeDialogVisible" title="类型映射配置" width="40%" :close-on-click-modal="false"
            :destroy-on-close="true" @close="fetchDbLangTypeList">
            <type-mapping-config></type-mapping-config>
        </el-dialog>

        <!-- 模板管理 -->
        <el-dialog v-model="templateManageDialogVisible" title="模板管理" width="50%" :close-on-click-modal="false"
            :destroy-on-close="true" @close="fetchTemplateList">
            <template-manage></template-manage>
        </el-dialog>

    </el-card>
</template>
<script setup>
import { ref, onBeforeMount, computed } from "vue";
import { listAll as listDb, queryTable } from "@/api/gen/db";
import { listAll as listTemplate } from "@/api/gen/template";
import { findAll as listDbLangType } from "@/api/gen/db-lang-type";
import { genCrud } from "@/api/gen/gen";
import { downloadFile } from "@/util/web-file-utils.js";
import templateManage from "./template-manage.vue";
import datasourceManage from "./datasource-manage.vue";
import typeMappingConfig from "./type-mapping-config.vue";
import { ElMessage } from 'element-plus'
import { prefixLocalStore } from "@/util/local-store";
import { hasText } from "@/util/string-utils";

const localStore = prefixLocalStore('crudCodeGen');
const genForm = ref(localStore.getJsonOrDefault('genForm', {
    keyword: null,
    dataSource: null,
    template: null,
    dbLangTypeId: null,
    author: 'clkit',
    extraParams: {},
    tableNames: []
}));

var dbLangTypeList = [];
const dataSourceList = ref([]);
const templateList = ref([]);
const tableList = ref([]);
const toUserTableList = computed(() => {
    const keyword = genForm.value.keyword;
    if (hasText(keyword)) {
        return tableList.value.filter(tb => tb.name.indexOf(keyword) >= 0 || tb.comment.indexOf(keyword) >= 0);
    }
    return tableList.value;
});
const availableTypeMappingList = ref([]);
const tableRef = ref();


function submitGen() {
    if (!genForm.value.dbLangTypeId) {
        ElMessage.error('请选择类型映射');
        return;
    }

    localStore.set('genForm', genForm.value);

    genCrud({
        author: genForm.value.author,
        dbId: genForm.value.dataSource.id,
        templateId: genForm.value.template.id,
        dbLangTypeId: genForm.value.dbLangTypeId,
        tableNames: genForm.value.tableNames,
        extraParams: genForm.value.extraParams
    }).then(res => {
        downloadFile(res.data, { type: res.headers['content-type'] }, decodeURIComponent(res.headers['content-disposition'].substring(20)))
    })

}

// 组件 dialog
const genDialogVisible = ref(false);
const datasourceManageDialogVisible = ref(false);
const dbLangTypeDialogVisible = ref(false);
const templateManageDialogVisible = ref(false);


function openGenDialog(tableName) {
    const genConfig = genForm.value;
    if (!genConfig.dataSource || !genConfig.template) {
        ElMessage.error('请先选择数据源和模板');
        return;
    }

    if (tableName) {
        genConfig.tableNames = [tableName];
    } else {
        //批量，获取选中表
        genConfig.tableNames = tableRef.value.getSelectionRows().map(row => row.name);
    }

    if (genConfig.tableNames.length === 0) {
        ElMessage.error('请选择要生成的表');
        return;
    }


    let beforeSelectedAvailable = false;
    availableTypeMappingList.value = dbLangTypeList.filter(tm => {
        if (tm.dbPlatform == genConfig.dataSource.platform && tm.langType == genConfig.template.lang) {
            if (genConfig.dbLangTypeId == tm.id) {
                beforeSelectedAvailable = true;
            }
            return true;
        }
        return false;
    });
    if (!beforeSelectedAvailable) {
        genConfig.dbLangTypeId = availableTypeMappingList.length > 0 ? availableTypeMappingList.value[0].id : null;
    }
    genDialogVisible.value = true;
}

function openDataSourceManage() {
    datasourceManageDialogVisible.value = true;
}

function openDbLangTypeManage() {
    dbLangTypeDialogVisible.value = true;
}

function openTemplateManage() {
    templateManageDialogVisible.value = true;
}

function fetchDbList() {
    listDb().then(res => {
        dataSourceList.value = res.data.data;
        dataSourceList.value.forEach(ds => {
            ds.username = '';
            ds.password = '';
        })

        if (!genForm.value.dataSource) {
            return;
        }

        //更新最新数据
        genForm.value.dataSource = dataSourceList.value.find(ds => ds.id === genForm.value.dataSource.id);
    })
}

function fetchTemplateList() {
    listTemplate().then(res => {
        templateList.value = res.data.data;

        if (!genForm.value.template) {
            return;
        }

        //更新最新数据
        genForm.value.template = templateList.value.find(tp => tp.id === genForm.value.template.id);
    })
}

function fetchDbLangTypeList() {
    listDbLangType().then(res => {
        dbLangTypeList = res.data.data;
    })
}

function fetchTableList() {
    if (!genForm.value.dataSource) {
        return
    }
    queryTable(genForm.value.dataSource.id).then(res => {
        tableList.value = res.data.data;
    });
}

onBeforeMount(() => {
    fetchDbList();
    fetchTemplateList();
    fetchDbLangTypeList();
    fetchTableList();
})

</script>

<style>
.clkit-gen-from .el-input {
    --el-input-width: 220px;
}

.clkit-gen-from .el-select {
    --el-select-width: 220px;
}
</style>