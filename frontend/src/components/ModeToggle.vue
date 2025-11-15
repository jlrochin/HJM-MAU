<script setup>
import { Sun, Moon } from 'lucide-vue-next'
import { useColorMode } from '@vueuse/core'
import Button from '@/components/ui/Button.vue'
import DropdownMenu from '@/components/ui/DropdownMenu.vue'
import DropdownMenuContent from '@/components/ui/DropdownMenuContent.vue'
import DropdownMenuItem from '@/components/ui/DropdownMenuItem.vue'
import DropdownMenuTrigger from '@/components/ui/DropdownMenuTrigger.vue'

const mode = useColorMode({
  selector: 'html',
  attribute: 'class',
  storageKey: 'vueuse-color-scheme'
})

const setTheme = (theme) => {
  mode.value = theme
}
</script>

<template>
  <div class="fixed top-4 right-4 z-50">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="outline" size="icon">
          <Sun class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span class="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem @click="setTheme('light')">
          Light
        </DropdownMenuItem>
        <DropdownMenuItem @click="setTheme('dark')">
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem @click="setTheme('auto')">
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
