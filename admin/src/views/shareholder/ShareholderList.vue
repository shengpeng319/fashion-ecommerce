<template>
  <div class="shareholder-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>股东列表</span>
          <el-button type="primary" @click="showCreateDialog">添加股东</el-button>
        </div>
      </template>
      
      <el-table :data="shareholders" v-loading="loading">
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="level" label="级别" width="120">
          <template #default="{ row }">{{ getLevelName(row.level) }}</template>
        </el-table-column>
        <el-table-column prop="totalInvestment" label="投资总额" width="120">
          <template #default="{ row }">¥{{ formatNumber(row.totalInvestment) }}</template>
        </el-table-column>
        <el-table-column prop="totalDividend" label="累计分红" width="120">
          <template #default="{ row }">¥{{ formatNumber(row.totalDividend) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建股东对话框 -->
    <el-dialog v-model="createVisible" title="添加股东" width="450px">
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="用户ID" required>
          <el-input v-model="createForm.userId" placeholder="输入用户ID" />
        </el-form-item>
        <el-form-item label="姓名" required>
          <el-input v-model="createForm.name" placeholder="输入股东姓名" />
        </el-form-item>
        <el-form-item label="手机号" required>
          <el-input v-model="createForm.phone" placeholder="输入手机号" />
        </el-form-item>
        <el-form-item label="级别">
          <el-select v-model="createForm.level" style="width: 100%">
            <el-option v-for="c in configs" :key="c.level" :label="c.name" :value="c.level" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" @click="createShareholder" :loading="creating">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { shareholderApi } from '../../api'

const router = useRouter()
const shareholders = ref<any[]>([])
const configs = ref<any[]>([])
const loading = ref(false)
const createVisible = ref(false)
const creating = ref(false)

const createForm = ref({
  userId: '',
  name: '',
  phone: '',
  level: 1
})

onMounted(async () => {
  await Promise.all([fetchShareholders(), fetchConfig()])
})

const fetchShareholders = async () => {
  loading.value = true
  try {
    const res: any = await shareholderApi.list()
    shareholders.value = res
  } finally {
    loading.value = false
  }
}

const fetchConfig = async () => {
  const res: any = await shareholderApi.getConfig()
  configs.value = res
}

const getLevelName = (level: number) => {
  const config = configs.value.find(c => c.level === level)
  return config?.name || `级别${level}`
}

const formatNumber = (val: string) => {
  if (!val) return '0'
  return Number(val).toLocaleString('zh-CN', { minimumFractionDigits: 2 })
}

const formatDate = (date: string) => new Date(date).toLocaleString('zh-CN')

const showCreateDialog = () => {
  createForm.value = { userId: '', name: '', phone: '', level: 1 }
  createVisible.value = true
}

const createShareholder = async () => {
  if (!createForm.value.userId || !createForm.value.name || !createForm.value.phone) {
    ElMessage.warning('请填写完整信息')
    return
  }
  creating.value = true
  try {
    await shareholderApi.create(createForm.value)
    ElMessage.success('添加成功')
    createVisible.value = false
    fetchShareholders()
  } catch (e: any) {
    ElMessage.error(e.message || '添加失败')
  } finally {
    creating.value = false
  }
}

const viewDetail = (row: any) => {
  router.push(`/shareholder/${row.id}`)
}
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
