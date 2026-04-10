<template>
  <div class="categories-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>分类列表</span>
          <el-button type="primary" @click="openDialog()">添加分类</el-button>
        </div>
      </template>
      
      <el-table :data="categories" v-loading="loading" row-key="id" default-expand-all>
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openDialog(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑分类' : '添加分类'" width="400px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { categoryApi } from '../api'
import type { FormInstance, FormRules } from 'element-plus'

const categories = ref<any[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)

const formRef = ref<FormInstance>()
const form = reactive({ id: '', name: '', sort: 0 })

const rules: FormRules = { name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }] }

onMounted(() => fetchCategories())

const fetchCategories = async () => {
  loading.value = true
  try {
    const res: any = await categoryApi.list()
    categories.value = res.categories
  } finally {
    loading.value = false
  }
}

const openDialog = (row?: any) => {
  if (row) {
    isEdit.value = true
    Object.assign(form, { id: row.id, name: row.name, sort: row.sort })
  } else {
    isEdit.value = false
    Object.assign(form, { id: '', name: '', sort: 0 })
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  if (isEdit.value) {
    await categoryApi.update(form.id, form)
    ElMessage.success('更新成功')
  } else {
    await categoryApi.create(form)
    ElMessage.success('添加成功')
  }
  dialogVisible.value = false
  fetchCategories()
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定删除该分类？', '提示', { type: 'warning' })
    await categoryApi.delete(id)
    ElMessage.success('删除成功')
    fetchCategories()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e.response?.data?.error || '删除失败')
  }
}
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
