<template>
  <div class="users-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
        </div>
      </template>
      
      <el-table :data="users" v-loading="loading">
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="nickname" label="昵称" width="150" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">{{ row.gender === 'male' ? '男' : row.gender === 'female' ? '女' : '未知' }}</template>
        </el-table-column>
        <el-table-column prop="_count.orders" label="订单数" width="100" />
        <el-table-column prop="createdAt" label="注册时间" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="showDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        class="mt-20"
        @current-change="fetchUsers"
      />
    </el-card>

    <el-dialog v-model="detailVisible" title="用户详情" width="500px">
      <el-descriptions :column="2" border v-if="currentUser">
        <el-descriptions-item label="手机号">{{ currentUser.phone }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ currentUser.nickname || '-' }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ currentUser.gender === 'male' ? '男' : currentUser.gender === 'female' ? '女' : '未知' }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ formatDate(currentUser.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="收货地址" :span="2">
          <div v-for="addr in currentUser.addresses" :key="addr.id" style="margin: 4px 0">
            {{ addr.name }} {{ addr.phone }} {{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { userApi } from '../api'

const users = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const detailVisible = ref(false)
const currentUser = ref<any>(null)

onMounted(() => fetchUsers())

const fetchUsers = async () => {
  loading.value = true
  try {
    const res: any = await userApi.list({ page: page.value, pageSize: pageSize.value })
    users.value = res.users
    total.value = res.total
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string) => new Date(date).toLocaleString('zh-CN')

const showDetail = async (row: any) => {
  const res: any = await userApi.get(row.id)
  currentUser.value = res.user
  detailVisible.value = true
}
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.mt-20 { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>
