<template>
  <div :style="{ height }"></div>
</template>

<script setup lang="ts">
import { getHeight } from '.'

defineOptions({ name: 'Gap' })

const props = withDefaults(defineProps<{ height: number }>(), { height: 50 })

const height = getHeight(props.height)
</script>
