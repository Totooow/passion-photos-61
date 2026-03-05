import { computed } from 'vue'
import { usePhotos } from '@/composables/usePhotos'

export function usePhotoFormat(photo, selectedFormat) {
  const { formats } = usePhotos()

  const currentFormat = computed(() => formats.value.find((f) => f.id === selectedFormat.value))

  const currentPrice = computed(() => photo.value?.prices?.[selectedFormat.value] ?? 0)

  const currentFormatLabel = computed(() => currentFormat.value?.label || selectedFormat.value)

  const currentFormatType = computed(() => currentFormat.value?.type || 'print')

  return { currentFormat, currentPrice, currentFormatLabel, currentFormatType }
}
