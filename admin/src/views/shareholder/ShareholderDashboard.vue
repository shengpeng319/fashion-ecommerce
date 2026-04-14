
<template>
  <div class="shareholder-dashboard">
    <el-row :gutter="20" class="mb-20">
      <el-col :span="6"><div class="stat-card"><div class="stat-icon" style="background:#409eff"><el-icon><Coin /></el-icon></div><div class="stat-info"><div class="stat-value">{{ formatNumber(stats.totalInvestment) }}</div><div class="stat-label">Total Investment</div></div></div></el-col>
      <el-col :span="6"><div class="stat-card"><div class="stat-icon" style="background:#67c23a"><el-icon><Money /></el-icon></div><div class="stat-info"><div class="stat-value">{{ formatNumber(stats.totalDividend) }}</div><div class="stat-label">Total Dividend</div></div></div></el-col>
      <el-col :span="6"><div class="stat-card"><div class="stat-icon" style="background:#e6a23c"><el-icon><Clock /></el-icon></div><div class="stat-info"><div class="stat-value">{{ formatNumber(stats.pendingDividend) }}</div><div class="stat-label">Pending Dividend</div></div></div></el-col>
      <el-col :span="6"><div class="stat-card"><div class="stat-icon" style="background:#f56c6c"><el-icon><PieChart /></el-icon></div><div class="stat-info"><div class="stat-value">{{ stats.investorCount }}</div><div class="stat-label">Investor Count</div></div></div></el-col>
    </el-row>
    <el-card><template #header><span>Recent Investments</span></template><el-table :data="recentInvestments"><el-table-column prop="shareholderName" label="Name" width="120" /><el-table-column prop="type" label="Type" width="120"><template #default="{row}"><el-tag :type="getTypeColor(row.type)">{{ row.type }}</el-tag></template></el-table-column><el-table-column prop="amount" label="Amount" width="120"><template #default="{row}">{{ formatNumber(row.amount) }}</template></el-table-column><el-table-column prop="createdAt" label="Date"><template #default="{row}">{{ formatDate(row.createdAt) }}</template></el-table-column></el-table></el-card>
  </div></template>
<script setup lang="ts">
import {ref,onMounted} from "vue"
import {shareholderApi} from "../../api"
const stats=ref({totalInvestment:0,totalDividend:0,pendingDividend:0,investorCount:0})
const recentInvestments=ref<any[]>([])
onMounted(async()=>{try{const res:any=await shareholderApi.getDashboard();stats.value=res.stats||res;recentInvestments.value=res.recentInvestments||[]}catch(e){console.error(e)}})
const formatNumber=(val:number)=>val?val.toLocaleString("zh-CN",{minimumFractionDigits:2}):"0.00"
const formatDate=(date:string)=>new Date(date).toLocaleString("zh-CN")
const getTypeColor=(type:string)=>{const map:Record<string,string>={initial:"success",additional:"primary",withdraw:"danger"};return map[type]||"info"}
</script>
<style scoped>.mb-20{margin-bottom:20px}.stat-card{background:#fff;border-radius:8px;padding:20px;display:flex;align-items:center;gap:20px;box-shadow:0 2px 12px rgba(0,0,0,0.05)}.stat-icon{width:60px;height:60px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px}.stat-value{font-size:24px;font-weight:bold;color:#333}.stat-label{color:#999;font-size:14px;margin-top:4px}</style>
