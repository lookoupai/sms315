# 🚀 Vercel 部署完整指南

## 📋 部署前准备

### 1. Supabase 数据库配置

#### 创建 Supabase 项目

1. **注册 Supabase 账号**
   - 访问 [Supabase](https://supabase.com)
   - 使用 GitHub 账号登录（推荐）

2. **创建新项目**
   - 点击 **New Project**
   - 选择组织（个人账号）
   - 填写项目信息：
     ```
     Name: sms-avoid-guide
     Database Password: 设置强密码（记住这个密码）
     Region: Northeast Asia (Tokyo) - 选择离用户最近的区域
     ```
   - 点击 **Create new project**
   - 等待 2-3 分钟项目创建完成

3. **获取数据库连接信息**
   - 项目创建完成后，进入 **Settings** → **API**
   - 复制以下信息：
     ```
     Project URL: https://你的项目ID.supabase.co
     anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（保密）
     ```

#### 创建数据库表结构

1. **进入 SQL Editor**
   - 在 Supabase Dashboard 中点击 **SQL Editor**
   - 点击 **New query**

2. **执行建表 SQL**
   ```sql
   -- 创建国家表
   CREATE TABLE countries (
     id SERIAL PRIMARY KEY,
     name VARCHAR(100) NOT NULL UNIQUE,
     code VARCHAR(10) NOT NULL UNIQUE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- 创建项目表
   CREATE TABLE projects (
     id SERIAL PRIMARY KEY,
     name VARCHAR(200) NOT NULL,
     description TEXT,
     website_url VARCHAR(500),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- 创建避坑指南表
   CREATE TABLE pitfall_guides (
     id SERIAL PRIMARY KEY,
     title VARCHAR(300) NOT NULL,
     content TEXT NOT NULL,
     country_id INTEGER REFERENCES countries(id),
     project_id INTEGER REFERENCES projects(id),
     risk_level VARCHAR(20) CHECK (risk_level IN ('低风险', '中风险', '高风险')),
     tags TEXT[],
     is_verified BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- 插入初始数据
   INSERT INTO countries (name, code) VALUES 
   ('中国', 'CN'),
   ('美国', 'US'),
   ('英国', 'UK'),
   ('加拿大', 'CA'),
   ('澳大利亚', 'AU'),
   ('新加坡', 'SG'),
   ('日本', 'JP'),
   ('韩国', 'KR');

   INSERT INTO projects (name, description, website_url) VALUES 
   ('阿里云短信', '阿里云短信服务', 'https://www.aliyun.com/product/sms'),
   ('腾讯云短信', '腾讯云短信服务', 'https://cloud.tencent.com/product/sms'),
   ('华为云短信', '华为云短信服务', 'https://www.huaweicloud.com/product/msgsms.html'),
   ('Twilio', '国际短信服务商', 'https://www.twilio.com'),
   ('AWS SNS', '亚马逊简单通知服务', 'https://aws.amazon.com/sns/'),
   ('SendGrid', '邮件和短信服务', 'https://sendgrid.com');

   -- 设置行级安全策略（RLS）
   ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
   ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
   ALTER TABLE pitfall_guides ENABLE ROW LEVEL SECURITY;

   -- 创建公开读取策略
   CREATE POLICY "Allow public read access" ON countries FOR SELECT USING (true);
   CREATE POLICY "Allow public read access" ON projects FOR SELECT USING (true);
   CREATE POLICY "Allow public read access" ON pitfall_guides FOR SELECT USING (true);

   -- 创建插入策略（任何人都可以提交避坑指南）
   CREATE POLICY "Allow public insert" ON pitfall_guides FOR INSERT WITH CHECK (true);
   ```

3. **点击 Run 执行 SQL**

#### 配置 Supabase 权限

1. **设置存储桶（如果需要文件上传）**
   - 进入 **Storage**
   - 创建新存储桶：`pitfall-images`
   - 设置为公开访问

2. **配置实时订阅（可选）**
   - 进入 **Database** → **Replication**
   - 启用需要实时更新的表

### 2. 环境变量配置

#### 完整的环境变量列表

```bash
# Supabase 配置
VITE_SUPABASE_URL=https://你的项目ID.supabase.co
VITE_SUPABASE_ANON_KEY=你的anon_public_key

# 管理员配置
VITE_ADMIN_PASSWORD=你的强密码

# 可选配置
VITE_APP_TITLE=SMS避坑指南
VITE_APP_DESCRIPTION=专业的短信服务避坑指南平台
```

#### 在 Vercel 中设置环境变量

1. **登录 Vercel Dashboard**
   - 访问 [Vercel Dashboard](https://vercel.com/dashboard)
   - 选择你的项目

2. **添加环境变量**
   - 进入 **Settings** → **Environment Variables**
   - 逐个添加以下变量：

   ```
   Name: VITE_SUPABASE_URL
   Value: https://你的项目ID.supabase.co
   Environment: Production, Preview, Development
   
   Name: VITE_SUPABASE_ANON_KEY  
   Value: 你的anon_public_key
   Environment: Production, Preview, Development
   
   Name: VITE_ADMIN_PASSWORD
   Value: 你的强密码（16位以上）
   Environment: Production, Preview, Development
   ```

3. **保存配置**
   - 每个变量都要点击 **Save**
   - 确保所有环境都选中

## 🔧 部署步骤

### 方法一：GitHub 连接部署（推荐）

1. **确保代码已推送到 GitHub**
   ```bash
   git add .
   git commit -m "准备部署：配置完整的环境变量"
   git push origin main
   ```

2. **连接 Vercel**
   - 访问 [Vercel](https://vercel.com)
   - 点击 **New Project**
   - 选择你的 GitHub 仓库：`lookoupai/sms315`
   - 点击 **Import**

3. **配置项目设置**
   ```
   Project Name: sms-avoid-guide
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **设置环境变量**（重要！）
   - 在部署前，点击 **Environment Variables**
   - 添加上面列出的所有环境变量
   - 确保每个变量都设置正确

5. **开始部署**
   - 点击 **Deploy**
   - 等待 3-5 分钟部署完成
   - 部署成功后会显示项目 URL

### 方法二：Vercel CLI 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 在项目根目录
cd sms-avoid-guide

# 安装依赖
npm install

# 设置环境变量
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY  
vercel env add VITE_ADMIN_PASSWORD

# 构建和部署
vercel --prod
```

## 🧪 部署后测试

### 1. 基础功能测试

1. **访问主页**
   - 打开部署的 URL
   - 检查页面是否正常加载
   - 测试导航功能

2. **测试数据库连接**
   - 查看避坑指南列表
   - 尝试筛选功能
   - 检查数据是否正常显示

3. **测试提交功能**
   - 进入"提交避坑"页面
   - 填写表单并提交
   - 检查数据是否保存到 Supabase

4. **测试管理后台**
   - 访问 `/admin` 路径
   - 使用设置的密码登录
   - 测试管理功能

### 2. 性能测试

```bash
# 使用 Lighthouse 测试
npx lighthouse https://你的域名.vercel.app --view

# 或者使用在线工具
# https://pagespeed.web.dev/
# https://gtmetrix.com/
```

## 🔐 安全配置

### 1. Supabase 安全设置

1. **启用 RLS（行级安全）**
   ```sql
   -- 在 Supabase SQL Editor 中执行
   ALTER TABLE pitfall_guides ENABLE ROW LEVEL SECURITY;
   
   -- 创建更严格的策略
   CREATE POLICY "Authenticated users can insert" ON pitfall_guides 
   FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');
   ```

2. **配置 CORS 设置**
   - 在 Supabase Dashboard → **Settings** → **API**
   - 添加你的 Vercel 域名到允许的源

3. **监控 API 使用**
   - 定期检查 **Settings** → **Usage**
   - 设置使用量警报

### 2. Vercel 安全设置

1. **启用 Vercel 防火墙**（Pro 计划）
   - 进入 **Settings** → **Security**
   - 配置 IP 白名单（如果需要）

2. **设置环境变量加密**
   - Vercel 自动加密环境变量
   - 不要在代码中硬编码敏感信息

## 🌐 域名和 SSL

### 1. 自定义域名配置

1. **添加域名**
   - 在 Vercel Dashboard → **Settings** → **Domains**
   - 点击 **Add Domain**
   - 输入域名：`sms-guide.yourdomain.com`

2. **DNS 配置**
   ```
   类型: CNAME
   名称: sms-guide
   值: cname.vercel-dns.com
   ```

3. **SSL 证书**
   - Vercel 自动提供 Let's Encrypt SSL 证书
   - 支持自动续期

### 2. CDN 和缓存优化

Vercel 自动提供全球 CDN，但你可以优化：

```javascript
// vercel.json 配置文件
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "s-maxage=60" }
      ]
    }
  ]
}
```

## 📊 监控和维护

### 1. Vercel 监控

1. **查看分析数据**
   - **Analytics** 标签页
   - 查看访问量、性能指标
   - 监控错误率

2. **设置警报**
   - **Settings** → **Notifications**
   - 配置部署失败通知
   - 设置性能警报

### 2. Supabase 监控

1. **数据库监控**
   - **Settings** → **Database**
   - 查看连接数、查询性能
   - 监控存储使用量

2. **API 监控**
   - **Settings** → **API**
   - 查看请求量和响应时间
   - 监控错误日志

## 🔄 自动化部署

### GitHub Actions 配置

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Build project
      run: npm run build
      
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🛠️ 故障排除

### 常见问题和解决方案

1. **Supabase 连接失败**
   ```bash
   # 检查环境变量
   console.log('SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
   console.log('SUPABASE_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY)
   
   # 解决方案：
   # 1. 确认环境变量名称正确（VITE_ 前缀）
   # 2. 重新部署项目
   # 3. 检查 Supabase 项目状态
   ```

2. **数据库查询失败**
   ```sql
   -- 检查表是否存在
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   
   -- 检查 RLS 策略
   SELECT * FROM pg_policies WHERE tablename = 'pitfall_guides';
   ```

3. **环境变量不生效**
   - 确保变量名有 `VITE_` 前缀
   - 检查是否在所有环境中设置
   - 重新部署项目

4. **构建失败**
   ```bash
   # 本地测试构建
   npm run build
   
   # 检查依赖
   npm audit
   npm audit fix
   ```

### 调试工具

```bash
# Vercel CLI 调试命令
vercel logs                    # 查看部署日志
vercel env ls                  # 列出环境变量
vercel inspect                 # 检查项目配置
vercel --debug                 # 调试模式部署

# 本地调试
npm run dev                    # 本地开发服务器
npm run build                  # 本地构建测试
npm run preview               # 预览构建结果
```

## 📞 获取帮助

### 官方文档
- [Vercel 文档](https://vercel.com/docs)
- [Supabase 文档](https://supabase.com/docs)
- [Vite 文档](https://vitejs.dev/guide/)

### 社区支持
- [Vercel Discord](https://discord.gg/vercel)
- [Supabase Discord](https://discord.supabase.com/)
- [GitHub Issues](https://github.com/lookoupai/sms315/issues)

### 紧急联系
如果遇到严重问题：
1. 检查 Vercel 和 Supabase 状态页面
2. 查看项目的构建日志
3. 在 GitHub 仓库创建 Issue
4. 联系相应平台的技术支持

---

**🎉 完成部署后，你将拥有一个完全功能的 SMS 避坑指南平台！**

**下一步：** 考虑创建 VPS 部署指南以提供更多部署选择。