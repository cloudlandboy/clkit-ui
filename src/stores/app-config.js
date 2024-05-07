import { ref, shallowRef } from 'vue';
import { defineStore } from 'pinia'
import Home from '@/components/home.vue';
import DateTime from '@/components/date-time.vue';
import LanScan from '@/components/net/lan-sacn.vue';
import MyNetInfo from '@/components/net/my-net-info.vue';
import Process from '@/components/os/process.vue';
import IdentityInfo from '@/components/data_gen/identity-info.vue';
import CrudCodeGen from '@/components/code/curd_gen/crud-code-gen.vue';
import ReplaceRow from '@/components/text_process/replace_row/index.vue';
import ExtensionManage from "@/components/extension/extension-manage.vue";
import DataBackup from "@/components/app/data-backup.vue";
import JsonUtils from "@/components/code/json-utils.vue";
import { getTree } from "@/api/extension";
import { AutoIncrementKey } from "@/util/id-utils";

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

export const useAppConfigStore = defineStore('appConfig', () => {
    const idGen = new AutoIncrementKey();
    const config = {
        title: 'CLKIT',
        iconSrc: '/author-avatar.png',
        contextPath: '',
        defaultPath: '/',
        maxIframeCache: 8,
        staticMenus: [
            {
                path: idGen.getStringKey(), title: '配置', children: [
                    { path: '/data-backup', title: '数据备份' },
                ]
            },
            {
                path: idGen.getStringKey(), title: '代码', children: [
                    { path: '/crud-code-gen', title: '增删改查生成' },
                    { path: '/json-utils', title: 'JSON工具' },
                ]
            },
            {
                path: idGen.getStringKey(), title: '网络', children: [
                    { path: '/lan-scan', title: '局域网扫描' },
                    { path: '/my-net-info', title: '本机网络信息' },
                ]
            },
            {
                path: idGen.getStringKey(), title: '系统', children: [
                    { path: '/process', title: '进程查杀' },
                ]
            },
            {
                path: idGen.getStringKey(), title: '假数据', children: [
                    { path: '/identity-info', title: '身份信息' }
                ]
            }
        ],
        staticRoutes: [
            { path: '/', view: Home, isComponent: true },
            { path: '/data-backup', view: DataBackup, isComponent: true },
            { path: '/format-now-time', view: DateTime, isComponent: true },
            { path: '/process', view: Process, isComponent: true },
            { path: '/identity-info', view: IdentityInfo, isComponent: true },
            { path: '/crud-code-gen', view: CrudCodeGen, isComponent: true },
            { path: '/json-utils', view: JsonUtils, isComponent: true },
            { path: '/replace-each-row', view: ReplaceRow, isComponent: true },
            { path: '/lan-scan', view: LanScan, isComponent: true },
            { path: '/my-net-info', view: MyNetInfo, isComponent: true },
            { path: '/extension-manage', view: ExtensionManage, isComponent: true }
        ]
    }

    const extensionMenu = {
        path: idGen.getStringKey(), title: '扩展', children: [{ path: '/extension-manage', title: '扩展管理' }]
    }

    const menuList = ref([].concat(config.staticMenus));
    const routerList = shallowRef([].concat(config.staticRoutes));

    function collectExtensionMenu(extension, menuBucket, routerBucket) {
        const menu = { path: `extension-${extension.id}`, title: extension.name, hide: !!extension.hide };
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
        extensionMenu.children = extensionMenuChildren;
        menuList.value = [].concat(config.staticMenus, extensionMenu);
        routerList.value = [].concat(config.staticRoutes, extensionRouters);
    }

    return { config, menuList, routerList, renderMenu }
})