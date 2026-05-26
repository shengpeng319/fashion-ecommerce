<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-brand">
        <text class="brand-icon">◆</text>
        <text class="brand-name">FASHION</text>
        <view class="brand-line"></view>
        <text class="brand-sub">ADMINISTRATION</text>
      </div>

      <el-form v-if="!isRegister" ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">
        <div class="form-label">手机号</div>
        <el-form-item prop="phone">
          <el-input v-model="loginForm.phone" placeholder="请输入手机号" :prefix-icon="User" size="large" />
        </el-form-item>
        <div class="form-label">密码</div>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" :prefix-icon="Lock" size="large" @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" size="large" class="login-btn" @click="handleLogin">登录</el-button>
        </el-form-item>
      </el-form>

      <el-form v-else ref="registerFormRef" :model="registerForm" :rules="registerRules" class="login-form">
        <div class="form-label">手机号</div>
        <el-form-item prop="phone">
          <el-input v-model="registerForm.phone" placeholder="请输入手机号" :prefix-icon="Cellphone" size="large" />
        </el-form-item>
        <div class="form-label">昵称（选填）</div>
        <el-form-item prop="nickname">
          <el-input v-model="registerForm.nickname" placeholder="请输入昵称" :prefix-icon="User" size="large" />
        </el-form-item>
        <div class="form-label">密码</div>
        <el-form-item prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="至少6位字符" :prefix-icon="Lock" size="large" />
        </el-form-item>
        <div class="form-label">确认密码</div>
        <el-form-item prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" :prefix-icon="Lock" size="large" @keyup.enter="handleRegister" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" size="large" class="login-btn" @click="handleRegister">创建账号</el-button>
        </el-form-item>
      </el-form>

      <div class="switch-mode">
        <el-button link type="primary" @click="toggleMode">
          {{ isRegister ? '已有账号？去登录' : '创建新账号' }}
        </el-button>
      </div>

      <div v-if="!isRegister" class="tips">测试账号: 13800138001 / admin123</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Cellphone } from '@element-plus/icons-vue'
import { authApi } from '../api/auth'

const router = useRouter()
const isRegister = ref(false)
const loading = ref(false)

const loginForm = ref({ phone: '', password: '' })
const registerForm = ref({ phone: '', nickname: '', password: '', confirmPassword: '' })

const loginRules = {
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const validateConfirm = (_rule: any, value: string, cb: any) => {
  if (value !== registerForm.value.password) cb(new Error('两次密码不一致'))
  else cb()
}

const registerRules = {
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  password: [{ required: true, min: 6, message: '密码至少6位字符', trigger: 'blur' }],
  confirmPassword: [{ required: true, validator: validateConfirm, trigger: 'blur' }]
}

const toggleMode = () => { isRegister.value = !isRegister.value }

const handleLogin = async () => {
  loading.value = true
  try {
    const res: any = await authApi.login(loginForm.value)
    if (res.success) {
      localStorage.setItem('admin_token', res.token)
      localStorage.setItem('admin_user', JSON.stringify(res.admin))
      router.push('/dashboard')
    } else {
      ElMessage.error(res.error || '登录失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.error || '登录失败')
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  loading.value = true
  try {
    const res: any = await authApi.register({
      phone: registerForm.value.phone,
      password: registerForm.value.password,
      nickname: registerForm.value.nickname || undefined
    })
    if (res.success) {
      ElMessage.success('注册成功！')
      localStorage.setItem('admin_token', res.token)
      localStorage.setItem('admin_user', JSON.stringify(res.admin))
      router.push('/dashboard')
    } else {
      ElMessage.error(res.error || '注册失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.error || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--fashion-dark);
}

.login-card {
  width: 420px;
  padding: 48px 40px;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.3);
}

.login-brand {
  text-align: center;
  margin-bottom: 40px;
}

.brand-icon {
  font-size: 14px;
  color: var(--fashion-gold);
  letter-spacing: 8px;
}

.brand-name {
  display: block;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 36px;
  font-weight: 700;
  color: var(--fashion-primary);
  letter-spacing: 8px;
  margin: 8px 0;
}

.brand-line {
  width: 40px;
  height: 2px;
  background: var(--fashion-gold);
  margin: 16px auto;
}

.brand-sub {
  display: block;
  font-size: 11px;
  color: var(--fashion-text-muted);
  letter-spacing: 6px;
  text-transform: uppercase;
}

.login-form {
  margin-top: 8px;
}

.form-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--fashion-text-secondary);
  letter-spacing: 2px;
  margin-bottom: 6px;
  margin-top: 16px;
}

.login-btn {
  width: 100%;
  letter-spacing: 3px;
  font-weight: 600 !important;
  height: 44px;
  margin-top: 8px;
}

.switch-mode {
  text-align: center;
  margin-top: 16px;
}

.tips {
  text-align: center;
  color: var(--fashion-text-muted);
  font-size: 12px;
  margin-top: 20px;
}
</style>
