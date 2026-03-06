<script setup>
import { useRouter } from 'vue-router'
import { useAdmin } from '@/composables/useAdmin'
import { useConfirm } from '@/composables/useConfirm'
import { useAdminFolders } from '@/composables/useAdminFolders'
import AdminFolderPanel from '@/components/admin/AdminFolderPanel.vue'

const router = useRouter()
const { catalog } = useAdmin()
const { loading } = useConfirm()
const { handleAddFolder, handleRenameFolder, handleRemoveFolder } = useAdminFolders()

function openFolder(id) {
  router.push({ name: 'admin-folder', params: { folderId: id } })
}
</script>

<template>
  <AdminFolderPanel
    :folders="catalog.folders"
    :photos="catalog.photos"
    :loading="loading"
    @open="openFolder"
    @add="handleAddFolder"
    @rename="handleRenameFolder"
    @remove="handleRemoveFolder"
  />
</template>
