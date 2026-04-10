<template>
  <el-container class="layout-container">
    <el-aside width="200px">
      <div class="logo">时尚女装</div>
      <el-menu :default-active="activeMenu" router background-color="#304156" text-color="#bfcbd9" active-text-color="#ff5777">
        <el-menu-item index="/dashboard">
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/products">
          <span>商品管理</span>
        </el-menu-item>
        <el-menu-item index="/categories">
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/orders">
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/users">
          <span>用户管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>
        <div class="header-left">
          <span class="page-title">{{ pageTitle }}</span>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              {{ adminUser?.nickname || '管理员' }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="password">修改密码</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { authApi } from '../api/auth'

const router = useRouter()
const route = useRoute()
const adminUser = ref<any>(null)

const activeMenu = computed(() => route.path)
const pageTitle = computed(() => (route.meta.title as string) || '')

onMounted(() => {
  const userStr = localStorage.getItem('admin_user')
  if (userStr) {
    adminUser.value = JSON.parse(userStr)
  }
})

const handleCommand = async (command: string) => {
  if (command === 'logout') {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    router.push('/login')
  } else if (command === 'password') {
    ElMessageBox.prompt('请输入新密码', '修改密码', {
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    }).then(async ({ value }) => {
      if (!value) return
      try {
        await authApi.changePassword({ oldPassword: 'admin123', newPassword: value })
        ElMessage.success('密码修改成功')
      } catch (e) {
        // error handled by interceptor
      }
    }).catch(() => {})
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}
.el-aside {
  background: #304156;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  background: #263445;
}
.el-menu {
  border: none;
}
.el-header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}
.page-title {
  font-size: 16px;
  font-weight: 500;
}
.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}
.el-main {
  background: #f5f7fa;
}
</style>
