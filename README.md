# 📱 SMS避坑指南

一个帮助用户分享和查看接码失败记录的Web应用，避免重复踩坑。

## ✨ 功能特色

### 🎯 核心功能
- **避坑指南查看** - 浏览其他用户分享的接码失败记录
- **智能筛选搜索** - 按网站、国家、项目快速筛选
- **骗子信息标记** - 区分普通网站、个人服务和骗子信息
- **失败记录提交** - 分享你的接码失败经验
- **数据统计展示** - 查看失败率统计和热门组合
- **智能链接替换** - 自动将原始链接替换为推广链接，增加收益转化

### 🛡️ 管理功能
- **权限管理系统** - 管理后台密码保护
- **数据管理** - 网站、国家、项目的增删改查
- **记录管理** - 用户提交记录的审核和管理
- **广告管理系统** - 公告和广告位的创建、编辑、管理
- **链接替换管理** - 推广链接规则的创建、编辑、启用/禁用管理

### 💰 收益优化
- **自动链接替换** - 原始链接自动替换为推广链接
- **多种匹配策略** - 支持精确匹配、域名匹配、包含匹配
- **智能缓存机制** - 60分钟缓存，减少92%数据库查询
- **实时管理** - 后台可随时添加、修改推广链接规则

### 📱 用户体验
- **完全响应式** - 完美适配手机、平板、桌面端
- **现代化UI** - 基于shadcn/ui的美观界面
- **快速搜索** - 实时搜索和智能提示
- **移动端优化** - 44px最小触摸目标，优化的移动端布局

## 🚀 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI组件**: shadcn/ui + Tailwind CSS
- **后端服务**: Supabase (PostgreSQL + 实时API)
- **状态管理**: React Hooks
- **缓存管理**: 智能缓存系统优化性能（60分钟缓存）
- **链接替换**: 自动推广链接转换系统
- **国际化**: i18n多语言支持（中文/英文）
- **图标库**: Lucide React
- **部署平台**: Vercel

## 📦 快速开始

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/你的用户名/sms-avoid-guide.git
cd sms-avoid-guide
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
# 复制环境变量示例文件
cp .env.example .env.local

# 编辑环境变量
nano .env.local
```

4. **启动开发服务器**
```bash
npm run dev
```

5. **访问应用**
- 前端页面: http://localhost:5173
- 管理后台: http://localhost:5173/admin

## ⚙️ 环境变量配置

### 必需配置

```env
# 管理员密码
VITE_ADMIN_PASSWORD=你的管理员密码

# Supabase配置
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥
```

### 可选配置

```env
# 应用信息
VITE_APP_NAME=SMS避坑指南
VITE_APP_VERSION=1.0.0
```

## 🗄️ 数据库结构

### 主要数据表

- **websites** - 接码网站信息
- **countries** - 国家和地区信息  
- **projects** - 项目/应用信息
- **submissions** - 用户提交的记录
- **announcements** - 广告和公告信息
- **link_replacements** - 链接替换规则配置
- **user_profiles** - 用户档案（如使用Supabase认证）

### 数据关系

```
submissions
├── website_id → websites.id
├── country_id → countries.id
└── project_id → projects.id
```

### 网站状态类型

- **active** - 正常网站
- **personal** - 个人服务
- **scammer** - 骗子（只收钱不提供服务）
- **pending** - 待审核
- **inactive** - 维护中
- **discontinued** - 已关闭

## 🚀 部署指南

### Vercel部署（推荐）

1. **推送到GitHub**
```bash
git add .
git commit -m "准备部署"
git push origin main
```

2. **连接Vercel**
- 访问 [Vercel Dashboard](https://vercel.com)
- 导入GitHub仓库
- 在"Framework Preset"（架构预设）中选择"Vite"
- 根目录保持为"./"

3. **设置环境变量**
在Vercel Dashboard中添加：
- `VITE_ADMIN_PASSWORD`: 你的管理员密码
- `VITE_SUPABASE_URL`: Supabase项目URL
- `VITE_SUPABASE_ANON_KEY`: Supabase匿名密钥
- `SUPABASE_URL`: 与VITE_SUPABASE_URL相同（API函数需要）
- `SUPABASE_ANON_KEY`: 与VITE_SUPABASE_ANON_KEY相同（API函数需要）

4. **创建vercel.json配置文件**
在项目根目录创建vercel.json文件，内容如下：
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

5. **部署完成**
点击"Deploy"按钮开始部署，完成后访问分配的域名即可使用

详细部署指南请查看: [VERCEL_DEPLOY_GUIDE.md](./VERCEL_DEPLOY_GUIDE.md)

### VPS部署

```bash
# 克隆项目
git clone https://github.com/你的用户名/sms-avoid-guide.git
cd sms-avoid-guide

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
nano .env

# 构建项目
npm run build

# 使用nginx或其他web服务器托管dist目录
```

## 💰 链接替换功能使用指南

### 功能概述
链接替换功能可以自动将网站中的原始链接替换为推广链接，帮助站长增加收益转化。

### 使用步骤

1. **设置数据库**
```sql
-- 在Supabase SQL Editor中执行
-- 详见 setup-database.sql 文件
CREATE TABLE link_replacements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_url TEXT NOT NULL UNIQUE,
  replacement_url TEXT NOT NULL,
  match_type VARCHAR(20) DEFAULT 'exact',
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

2. **添加替换规则**
- 访问管理后台 `/admin`
- 点击"链接替换"标签页
- 添加规则：
  - 原始链接：`https://sms-activate.io`
  - 推广链接：`https://sms-activate.io/?ref=486565`
  - 匹配类型：精确匹配

3. **测试功能**
- 访问 `/test-link-replacement` 页面验证效果
- 查看首页链接是否自动替换

### 匹配策略
- **精确匹配**：完全匹配URL
- **域名匹配**：匹配域名，保留路径参数
- **包含匹配**：包含指定字符串的URL

### 性能优化
- 60分钟智能缓存，减少92%数据库查询
- 专门针对Vercel和Supabase免费额度优化
- 支持管理员手动清除缓存

## 📱 功能截图

### 主页面
- 避坑指南列表
- 智能筛选和搜索
- 统计数据展示
- 自动链接替换（蓝色可点击链接）
- 骗子信息标记（红色警告标识）

### 提交页面
- 表单填写界面
- 服务类型选择（网站、个人服务、骗子）
- 搜索建议功能
- 移动端优化
- 备注中的链接自动替换

### 管理后台
- 权限认证界面
- 数据管理功能
- 广告管理系统
- **链接替换管理** - 新增功能
- 统计概览

### 链接替换测试页面
- 各种匹配策略的测试示例
- 实时替换效果预览
- 功能验证工具

## 🔐 安全特性

### 权限管理
- **密码保护** - 管理后台需要密码认证
- **会话管理** - 2小时有效期，自动过期
- **环境变量** - 敏感信息通过环境变量管理

### 数据安全
- **输入验证** - 前端表单验证
- **SQL注入防护** - 使用Supabase安全API
- **HTTPS加密** - 生产环境强制HTTPS

## 🛠️ 开发指南

### 项目结构

```
src/
├── components/          # 可复用组件
│   ├── ui/             # UI基础组件
│   ├── admin-auth.tsx  # 管理员认证
│   ├── link-replacer.tsx # 链接替换组件
│   └── ...
├── pages/              # 页面组件
│   ├── guide-list-page.tsx    # 主页
│   ├── submit-page-new.tsx    # 提交页面
│   ├── admin-page.tsx         # 管理后台
│   ├── test-link-replacement.tsx # 链接替换测试页面
│   └── ...
├── hooks/              # React Hooks
│   ├── use-ads-cache.ts       # 广告缓存Hook
│   ├── useLinkReplacement.ts  # 链接替换Hook
│   └── ...
├── services/           # 服务层
│   ├── database.ts     # 数据库操作
│   ├── linkReplacement.ts # 链接替换服务
│   └── ...
├── i18n/               # 国际化
│   └── locales/        # 语言包
│       ├── zh-CN.json  # 中文翻译
│       └── en-US.json  # 英文翻译
├── lib/                # 工具库
│   ├── supabase.ts     # 数据库配置
│   └── utils.ts        # 工具函数
├── database/           # 数据库相关
│   └── migrations/     # 数据库迁移文件
├── docs/               # 文档
│   └── link-replacement-guide.md # 链接替换使用指南
└── globals.css         # 全局样式
```

### 开发命令

```bash
# 开发服务器
npm run dev

# 类型检查
npm run type-check

# 构建项目
npm run build

# 预览构建结果
npm run preview
```

### 代码规范

- 使用TypeScript进行类型检查
- 遵循React Hooks最佳实践
- 使用Tailwind CSS进行样式管理
- 组件采用函数式组件 + Hooks

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

### 开发流程

1. Fork项目
2. 创建功能分支: `git checkout -b feature/新功能`
3. 提交更改: `git commit -m '添加新功能'`
4. 推送分支: `git push origin feature/新功能`
5. 提交Pull Request

### 问题反馈

如果遇到问题，请在GitHub Issues中反馈：
- 详细描述问题
- 提供复现步骤
- 附上错误截图或日志

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [React](https://reactjs.org/) - 前端框架
- [Vite](https://vitejs.dev/) - 构建工具
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [shadcn/ui](https://ui.shadcn.com/) - UI组件库
- [Supabase](https://supabase.com/) - 后端服务
- [Lucide](https://lucide.dev/) - 图标库

## 📞 联系方式

- 项目地址: https://github.com/lookoupai/sms315
- 问题反馈: https://github.com/lookoupai/sms315/issues

---

**让接码避坑变得简单！** 🎉