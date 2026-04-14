<template>
  <div class="shareholder-config">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Shareholder Level Config</span>
          <el-button type="primary" @click="save" :loading="saving">Save</el-button>
        </div>
      </template>
      <el-table :data="configs" border>
        <el-table-column prop="level" label="Level" width="100" />
        <el-table-column prop="name" label="Name" width="200">
          <template #default="{row}"><el-input v-model="row.name" size="small" /></template>
        </el-table-column>
        <el-table-column prop="threshold" label="Threshold" width="200">
          <template #default="{row}"><el-input-number v-model="row.threshold" :min="0" :precision="2" size="small" /></template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import {ref,onMounted} from "vue"
import {ElMessage} from "element-plus"
import {shareholderApi} from "../../api"
const configs=ref<any[]>([])
const saving=ref(false)
onMounted(async()=>{const res:any=await shareholderApi.getConfig();configs.value=res})
const save=async()=>{saving.value=true;try{await shareholderApi.updateConfig(configs.value);ElMessage.success("Saved")}catch(e:any){ElMessage.error(e.message||"Failed")}finally{saving.value=false}}
</script>
<style scoped>.card-header{display:flex;justify-content:space-between;align-items:center}</style>
