import { ref, computed, watch } from 'vue'

export function useSearchPagination(items, perPage = 30) {
  const searchQuery = ref('')
  const page = ref(1)

  const filtered = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return items.value
    return items.value.filter((item) => item.title.toLowerCase().includes(q))
  })

  const paginated = computed(() => filtered.value.slice(0, page.value * perPage))
  const hasMore = computed(() => page.value * perPage < filtered.value.length)

  watch(searchQuery, () => {
    page.value = 1
  })

  function reset() {
    searchQuery.value = ''
    page.value = 1
  }

  return { searchQuery, page, filtered, paginated, hasMore, reset }
}
