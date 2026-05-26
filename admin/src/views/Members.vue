<template>
  <div class="members-page">
    <el-card class="search-card">
      <el-row :gutter="12">
        <el-col :span="8">
          <el-input v-model="search" placeholder="搜索手机号/昵称" clearable @keyup.enter="loadMembers" />
        </el-col>
        <el-col :span="6">
          <el-select v-model="filterLevel" placeholder="会员等级" clearable @change="loadMembers">
            <el-option v-for="lv in levels" :key="lv.key" :label="lv.name" :value="lv.key" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="loadMembers">搜索</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="table-card">
      <el-table :data="members" style="width:100%" v-loading="loading">
        <el-table-column prop="user.phone" label="手机号" width="140" />
        <el-table-column prop="user.nickname" label="昵称" width="120" />
        <el-table-column prop="level" label="等级" width="120">
          <template #default="{ row }">
            <el-tag>{{ getLevelName(row.level) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="points" label="积分" width="100" sortable />
        <el-table-column prop="totalSpent" label="累计消费" width="120" sortable>
          <template #default="{ row }">¥{{ row.totalSpent }}</template>
        </el-table-column>
        <el-table-column prop="depositAmount" label="预存/权益金" width="130">
          <template #default="{ row }">¥{{ row.depositAmount }}</template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="showDetail(row)">详情</el-button>
            <el-button link type="primary" size="small" @click="showAdjust(row)">调整</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination v-model:current-page="page" :page-size="limit" :total="total"
          layout="total, prev, pager, next" @current-change="loadMembers" />
      </div>
    </el-card>

    <!-- Detail Dialog -->
    <el-dialog v-model="detailVisible" title="会员详情" width="600px">
      <div v-if="detailMember" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="手机号">{{ detailMember.user?.phone }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ detailMember.user?.nickname }}</el-descriptions-item>
          <el-descriptions-item label="等级">{{ getLevelName(detailMember.level) }}</el-descriptions-item>
          <el-descriptions-item label="积分">{{ detailMember.points }}</el-descriptions-item>
          <el-descriptions-item label="累计消费">¥{{ detailMember.totalSpent }}</el-descriptions-item>
          <el-descriptions-item label="预存金额">¥{{ detailMember.depositAmount }}</el-descriptions-item>
        </el-descriptions>
        <h4 style="margin-top:20px">积分流水</h4>
        <el-table :data="detailMember.transactions || []" size="small">
          <el-table-column prop="type" label="类型" width="80">
            <template #default="{ row }">
              <el-tag :type="row.amount > 0 ? 'success' : 'danger'" size="small">
                {{ row.amount > 0 ? '收入' : '支出' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="数量" width="80" :formatter="(r:any) => (r.amount > 0 ? '+' : '') + r.amount" />
          <el-table-column prop="balance" label="余额" width="80" />
          <el-table-column prop="description" label="描述" />
        </el-table>
      </div>
    </el-dialog>

    <!-- Adjust Dialog -->
    <el-dialog v-model="adjustVisible" title="调整积分" width="450px">
      <el-form v-if="adjustMember" label-width="100px">
        <el-form-item label="当前积分">
          <span>{{ adjustMember.points }}</span>
        </el-form-item>
        <el-form-item label="调整数量">
          <el-input-number v-model="adjustDelta" :min="-100000" :max="100000" />
        </el-form-item>
        <el-form-item label="调整理由">
          <el-input v-model="adjustReason" placeholder="请输入调整理由" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitAdjust" :loading="adjusting">确认调整</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../api/request'

const members = ref<any[]>([])
const levels = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const filterLevel = ref('')
const page = ref(1)
const limit = ref(20)
const total = ref(0)

const detailVisible = ref(false)
const detailMember = ref<any>(null)
const adjustVisible = ref(false)
const adjustMember = ref<any>(null)
const adjustDelta = ref(0)
const adjustReason = ref('')
const adjusting = ref(false)

const getLevelName = (key: string) => {
  const lv = levels.value.find((l: any) => l.key === key)
  return lv ? lv.name : key
}

const loadLevels = async () => {
  try { levels.value = await request.get('/membership-levels') } catch (e) {}
}

const loadMembers = async () => {
  loading.value = true
  try {
    const params: any = { page: page.value, limit: limit.value }
    if (filterLevel.value) params.level = filterLevel.value
    if (search.value) params.search = search.value
    const res: any = await request.get('/members', { params })
    members.value = res.members || []
    total.value = res.total || 0
  } catch (e) {}
  loading.value = false
}

const showDetail = async (row: any) => {
  try {
    detailMember.value = await request.get(`/members/${row.id}`)
    detailVisible.value = true
  } catch (e) {}
}

const showAdjust = (row: any) => {
  adjustMember.value = row
  adjustDelta.value = 0
  adjustReason.value = ''
  adjustVisible.value = true
}

const submitAdjust = async () => {
  adjusting.value = true
  try {
    await request.put(`/members/${adjustMember.value.id}`, {
      pointsDelta: adjustDelta.value,
      pointsReason: adjustReason.value
    })
    ElMessage.success('调整成功')
    adjustVisible.value = false
    loadMembers()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.error || '调整失败')
  }
  adjusting.value = false
}

onMounted(() => {
  loadLevels()
  loadMembers()
})
</script>

<style scoped>
.members-page { padding: 0; }
.search-card { margin-bottom: 16px; }
.table-card { margin-bottom: 16px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
.detail-content h4 { font-size: 15px; font-weight: 600; color: var(--fashion-text); margin-bottom: 12px; }
</style>
