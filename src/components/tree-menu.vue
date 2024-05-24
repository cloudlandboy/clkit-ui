<template>
    <label v-for="menu in menuList" :key="menu._id" v-show="!menu.hide">
        <el-sub-menu v-if="menu.children" :index="menu.path">
            <template #title>
                <span>{{ menu.title }}</span>
            </template>
            <tree-menu :menuList="menu.children" />
        </el-sub-menu>
        <el-menu-item v-else :index="menu.path">{{ menu.title }}</el-menu-item>
    </label>
</template>

<script setup>
const { menuList } = defineProps(['menuList'])
</script>