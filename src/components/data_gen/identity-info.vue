<template>
    <el-card class="box-card">
        <template #header>
            <div class="card-header">
                <span>身份信息</span>
                <el-button style="float: right;" @click="gen">重新生成</el-button>
            </div>
        </template>
        <div>
            <ul class="faker-item">
                <li>
                    <span>姓名：</span>
                    <span>{{ info.name }}</span>
                    <copyButton></copyButton>
                </li>
                <li>
                    <span>电话：</span>
                    <span>{{ info.phone }}</span>
                    <copyButton></copyButton>
                </li>
                <li>
                    <span>邮箱：</span>
                    <span>
                        {{ info.email }}
                    </span>
                    <copyButton></copyButton>
                </li>
            </ul>
        </div>
    </el-card>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { Faker, zh_CN } from '@faker-js/faker';
import copyButton from '@/components/copy-button.vue';

const faker = new Faker({
    locale: [zh_CN],
});

const info = reactive({});


function gen() {
    info.name = faker.person.fullName();
    info.phone = faker.phone.number();
    info.email = faker.internet.email();
}

onMounted(() => {
    gen();
})
</script>