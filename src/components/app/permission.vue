<template>
  <el-tree ref="treeRef" class="clkit-permission-tree" :props="treeProps" :data="treeData" node-key="path"
    :show-checkbox="props.showCheckbox" :default-expand-all="props.defaultExpandAll" />
</template>

<script setup>
import { ref, onBeforeMount } from 'vue';
import { getTree } from '@/api/app/permission'

const props = defineProps({
  showCheckbox: {
    type: Boolean,
    default: false
  },
  defaultExpandAll: {
    type: Boolean,
    default: true
  }
});

const treeProps = {
  label: 'name',
  children: 'children',
}

const treeData = ref([]);
const treeRef = ref();
const idPathMap = {};
const lockState = {
  initPromise: Promise.resolve()
}

function getSelectedIds() {
  return treeRef.value.getCheckedNodes().filter(n => !!n.id).map(n => n.id);
}

function setSelectedIds(ids) {
  lockState.initPromise.then(() => {
    treeRef.value.setCheckedKeys(ids.map(id => idPathMap[id]));
  })

}

onBeforeMount(() => {
  lockState.initPromise = new Promise(resolve => {
    getTree().then(res => {
      const data = res.data.data;
      treeData.value = data;
      function collectIdPathMap(node) {
        if (node.id) {
          idPathMap[node.id] = node.path;
          return
        }
        for (const cnode of node.children) {
          collectIdPathMap(cnode)
        }
      }
      for (const node of data) {
        collectIdPathMap(node);
      }

    }).finally(() => {
      resolve();
    });
  })

})

defineExpose({ getSelectedIds, setSelectedIds })
</script>

<style scoped>
.clkit-permission-tree {
  display: grid;
  grid-template-columns: repeat(5, 168px);
  grid-gap: 16px;
}
</style>