<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card stat-card--primary">
          <div class="stat-card__icon"><el-icon><Goods /></el-icon></div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ stats.products }}</div>
            <div class="stat-card__label">商品数量</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card stat-card--success">
          <div class="stat-card__icon"><el-icon><ShoppingCart /></el-icon></div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ stats.orders }}</div>
            <div class="stat-card__label">订单数量</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card stat-card--warning">
          <div class="stat-card__icon"><el-icon><User /></el-icon></div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ stats.users }}</div>
            <div class="stat-card__label">用户数量</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card stat-card--danger">
          <div class="stat-card__icon"><el-icon><TrendCharts /></el-icon></div>
          <div class="stat-card__content">
            <div class="stat-card__value">¥{{ formatNumber(stats.sales) }}</div>
            <div class="stat-card__label">销售额</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-card class="recent-card">
      <template #header>
        <span>最近订单</span>
      </template>
      <el-table 
        :data="recentOrders" 
        v-loading="loading"
        empty-text="暂无订单数据"
      >
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="user.phone" label="用户" width="120" />
        <el-table-column prop="totalAmount" label="金额" width="100">
          <template #default="{ row }">¥{{ row.totalAmount }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '../api/request'

const stats = ref({ products: 0, orders: 0, users: 0, sales: 0 })
const recentOrders = ref<any[]>([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const [productsRes, ordersRes, usersRes] = await Promise.all([
      request.get('/products', { params: { pageSize: 1 } }),
      request.get('/orders', { params: { pageSize: 10 } }),
      request.get('/users', { params: { pageSize: 1 } })
    ])
    stats.value.products = (productsRes as any).total || 0
    stats.value.orders = (ordersRes as any).total || 0
    stats.value.users = (usersRes as any).total || 0
    recentOrders.value = (ordersRes as any).orders || []
    
    const allOrders = await request.get('/orders', { params: { pageSize: 1000, status: 'completed' } })
    const orders = (allOrders as any).orders || []
    stats.value.sales = orders.reduce((sum: number, o: any) => sum + Number(o.payAmount), 0)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    paid: 'success',
    shipped: 'primary',
    completed: 'success',
    cancelled: 'info'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

const formatNumber = (val: number) => val.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
const formatDate = (date: string) => new Date(date).toLocaleString('zh-CN')
</script>

<style scoped>
.dashboard { padding: 20px; }

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
  color: #333;
  line-height: 1.2;
}

.stat-card__label {
  color: #666;
  font-size: 14px;
  margin-top: 4px;
}

.recent-card { border-radius: 12px; }
</style>
