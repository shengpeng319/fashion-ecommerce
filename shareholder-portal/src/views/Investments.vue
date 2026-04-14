<template>
  <div class="page-container">
    <div class="header">
      <h1>投资记录</h1>
      <el-button @click="$router.push('/dashboard')">返回</el-button>
    </div>

    <el-card>
      <el-table :data="investments" stripe v-loading="loading">
        <el-table-column prop="date" label="时间" width="180" />
        <el-table-column prop="type" label="类型" width="150">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)">{{ getTypeName(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额">
          <template #default="{ row }">
            <span :class="row.type === 'withdrawal' ? 'negative' : 'positive'">
              {{ row.type === 'withdrawal' ? '-' : '+' }}¥{{ formatMoney(row.amount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="note" label="备注" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { shareholderApi, type InvestmentItem } from '../api/shareholder'

const investments = ref<InvestmentItem[]>([])
const loading = ref(false)

const formatMoney = (val: number) => val?.toLocaleString() || '0'

const getTypeName = (type: string) => {
  const map: Record<string, string> = {
    initial: '初始投资',
    additional: '追加投资',
    withdrawal: '撤回投资'
  }
  return map[type] || type
}

const getTypeColor = (type: string) => {
  const map: Record<string, string> = {
    initial: 'success',
    additional: 'warning',
    withdrawal: 'danger'
  }
  return map[type] || ''
}

const loadInvestments = async () => {
  loading.value = true
  try {
    const { data } = await shareholderApi.getInvestments()
    investments.value = data
  } catch {
    // Mock data
    investments.value = [
      { id: 1, date: '2024-01-15', type: 'initial', amount: 300000, note: '初始投资入股' },
      { id: 2, date: '2024-06-20', type: 'additional', amount: 200000, note: '追加投资' },
      { id: 3, date: '2025-01-10', type: 'additional', amount: 100000, note: '第三次追加' },
      { id: 4, date: '2025-03-15', type: 'withdrawal', amount: 50000, note: '部分撤资' }
    ]
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadInvestments()
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

.positive {
  color: #67c23a;
}

.negative {
  color: #f56c6c;
}
</style>
