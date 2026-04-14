<template>
  <div class="shareholder-detail">
    <el-button class="mb-20" @click="router.push('/shareholder/list')">← 返回列表</el-button>
    
    <el-card class="mb-20" v-if="detail.id">
      <template #header>
        <span>基本信息</span>
        <el-tag :type="detail.status === 'active' ? 'success' : 'info'" style="margin-left: 10px">
          {{ detail.status === 'active' ? '正常' : '停用' }}
        </el-tag>
      </template>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="姓名">{{ detail.name }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ detail.phone }}</el-descriptions-item>
        <el-descriptions-item label="级别">{{ getLevelName(detail.level) }}</el-descriptions-item>
        <el-descriptions-item label="投资总额"><span class="amount">¥{{ formatNumber(detail.totalInvestment) }}</span></el-descriptions-item>
        <el-descriptions-item label="累计分红"><span class="text-success">¥{{ formatNumber(detail.totalDividend) }}</span></el-descriptions-item>
        <el-descriptions-item label="待分红"><span class="text-warning">¥{{ formatNumber(detail.pendingDividend) }}</span></el-descriptions-item>
        <el-descriptions-item label="加入时间">{{ formatDate(detail.createdAt) }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="mb-20">
      <template #header><div class="card-header"><span>投资记录</span><el-button type="primary" size="small" @click="showInvestmentDialog">添加投资记录</el-button></div></template>
      <el-table :data="investments" v-loading="loadingInvestments">
        <el-table-column prop="type" label="类型" width="120"><template #default="{ row }"><el-tag :type="typeColor(row.type)">{{ typeName(row.type) }}</el-tag></template></el-table-column>
        <el-table-column prop="amount" label="金额" width="140"><template #default="{ row }">¥{{ formatNumber(row.amount) }}</template></el-table-column>
        <el-table-column prop="remark" label="备注" />
        <el-table-column prop="createdAt" label="时间" width="160"><template #default="{ row }">{{ formatDate(row.createdAt) }}</template></el-table-column>
      </el-table>
    </el-card>

    <el-card class="mb-20">
      <template #header><div class="card-header"><span>分红记录</span><el-button type="primary" size="small" @click="showDividendDialog">发放分红</el-button></div></template>
      <el-table :data="dividends" v-loading="loadingDividends">
        <el-table-column prop="period" label="周期" width="120" />
        <el-table-column prop="amount" label="金额" width="140"><template #default="{ row }">¥{{ formatNumber(row.amount) }}</template></el-table-column>
        <el-table-column prop="status" label="状态" width="100"><template #default="{ row }"><el-tag :type="row.status === 'paid' ? 'success' : 'warning'">{{ row.status === 'paid' ? '已发放' : '待发放' }}</el-tag></template></el-table-column>
        <el-table-column prop="createdAt" label="时间" width="160"><template #default="{ row }">{{ formatDate(row.createdAt) }}</template></el-table-column>
      </el-table>
    </el-card>

    <el-card>
      <template #header><div class="card-header"><span>成本分摊</span><el-button type="primary" size="small" @click="showCostDialog">添加分摊</el-button></div></template>
      <el-table :data="costs" v-loading="loadingCosts">
        <el-table-column prop="period" label="周期" width="120" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="amount" label="金额" width="140"><template #default="{ row }">¥{{ formatNumber(row.amount) }}</template></el-table-column>
        <el-table-column prop="remark" label="备注" />
      </el-table>
    </el-card>

    <el-dialog v-model="investmentVisible" title="添加投资记录" width="400px">
      <el-form :model="investmentForm" label-width="80px">
        <el-form-item label="类型" required><el-select v-model="investmentForm.type" style="width: 100%"><el-option label="初始投资" value="initial" /><el-option label="追加投资" value="additional" /><el-option label="撤回投资" value="withdraw" /></el-select></el-form-item>
        <el-form-item label="金额" required><el-input-number v-model="investmentForm.amount" :min="0" :precision="2" style="width: 100%" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="investmentForm.remark" type="textarea" :rows="2" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="investmentVisible = false">取消</el-button><el-button type="primary" @click="submitInvestment" :loading="submitting">确认</el-button></template>
    </el-dialog>

    <el-dialog v-model="dividendVisible" title="发放分红" width="400px">
      <el-form :model="dividendForm" label-width="80px">
        <el-form-item label="周期" required><el-input v-model="dividendForm.period" placeholder="如：2024Q1" /></el-form-item>
        <el-form-item label="金额" required><el-input-number v-model="dividendForm.amount" :min="0" :precision="2" style="width: 100%" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dividendVisible = false">取消</el-button><el-button type="primary" @click="submitDividend" :loading="submitting">确认发放</el-button></template>
    </el-dialog>

    <el-dialog v-model="costVisible" title="添加成本分摊" width="400px">
      <el-form :model="costForm" label-width="80px">
        <el-form-item label="周期" required><el-input v-model="costForm.period" placeholder="如：2024Q1" /></el-form-item>
        <el-form-item label="类型" required><el-select v-model="costForm.type" style="width: 100%"><el-option label="运营成本" value="operation" /><el-option label="营销成本" value="marketing" /><el-option label="仓储成本" value="storage" /><el-option label="物流成本" value="logistics" /><el-option label="其他成本" value="other" /></el-select></el-form-item>
        <el-form-item label="金额" required><el-input-number v-model="costForm.amount" :min="0" :precision="2" style="width: 100%" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="costForm.remark" type="textarea" :rows="2" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="costVisible = false">取消</el-button><el-button type="primary" @click="submitCost" :loading="submitting">确认</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { shareholderApi } from '../../api'

const router = useRouter()
const route = useRoute()
const id = route.params.id as string

const detail = ref<any>({})
const configs = ref<any[]>([])
const investments = ref<any[]>([])
const dividends = ref<any[]>([])
const costs = ref<any[]>([])
const loadingInvestments = ref(false)
const loadingDividends = ref(false)
const loadingCosts = ref(false)
const investmentVisible = ref(false)
const dividendVisible = ref(false)
const costVisible = ref(false)
const submitting = ref(false)

const investmentForm = ref({ type: 'initial', amount: 0, remark: '' })
const dividendForm = ref({ period: '', amount: 0 })
const costForm = ref({ period: '', type: 'operation', amount: 0, remark: '' })

onMounted(async () => {
  await Promise.all([fetchDetail(), fetchConfig(), fetchInvestments(), fetchDividends(), fetchCosts()])
})

const fetchDetail = async () => { const res: any = await shareholderApi.get(id); detail.value = res }
const fetchConfig = async () => { const res: any = await shareholderApi.getConfig(); configs.value = res }
const fetchInvestments = async () => { loadingInvestments.value = true; try { investments.value = await shareholderApi.getInvestments(id) } finally { loadingInvestments.value = false } }
const fetchDividends = async () => { loadingDividends.value = true; try { dividends.value = await shareholderApi.getDividends(id) } finally { loadingDividends.value = false } }
const fetchCosts = async () => { loadingCosts.value = true; try { costs.value = await shareholderApi.getCosts(id) } finally { loadingCosts.value = false } }

const getLevelName = (level: number) => { const config = configs.value.find(c => c.level === level); return config?.name || '级别' + level }
const typeColor = (type: string) => ({ initial: 'success', additional: 'primary', withdraw: 'danger' }[type] || 'info')
const typeName = (type: string) => ({ initial: '初始投资', additional: '追加投资', withdraw: '撤回投资' }[type] || type)
const formatNumber = (val: string | number) => { if (!val) return '0.00'; return Number(val).toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }
const formatDate = (date: string) => { if (!date) return '-'; return new Date(date).toLocaleString('zh-CN') }

const showInvestmentDialog = () => { investmentForm.value = { type: 'initial', amount: 0, remark: '' }; investmentVisible.value = true }
const showDividendDialog = () => { dividendForm.value = { period: '', amount: 0 }; dividendVisible.value = true }
const showCostDialog = () => { costForm.value = { period: '', type: 'operation', amount: 0, remark: '' }; costVisible.value = true }

const submitInvestment = async () => {
  if (!investmentForm.value.amount) { ElMessage.warning('请输入金额'); return }
  submitting.value = true
  try { await shareholderApi.addInvestment(id, investmentForm.value); ElMessage.success('添加成功'); investmentVisible.value = false; await Promise.all([fetchDetail(), fetchInvestments()]) }
  catch (e: any) { ElMessage.error(e.message || '添加失败') }
  finally { submitting.value = false }
}

const submitDividend = async () => {
  if (!dividendForm.value.period || !dividendForm.value.amount) { ElMessage.warning('请填写完整'); return }
  submitting.value = true
  try { await shareholderApi.addDividend(id, dividendForm.value); ElMessage.success('发放成功'); dividendVisible.value = false; await Promise.all([fetchDetail(), fetchDividends()]) }
  catch (e: any) { ElMessage.error(e.message || '发放失败') }
  finally { submitting.value = false }
}

const submitCost = async () => {
  if (!costForm.value.period || !costForm.value.amount) { ElMessage.warning('请填写完整'); return }
  submitting.value = true
  try { await shareholderApi.addCost(id, costForm.value); ElMessage.success('添加成功'); costVisible.value = false; await fetchCosts() }
  catch (e: any) { ElMessage.error(e.message || '添加失败') }
  finally { submitting.value = false }
}
</script>

<style scoped>
.mb-20 { margin-bottom: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.text-success { color: #67c23a; font-weight: bold; }
.text-warning { color: #e6a23c; font-weight: bold; }
.amount { font-weight: bold; }
</style>
