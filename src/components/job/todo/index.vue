<template>
    <div class="clkit-todo-create-btn-group">
        <el-icon @click="createTodo" :size="24" color="#00C5FF">
            <MaterialSymbolsAssignmentAddSharp />
        </el-icon>
    </div>
    <el-tabs v-model="activeTodo" @tab-change="loadTodo">
        <el-tab-pane label="今日" name="today"></el-tab-pane>
        <el-tab-pane label="全部" name="all"></el-tab-pane>
    </el-tabs>
    <div class="clkit-custom-scrollbar">
        <ul v-infinite-scroll="loadTodo" :infinite-scroll-disabled="pageState.isLast" class="clkit-todo-list"
            style="overflow: auto">
            <li v-for="todo in todoList" :key="todo.id" class="clkit-todo-list-item">
                <el-checkbox style="margin-top: 2px;margin-right: 8px;" :checked="todo.status === '1'"
                    @change="chageDone(todo)" />
                <span style="width: 220px;" class="clkit-overflow-ellipsis">{{ todo.name }}</span>
                <span style="margin-left: 16px;" :style="getTimeStyle(todo.status)">
                    {{ displayTime(todo.deadlineTime) }}
                </span>
            </li>
        </ul>
    </div>

    <!-- add dialog -->
    <el-dialog v-model="createDialogVisible" title="创建待办" width="50%" :close-on-click-modal="false" :z-index="10">
        <el-form :model="todoForm" label-width="auto">
            <el-form-item>
                <el-input v-model="todoForm.name" placeholder="输入标题" class="clkit-none-border-el-input" />
            </el-form-item>
            <el-form-item>
                <el-date-picker v-model="todoForm.deadlineTime" type="datetime" placeholder="设置截止时间"
                    format="YYYY年M月D日 HH:mm" time-format="HH:mm" value-format="YYYY-MM-DD HH:mm:00" />
                <el-dropdown :hide-on-click="false" trigger="click" style="margin-left: 16px">
                    <el-icon size="24" :color="todoForm.repeat != '0' ? '#337ecc' : ''" style="cursor: pointer;">
                        <MaterialSymbolsEventRepeatOutline />
                    </el-icon>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item v-for="item in DICT.repeatMode" :key="item.value"
                                @click="todoForm.repeat = item.value">
                                <div style="width: 32px;">
                                    <el-icon style="vertical-align: middle" v-if="todoForm.repeat === item.value">
                                        <Select />
                                    </el-icon>
                                </div>
                                <div>{{ item.label }}</div>
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
                <el-dropdown :hide-on-click="false" trigger="click" style="margin-left: 16px">
                    <el-icon size="24" :color="todoForm.reminder != '0' ? '#337ecc' : ''" style="cursor: pointer;">
                        <AlarmClock />
                    </el-icon>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item v-for="item in DICT.reminder" :key="item.value"
                                @click="todoForm.reminder = item.value">
                                <div style="width: 32px;">
                                    <el-icon style="vertical-align: middle" v-if="todoForm.reminder === item.value">
                                        <Select />
                                    </el-icon>
                                </div>
                                <div>{{ item.label }}</div>
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </el-form-item>
            <el-form-item>
                <Editor v-model="todoForm.remark" :tinymce-script-src="TINYMCE_SCRIPT_SRC" :init="tinymceConfig" />
            </el-form-item>
            <el-form-item class="clkit-form-right-btn-group">
                <el-button color="var(--clkit-color-pale-purple)" @click="postTodo">保存</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import dayjs from 'dayjs';
import { faker } from '@faker-js/faker';
import Editor from '@tinymce/tinymce-vue'
import MaterialSymbolsEventRepeatOutline from '~icons/material-symbols/event-repeat-outline'
import MaterialSymbolsAssignmentAddSharp from '~icons/material-symbols/assignment-add-sharp'
import { ElNotification } from 'element-plus'
import { TINYMCE_SCRIPT_SRC } from "@/constants/path-constant";
import initTinymceConfig from '@/config/tinymce-config';
import { DICT_JOB_REPEAT_MODE, DICT_JOB_REMINDER } from "@/constants/dict";
import { getDict } from "@/api/app";
import * as todoApi from "@/api/job/todo";

const tinymceConfig = initTinymceConfig({ placeholder: '在此处填写备注' });
const createDialogVisible = ref(false);

const DICT = {
    reminder: [],
    repeatMode: [],
    status: {
        UNDONE: {
            label: '未完成',
            value: '0',
            className: 'undone'
        },
        DONE: {
            label: '已完成',
            value: '1',
            className: 'done'
        },
        EXPIRED: {
            label: '已过期',
            value: '2',
            className: 'expried'
        }
    }
}

const pageState = ref({
    page: 0,
    size: 50,
    sort: 'deadlineTime,desc',
    isLast: false,
});

const activeTodo = ref('today');
const todoList = ref([])
const todoForm = ref({
    name: '',
    remark: '',
    repeat: '0',
    reminder: '0',
    deadlineTime: null,
});



function loadTodo(active) {
    if (active) {
        todoList.value = [];
        pageState.value.page = 1;
    } else {
        active = activeTodo.value;
        pageState.value.page++;
    }

    const query = {
        page: pageState.value.page,
        size: pageState.value.size,
        sort: pageState.value.sort,
    }

    // if (active == 'today') {
    //     const today = dayjs().format('YYYY/MM/DD');
    //     query.startDeadlineDate = today;
    //     query.endDeadlineDate = today;
    // }

    todoApi.queryPage(query).then(res => {
        pageState.value.isLast = res.data.data.last;
        const existsIds = todoList.value.map(t => t.id);
        res.data.data.content.forEach(td => {
            if (!existsIds.includes(td.id)) {
                todoList.value.push(td);
            }
        })
    });
}

function getTimeStyle(status) {
    switch (status) {
        case DICT.status.UNDONE.value:
            return { color: '#909399' }
        case DICT.status.DONE.value:
            return { color: '#67c23a' }
        case DICT.status.EXPIRED.value:
            return { color: '#f56c6c' }
        default:
    }
}

function chageDone(todo) {
    if (todo.status === DICT.status.DONE) {
        //已完成改为未完成或已过期
    } else {
        //改为已完成
    }
}

function displayTime(normalTimeText) {
    return normalTimeText.substring(0, 16);
}

function createTodo() {
    createDialogVisible.value = true;
}

function postTodo() {
    todoApi.create(todoForm.value).then(res => {
        ElNotification.success('保存成功');
        createDialogVisible.value = false;
    })
}
onMounted(() => {
    getDict(DICT_JOB_REPEAT_MODE, DICT_JOB_REMINDER).then(res => {
        DICT.reminder = res.data.data[DICT_JOB_REMINDER];
        DICT.repeatMode = res.data.data[DICT_JOB_REPEAT_MODE];
    });
})
</script>

<style>
.clkit-todo-create-btn-group {
    position: fixed;
    right: 16px;
    top: 8px;
    z-index: 2;
    cursor: pointer;
}

.clkit-todo-create-btn-group>.el-icon:hover {
    color: #329672
}

.clkit-todo-list {
    height: 500px;
    padding: 0;
    margin: 0;
    list-style: none;
    cursor: pointer;
}

.clkit-todo-list-item {
    display: flex;
    align-items: center;
    justify-content: left;
    height: 42px;
    margin: 10px;
    padding: 0 16px;
    border-radius: 6px;
}

.clkit-todo-list-item>span:first-child {
    color: #1B9AEE;
}

.clkit-todo-list-item:hover {
    background: #F7F7F7;
}

.clkit-todo-list-item .el-checkbox .el-checkbox__inner {
    border-radius: 50%;
    width: 18px;
    height: 18px;
}

.clkit-todo-list-item .el-checkbox .el-checkbox__inner::after {
    height: 9px;
    left: 5px;
    width: 5px;
}
</style>