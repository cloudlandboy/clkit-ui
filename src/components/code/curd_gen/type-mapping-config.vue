<template>
    <div style="padding-bottom: 0.6rem;text-align: right;">
        <el-button type="primary" @click="openSaveOrUpdate(null)">新增</el-button>
    </div>
    <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="name" label="名称" width="180" />
        <el-table-column prop="dbPlatform" label="数据库平台" width="180" />
        <el-table-column prop="langType" label="语言类型" width="180" />
        <el-table-column label="操作">
            <template #default="scope">
                <el-button size="small" @click="copy(scope.row)">复制</el-button>
                <el-button size="small" @click="openSaveOrUpdate(scope.row)">编辑</el-button>
                <el-button size="small" type="danger" v-if="!scope.row.locked"
                    @click="removeAndRefresh(scope.row.id)">删除</el-button>
                <el-button size="small" type="warning" v-if="scope.row.locked"
                    @click="openUnlockConfirm(scope.row)">解锁</el-button>
            </template>
        </el-table-column>
    </el-table>

    <el-dialog v-model="formDialogVisible" :title="form.id ? '修改' : '新增'" width="1280px" :close-on-click-modal="false">
        <el-form ref="formRef" :model="form" :inline="true" label-position="right" :disabled="formDisabled"
            :rules="formRules" :validate-on-rule-change="false">
            <el-form-item label="唯一名称" prop="name">
                <el-input v-model.trim="form.name" :validate-event="false" style="width: 220px;" class="required" />
            </el-form-item>
            <el-form-item label="数据库平台" prop="dbPlatform">
                <el-select v-model="form.dbPlatform" :validate-event="false" style="width: 180px;">
                    <el-option v-for="dbPlatform in dbPlatformList" :key="dbPlatform" :label="dbPlatform"
                        :value="dbPlatform" />
                </el-select>
            </el-form-item>
            <el-form-item label="语言" prop="langType">
                <el-input v-model.trim="form.langType" :validate-event="false" style="width: 170px;" />
            </el-form-item>
            <el-form-item label="加锁" prop="locked">
                <el-switch v-model="form.locked" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="addMacth">添加配置</el-button>
            </el-form-item>
            <el-form-item prop="matchList" class="type-mapping-matchs">
                <el-table :data="form.matchList" border empty-text=" ">
                    <el-table-column label="正则表达式" align="center" width="240px" heigth="80px"
                        label-class-name="required">
                        <template #default="scope">
                            <el-form-item :prop="'matchList.' + scope.$index + '.match'">
                                <el-input v-model="scope.row.match" :readonly="scope.row.required"
                                    :validate-event="false" />
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column label="语言类型" align="center" width="180px" label-class-name="required">
                        <template #default="scope">
                            <el-form-item :prop="'matchList.' + scope.$index + '.type'">
                                <el-input v-model.trim="scope.row.type" :validate-event="false" />
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column label="包名" align="center" width="240px">
                        <template #default="scope">
                            <el-form-item :prop="'matchList.' + scope.$index + '.packagePath'">
                                <el-input v-model.trim="scope.row.packagePath" :validate-event="false" />
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column label="包导入语句" align="center" width="280px">
                        <template #default="scope">
                            <el-form-item :prop="'matchList.' + scope.$index + '.importStatement'">
                                <el-input v-model="scope.row.importStatement" :validate-event="false"
                                    style="width: 260px;" />
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" align="center" width="150px">
                        <template #default="scope">
                            <el-icon class="clkit-swap-sort-btn"
                                @click="swapMatchListIndex(scope.$index, scope.$index - 1)"
                                v-show="!scope.required && scope.$index > 0">
                                <ArrowUpBold />
                            </el-icon>
                            <el-icon class="clkit-swap-sort-btn"
                                @click="swapMatchListIndex(scope.$index, scope.$index + 1)"
                                v-show="scope.$index < form.matchList.length - 1">
                                <ArrowDownBold />
                            </el-icon>
                            <el-button v-if="!scope.row.required" type="danger" size="small"
                                @click="removeMatch(scope.row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-form-item>


            <div style="text-align: center;margin-top: 20px;">

            </div>
            <div class="content-right">
                <el-button type="primary" @click="submitSaveOrUpdate">{{ form.id ? '更新' : '保存' }}</el-button>
                <el-button @click="formDialogVisible = false">取消</el-button>
            </div>
        </el-form>
    </el-dialog>
</template>

<script setup>
import { ref, onMounted, onBeforeMount } from "vue";
import { FieldDef } from "@/util/object-utils";
import { hasText } from "@/util/string-utils";
import { getSupportedPlatform } from "@/api/gen/db";
import { create, findAll, remove, update, unlock } from '@/api/gen/db-lang-type'
import { ElMessageBox } from 'element-plus'

const tableData = ref([]);
const dbPlatformList = ref([]);
const formDisabled = ref(false);
const formDialogVisible = ref(false);

const formRef = ref();

const hasTextValidator = function (rule, value, callback) {
    if (hasText(value)) {
        callback();
        return
    }
    callback(new Error(`${rule.label}不能为空`));
}

const rulesDef = {
    match: [{ validator: hasTextValidator, label: '正则表达式' }],
    type: [{ validator: hasTextValidator, label: '语言类型' }],

}

const formRules = ref({
    "name": [{ validator: hasTextValidator, label: '唯一名称' }],
    "langType": [{ validator: hasTextValidator, label: '语言' }],
    "matchList.0.match": rulesDef.match,
    "matchList.0.type": rulesDef.type,
})

const matchDef = new FieldDef({
    match: '',
    type: '',
    packagePath: '',
    importStatement: '',
    required: false
});

const defaultMatch = matchDef.getObj();
defaultMatch.match = '.*';
defaultMatch.required = true;
const fieldDef = new FieldDef({
    name: '',
    dbPlatform: null,
    langType: 'JAVA',
    locked: false,
    matchList: [defaultMatch],
});

const form = ref(fieldDef.getObj());

function copy(data) {
    const copyData = JSON.parse(JSON.stringify(data));
    delete copyData.id;
    copyData.locked = false;
    openSaveOrUpdate(copyData);
}

function openSaveOrUpdate(data) {
    if (data) {
        form.value = data;
        formDisabled.value = data.locked;
    } else {
        form.value = fieldDef.getObj();
        form.value.dbPlatform = dbPlatformList.value[0];
    }
    formDialogVisible.value = true;
}

function removeAndRefresh(id) {
    remove(id).then(fetchData);
}

function openUnlockConfirm(data) {
    ElMessageBox.confirm('确认要解锁吗?', '解锁提醒',
        {
            type: 'warning',
            confirmButtonText: '确认',
            cancelButtonText: '取消'
        }
    ).then(() => {
        unlock(data.id).then(res => { fetchData() })
    }).catch(() => { });
}

function submitSaveOrUpdate() {
    formRef.value.validate(isValid => {
        if (!isValid) {
            return;
        }

        if (form.value.id) {
            update(form.value.id, form.value).then(() => {
                fetchData();
                formDialogVisible.value = false;
            });
            return
        }

        create(form.value).then(() => {
            fetchData();
            formDialogVisible.value = false;
        });


    });
}

function removeMatch(match) {
    formRef.value.clearValidate();
    const prefix = 'matchList.' + (form.value.matchList.length - 1) + '.';
    delete formRules.value[`${prefix}match`];
    delete formRules.value[`${prefix}type`];
    form.value.matchList = form.value.matchList.filter(i => i !== match);
}
function addMacth() {
    formRef.value.clearValidate();
    form.value.matchList.unshift(matchDef.getObj());
    const prefix = 'matchList.' + (form.value.matchList.length - 1) + '.'
    formRules.value[`${prefix}match`] = rulesDef.match;
    formRules.value[`${prefix}type`] = rulesDef.type;
}

function swapMatchListIndex(sourceIndex, targetIndex) {
    if (targetIndex < 0 || targetIndex > form.value.matchList.length - 1) {
        return
    }

    const targetData = form.value.matchList[targetIndex];
    form.value.matchList[targetIndex] = form.value.matchList[sourceIndex];
    form.value.matchList[sourceIndex] = targetData;
}

function clearItemValidate(prop, event) {
    formRef.value.clearValidate([prop]);
}

function fetchData() {
    findAll().then(res => tableData.value = res.data.data)
}

onBeforeMount(() => {
    getSupportedPlatform().then(res => {
        dbPlatformList.value = res.data.data;
    })

})


onMounted(fetchData);
</script>

<style>
.clkit-swap-sort-btn {
    margin-right: 12px;
    vertical-align: middle;
    color: #337ecc;
    cursor: pointer;
}

.clkit-swap-sort-btn:hover {
    color: #eebe77;
}

.type-mapping-matchs .cell {
    overflow: visible;
}

.type-mapping-matchs .el-form-item__error {
    top: 32px;
    right: 0;
}
</style>