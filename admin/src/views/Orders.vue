<template>
  <div class="orders-page">
    <el-card>
      <template #header>
        <el-row :gutter="20" align="middle">
          <el-col :span="4"><span>订单列表</span></el-col>
          <el-col :span="8">
            <el-select v-model="statusFilter" placeholder="订单状态" clearable @change="fetchOrders">
              <el-option label="待支付" value="pending" />
              <el-option label="已支付" value="paid" />
              <el-option label="已发货" value="shipped" />
              <el-option label="已完成" value="completed" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
          </el-col>
        </el-row>
      </template>
      
      <el-table :data="orders" v-loading="loading">
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="user.phone" label="用户" width="120" />
        <el-table-column label="商品" min-width="200">
          <template #default="{ row }">
            <div v-for="item in row.items" :key="item.id" class="order-item">
              <span>{{ item.productName }}</span>
              <span>x{{ item.quantity }}</span>
              <span>¥{{ item.price }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="总金额" width="100">
          <template #default="{ row }">¥{{ row.totalAmount }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-dropdown @command="(cmd: string) => handleAction(row, cmd)">
              <el-button type="primary" size="small">操作<el-icon class="el-icon--right"><ArrowDown /></el-icon></el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="detail">查看详情</el-dropdown-item>
                  <el-dropdown-item command="ship" v-if="row.status === 'paid'">发货</el-dropdown-item>
                  <el-dropdown-item command="complete" v-if="row.status === 'shipped'">完成</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        class="mt-20"
        @current-change="fetchOrders"
      />
    </el-card>

    <!-- 订单详情 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="600px">
      <el-descriptions :column="2" border v-if="currentOrder">
        <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentOrder.status)">{{ getStatusText(currentOrder.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="用户">{{ currentOrder.user?.phone }}</el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ formatDate(currentOrder.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="收货人">{{ currentOrder.address?.name }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentOrder.address?.phone }}</el-descriptions-item>
        <el-descriptions-item label="收货地址" :span="2">{{ currentOrder.address?.province }}{{ currentOrder.address?.city }}{{ currentOrder.address?.district }}{{ currentOrder.address?.detail }}</el-descriptions-item>
        <el-descriptions-item label="商品" :span="2">
          <div v-for="item in currentOrder.items" :key="item.id" class="order-item-detail">
            {{ item.productName }} x {{ item.quantity }} = ¥{{ Number(item.price) * item.quantity }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="总金额" :span="2"><strong>¥{{ currentOrder.totalAmount }}</strong></el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { orderApi } from '../api'

const orders = ref<any[]>([])
const loading = ref(false)
const statusFilter = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const detailVisible = ref(false)
const currentOrder = ref<any>(null)

onMounted(() => fetchOrders())

const fetchOrders = async () => {
  loading.value = true
  try {
    const res: any = await orderApi.list({ page: page.value, pageSize: pageSize.value, status: statusFilter.value })
    orders.value = res.orders
    total.value = res.total
  } finally {
    loading.value = false
  }
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = { pending: 'warning', paid: 'success', shipped: 'primary', completed: 'success', cancelled: 'info' }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = { pending: '待支付', paid: '已支付', shipped: '已发货', completed: '已完成', cancelled: '已取消' }
  return map[status] || status
}

const formatDate = (date: string) => new Date(date).toLocaleString('zh-CN')

const handleAction = async (row: any, cmd: string) => {
  if (cmd === 'detail') {
    currentOrder.value = row
    detailVisible.value = true
  } else if (cmd === 'ship') {
    await orderApi.updateStatus(row.id, 'shipped')
    ElMessage.success('已发货')
    fetchOrders()
  } else if (cmd === 'complete') {
    await orderApi.updateStatus(row.id, 'completed')
    ElMessage.success('已完成')
    fetchOrders()
  }
}
</script>

<style scoped>
.mt-20 { margin-top: 20px; display: flex; justify-content: flex-end; }
.order-item { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; }
.order-item-detail { padding: 4px 0; }
</style>
