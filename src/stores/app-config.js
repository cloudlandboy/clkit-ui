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
import IntegrationManage from "@/components/integration-manage.vue";
import DataBackup from "@/components/app/data-backup.vue";
import JsonUtils from "@/components/code/json-utils.vue";
// import { getInstalledTree } from "@/api/integration";
// import { INTEGRATION_TYPES } from "../constant/dict.constants";
import { AutoIncrementKey } from "@/util/id-utils";

// const serverAddressPrefix = import.meta.env.VITE_SERVER_ADDRESS || '';

// function serverIntegrationUrl(id, index) {
//     if (index.startsWith('/')) {
//         index = index.substring(1);
//     }
//     return `${serverAddressPrefix}/integration/${id}/${index}`;
// }

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
            { path: '/integration-manage', view: IntegrationManage, isComponent: true }
        ]
    }

    const integrationMenu = {
        path: idGen.getStringKey(), title: '集成', children: [{ path: '/integration-manage', title: '集成管理' }]
    }

    const menuList = ref([].concat(config.staticMenus));
    const routerList = shallowRef([].concat(config.staticRoutes));

    // function collectIntegrationMenu(treeNode, menuBucket, routerBucket) {
    //     const path = `/integration/${treeNode._id}`;
    //     const menu = { path, title: treeNode.name, hide: !!treeNode.hide };
    //     menuBucket.push(menu);
    //     if (INTEGRATION_TYPES.FOLDER.ve(treeNode.type)) {
    //         menu.children = [];
    //         treeNode.children.map(c => collectIntegrationMenu(c, menu.children, routerBucket));
    //     } else {
    //         routerBucket.push({
    //             path: path,
    //             view: INTEGRATION_TYPES.ONLINE_URL.ve(treeNode.type) ? treeNode.url : serverIntegrationUrl(treeNode._id, treeNode.index),
    //             isComponent: false,
    //             insertScript: treeNode.insertScript
    //         });
    //     }
    // }

    async function renderMenu() {
        const integrationMenuChildren = [{ path: '/integration-manage', title: '集成管理' }];
        const integrationRouters = [];
        // const res = await getInstalledTree();
        // res.data.forEach(item => {
        //     collectIntegrationMenu(item, integrationMenuChildren, integrationRouters);
        // })
        //integrationMenu.children = integrationMenuChildren;
        //menuList.value = [].concat(config.staticMenus, integrationMenu);
        //routerList.value = [].concat(config.staticRoutes, integrationRouters);
    }

    return { config, menuList, routerList, renderMenu }
})