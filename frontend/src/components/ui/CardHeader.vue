<script setup>
import { cn } from '@/lib/utils'
</script>

<template>
  <div :class="cn('px-6 py-4 border-b border-border')">
    <slot />
  </div>
</template>
