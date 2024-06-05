<template>
  <el-table :data="properties" border style="width: 100%" @cell-mouse-enter="cellEditableEnable"
    @cell-mouse-leave="cellEditableDisable" :show-overflow-tooltip="true" :row-style="{ height: '48px' }">
    <el-table-column prop="name" label="参数名" width="280">
      <template #default="scope">
        <el-input v-model="scope.row.name" v-if="!scope.row.internal && scope.row.$$editableProperty === 'name'"
          placeholder="请输入参数名" @change="handleEditComplete(scope.row)" />
        <div v-else>{{ scope.row.name }}</div>
      </template>
    </el-table-column>
    <el-table-column prop="propKey" label="参数键" width="300">
      <template #default="scope">
        <el-input v-model="scope.row.propKey" v-if="!scope.row.internal && scope.row.$$editableProperty === 'propKey'"
          placeholder="请输入参数键" @change="handleEditComplete(scope.row)" />
        <div v-else>{{ scope.row.propKey }}</div>
      </template>
    </el-table-column>
    <el-table-column prop="propValue" label="参数值">
      <template #default="scope">
        <el-input v-model="scope.row.propValue"
          v-if="scope.row.editable && scope.row.$$editableProperty === 'propValue'" placeholder="请输入参数值"
          @change="handleEditComplete(scope.row)" />
        <div v-else>{{ scope.row.propValue }}</div>
      </template>
    </el-table-column>
    <el-table-column prop="description" label="说明"></el-table-column>
  </el-table>
</template>

<script setup>
import { ref, onBeforeMount } from "vue";
import { getAll, updateValueById } from "@/api/app/property";
import { operationSuccessNotify } from "@/util/clkil-utils";
const properties = ref([]);

function cellEditableEnable(row, cell) {
  row.$$editableProperty = cell.property;
}

function cellEditableDisable(row, cell) {
  row.$$editableProperty = null;
}

function handleEditComplete(row) {
  updateValueById(row.id, row.propValue).then(() => {
    operationSuccessNotify();
  })
}

onBeforeMount(() => {
  getAll().then(res => {
    res.data.data.sort((a, b) => {
      if (a.editable && b.editable) {
        return 0;
      }
      return a.editable ? -1 : 1;
    });
    properties.value = res.data.data;
  })
})
</script>

<style></style>