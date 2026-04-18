<template>
  <div class="shareholder-config">
    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <div class="card-header__left">
            <span class="card-header__title">股东级别配置</span>
            <el-tooltip content="设置不同级别股东的最低投资门槛" placement="top">
              <el-icon class="card-header__help"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
          <el-button type="primary" @click="save" :loading="saving">
            <el-icon><Check /></el-icon> 保存配置
          </el-button>
        </div>
      </template>
      
      <el-table :data="configs" border stripe class="config-table">
        <el-table-column prop="level" label="级别" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getLevelTagType(row.level)" size="large" effect="plain">
              {{ row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="级别名称" width="200">
          <template #default="{ row }">
            <el-input v-model="row.name" size="default" placeholder="请输入级别名称" />
          </template>
        </el-table-column>
        <el-table-column prop="threshold" label="最低门槛（万元）" min-width="200">
          <template #default="{ row }">
            <el-input-number 
              v-model="row.threshold" 
              :min="0" 
              :precision="0" 
              :step="10"
              size="default"
              style="width: 100%"
            />
          </template>
        </el-table-column>
        <el-table-column label="说明">
          <template #default="{ row }">
            <span class="config-hint">投资 ≥ {{ row.threshold }} 万即可成为{{ row.name }}</span>
          </template>
        </el-table-column>
      </el-table>

      <el-alert
        title="级别说明"
        type="info"
        :closable="false"
        class="mt-20"
      >
        <template #default>
          <ul class="level-list">
            <li><strong>普通股东</strong>：基础级别，享受正常分红</li>
            <li><strong>战略股东</strong>：投资额度更高，获取更多资源支持</li>
            <li><strong>创始人股东</strong>：最高级别，全方位深度合作</li>
          </ul>
        </template>
      </el-alert>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { shareholderApi } from '../../api'

const configs = ref<any[]>([])
const saving = ref(false)

onMounted(async () => {
  const res: any = await shareholderApi.getConfig()
  configs.value = res
})

const getLevelTagType = (level: number) => {
  const map: Record<number, string> = { 1: '', 2: 'warning', 3: 'danger' }
  return map[level] || 'info'
}

const save = async () => {
  saving.value = true
  try {
    await shareholderApi.updateConfig(configs.value)
    ElMessage.success('配置保存成功')
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.config-card { border-radius: 12px; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header__left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-header__title {
  font-size: 16px;
  font-weight: 600;
}

.card-header__help {
  color: #595959;
  cursor: help;
}

.config-table :deep(.el-input) {
  --el-input-border-radius: 6px;
}

.config-hint {
  color: #595959;
  font-size: 13px;
}

.level-list {
  margin: 0;
  padding-left: 20px;
  line-height: 2;
}

.mt-20 { margin-top: 20px; }
</style>
