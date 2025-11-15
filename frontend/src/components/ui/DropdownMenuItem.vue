<script setup>
import { DropdownMenuItem } from 'radix-vue'
import { cn } from '@/lib/utils'
import { computed } from 'vue'

const classes = computed(() =>
  cn(
    'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
    'transition-colors focus:bg-accent focus:text-accent-foreground',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
  )
)
</script>

<template>
  <DropdownMenuItem
    :class="classes"
    v-bind="$attrs"
  >
    <slot />
  </DropdownMenuItem>
</template>
