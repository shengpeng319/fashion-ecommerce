<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2>{{ isRegister ? '注册账号' : '股东门户登录' }}</h2>
      </template>

      <!-- 登录表单 -->
      <el-form v-if="!isRegister" ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="80px">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="loginForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" style="width: 100%" @click="handleLogin">
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 注册表单 -->
      <el-form v-else ref="registerFormRef" :model="registerForm" :rules="registerRules" label-width="80px">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="registerForm.phone" placeholder="手机号（作为账号）" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="密码（至少6位）" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="再次输入密码" @keyup.enter="handleRegister" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" style="width: 100%" @click="handleRegister">
            注册
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 切换链接 -->
      <div class="switch-mode">
        <el-button link type="primary" @click="toggleMode">
          {{ isRegister ? '已有账号？去登录' : '没有账号？去注册' }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import { shareholderApi } from '../api/shareholder'

const router = useRouter()
const auth = useAuthStore()
const loading = ref(false)
const isRegister = ref(false)

// 登录相关
const loginFormRef = ref<FormInstance>()
const loginForm = reactive({ phone: '', password: '' })
const loginRules: FormRules = {
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

// 注册相关
const registerFormRef = ref<FormInstance>()
const registerForm = reactive({ phone: '', password: '', confirmPassword: '' })

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}
const validatePasswordLength = (_rule: any, value: string, callback: any) => {
  if (value && value.length < 6) {
    callback(new Error('密码至少6位'))
  } else {
    callback()
  }
}
const registerRules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { validator: validatePasswordLength, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  const valid = await loginFormRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const res: any = await shareholderApi.login(loginForm)
    if (res.data?.shareholder) {
      auth.setAuth(res.data.token, res.data.shareholder)
      ElMessage.success('登录成功')
      router.push('/dashboard')
    }
  } catch (err: any) {
    ElMessage.error(err.message || '登录失败')
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  const valid = await registerFormRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const res: any = await shareholderApi.register({
      phone: registerForm.phone,
      password: registerForm.password
    })
    if (res.success) {
      ElMessage.success('注册成功，请登录')
      // 注册成功后自动切换到登录
      isRegister.value = false
      loginForm.phone = registerForm.phone
      loginForm.password = ''
      registerFormRef.value?.resetFields()
    }
  } catch (err: any) {
    ElMessage.error(err.message || '注册失败')
  } finally {
    loading.value = false
  }
}

const toggleMode = () => {
  isRegister.value = !isRegister.value
  if (isRegister.value) {
    loginFormRef.value?.resetFields()
  } else {
    registerFormRef.value?.resetFields()
  }
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
  width: 420px;
}

.switch-mode {
  text-align: center;
  margin-top: 12px;
}
</style>
