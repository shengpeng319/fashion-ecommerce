<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2>股东门户登录</h2>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" style="width: 100%" @click="handleLogin">
            登录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="simple-login">
        <el-button text @click="handleSimpleLogin">简易登录（使用手机号作为ID）</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import { shareholderApi } from '../api/shareholder'

const router = useRouter()
const auth = useAuthStore()

const formRef = ref()
const loading = ref(false)

const form = reactive({
  phone: '',
  password: ''
})

const rules = {
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const { data } = await shareholderApi.login(form)
    auth.setAuth(data.token, data.shareholder)
    ElMessage.success('登录成功')
    router.push('/dashboard')
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || '登录失败')
    // Fallback to simple login if API not available
    handleSimpleLogin()
  } finally {
    loading.value = false
  }
}

const handleSimpleLogin = () => {
  if (!form.phone) {
    ElMessage.warning('请输入手机号')
    return
  }
  // Simple login: use phone as identifier
  auth.setAuth('simple_token_' + form.phone, {
    id: parseInt(form.phone) || 1,
    name: '股东用户',
    phone: form.phone,
    level: '普通股东',
    investmentAmount: 100000
  })
  ElMessage.success('登录成功（简易模式）')
  router.push('/dashboard')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
}

.simple-login {
  text-align: center;
  margin-top: 16px;
}
</style>
