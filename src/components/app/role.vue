<template>
  <el-card class="clkit-card">
    <template #header>
      <div class="clkit-card-header">
        <div class="clkit-card-header-title">角色管理</div>
        <div class="clkit-card-header-btn-area">
          <el-button type="primary" @click="openAddOrEdit(null)">新增</el-button>
        </div>
      </div>
    </template>
    <el-table :data="pageData" border style="width: 100%">
      <el-table-column prop="name" label="角色名" width="240" />
      <el-table-column prop="code" label="角色编码" width="240" />
      <el-table-column label="操作">
        <template #default="scope">
          <div v-if="scope.row.code !== ROLE_ADMIN">
            <el-button size="small" @click="openAddOrEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteRole(scope.row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div class="clkit-pagination-box">
      <el-pagination background layout="prev, pager, next" v-model:current-page="pageState.page"
        v-model:page-size="pageState.size" :total="pageState.total" />
    </div>

    <!-- 新增编辑框 -->
    <el-dialog v-model="addEditDialogVisible" :show-close="false" :close-on-click-modal="false"
      :close-on-press-escape="false" @open="selectPermission">
      <template #header="{ close, titleId, titleClass }">
        <div class="clkit-permission-dialog-header">
          <div :id="titleId" :class="titleClass">{{ roleForm.id ? '编辑' : '新增' }}</div>
          <div>
            <el-icon @click="addEditDialogVisible = false" size="24" color="var(--el-color-info)">
              <CircleCloseFilled />
            </el-icon>
            <el-icon @click="postSaveOrUpdate" :size="24" color="var(--el-color-primary)">
              <SaveFill />
            </el-icon>
          </div>

        </div>
      </template>

      <el-form ref="roleFormRef" :model="roleForm" :inline="true" :rules="roleFormRules">
        <el-form-item label="角色名" prop="name" required>
          <el-input v-model="roleForm.name" :validate-event="false" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code" required>
          <el-input v-model="roleForm.code" :validate-event="false">
          </el-input>
        </el-form-item>
      </el-form>

      <div>
        <div style="font-size: 16px;font-weight: bold;margin-bottom: 16px">选择权限:</div>
        <permission ref="permissionRef" :show-checkbox="true" />
      </div>

    </el-dialog>
  </el-card>
</template>

<script setup>
import * as roleApi from '@/api/app/role'
import { ROLE_ADMIN } from '@/constants/permission';
import { ref, onBeforeMount } from 'vue';
import Permission from './permission.vue';
import { ObjectSupplier } from '@/util/object-utils';
import SaveFill from '~icons/eva/save-fill';
import { hasTextValidator } from '@/util/validator';
import { hPointText, operationConfirm, operationSuccessNotify } from '@/util/clkil-utils';

const addEditDialogVisible = ref(false);
const permissionRef = ref();
const pageState = ref({
  page: 1,
  size: 20,
  total: 1000
})
const pageData = ref([]);

const roleSupplier = new ObjectSupplier(() => {
  return {
    name: '',
    code: '',
    permissionIds: []
  }
});
const roleForm = ref(roleSupplier.getObj());
const roleFormRef = ref();
const roleFormRules = {
  name: [{ validator: hasTextValidator, label: '角色名' }],
  code: [{ validator: hasTextValidator, label: '角色编码' }]
}

function loadPageData() {
  roleApi.getPage({
    page: pageState.value.page,
    size: pageState.value.size
  }).then(res => {
    const data = res.data.data;
    pageData.value = data.content;
    pageState.value.total = data.totalElements;
  })
}

function openAddOrEdit(data) {
  if (data) {
    roleForm.value = data;
    roleForm.value.permissionIds = data.permission.map(pms => pms.id);
  } else {
    roleForm.value = roleSupplier.getObj();
  }
  addEditDialogVisible.value = true;
}


function postSaveOrUpdate() {
  roleFormRef.value.validate(valid => {
    if (!valid) {
      return
    }
    roleForm.value.permissionIds = permissionRef.value.getSelectedIds();
    const data = roleForm.value;
    let requestPromise;
    if (data.id) {
      requestPromise = roleApi.updateById(data.id, data);
    } else {
      requestPromise = roleApi.save(data);
    }

    requestPromise.then(res => {
      loadPageData();
      operationSuccessNotify();
      addEditDialogVisible.value = false;
    })

  })

}

function deleteRole(data) {
  operationConfirm(hPointText('确认删除', data.name, '角色吗？')).then(() => {
    roleApi.removeById(data.id).then(res => {
      operationSuccessNotify();
      loadPageData();
    });
  })
}

function selectPermission() {
  permissionRef.value.setSelectedIds(roleForm.value.permissionIds)
}

onBeforeMount(loadPageData)
</script>

<style scoped>
.clkit-permission-dialog-header {
  display: flex;
  justify-content: space-between;
}

.clkit-permission-dialog-header .el-icon {
  cursor: pointer;
}

.clkit-permission-dialog-header .el-icon:first-child:hover {
  color: var(--el-color-warning);
}

.clkit-permission-dialog-header .el-icon:last-child:hover {
  color: var(--el-color-success);
}
</style>