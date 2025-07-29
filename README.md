# 📱 SMS避坑指南

一个帮助用户分享和查看接码失败记录的Web应用，避免重复踩坑。

## ✨ 功能特色

### 🎯 核心功能
- **避坑指南查看** - 浏览其他用户分享的接码失败记录
- **智能筛选搜索** - 按网站、国家、项目快速筛选
- **失败记录提交** - 分享你的接码失败经验
- **数据统计展示** - 查看失败率统计和热门组合

### 🛡️ 管理功能
- **权限管理系统** - 管理后台密码保护
- **数据管理** - 网站、国家、项目的增删改查
- **记录管理** - 用户提交记录的审核和管理
- **广告管理系统** - 公告和广告位的创建、编辑、管理

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
- **缓存管理**: 智能缓存系统优化性能
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
- **user_profiles** - 用户档案（如使用Supabase认证）

### 数据关系

```
submissions
├── website_id → websites.id
├── country_id → countries.id
└── project_id → projects.id
```

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
- 配置环境变量

3. **设置环境变量**
在Vercel Dashboard中添加：
- `VITE_ADMIN_PASSWORD`: 你的管理员密码
- `VITE_SUPABASE_URL`: Supabase项目URL
- `VITE_SUPABASE_ANON_KEY`: Supabase匿名密钥

4. **部署完成**
访问分配的域名即可使用

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

## 📱 功能截图

### 主页面
- 避坑指南列表
- 智能筛选和搜索
- 统计数据展示

### 提交页面
- 表单填写界面
- 搜索建议功能
- 移动端优化

### 管理后台
- 权限认证界面
- 数据管理功能
- 广告管理系统
- 统计概览

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
│   └── ...
├── pages/              # 页面组件
│   ├── guide-list-page.tsx    # 主页
│   ├── submit-page-new.tsx    # 提交页面
│   └── admin-page.tsx         # 管理后台
├── lib/                # 工具库
│   ├── supabase.ts     # 数据库配置
│   └── utils.ts        # 工具函数
├── services/           # 服务层
│   └── database.ts     # 数据库操作
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

- 项目地址: https://github.com/你的用户名/sms-avoid-guide
- 问题反馈: https://github.com/你的用户名/sms-avoid-guide/issues

---

**让接码避坑变得简单！** 🎉