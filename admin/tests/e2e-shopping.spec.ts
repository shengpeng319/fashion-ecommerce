import { test, expect } from '@playwright/test'

/**
 * 端到端测试：浏览商品 → 订单管理 → 查看详情 → 状态更新 → 查询订单
 */

test.describe('电商下单全流程 E2E 测试', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/login')
    await page.waitForLoadState('networkidle')
    await page.fill('input[placeholder="手机号"]', '13800138001')
    await page.fill('input[placeholder="密码"]', 'admin123')
    await page.click('button:has-text("登录")')
    await page.waitForURL('**/dashboard', { timeout: 5000 })
  })

  test('完整购物流程：浏览→订单→详情→状态流转', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => { 
      if (msg.type() === 'error') errors.push(msg.text()) 
    })

    // ========== Step 1: 浏览商品 ==========
    console.log('Step 1: 浏览商品')
    await page.click('.el-menu-item:has-text("商品管理")')
    await page.waitForURL('**/products', { timeout: 5000 })
    await page.waitForLoadState('networkidle')
    
    await expect(page.locator('.el-table')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('.el-card__header >> text=商品列表')).toBeVisible()
    
    const productRows = page.locator('.el-table__body tr')
    const productCount = await productRows.count()
    console.log(`商品数量: ${productCount}`)
    
    // ========== Step 2: 查看订单列表 ==========
    console.log('Step 2: 查看订单列表')
    await page.click('.el-menu-item:has-text("订单管理")')
    await page.waitForURL('**/orders', { timeout: 5000 })
    await page.waitForLoadState('networkidle')
    
    await expect(page.locator('.el-card__header >> text=订单列表')).toBeVisible()
    await expect(page.locator('.el-table')).toBeVisible()
    
    const statusFilter = page.locator('.el-select')
    await expect(statusFilter).toBeVisible()
    
    const orderRows = page.locator('.el-table__body tr')
    const orderCount = await orderRows.count()
    console.log(`当前订单数量: ${orderCount}`)
    
    // ========== Step 3: 测试查看订单详情 ==========
    console.log('Step 3: 测试查看订单详情')
    
    if (orderCount > 0) {
      // 只点击第一行的操作按钮
      const firstRow = orderRows.first()
      const actionBtn = firstRow.locator('.el-button')
      await actionBtn.click()
      
      // 等待下拉菜单出现（在第一行的范围内）
      await page.waitForTimeout(500)
      
      // 在第一行的下拉菜单中找"查看详情"
      const dropdownMenu = firstRow.locator('.el-dropdown-menu')
      if (await dropdownMenu.isVisible()) {
        const detailItem = dropdownMenu.locator('.el-dropdown-menu__item:has-text("查看详情")').first()
        if (await detailItem.isVisible()) {
          await detailItem.click()
          
          // 验证订单详情弹窗
          await expect(page.locator('.el-dialog:has-text("订单详情")')).toBeVisible({ timeout: 3000 })
          await expect(page.locator('.el-descriptions')).toBeVisible()
          
          // 关闭弹窗
          await page.locator('.el-dialog__headerbtn').click()
          await page.waitForTimeout(300)
          console.log('订单详情查看成功')
        }
      }
    }
    
    // ========== Step 4: 测试订单状态流转（发货/完成）==========
    console.log('Step 4: 测试订单状态流转')
    
    // 找一个"已支付"状态的订单，测试发货
    await statusFilter.click()
    await page.waitForTimeout(200)
    await page.locator('.el-select-dropdown__item:has-text("已支付")').click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    
    const paidRows = page.locator('.el-table__body tr')
    const paidCount = await paidRows.count()
    console.log(`已支付订单数量: ${paidCount}`)
    
    if (paidCount > 0) {
      const paidRow = paidRows.first()
      const actionBtn = paidRow.locator('.el-button')
      await actionBtn.click()
      await page.waitForTimeout(500)
      
      const dropdownMenu = paidRow.locator('.el-dropdown-menu')
      const shipItem = dropdownMenu.locator('.el-dropdown-menu__item:has-text("发货")')
      if (await shipItem.isVisible()) {
        await shipItem.click()
        await page.waitForTimeout(1000)
        console.log('发货操作成功')
      }
    }
    
    // ========== Step 5: 测试 Dashboard ==========
    console.log('Step 5: 验证 Dashboard')
    await page.click('.el-menu-item:has-text("首页")')
    await page.waitForURL('**/dashboard', { timeout: 5000 })
    await page.waitForLoadState('networkidle')
    
    await expect(page.locator('text=商品数量')).toBeVisible()
    await expect(page.locator('text=订单数量')).toBeVisible()
    await expect(page.locator('text=用户数量')).toBeVisible()
    await expect(page.locator('text=销售额')).toBeVisible()
    await expect(page.locator('.el-card:has-text("最近订单")')).toBeVisible()
    
    // ========== 验证无 Console Error ==========
    console.log('Console errors:', errors)
    expect(errors.length).toBe(0)
    
    console.log('✅ 购物流程 E2E 测试完成')
  })

  test('订单状态筛选功能', async ({ page }) => {
    await page.click('.el-menu-item:has-text("订单管理")')
    await page.waitForURL('**/orders', { timeout: 5000 })
    await page.waitForLoadState('networkidle')
    
    const statuses = ['待支付', '已支付', '已发货', '已完成', '已取消']
    
    for (const status of statuses) {
      const select = page.locator('.el-select')
      await select.click()
      await page.waitForTimeout(200)
      
      const option = page.locator(`.el-select-dropdown__item:has-text("${status}")`)
      if (await option.isVisible()) {
        await option.click()
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(300)
        await expect(page.locator('.el-table')).toBeVisible()
        console.log(`筛选 "${status}" 成功`)
      }
    }
  })

  test('订单详情查看功能', async ({ page }) => {
    await page.click('.el-menu-item:has-text("订单管理")')
    await page.waitForURL('**/orders', { timeout: 5000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    const table = page.locator('.el-table')
    await expect(table).toBeVisible()
    
    const rows = page.locator('.el-table__body tr')
    const count = await rows.count()
    console.log(`订单数量: ${count}`)
    
    if (count > 0) {
      // 点击第一行的操作按钮
      const firstRow = rows.first()
      const actionBtn = firstRow.locator('.el-button')
      await actionBtn.click()
      await page.waitForTimeout(500)
      
      // 在该行范围内找下拉菜单
      const dropdownMenu = firstRow.locator('.el-dropdown-menu')
      if (await dropdownMenu.isVisible()) {
        const detailBtn = dropdownMenu.locator('.el-dropdown-menu__item:has-text("查看详情")').first()
        if (await detailBtn.isVisible()) {
          await detailBtn.click()
          await expect(page.locator('.el-dialog__title:has-text("订单详情")')).toBeVisible({ timeout: 3000 })
          await expect(page.locator('.el-descriptions-item:has-text("订单号")')).toBeVisible()
          console.log('订单详情查看成功')
          await page.locator('.el-dialog__close').click()
        }
      }
    } else {
      console.log('当前无订单')
    }
  })

  test('订单发货操作', async ({ page }) => {
    await page.click('.el-menu-item:has-text("订单管理")')
    await page.waitForURL('**/orders', { timeout: 5000 })
    await page.waitForLoadState('networkidle')
    
    // 筛选"已支付"状态
    const select = page.locator('.el-select')
    await select.click()
    await page.waitForTimeout(200)
    await page.locator('.el-select-dropdown__item:has-text("已支付")').click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    
    const rows = page.locator('.el-table__body tr')
    const count = await rows.count()
    
    if (count > 0) {
      // 点击第一行的操作按钮
      const firstRow = rows.first()
      const actionBtn = firstRow.locator('.el-button')
      await actionBtn.click()
      await page.waitForTimeout(500)
      
      // 在该行范围内找"发货"选项
      const dropdownMenu = firstRow.locator('.el-dropdown-menu')
      const shipItem = dropdownMenu.locator('.el-dropdown-menu__item:has-text("发货")')
      
      if (await shipItem.isVisible()) {
        await shipItem.click()
        await page.waitForTimeout(1000)
        
        // 验证成功消息
        await expect(page.locator('.el-message--success')).toBeVisible({ timeout: 3000 })
        console.log('发货操作成功')
      } else {
        console.log('没有可发货的订单')
      }
    } else {
      console.log('没有已支付订单')
    }
  })
})
