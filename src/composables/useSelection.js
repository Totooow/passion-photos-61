import { ref, computed } from 'vue'

export function useSelection() {
  const selectedIds = ref(new Set())
  const selectionActive = computed(() => selectedIds.value.size > 0)

  function toggle(id) {
    const s = new Set(selectedIds.value)
    if (s.has(id)) s.delete(id)
    else s.add(id)
    selectedIds.value = s
  }

  function selectAll(ids) {
    selectedIds.value = new Set(ids)
  }

  function deselectAll() {
    selectedIds.value = new Set()
  }

  return { selectedIds, selectionActive, toggle, selectAll, deselectAll }
}
