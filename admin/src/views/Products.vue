<template>
  <div class="products-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品列表</span>
          <el-button type="primary" @click="openDialog()">添加商品</el-button>
        </div>
      </template>
      
      <el-table 
        :data="products" 
        v-loading="loading"
        empty-text="暂无商品数据，请先添加商品"
      >
        <el-table-column prop="image" label="图片" width="100">
          <template #default="{ row }">
            <el-image 
              v-if="row.image" 
              :src="row.image" 
              style="width:60px;height:60px" 
              fit="cover"
              :preview-src-list="[row.image]"
              preview-teleported
            />
            <span v-else class="no-image">暂无图片</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" min-width="150" />
        <el-table-column prop="category.name" label="分类" width="100" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" />
        <el-table-column prop="sales" label="销量" width="80" />
        <el-table-column prop="isActive" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'">{{ row.isActive ? '上架' : '下架' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openDialog(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        class="pagination"
        @current-change="fetchProducts"
      />
    </el-card>

    <!-- 商品编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑商品' : '添加商品'" width="700px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="副标题" prop="subtitle">
          <el-input v-model="form.subtitle" placeholder="请输入副标题" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="价格" prop="price">
              <el-input-number v-model="form.price" :min="0" :precision="2" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="原价">
              <el-input-number v-model="form.originalPrice" :min="0" :precision="2" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分类" prop="categoryId">
              <el-select v-model="form.categoryId" style="width:100%">
                <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存">
              <el-input-number v-model="form.stock" :min="0" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="商品图片">
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="handleUpload"
          >
            <img v-if="form.image" :src="form.image" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">点击上传图片，自动生成缩略图</div>
        </el-form-item>
        <el-form-item label="商品描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入商品描述" />
        </el-form-item>
        <el-form-item label="商品详情">
          <el-input v-model="form.detail" type="textarea" :rows="5" placeholder="请输入商品详情（支持HTML）" />
        </el-form-item>
        <el-form-item label="上架状态">
          <el-switch v-model="form.isActive" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { productApi, categoryApi } from '../api'
import type { FormInstance, FormRules } from 'element-plus'

const products = ref<any[]>([])
const categories = ref<any[]>([])
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const formRef = ref<FormInstance>()
const form = reactive({
  id: '',
  name: '',
  subtitle: '',
  price: 0,
  originalPrice: 0,
  categoryId: '',
  stock: 0,
  image: '',
  thumbnail: '',
  description: '',
  detail: '',
  isActive: true
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }]
}

onMounted(() => {
  fetchProducts()
  fetchCategories()
})

const fetchProducts = async () => {
  loading.value = true
  try {
    const res: any = await productApi.list({ page: page.value, pageSize: pageSize.value })
    products.value = res.products
    total.value = res.total
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  const res: any = await categoryApi.list()
  categories.value = res.categories
}

const openDialog = (row?: any) => {
  if (row) {
    isEdit.value = true
    Object.assign(form, {
      id: row.id,
      name: row.name,
      subtitle: row.subtitle || '',
      price: Number(row.price),
      originalPrice: row.originalPrice ? Number(row.originalPrice) : 0,
      categoryId: row.categoryId,
      stock: row.stock,
      image: row.image || '',
      thumbnail: row.thumbnail || '',
      description: row.description || '',
      detail: row.detail || '',
      isActive: row.isActive
    })
  } else {
    isEdit.value = false
    Object.assign(form, {
      id: '', name: '', subtitle: '', price: 0, originalPrice: 0,
      categoryId: '', stock: 0, image: '', thumbnail: '',
      description: '', detail: '', isActive: true
    })
  }
  dialogVisible.value = true
}

const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isImage) ElMessage.error('只能上传图片文件')
  if (!isLt5M) ElMessage.error('图片大小不能超过5MB')
  return isImage && isLt5M
}

const handleUpload = async ({ file }: any) => {
  const formData = new FormData()
  formData.append('image', file)
  try {
    const res: any = await productApi.upload(formData)
    form.image = res.image
    form.thumbnail = res.thumbnail
    ElMessage.success('上传成功')
  } catch (e) {
    // error handled by interceptor
  }
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  submitting.value = true
  try {
    if (isEdit.value) {
      await productApi.update(form.id, form)
      ElMessage.success('更新成功')
    } else {
      await productApi.create(form)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    fetchProducts()
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id: string) => {
  await ElMessageBox.confirm('确定删除该商品？', '提示', { type: 'warning' })
  await productApi.delete(id)
  ElMessage.success('删除成功')
  fetchProducts()
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: border-color 0.2s;
}
.avatar-uploader:hover {
  border-color: #ff5777;
}
.avatar {
  width: 120px;
  height: 120px;
  object-fit: cover;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #666;
}
.upload-tip {
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}
.no-image {
  color: #595959;
  font-size: 12px;
}
</style>
