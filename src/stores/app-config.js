import { ref, shallowRef } from 'vue';
import { defineStore } from 'pinia'
import Home from '@/components/home.vue';
import DateTime from '@/components/date-time.vue';
import Lan from '@/components/os/lan.vue';
import Process from '@/components/os/process.vue';
import Faker from '@/components/data_gen/faker.vue';
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
                path: idGen.getStringKey(), title: '工具配置', children: [
                    { path: '/data-backup', title: '数据备份' },
                ]
            },
            {
                path: idGen.getStringKey(), title: '代码相关', children: [
                    { path: '/crud-code-gen', title: '增删改查生成' },
                    { path: '/json-utils', title: 'JSON工具' },
                ]
            },
            {
                path: idGen.getStringKey(), title: '系统相关', children: [
                    { path: '/lan', title: '局域网工具' },
                    { path: '/process', title: '进程工具' },
                ]
            },
            {
                path: idGen.getStringKey(), title: '数据生成', children: [
                    { path: '/faker', title: '个人资料' }
                ]
            },
            {
                path: idGen.getStringKey(), title: '格式转换', children: [
                    { path: '/format-now-time', title: '格式化当前时间' },
                ]
            }
            ,
            {
                path: idGen.getStringKey(), title: '文本处理', children: [
                    { path: '/replace-each-row', title: '替换每一行' }
                ]
            },
        ],
        staticRoutes: [
            { path: '/', view: Home, isComponent: true },
            { path: '/data-backup', view: DataBackup, isComponent: true },
            { path: '/format-now-time', view: DateTime, isComponent: true },
            { path: '/process', view: Process, isComponent: true },
            { path: '/faker', view: Faker, isComponent: true },
            { path: '/crud-code-gen', view: CrudCodeGen, isComponent: true },
            { path: '/json-utils', view: JsonUtils, isComponent: true },
            { path: '/replace-each-row', view: ReplaceRow, isComponent: true },
            { path: '/lan', view: Lan, isComponent: true },
            { path: '/integration-manage', view: IntegrationManage, isComponent: true }
        ]
    }

    const integrationMenu = {
        path: idGen.getStringKey(), title: '集成', children: [{ path: '/integration-manage', title: '集成管理' }]
    }

    const menuList = ref([].concat(config.staticMenus, integrationMenu));
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
        integrationMenu.children = integrationMenuChildren;
        menuList.value = [].concat(config.staticMenus, integrationMenu);
        routerList.value = [].concat(config.staticRoutes, integrationRouters);
    }

    return { config, menuList, routerList, renderMenu }
})