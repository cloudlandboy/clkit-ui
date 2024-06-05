<template>
  <div class="clkit-regexp-container" v-loading.fullscreen.lock="syncAnyRuleLoading">
    <div class="clkit-regexp-topbar">
      <has-permission :value="CODE_REGEXP_MANAGE">
        <el-tooltip content="从AnyRule同步">
          <el-button type="info" icon="Refresh" @click="syncAnyRule">AnyRule</el-button>
        </el-tooltip>
        <el-button type="primary" @click="openAddOrEdit(null)">新增</el-button>
      </has-permission>
    </div>
    <div>
      <el-input v-model.trim="keyword" placeholder="搜索关键字" />
    </div>
    <div class="clkit-regexp-list clkit-custom-scrollbar">
      <el-card class="clkit-regexp-item" v-for="item in inViewRegexpList" :key="item.id">
        <h2>{{ item.name }}</h2>
        <div class="clkit-regexp-content">
          <el-button class="clkit-copy-btn" color="#20a162" type="primary" size="small"
            :data-clipboard-text="item.regex">复制</el-button>
          <div>{{ item.regex }}</div>
        </div>
        <div class="clkit-regexp-test">
          <el-input v-model="item.testText" :placeholder="item.examples.join('，')" />
          <el-button type="danger" :text="true" @click="testRegexp(item)">验证</el-button>
        </div>
        <div class="clkit-regexp-test-result" v-show="item.testResult != null">
          <el-tag v-show="item.testResult" type="success" effect="dark">通过</el-tag>
          <el-tag v-show="!item.testResult" type="danger" effect="dark">不通过</el-tag>
        </div>
      </el-card>
    </div>
  </div>


</template>
<script setup>
import axios from "@/api/axios";
import { ref, onBeforeMount, watch } from "vue";
import * as regexpApi from "@/api/code/regexp";
import { operationSuccessNotify } from "@/util/clkil-utils";
import { hasText } from "@/util/string-utils";
import { CODE_REGEXP_MANAGE } from "@/constants/permission";

const state = {
  searchTimer: null,
}

const syncAnyRuleLoading = ref(false);
const keyword = ref("");
const regexpList = ref([]);
const inViewRegexpList = ref([]);

watch(keyword, updateInViewRegexpList)
watch(regexpList, updateInViewRegexpList, { deep: false })

function updateInViewRegexpList() {
  if (state.searchTimer) {
    clearTimeout(state.searchTimer);
  }

  state.searchTimer = setTimeout(() => {
    if (hasText(keyword.value)) {
      inViewRegexpList.value = regexpList.value.filter(item => {
        return item.name.indexOf(keyword.value) >= 0 || item.description.indexOf(keyword.value) >= 0
      })
      return;
    }
    inViewRegexpList.value = regexpList.value;
  }, 100);

}

function testRegexp(regexp) {
  const rule = RegExp(regexp.regex)
  regexp.testResult = rule.test(regexp.testText);
}

function openAddOrEdit() {
}

function loadData() {
  regexpApi.getAll().then(res => {
    regexpList.value = res.data.data;
  })
}

async function syncAnyRule() {
  syncAnyRuleLoading.value = true;
  try {
    const anyRuleModule = await import(/* @vite-ignore */ axios.defaults.baseURL + '/code/regexp/any-rule.js')
    const ruleList = anyRuleModule.default;
    const dataList = ruleList.map(item => {
      return {
        name: item.title,
        description: item.title,
        regex: item.rule.source,
        examples: item.examples || [],
        counterExamples: item.counterExamples || [],
      }
    })

    await regexpApi.importData(dataList);
    operationSuccessNotify();
  } finally {
    syncAnyRuleLoading.value = false;
  }

}

onBeforeMount(loadData);
</script>

<style scoped>
.clkit-regexp-container {
  padding: 0 var(--clkit-margin) 0 var(--clkit-margin);
  margin: var(--clkit-margin) auto 0 auto;
}

.clkit-regexp-topbar {
  margin-bottom: var(--clkit-margin);
  text-align: right;
}

.clkit-regexp-list {
  margin-top: var(--clkit-margin);
  height: calc(var(--clkit-route-content-heigth) - 150px);
  overflow-y: scroll;
}

.clkit-regexp-item+.clkit-regexp-item {
  margin-top: var(--clkit-margin);
}

.clkit-regexp-item h2 {
  margin: 0 0 var(--clkit-margin) 0;
  color: #0eb0c9;
}

.clkit-regexp-item:hover {
  cursor: pointer;
  background-color: #f9f1db;
}

.clkit-regexp-content {
  background-color: #eee;
  border-radius: 4px;
  padding: 8px;
  margin-bottom: var(--clkit-margin);
  font-size: 0.8em;
  font-family: "JetBrainsMono";
  line-height: 2em;
  word-break: break-word;
}

.clkit-regexp-content .clkit-copy-btn {
  float: left;
  margin-right: 1em;
}

.clkit-regexp-test {
  display: flex;
  gap: var(--clkit-margin);
}

.clkit-regexp-test-result {
  margin-top: 8px;
}
</style>