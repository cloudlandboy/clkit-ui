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
                <el-dropdown-item>个人信息</el-dropdown-item>
                <el-dropdown-item @click="authStore.actionLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="150px" class="clkit-aside" v-show="menuShow">
        <el-menu ref="menuRef" class="clkit-aside-menu" :default-active="currentRouter.path" @select="menuSelect"
          :default-openeds="defaultOpeneds" :collapse-transition="false">
          <tree-menu :menuList="appStore.menuList" />
        </el-menu>
      </el-aside>
      <!-- 路由视图 -->
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
  </el-container>

  <!-- 登录 -->
  <login />
</template>

<script setup>
import Clipboard from 'clipboard';
import { ref, onMounted, onBeforeMount, shallowRef } from 'vue';
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

function toggleShow(value) {
  menuShow.value = value;
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

.clkit-aside-menu {
  border-right: none;
}
</style>