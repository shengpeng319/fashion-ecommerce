import { test, expect } from '@playwright/test'

test.describe('管理后台全面测试', () => {
  
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/#/login')
    await page.waitForLoadState('networkidle')
  })

  test('登录页 - 验证UI元素', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    const errors: string[] = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    
    // 验证品牌标题
    await expect(page.locator('.brand-name')).toContainText('FASHION')
    await expect(page.locator('.brand-sub')).toContainText('ADMINISTRATION')
    
    // 验证表单元素
    await expect(page.locator('input[placeholder="请输入手机号"]')).toBeVisible()
    await expect(page.locator('input[placeholder="请输入密码"]')).toBeVisible()
    await expect(page.locator('button:has-text("登录")')).toBeVisible()
    
    // 验证测试提示
    await expect(page.locator('.tips')).toContainText('13800138001')
    
    console.log('Console errors:', errors)
    expect(errors.length).toBe(0)
  })

  test('登录功能 - 成功登录', async ({ page }) => {
    await page.fill('input[placeholder="请输入手机号"]', '13800138001')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button:has-text("登录")')
    
    // 等待跳转
    await page.waitForURL('**/dashboard', { timeout: 5000 })
    await expect(page).toHaveURL(/dashboard/)
  })
})

test.describe('Dashboard 首页测试', () => {
  test.beforeEach(async ({ page }) => {
    // 先登录
    await page.goto('/#/login')
    await page.waitForLoadState('networkidle')
    await page.fill('input[placeholder="请输入手机号"]', '13800138001')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button:has-text("登录")')
    await page.waitForURL('**/dashboard', { timeout: 5000 })
  })

  test('Dashboard - 验证统计卡片', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    const errors: string[] = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    
    // 验证统计卡片存在（中文标签）
    await expect(page.locator('text=商品数量')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=订单数量')).toBeVisible()
    await expect(page.locator('text=用户数量')).toBeVisible()
    await expect(page.locator('text=销售额')).toBeVisible()
    
    // 验证最近订单标题是中文
    await expect(page.locator('text=最近订单')).toBeVisible()
    
    console.log('Console errors:', errors)
    expect(errors.length).toBe(0)
  })
})

test.describe('Layout 布局测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/login')
    await page.waitForLoadState('networkidle')
    await page.fill('input[placeholder="请输入手机号"]', '13800138001')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button:has-text("登录")')
    await page.waitForURL('**/dashboard', { timeout: 5000 })
  })

  test('Layout - 侧边栏菜单和图标', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // 验证侧边栏文字
    await expect(page.locator('.logo-text')).toContainText('FASHION')
    await expect(page.locator('.el-menu-item:has-text("仪表盘")')).toBeVisible()
    await expect(page.locator('.el-menu-item:has-text("商品管理")')).toBeVisible()
    await expect(page.locator('.el-menu-item:has-text("订单管理")')).toBeVisible()
    await expect(page.locator('.el-menu-item:has-text("股东管理")')).toBeVisible()
    
    // 验证面包屑
    await expect(page.locator('.el-breadcrumb')).toBeVisible()
  })

  test('Layout - 导航到各页面', async ({ page }) => {
    // 导航到商品管理
    await page.click('.el-menu-item:has-text("商品管理")')
    await page.waitForURL('**/products', { timeout: 5000 })
    await expect(page.locator('.el-card__header >> text=商品列表')).toBeVisible()
    
    // 导航到订单管理
    await page.click('.el-menu-item:has-text("订单管理")')
    await page.waitForURL('**/orders', { timeout: 5000 })
    await expect(page.locator('.el-card__header >> text=订单列表')).toBeVisible()
    
    // 导航到股东管理
    await page.click('.el-menu-item:has-text("股东管理")')
    await page.waitForURL('**/shareholder/list', { timeout: 5000 })
    await expect(page.locator('.el-breadcrumb')).toBeVisible()
  })
})

test.describe('Products 商品管理测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/login')
    await page.waitForLoadState('networkidle')
    await page.fill('input[placeholder="请输入手机号"]', '13800138001')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button:has-text("登录")')
    await page.waitForURL('**/dashboard', { timeout: 5000 })
    await page.click('.el-menu-item:has-text("商品管理")')
    await page.waitForURL('**/products', { timeout: 5000 })
  })

  test('Products - 验证页面元素', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    const errors: string[] = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    
    // 验证标题和按钮
    await expect(page.locator('.el-card__header >> text=商品列表')).toBeVisible()
    await expect(page.locator('button:has-text("添加商品")')).toBeVisible()
    
    // 验证表格列
    await expect(page.locator('.el-table__header th:has-text("图片")')).toBeVisible()
    await expect(page.locator('.el-table__header th:has-text("名称")')).toBeVisible()
    await expect(page.locator('.el-table__header th:has-text("分类")')).toBeVisible()
    await expect(page.locator('.el-table__header th:has-text("价格")')).toBeVisible()
    await expect(page.locator('.el-table__header th:has-text("状态")')).toBeVisible()
    
    // 验证分页
    await expect(page.locator('.el-pagination')).toBeVisible()
    
    console.log('Console errors:', errors)
    expect(errors.length).toBe(0)
  })
})

test.describe('Orders 订单管理测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/login')
    await page.waitForLoadState('networkidle')
    await page.fill('input[placeholder="请输入手机号"]', '13800138001')
    await page.fill('input[placeholder="请输入密码"]', 'admin123')
    await page.click('button:has-text("登录")')
    await page.waitForURL('**/dashboard', { timeout: 5000 })
    await page.click('.el-menu-item:has-text("订单管理")')
    await page.waitForURL('**/orders', { timeout: 5000 })
  })

  test('Orders - 验证页面元素', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    const errors: string[] = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    
    // 验证标题
    await expect(page.locator('.el-card__header >> text=订单列表')).toBeVisible()
    
    // 验证筛选器
    await expect(page.locator('.el-select')).toBeVisible()
    
    // 验证表格
    await expect(page.locator('.el-table__header th:has-text("订单号")')).toBeVisible()
    await expect(page.locator('.el-table__header th:has-text("用户")')).toBeVisible()
    await expect(page.locator('.el-table__header th:has-text("状态")')).toBeVisible()
    
    console.log('Console errors:', errors)
    expect(errors.length).toBe(0)
  })
})
