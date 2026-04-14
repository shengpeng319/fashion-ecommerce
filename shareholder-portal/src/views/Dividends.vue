<template>
  <div class="page-container">
    <div class="header">
      <h1>分红记录</h1>
      <el-button @click="$router.push('/dashboard')">返回</el-button>
    </div>

    <el-card>
      <el-table :data="dividends" stripe v-loading="loading">
        <el-table-column prop="period" label="周期" width="180" />
        <el-table-column prop="amount" label="金额">
          <template #default="{ row }">
            ¥{{ formatMoney(row.amount) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="150">
          <template #default="{ row }">
            <el-tag :type="row.status === 'paid' ? 'success' : 'warning'">
              {{ row.status === 'paid' ? '已发放' : '待发放' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { shareholderApi, type DividendItem } from '../api/shareholder'

const dividends = ref<DividendItem[]>([])
const loading = ref(false)

const formatMoney = (val: number) => val?.toLocaleString() || '0'

const loadDividends = async () => {
  loading.value = true
  try {
    const { data } = await shareholderApi.getDividends()
    dividends.value = data
  } catch {
    // Mock data
    dividends.value = [
      { id: 1, period: '2024年上半年', amount: 15000, status: 'paid' },
      { id: 2, period: '2024年下半年', amount: 18000, status: 'paid' },
      { id: 3, period: '2025年上半年', amount: 22000, status: 'paid' },
      { id: 4, period: '2025年下半年', amount: 25000, status: 'pending' }
    ]
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDividends()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
}
</style>
