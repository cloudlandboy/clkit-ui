<template>
  <el-container class="clkit-container">
    <!-- 顶栏 -->
    <el-header>
      <div class="clkit-header-item">
        <el-avatar :alt="appStore.config.title" :src="appStore.config.iconSrc" v-if="appStore.config.iconSrc"
          @click="menuSelect('/')" />
      </div>
      <div style="flex-grow: 1;"></div>
      <div class="clkit-header-item clkit-header-right-area">
        <div>
          <el-icon v-show="!menuShow" @click="toggleShow(true)" :size="28">
            <Menu />
          </el-icon>
          <el-icon v-show="menuShow" @click="toggleShow(false)" :size="28">
            <Fold />
          </el-icon>
        </div>
        <div>
          <el-link type="primary" v-if="authStore.authInfo.user.isAnonymous" :underline="false"
            @click="authStore.actionLogin">登录</el-link>
          <el-dropdown v-else>
            <el-avatar>{{ authStore.authInfo.user.realName[0] }}</el-avatar>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="menuSelect('/user-info')">个人信息</el-dropdown-item>
                <el-dropdown-item @click="authStore.actionLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="150px" class="clkit-aside clkit-custom-scrollbar" v-show="menuShow">
        <el-menu ref="menuRef" class="clkit-aside-menu" :default-active="appStore.currentRouter.path"
          @select="menuSelect" :default-openeds="defaultOpeneds" :collapse-transition="false">
          <tree-menu :menuList="appStore.menuList" />
        </el-menu>
      </el-aside>
      <!-- 路由视图 -->
      <el-main>
        <div class="route-content">
          <div>
            <component v-if="appStore.currentRouter.isComponent" :is="appStore.currentRouter.view" />
          </div>
          <div v-for="frame in appStore.iframeList" :key="frame.index">
            <iframe class="clkit-router-content-iframe" v-show="appStore.currentRouter.path === frame.router.path"
              :src="frame.router.view" frameborder="0" allowfullscreen="true" :ref="frame.ref"></iframe>
          </div>
        </div>
      </el-main>
    </el-container>
  </el-container>

  <!-- 登录 -->
  <login />
</template>

<script setup>
import Clipboard from 'clipboard';
import { ref, onMounted, onBeforeMount } from 'vue';
import { useAppStore } from "@/stores/app";
import { useAuthStore } from "@/stores/auth"
import TreeMenu from "@/components/tree-menu.vue";
import Login from "@/components/login.vue";

const containerState = ref({
  width: window.innerWidth,
  height: window.innerHeight
});

const menuShow = ref(true);
const appStore = useAppStore();
const authStore = useAuthStore();
const menuRef = ref();

const defaultOpeneds = [appStore.menuList[0].path];

function menuSelect(path) {
  appStore.setCurrentRouter(path);
}

function toggleShow(value) {
  menuShow.value = value;
}

onBeforeMount(() => {
  appStore.renderMenu().finally(() => {
    const path = location.pathname.substring(appStore.config.contextPath.length - 1);
    appStore.setCurrentRouter(path);
  })
})

onMounted(() => {
  new Clipboard('.copy-btn', {
    text: function (trigger) {
      return trigger.previousElementSibling;
    }
  });

  window.addEventListener("resize", () => {
    containerState.value.width = window.innerWidth;
    containerState.value.height = window.innerHeight
  });


});
</script>

<style>
.clkit-container .el-header {
  --el-header-height: 80px;
  display: flex;
  line-height: var(--el-header-height);
  user-select: none;
  padding: 0 48px;
}

.clkit-container .el-main {
  padding: 0 var(--el-main-padding);
}

.clkit-aside-menu {
  user-select: none;
  overflow-y: auto;
}

.clkit-header-item {
  cursor: pointer;
}

.clkit-header-item .el-icon,
.clkit-header-item .el-avatar,
.clkit-header-item .el-dropdown {
  vertical-align: middle;
}

.clkit-header-right-area {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.clkit-header-item .el-dropdown .el-tooltip__trigger:focus-visible {
  outline: none;
}

.clkit-aside {
  height: var(--clkit-route-content-heigth);
}

.clkit-aside-menu {
  border-right: none;
}

.clkit-router-content-iframe {
  width: 99%;
  height: var(--clkit-route-content-heigth)
}
</style>