<template>
  <div class="shareholder-dashboard">
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card stat-card--primary">
          <div class="stat-card__icon"><el-icon><Coin /></el-icon></div>
          <div class="stat-card__content">
            <div class="stat-card__value">¥{{ formatNumber(stats.totalInvestment) }}</div>
            <div class="stat-card__label">投资总额</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card stat-card--success">
          <div class="stat-card__icon"><el-icon><Money /></el-icon></div>
          <div class="stat-card__content">
            <div class="stat-card__value">¥{{ formatNumber(stats.totalDividend) }}</div>
            <div class="stat-card__label">已分红</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card stat-card--warning">
          <div class="stat-card__icon"><el-icon><Clock /></el-icon></div>
          <div class="stat-card__content">
            <div class="stat-card__value">¥{{ formatNumber(stats.pendingDividend) }}</div>
            <div class="stat-card__label">待分红</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card stat-card--danger">
          <div class="stat-card__icon"><el-icon><User /></el-icon></div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ stats.investorCount }}</div>
            <div class="stat-card__label">股东人数</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-card class="recent-card">
      <template #header>
        <div class="card-header">
          <span>最近投资记录</span>
          <el-button type="primary" plain size="small" @click="router.push('/shareholder/list')">查看全部</el-button>
        </div>
      </template>
      <el-table 
        :data="recentInvestments" 
        v-loading="loading"
        :empty-text="loading ? '加载中...' : '暂无投资记录'"
      >
        <el-table-column prop="shareholderName" label="股东姓名" width="120" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{row}">
            <el-tag :type="getTypeColor(row.type)" size="small">
              {{ getTypeName(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="140">
          <template #default="{row}">
            <span class="amount">¥{{ formatNumber(row.amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间">
          <template #default="{row}">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { shareholderApi } from '../../api'

const router = useRouter()
const stats = ref({ totalInvestment: 0, totalDividend: 0, pendingDividend: 0, investorCount: 0 })
const recentInvestments = ref<any[]>([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const res: any = await shareholderApi.getDashboard()
    stats.value = res.stats || res
    recentInvestments.value = res.recentInvestments || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

const formatNumber = (val: number) => val ? val.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) : '0.00'
const formatDate = (date: string) => new Date(date).toLocaleString('zh-CN')

const getTypeName = (type: string) => {
  const map: Record<string, string> = { initial: '初始投资', additional: '追加投资', withdraw: '撤回投资' }
  return map[type] || type
}

const getTypeColor = (type: string) => {
  const map: Record<string, string> = { initial: 'success', additional: 'primary', withdraw: 'danger' }
  return map[type] || 'info'
}
</script>

<style scoped>
.stat-row { margin-bottom: 24px; }

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
  margin-bottom: 16px;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-card__icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  flex-shrink: 0;
}

.stat-card--primary .stat-card__icon { background: linear-gradient(135deg, #409eff, #66b1ff); }
.stat-card--success .stat-card__icon { background: linear-gradient(135deg, #67c23a, #85ce61); }
.stat-card--warning .stat-card__icon { background: linear-gradient(135deg, #e6a23c, #ebb563); }
.stat-card--danger .stat-card__icon { background: linear-gradient(135deg, #f56c6c, #f78989); }

.stat-card__value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-card__label {
  color: #909399;
  font-size: 14px;
  margin-top: 4px;
}

.amount { color: #f56c6c; font-weight: 600; }

.recent-card { border-radius: 12px; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
