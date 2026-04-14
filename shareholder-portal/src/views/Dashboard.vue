<template>
  <div class="dashboard">
    <div class="header">
      <h1>股东 Dashboard</h1>
      <div class="user-info">
        <span>{{ shareholder?.name }}</span>
        <el-tag>{{ shareholder?.level }}</el-tag>
        <el-button text @click="handleLogout">退出</el-button>
      </div>
    </div>

    <el-row :gutter="20" class="stats">
      <el-col :span="6">
        <el-card>
          <div class="stat-label">投资总额</div>
          <div class="stat-value">¥{{ formatMoney(stats.totalInvestment) }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-label">累计收益</div>
          <div class="stat-value">¥{{ formatMoney(stats.cumulativeReturns) }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-label">待分红</div>
          <div class="stat-value">¥{{ formatMoney(stats.pendingDividends) }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-label">投资比例</div>
          <div class="stat-value">{{ stats.investmentRatio }}%</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="recent-investments">
      <template #header>
        <div class="card-header">
          <span>最近投资记录</span>
          <el-button text @click="$router.push('/investments')">查看全部</el-button>
        </div>
      </template>
      <el-table :data="stats.recentInvestments" stripe>
        <el-table-column prop="date" label="时间" width="180" />
        <el-table-column prop="type" label="类型" width="150">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)">{{ getTypeName(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额">
          <template #default="{ row }">
            <span :class="row.type === 'withdrawal' ? 'negative' : ''">
              {{ row.type === 'withdrawal' ? '-' : '+' }}¥{{ formatMoney(row.amount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="note" label="备注" />
      </el-table>
    </el-card>

    <div class="nav-links">
      <el-button type="primary" @click="$router.push('/investments')">投资记录</el-button>
      <el-button type="success" @click="$router.push('/dividends')">分红记录</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { shareholderApi } from '../api/shareholder'

const router = useRouter()
const { shareholder, logout, loadFromStorage } = useAuthStore()

const stats = reactive({
  totalInvestment: 500000,
  cumulativeReturns: 125000,
  pendingDividends: 25000,
  investmentRatio: 8.5,
  recentInvestments: [] as any[]
})

const formatMoney = (val: number) => {
  return val?.toLocaleString() || '0'
}

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

const handleLogout = () => {
  logout()
  router.push('/')
}

const loadDashboard = async () => {
  try {
    const { data } = await shareholderApi.getDashboard()
    Object.assign(stats, data)
  } catch {
    stats.recentInvestments = [
      { id: 1, date: '2024-01-15', type: 'initial', amount: 300000, note: '初始投资' },
      { id: 2, date: '2024-06-20', type: 'additional', amount: 200000, note: '追加投资' },
      { id: 3, date: '2025-01-10', type: 'additional', amount: 100000, note: '追加投资' }
    ]
  }
}

onMounted(() => {
  loadFromStorage()
  loadDashboard()
})
</script>

<style scoped>
.dashboard {
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

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stats {
  margin-bottom: 20px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.recent-investments {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.negative {
  color: #f56c6c;
}

.nav-links {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>
