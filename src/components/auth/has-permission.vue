<template>
    <template v-if="authStore.authChecker.hasPermission(props.value)">
        <slot></slot>
    </template>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();
const props = defineProps({
    value: {
        type: String,
        required: true
    }
})
</script>