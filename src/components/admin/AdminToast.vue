<script setup>
import { useToast } from '@/composables/useToast'

const { toast } = useToast()
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="toast.show"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium"
        :class="toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-plum-dark text-white'"
        @click="toast.show = false"
      >
        {{ toast.message }}
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 12px);
}
</style>
