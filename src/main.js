/**
 * 
 * @author: clboy
 * @date: 2023-12-13 12:32:30
 * @Copyright (c) 2023 by syl@clboy.cn, All Rights Reserved. 
 */
import './assets/base.css';
import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import zhLocale from "element-plus/dist/locale/zh-cn";
import 'dayjs/locale/zh-cn';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import App from './App.vue';
import { basicSetup } from 'codemirror';
import VueCodemirror from 'vue-codemirror';
import VueDragResize from 'vue-drag-resize/src/components/vue-drag-resize.vue';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration'
import HasPermission from '@/components/auth/has-permission.vue';

dayjs.extend(duration);

const app = createApp(App)
app.use(createPinia());
app.use(ElementPlus, { locale: zhLocale })
app.component('HasPermission', HasPermission)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(VueCodemirror, {
  autofocus: true,
  disabled: false,
  indentWithTab: true,
  tabSize: 2,
  placeholder: 'Code goes here...',
  extensions: [basicSetup]
})

app.mount('#app');

