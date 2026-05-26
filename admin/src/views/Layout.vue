<template>
  <el-container class="layout-container">
    <!-- Sidebar -->
    <el-aside width="220px" class="aside">
      <div class="logo" @click="router.push('/dashboard')">
        <text class="logo-icon">◆</text>
        <text class="logo-text">FASHION</text>
        <text class="logo-sub">ADMIN</text>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/products">
          <el-icon><Goods /></el-icon>
          <span>商品管理</span>
        </el-menu-item>
        <el-menu-item index="/categories">
          <el-icon><FolderOpened /></el-icon>
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/orders">
          <el-icon><Document /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/members">
          <el-icon><Star /></el-icon>
          <span>会员管理</span>
        </el-menu-item>
        <el-menu-item index="/shareholder/list">
          <el-icon><Coin /></el-icon>
          <span>股东管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- Right Content -->
    <el-container>
      <!-- Header -->
      <el-header class="header">
        <div class="header-left">
          <el-breadcrumb separator="·">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">仪表盘</el-breadcrumb-item>
            <el-breadcrumb-item v-if="pageTitle && pageTitle !== '首页'">{{ pageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
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
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- Main -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const activeMenu = computed(() => route.path)
const pageTitle = computed(() => route.meta.title as string)

const adminUser = ref<any>(null)
try {
  const stored = localStorage.getItem('admin_user')
  if (stored) adminUser.value = JSON.parse(stored)
} catch (e) {}

const handleCommand = async (cmd: string) => {
  if (cmd === 'logout') {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    router.push('/login')
  } else if (cmd === 'password') {
    // Placeholder for password change
    ElMessage.info('修改密码功能开发中')
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

/* Sidebar */
.aside {
  background: var(--fashion-dark);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--fashion-dark);
  border-bottom: 1px solid rgba(201, 169, 110, 0.1);
  cursor: pointer;
}
.logo-icon {
  font-size: 12px;
  color: var(--fashion-gold);
  margin-bottom: 2px;
}
.logo-text {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 20px;
  font-weight: 700;
  color: var(--fashion-gold);
  letter-spacing: 4px;
  line-height: 1;
}
.logo-sub {
  font-size: 9px;
  color: var(--fashion-text-muted);
  letter-spacing: 6px;
  text-transform: uppercase;
  margin-top: 2px;
}

.sidebar-menu {
  border: none !important;
}

.sidebar-menu :deep(.el-menu-item) {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  height: 48px;
  margin: 2px 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.sidebar-menu :deep(.el-menu-item .el-icon) {
  font-size: 18px;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: rgba(201, 169, 110, 0.12);
  color: var(--fashion-gold);
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background: rgba(255,255,255,0.04);
  color: var(--fashion-text-inverse);
}

/* Header */
.header {
  height: 56px !important;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #E0D8CF;
  padding: 0 24px;
}

.header-left {
  display: flex;
  align-items: center;
}

.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--fashion-text-secondary);
  font-size: 14px;
  font-weight: 500;
}

/* Main */
.main-content {
  background: var(--fashion-bg);
  padding: 24px;
}
</style>
