import { useAdmin } from '@/composables/useAdmin'
import { useConfirm } from '@/composables/useConfirm'

export function useAdminFolders() {
  const { catalog, addFolder: apiAddFolder, renameFolder: apiRenameFolder, removeFolder: apiRemoveFolder } = useAdmin()
  const { showConfirm, withLoading } = useConfirm()

  function handleAddFolder(name) {
    withLoading(() => apiAddFolder(name), 'Dossier créé')
  }

  function handleRenameFolder(folderId, name) {
    withLoading(() => apiRenameFolder(folderId, name), 'Renommé')
  }

  function handleRemoveFolder(folder) {
    const photos = catalog.value.photos.filter((p) => p.folder === folder.id)
    showConfirm(`Supprimer "${folder.name}" et ses ${photos.length} photo(s) ?`, () =>
      withLoading(() => apiRemoveFolder(folder.id), 'Dossier supprimé'),
    )
  }

  return { handleAddFolder, handleRenameFolder, handleRemoveFolder }
}
