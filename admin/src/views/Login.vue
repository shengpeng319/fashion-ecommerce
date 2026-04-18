<template>
  <div class="login-container">
    <div class="login-box">
      <h2>{{ isRegister ? '注册账号' : '时尚女装管理后台' }}</h2>
      
      <!-- 登录表单 -->
      <el-form v-if="!isRegister" ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="0">
        <el-form-item prop="phone">
          <el-input
            v-model="loginForm.phone"
            placeholder="手机号"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            :prefix-icon="Lock"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" class="login-btn" @click="handleLogin">登录</el-button>
        </el-form-item>
      </el-form>

      <!-- 注册表单 -->
      <el-form v-else ref="registerFormRef" :model="registerForm" :rules="registerRules" label-width="0">
        <el-form-item prop="phone">
          <el-input
            v-model="registerForm.phone"
            placeholder="手机号（作为账号）"
            :prefix-icon="Cellphone"
          />
        </el-form-item>
        <el-form-item prop="nickname">
          <el-input
            v-model="registerForm.nickname"
            placeholder="昵称（可选）"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="密码（至少6位）"
            :prefix-icon="Lock"
          />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="确认密码"
            :prefix-icon="Lock"
            @keyup.enter="handleRegister"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" class="login-btn" @click="handleRegister">注册</el-button>
        </el-form-item>
      </el-form>

      <!-- 切换链接 -->
      <div class="switch-mode">
        <el-button link type="primary" @click="toggleMode">
          {{ isRegister ? '已有账号？去登录' : '没有账号？去注册' }}
        </el-button>
      </div>

      <div v-if="!isRegister" class="tips">测试账号: 13800138001 / admin123</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock, Cellphone } from '@element-plus/icons-vue'
import { authApi } from '../api/auth'

const router = useRouter()
const loading = ref(false)
const isRegister = ref(false)

// 登录相关
const loginFormRef = ref<FormInstance>()
const loginForm = reactive({
  phone: '13800138001',
  password: 'admin123'
})
const loginRules: FormRules = {
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

// 注册相关
const registerFormRef = ref<FormInstance>()
const registerForm = reactive({
  phone: '',
  nickname: '',
  password: '',
  confirmPassword: ''
})

// 密码一致性校验
const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 密码强度校验（至少6位）
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
  nickname: [],
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
  await loginFormRef.value?.validate()
  loading.value = true
  try {
    const res: any = await authApi.login(loginForm)
    if (res.success) {
      localStorage.setItem('admin_token', res.token)
      localStorage.setItem('admin_user', JSON.stringify(res.admin))
      ElMessage.success('登录成功')
      router.push('/')
    }
  } catch {
    // error handled by interceptor
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  await registerFormRef.value?.validate()
  loading.value = true
  try {
    const res: any = await authApi.register({
      phone: registerForm.phone,
      password: registerForm.password,
      nickname: registerForm.nickname || undefined
    })
    if (res.success) {
      localStorage.setItem('admin_token', res.token)
      localStorage.setItem('admin_user', JSON.stringify(res.admin))
      ElMessage.success('注册成功，已自动登录')
      router.push('/')
    }
  } catch {
    // error handled by interceptor
  } finally {
    loading.value = false
  }
}

const toggleMode = () => {
  isRegister.value = !isRegister.value
  // resetForms
  if (isRegister.value) {
    loginFormRef.value?.resetFields()
  } else {
    registerFormRef.value?.resetFields()
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff5777, #ff8a9a);
}
.login-box {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}
.login-box h2 {
  text-align: center;
  color: #ff5777;
  margin-bottom: 30px;
}
.login-btn {
  width: 100%;
}
.tips {
  text-align: center;
  color: #666;
  font-size: 12px;
  margin-top: 10px;
}
.switch-mode {
  text-align: center;
  margin-top: 12px;
}

/* Focus visible 样式 */
:deep(.el-input__wrapper:focus-within) {
  box-shadow: 0 0 0 2px rgba(255, 87, 119, 0.2);
}
:deep(.el-button--primary:focus) {
  background: #ff6b88;
  border-color: #ff6b88;
}
</style>
