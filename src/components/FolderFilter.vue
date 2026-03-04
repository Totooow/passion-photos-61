<script setup>
defineProps({
  folders: { type: Array, required: true },
  active: { type: String, default: '' },
})

defineEmits(['select'])
</script>

<template>
  <div class="flex flex-wrap gap-2 justify-center">
    <button
      class="px-4 py-1.5 rounded-full text-sm transition-colors"
      :class="active === '' ? 'bg-plum text-white' : 'bg-cream-dark text-plum-dark hover:bg-plum hover:text-white'"
      @click="$emit('select', '')"
    >
      Toutes
    </button>
    <button
      v-for="folder in folders"
      :key="folder.id"
      class="px-4 py-1.5 rounded-full text-sm transition-colors"
      :class="active === folder.id ? 'bg-plum text-white' : 'bg-cream-dark text-plum-dark hover:bg-plum hover:text-white'"
      @click="$emit('select', folder.id)"
    >
      {{ folder.name }}
    </button>
  </div>
</template>
