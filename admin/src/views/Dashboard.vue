<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #409eff">
            <el-icon><Goods /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.products }}</div>
            <div class="stat-label">商品数量</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #67c23a">
            <el-icon><ShoppingCart /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.orders }}</div>
            <div class="stat-label">订单数量</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #e6a23c">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.users }}</div>
            <div class="stat-label">用户数量</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #f56c6c">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">¥{{ stats.sales }}</div>
            <div class="stat-label">销售额</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-card class="mt-20">
      <template #header>
        <span>Recent Orders</span>
      </template>
      <el-table :data="recentOrders">
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="user.phone" label="用户" width="120" />
        <el-table-column prop="totalAmount" label="金额" width="100">
          <template #default="{ row }">¥{{ row.totalAmount }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
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

onMounted(async () => {
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
    
    // 计算销售额
    const allOrders = await request.get('/orders', { params: { pageSize: 1000, status: 'completed' } })
    const orders = (allOrders as any).orders || []
    stats.value.sales = orders.reduce((sum: number, o: any) => sum + Number(o.payAmount), 0)
  } catch (e) {
    console.error(e)
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

const formatDate = (date: string) => new Date(date).toLocaleString('zh-CN')
</script>

<style scoped>
.dashboard {
  padding: 20px;
}
.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}
.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}
.stat-label {
  color: #999;
  font-size: 14px;
  margin-top: 4px;
}
.mt-20 {
  margin-top: 20px;
}
</style>
