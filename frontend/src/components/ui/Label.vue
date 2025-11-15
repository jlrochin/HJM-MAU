<script setup>
import { cn } from '@/lib/utils'

const props = defineProps({
  for: {
    type: String,
    default: undefined
  }
})
</script>

<template>
  <label
    :for="props.for"
    :class="cn('block text-sm font-medium text-foreground mb-2')"
  >
    <slot />
  </label>
</template>
