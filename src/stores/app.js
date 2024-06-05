import { ref, shallowRef } from 'vue';
import { defineStore } from 'pinia'
import Home from '@/components/home.vue';
import DateTime from '@/components/date-time.vue';
import LanScan from '@/components/net/lan-sacn.vue';
import MyNetInfo from '@/components/net/my-net-info.vue';
import Process from '@/components/os/process.vue';
import IdentityInfo from '@/components/data_gen/identity-info.vue';
import CrudCodeGen from '@/components/code/curd_gen/crud-code-gen.vue';
import ExtensionManage from "@/components/extension/extension-manage.vue";
import DataBackup from "@/components/app/data-backup.vue";
import JsonUtils from "@/components/code/json-utils.vue";
import Todo from "@/components/job/todo/index.vue";
import Property from '@/components/app/property.vue';
import User from '@/components/app/user.vue'
import Role from '@/components/app/role.vue'
import Permission from '@/components/app/permission.vue'
import Regexp from '@/components/code/regexp.vue';
import UserInfo from '@/components/app/user-info.vue'
import NotFound from '@/components/not-found.vue'
import WebsocketTest from '@/components/code/websocket-test.vue'
import { getTree } from "@/api/extension";
import { AutoIncrementKey } from "@/util/id-utils";
import { getAll as getAllProperty } from '@/api/app/property';
import localStore from '@/util/local-store';


const serverAddress = import.meta.env.VITE_SERVER_ADDRESS || '';

function getServerResourceUrl(path) {
    if (!path) {
        return `${serverAddress}/api/404`;
    }
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    return `${serverAddress}/${path.startsWith('/') ? path.substring(1) : path}`;
}

export const useAppStore = defineStore('app', () => {
    const idGen = new AutoIncrementKey();
    const config = {
        title: 'Clkit',
        iconSrc: '/favicon.ico',
        contextPath: '',
        defaultPath: '/',
        maxIframeSize: 8,
        staticMenus: [
            {
                path: idGen.getStringKey(), title: '系统', children: [
                    { path: '/data-backup', title: '数据备份' },
                    { path: '/property', title: '参数配置' },
                    { path: '/user', title: '用户管理' },
                    { path: '/role', title: '角色管理' },
                    { path: '/permission', title: '权限查看' },
                ]
            },
            {
                path: idGen.getStringKey(), title: '开发', children: [
                    { path: '/crud-code-gen', title: 'CRUD生成' },
                    { path: '/json-utils', title: 'JSON工具' },
                    { path: '/regexp', title: '正则工具' },
                    { path: '/websocket-test', title: 'Websocket测试' },
                ]
            },
            {
                path: idGen.getStringKey(), title: '任务', children: [
                    { path: '/todo', title: '待办' },
                ]
            },
            {
                path: idGen.getStringKey(), title: '网络', children: [
                    { path: '/lan-scan', title: '局域网扫描' },
                    { path: '/my-net-info', title: '本机网络信息' },
                ]
            },
            {
                path: idGen.getStringKey(), title: '操作系统', children: [
                    { path: '/process', title: '进程查杀' },
                ]
            },
            {
                path: idGen.getStringKey(), title: '模拟数据', children: [
                    { path: '/identity-info', title: '身份信息' }
                ]
            }
        ],
        staticRoutes: [
            { path: '/home', view: Home, isComponent: true },
            { path: '/user-info', view: UserInfo, isComponent: true },
            { path: '/data-backup', view: DataBackup, isComponent: true },
            { path: '/property', view: Property, isComponent: true },
            { path: '/user', view: User, isComponent: true },
            { path: '/role', view: Role, isComponent: true },
            { path: '/permission', view: Permission, isComponent: true },
            { path: '/format-now-time', view: DateTime, isComponent: true },
            { path: '/process', view: Process, isComponent: true },
            { path: '/identity-info', view: IdentityInfo, isComponent: true },
            { path: '/crud-code-gen', view: CrudCodeGen, isComponent: true },
            { path: '/json-utils', view: JsonUtils, isComponent: true },
            { path: '/regexp', view: Regexp, isComponent: true },
            { path: '/websocket-test', view: WebsocketTest, isComponent: true },
            { path: '/lan-scan', view: LanScan, isComponent: true },
            { path: '/my-net-info', view: MyNetInfo, isComponent: true },
            { path: '/extension-manage', view: ExtensionManage, isComponent: true },
            { path: '/todo', view: Todo, isComponent: true },
            { path: '/404', view: NotFound, isComponent: true }
        ],
        property: localStore.getJsonOrDefault('config-property', {
            "CLKIT_HOME_PATH": "/home",
            "CLKIT_EXTENSION_MODE": "MENU"
        })
    }

    //缓存配置
    getAllProperty().then(res => {
        res.data.data.forEach(item => {
            config.property[item.propKey] = item.propValue;
        })
        localStore.set('config-property', config.property);
    })

    const extensionMenu = {
        path: idGen.getStringKey(), title: '扩展', children: [{ path: '/extension-manage', title: '扩展管理' }]
    }

    const iframeList = ref([]);
    const currentRouter = shallowRef({});
    const menuList = ref([].concat(config.staticMenus));
    const routerList = shallowRef([].concat(config.staticRoutes));

    function collectExtensionMenu(extension, menuBucket, routerBucket) {
        const menu = { path: `/extension-${extension.id}`, title: extension.name, hide: !!extension.hide };
        menuBucket.push(menu);
        if (extension.type === '0') {
            menu.children = [];
            if (extension.children) {
                extension.children.map(et => collectExtensionMenu(et, menu.children, routerBucket));
            }
        } else {
            routerBucket.push({
                path: menu.path,
                view: getServerResourceUrl(extension.path),
                isComponent: false,
                insertScript: ''
            });
        }
    }

    async function renderMenu() {
        const extensionMenuChildren = [{ path: '/extension-manage', title: '扩展管理' }];
        const extensionRouters = [];
        const res = await getTree(true);
        res.data.data.forEach(extension => {
            collectExtensionMenu(extension, extensionMenuChildren, extensionRouters);
        })

        if ("MENU" == config.property["CLKIT_EXTENSION_MODE"]) {
            extensionMenu.children = extensionMenuChildren;
        } else {
            extensionMenu.children = [extensionMenuChildren[0]];
        }

        menuList.value = [].concat(config.staticMenus, extensionMenu);
        routerList.value = [].concat(config.staticRoutes, extensionRouters);
    }

    function findRoute(path) {
        return routerList.value.find(r => r.path === path);
    }

    function setCurrentRouter(path) {
        window.history.replaceState(null, "", config.contextPath + path);
        if (!path || path == "/") {
            path = config.property["CLKIT_HOME_PATH"]
        }
        if (path == "/") {
            path = "/home";
        }

        const view = findRoute(path) || findRoute('/404');
        currentRouter.value = view;
        if (view.isComponent) {
            return
        }
        let toView = iframeList.value.find(frame => frame.router.path === view.path);
        if (toView) {
            toView.viewCount++;
            return;
        }

        if (iframeList.value.length < config.maxIframeSize) {
            toView = { index: iframeList.value.length, router: view, ref: null, viewCount: 0 };
            iframeList.value.push(toView);
            return
        }

        //最少使用
        toView = iframeList.value[0];
        let maxViewCount = 0;
        iframeList.value.forEach(frame => {
            if (frame.viewCount < toView.viewCount) {
                toView = frame;
            }
            if (frame.viewCount > maxViewCount) {
                maxViewCount = frame.viewCount;
            }
        })
        toView.viewCount = maxViewCount + 1;
        toView.router = view;

    }

    return { config, menuList, routerList, iframeList, currentRouter, renderMenu, setCurrentRouter }
})