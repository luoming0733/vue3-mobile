// 我的业绩
<script setup lang="ts">
import { onMounted } from 'vue'

import MyNavBar from '@/components/my-nav-bar/index.vue'
import develop from '@/components/other-page/develop.vue'
import { isWeChatBrowser } from '@/utils'

onMounted(() => {})
</script>

<template>
  <div class="page">
    <my-nav-bar v-if="!isWeChatBrowser" title="我的业绩" />
    <develop />
  </div>
</template>
