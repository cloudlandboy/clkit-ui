<script setup>
import Clipboard from 'clipboard';
import { ref, onMounted, onBeforeMount, h, shallowRef } from 'vue';
import { useAppStore } from "@/stores/app";
import { useAuthStore } from "@/stores/auth"
import TreeMenu from "@/components/tree-menu.vue";
import Login from "@/components/login.vue";

const containerState = ref({
  width: window.innerWidth,
  height: window.innerHeight,
  menuBarX: 0,
  menuBarY: 0,
  menuBarMoveing: false
});

const containerLayoutDef = {
  normal: {
    menu: {
      xs: 6,
      sm: 4,
      lg: 2,
    },
    view: {
      xs: 18,
      sm: 20,
      lg: 22,
    }
  },
  min: {
    menu: {
      xs: 0,
      sm: 0,
      lg: 0,
    },
    view: {
      xs: 24,
      sm: 24,
      lg: 24,
    }
  }
}

const containerLayout = ref(containerLayoutDef.normal);

const menuCollapse = ref(false);
const appStore = useAppStore();
const authStore = useAuthStore();
const menuRef = ref();

const iframeCache = ref([]);

const defaultOpeneds = [appStore.menuList[0].path];
const currentRouter = shallowRef({ path: '' });
const updateLoading = ref(false);

function menuSelect(path) {
  window.history.replaceState(null, "", appStore.config.contextPath + path);
  currentRouter.value = findRoute(path);
  if (currentRouter.value.isComponent) {
    return
  }

  let toView = iframeCache.value.find(frame => frame.router.path === currentRouter.value.path);
  if (toView) {
    toView.viewCount++;
    return;
  }

  if (iframeCache.value.length < appStore.config.maxIframeCache) {
    toView = { index: iframeCache.value.length, router: currentRouter.value, ref: null, viewCount: 0 };
    iframeCache.value.push(toView);
    return
  }

  //最少使用
  toView = iframeCache.value[0];
  let maxViewCount = 0;
  iframeCache.value.forEach(frame => {
    if (frame.viewCount < toView.viewCount) {
      toView = frame;
    }
    if (frame.viewCount > maxViewCount) {
      maxViewCount = frame.viewCount;
    }
  })
  toView.viewCount = maxViewCount + 1;
  toView.router = currentRouter.value;
}

function findRoute(path) {
  return appStore.routerList.find(r => r.path === path);
}

function toggleMenuCollapse(collapse) {
  if (containerState.value.menuBarMoveing) {
    return;
  }
  menuCollapse.value = collapse;
  if (collapse) {
    containerLayout.value = containerLayoutDef.min;
  } else {
    containerLayout.value = containerLayoutDef.normal;
  }
}

function iframeLoaded(frame) {
  try {
    const iframeDocument = frame.ref.contentWindow.document;
    const scriptElement = iframeDocument.createElement('script');
    scriptElement.text = route.insertScript;
    scriptElement.id = "clkit-insert-script";
    iframeDocument.body.appendChild(scriptElement);
  } catch (err) {
    //ignore
  }
}

function menuBarDragging(pos) {
  if (containerState.value.menuBarMoveing) {
    return;
  }
  const xMove = Math.abs(pos.left - containerState.value.menuBarX);
  const yMove = Math.abs(pos.top - containerState.value.menuBarY);
  containerState.value.menuBarMoveing = (xMove > 1 || yMove > 1);
  containerState.value.menuBarX = pos.left;
  containerState.value.menuBarY = pos.top;
}

function openInNewTab() {
  if (currentRouter.value.isComponent) {
    return
  }
  window.open(currentRouter.value.view, '_blank');
}

onBeforeMount(() => {
  appStore.renderMenu().finally(() => {
    const path = location.pathname.substring(appStore.config.contextPath.length - 1);
    const route = findRoute(path);
    menuSelect(route ? path : appStore.config.defaultPath);
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

<template>
  <div class="clkit-container" v-loading.fullscreen.lock="updateLoading" element-loading-text="更新中...">
    <el-row>
      <el-col :xs="containerLayout.menu.xs" :sm="containerLayout.menu.sm" :lg="containerLayout.menu.lg">
        <div class="clkit-title" @click="menuSelect('/')">
          <el-avatar :alt="appStore.config.title" :src="appStore.config.iconSrc" v-if="appStore.config.iconSrc" />
        </div>
        <el-menu ref="menuRef" :default-active="currentRouter.path" @select="menuSelect"
          :default-openeds="defaultOpeneds" :collapse="menuCollapse" :collapse-transition="false">
          <tree-menu :menuList="appStore.menuList" :menuCollapse="menuCollapse" />
        </el-menu>
      </el-col>
      <el-col :xs="containerLayout.view.xs" :sm="containerLayout.view.sm" :lg="containerLayout.view.lg">
        <el-container>
          <el-header class="clkit-top-menu">
            <div class="clkit-top-menu-item">
              <el-icon v-show="menuCollapse" @mouseup="toggleMenuCollapse(false)" :size="28">
                <Menu />
              </el-icon>
              <el-icon v-show="!menuCollapse" @mouseup="toggleMenuCollapse(true)" :size="28">
                <Fold />
              </el-icon>
            </div>
            <div class="clkit-top-menu-item">
              <el-link type="primary" v-if="authStore.authInfo.user.isAnonymous" :underline="false"
                @click="authStore.actionLogin">登录</el-link>
              <el-dropdown v-else>
                <el-avatar>{{ authStore.authInfo.user.realName[0] }}</el-avatar>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>个人信息</el-dropdown-item>
                    <el-dropdown-item @click="authStore.actionLogout">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </el-header>
          <el-main>
            <div class="route-content">
              <div>
                <component v-if="currentRouter.isComponent" :is="currentRouter.view" />
              </div>
              <div v-for="frame in iframeCache" :key="frame.index">
                <iframe v-show="currentRouter.path === frame.router.path" :src="frame.router.view" frameborder="0"
                  allowfullscreen="true" @load="iframeLoaded(frame)" :ref="frame.ref"
                  :style="{ width: '99%', height: containerState.height + 'px' }"></iframe>
              </div>
            </div>
          </el-main>
        </el-container>
      </el-col>
    </el-row>
  </div>

  <!-- 登录 -->
  <login />
</template>

<style>
.clkit-title {
  margin-top: 12px;
  padding: var(--el-menu-base-level-padding);
  text-align: center;
}

.el-menu,
.clkit-title {
  user-select: none;
}

.clkit-container {
  width: 100%;
}

.clkit-update-notification {
  width: 180px
}

.clkit-top-menu {
  display: flex;
  justify-content: flex-end;
  line-height: var(--el-header-height);
  user-select: none;
}

.clkit-top-menu-item {
  cursor: pointer;
  margin-right: 16px;
}

.clkit-top-menu-item .el-icon,
.clkit-top-menu-item .el-dropdown {
  vertical-align: middle;
}

.clkit-top-menu-item .el-dropdown {
  line-height: var(--el-header-height);
}

.clkit-top-menu-item .el-dropdown .el-tooltip__trigger:focus-visible {
  outline: none;
}
</style>