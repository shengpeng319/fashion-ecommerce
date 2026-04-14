import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// 统一响应格式
const ok = (data: any) => ({ success: true, data });
const err = (error: string) => ({ success: false, error });

// 获取股东级别配置
router.get('/config', async (req: Request, res: Response) => {
  try {
    const configs = await prisma.shareholderLevelConfig.findMany({
      orderBy: { level: 'asc' }
    });
    res.json(ok(configs));
  } catch (e: any) {
    res.status(500).json(err(e.message));
  }
});

// 更新股东级别配置（管理员）
router.put('/config', async (req: Request, res: Response) => {
  try {
    const { configs } = req.body;
    if (!Array.isArray(configs)) {
      res.status(400).json(err('configs must be an array'));
      return;
    }

    for (const config of configs) {
      await prisma.shareholderLevelConfig.upsert({
        where: { level: config.level },
        update: {
          name: config.name,
          minAmount: new Prisma.Decimal(config.minAmount)
        },
        create: {
          level: config.level,
          name: config.name,
          minAmount: new Prisma.Decimal(config.minAmount)
        }
      });
    }

    const updated = await prisma.shareholderLevelConfig.findMany({
      orderBy: { level: 'asc' }
    });
    res.json(ok(updated));
  } catch (e: any) {
    res.status(500).json(err(e.message));
  }
});

// 股东列表（管理员）
router.get('/list', async (req: Request, res: Response) => {
  try {
    const shareholders = await prisma.shareholder.findMany({
      include: {
        user: { select: { id: true, phone: true, nickname: true } },
        _count: {
          select: {
            investments: true,
            dividends: true,
            costs: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 计算每个股东的投资总额
    const result = await Promise.all(shareholders.map(async (s) => {
      const investments = await prisma.shareholderInvestment.findMany({
        where: { shareholderId: s.id },
        orderBy: { createdAt: 'desc' }
      });

      let totalInvestment = new Prisma.Decimal(0);
      for (const inv of investments) {
        if (inv.type === 'withdrawal') {
          totalInvestment = totalInvestment.minus(inv.amount);
        } else {
          totalInvestment = totalInvestment.plus(inv.amount);
        }
      }

      const totalDividend = await prisma.shareholderDividend.aggregate({
        where: { shareholderId: s.id },
        _sum: { amount: true }
      });

      return {
        ...s,
        totalInvestment: totalInvestment.toString(),
        totalDividend: totalDividend._sum.amount?.toString() || '0'
      };
    }));

    res.json(ok(result));
  } catch (e: any) {
    res.status(500).json(err(e.message));
  }
});

// 创建股东（管理员）
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, name, phone, level } = req.body;

    if (!userId || !name || !phone) {
      res.status(400).json(err('userId, name, phone are required'));
      return;
    }

    // 检查用户是否已经是股东
    const existing = await prisma.shareholder.findUnique({ where: { userId } });
    if (existing) {
      res.status(400).json(err('User is already a shareholder'));
      return;
    }

    const shareholder = await prisma.shareholder.create({
      data: {
        userId,
        name,
        phone,
        level: level || 1
      }
    });

    res.json(ok(shareholder));
  } catch (e: any) {
    res.status(500).json(err(e.message));
  }
});

// 股东详情
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const shareholder = await prisma.shareholder.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, phone: true, nickname: true } }
      }
    });

    if (!shareholder) {
      res.status(404).json(err('Shareholder not found'));
      return;
    }

    res.json(ok(shareholder));
  } catch (e: any) {
    res.status(500).json(err(e.message));
  }
});

// 投资记录
router.get('/:id/investments', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const investments = await prisma.shareholderInvestment.findMany({
      where: { shareholderId: id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(ok(investments));
  } catch (e: any) {
    res.status(500).json(err(e.message));
  }
});

// 添加投资记录
router.post('/:id/investments', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, type, remark } = req.body;

    if (!amount || !type) {
      res.status(400).json(err('amount and type are required'));
      return;
    }

    const investment = await prisma.shareholderInvestment.create({
      data: {
        shareholderId: id,
        amount: new Prisma.Decimal(amount),
        type,
        remark
      }
    });

    res.json(ok(investment));
  } catch (e: any) {
    res.status(500).json(err(e.message));
  }
});

// 分红记录
router.get('/:id/dividends', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const dividends = await prisma.shareholderDividend.findMany({
      where: { shareholderId: id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(ok(dividends));
  } catch (e: any) {
    res.status(500).json(err(e.message));
  }
});

// 发放分红（管理员）
router.post('/:id/dividends', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, period } = req.body;

    if (!amount || !period) {
      res.status(400).json(err('amount and period are required'));
      return;
    }

    const dividend = await prisma.shareholderDividend.create({
      data: {
        shareholderId: id,
        amount: new Prisma.Decimal(amount),
        period,
        status: 'paid'
      }
    });

    res.json(ok(dividend));
  } catch (e: any) {
    res.status(500).json(err(e.message));
  }
});

// 成本分摊记录
router.get('/:id/costs', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const costs = await prisma.shareholderCost.findMany({
      where: { shareholderId: id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(ok(costs));
  } catch (e: any) {
    res.status(500).json(err(e.message));
  }
});

// 添加成本分摊记录（管理员）
router.post('/:id/costs', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, type, remark, period } = req.body;

    if (!amount || !type || !period) {
      res.status(400).json(err('amount, type, and period are required'));
      return;
    }

    const cost = await prisma.shareholderCost.create({
      data: {
        shareholderId: id,
        amount: new Prisma.Decimal(amount),
        type,
        remark,
        period
      }
    });

    res.json(ok(cost));
  } catch (e: any) {
    res.status(500).json(err(e.message));
  }
});

// 股东 Dashboard 数据
router.get('/dashboard/me', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;

    if (!userId) {
      res.status(401).json(err('Unauthorized'));
      return;
    }

    const shareholder = await prisma.shareholder.findUnique({
      where: { userId }
    });

    if (!shareholder) {
      res.status(404).json(err('You are not a shareholder'));
      return;
    }

    // 计算投资总额
    const investments = await prisma.shareholderInvestment.findMany({
      where: { shareholderId: shareholder.id }
    });

    let totalInvestment = new Prisma.Decimal(0);
    for (const inv of investments) {
      if (inv.type === 'withdrawal') {
        totalInvestment = totalInvestment.minus(inv.amount);
      } else {
        totalInvestment = totalInvestment.plus(inv.amount);
      }
    }

    // 计算累计收益（已发放分红）
    const paidDividends = await prisma.shareholderDividend.aggregate({
      where: { shareholderId: shareholder.id, status: 'paid' },
      _sum: { amount: true }
    });

    // 计算待分红
    const pendingDividends = await prisma.shareholderDividend.aggregate({
      where: { shareholderId: shareholder.id, status: 'pending' },
      _sum: { amount: true }
    });

    // 计算总分红
    const allDividends = await prisma.shareholderDividend.aggregate({
      where: { shareholderId: shareholder.id },
      _sum: { amount: true }
    });

    // 计算所有股东总投资额（用于计算比例）
    const allInvestments = await prisma.shareholderInvestment.findMany();
    let allTotalInvestment = new Prisma.Decimal(0);
    for (const inv of allInvestments) {
      if (inv.type === 'withdrawal') {
        allTotalInvestment = allTotalInvestment.minus(inv.amount);
      } else {
        allTotalInvestment = allTotalInvestment.plus(inv.amount);
      }
    }

    // 计算投资比例
    const investmentRatio = allTotalInvestment.gt(0)
      ? totalInvestment.div(allTotalInvestment).times(100).toFixed(2)
      : '0';

    // 获取级别配置
    const levelConfig = await prisma.shareholderLevelConfig.findUnique({
      where: { level: shareholder.level }
    });

    res.json(ok({
      shareholder: {
        id: shareholder.id,
        name: shareholder.name,
        level: shareholder.level,
        levelName: levelConfig?.name || '',
        status: shareholder.status
      },
      totalInvestment: totalInvestment.toString(),
      totalEarnings: (paidDividends._sum.amount || new Prisma.Decimal(0)).toString(),
      pendingDividend: (pendingDividends._sum.amount || new Prisma.Decimal(0)).toString(),
      totalDividend: (allDividends._sum.amount || new Prisma.Decimal(0)).toString(),
      investmentRatio: investmentRatio + '%',
      recentInvestments: investments.slice(0, 5).map(inv => ({
        ...inv,
        amount: inv.amount.toString()
      }))
    }));
  } catch (e: any) {
    res.status(500).json(err(e.message));
  }
});

export default router;
