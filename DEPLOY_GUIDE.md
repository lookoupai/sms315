# 🚀 接码避坑指南 - 超简单部署教程

## 📋 准备工作

你需要注册以下免费账号：
1. **GitHub** - 存放代码
2. **Vercel** - 部署网站  
3. **Supabase** - 数据库

## 🎯 第一步：准备代码

### 方法一：下载项目文件
1. 将整个 `sms-avoid-guide` 文件夹复制到你的电脑
2. 压缩成 zip 文件备用

### 方法二：使用 Git（推荐）
```bash
# 如果你会用 Git
git init
git add .
git commit -m "初始提交"
```

## 🗄️ 第二步：设置数据库（Supabase）

### 2.1 创建 Supabase 项目
1. 访问 [supabase.com](https://supabase.com)
2. 点击 "Start your project"
3. 用 GitHub 账号登录
4. 点击 "New project"
5. 填写项目信息：
   - Name: `sms-avoid-guide`
   - Database Password: 设置一个密码（记住它）
   - Region: 选择 `Southeast Asia (Singapore)`
6. 点击 "Create new project"

### 2.2 创建数据表
1. 等待项目创建完成（约2分钟）
2. 在左侧菜单点击 "SQL Editor"
3. 点击 "New query"
4. 复制粘贴以下SQL代码：

```sql
-- 网站表
CREATE TABLE websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  url VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
  status_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 国家表
CREATE TABLE countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 项目表
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 提交记录表
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID REFERENCES websites(id),
  country_id UUID REFERENCES countries(id),
  project_id UUID REFERENCES projects(id),
  result VARCHAR(10) NOT NULL CHECK (result IN ('success', 'failure')),
  note TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- IP日志表
CREATE TABLE ip_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address VARCHAR(45) NOT NULL,
  request_count INTEGER DEFAULT 1,
  last_request_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入初始数据
INSERT INTO websites (name, url, status) VALUES
('SMS-Activate', 'sms-activate.io', 'active'),
('5SIM', '5sim.net', 'active'),
('SMS-Man', 'sms-man.com', 'active'),
('GetSMSCode', 'getsmscode.com', 'active');

INSERT INTO countries (name, code) VALUES
('美国', 'US'),
('英国', 'GB'),
('加拿大', 'CA'),
('德国', 'DE'),
('法国', 'FR'),
('澳大利亚', 'AU'),
('日本', 'JP'),
('韩国', 'KR');

INSERT INTO projects (name, code) VALUES
('WhatsApp', 'wa'),
('Telegram', 'tg'),
('Discord', 'ds'),
('Instagram', 'ig'),
('Facebook', 'fb'),
('Twitter', 'tw'),
('TikTok', 'tt'),
('YouTube', 'yt');
```

5. 点击 "Run" 执行SQL
6. 看到 "Success" 表示创建成功

### 2.3 获取数据库连接信息
1. 点击左侧 "Settings" → "API"
2. 复制保存以下信息：
   - **Project URL** (类似: https://xxx.supabase.co)
   - **anon public** key (很长的字符串)

## 🌐 第三步：部署到 Vercel

### 3.1 上传代码到 GitHub
1. 访问 [github.com](https://github.com)
2. 登录后点击右上角 "+" → "New repository"
3. Repository name: `sms-avoid-guide`
4. 选择 "Public"
5. 点击 "Create repository"
6. 按照页面提示上传代码，或者：
   - 点击 "uploading an existing file"
   - 将项目文件夹拖拽上传
   - 写个提交信息，点击 "Commit changes"

### 3.2 部署到 Vercel
1. 访问 [vercel.com](https://vercel.com)
2. 点击 "Continue with GitHub" 登录
3. 点击 "New Project"
4. 找到你的 `sms-avoid-guide` 仓库，点击 "Import"
5. 在 "Environment Variables" 部分添加：
   - Name: `SUPABASE_URL`
   - Value: 粘贴你的 Project URL
   - Name: `SUPABASE_ANON_KEY`  
   - Value: 粘贴你的 anon public key
6. 点击 "Deploy"
7. 等待部署完成（约2-3分钟）
8. 看到庆祝页面表示成功！

## 🎉 完成！

部署成功后，你会得到一个网址，类似：
`https://sms-avoid-guide-xxx.vercel.app`

### 测试功能
1. 访问你的网站
2. 尝试提交一条接码记录
3. 查看避坑指南页面
4. 进入管理后台（密码：admin123）

## 🔧 常见问题

### Q: 网站打不开？
A: 等待几分钟，Vercel 需要时间部署

### Q: 提交表单报错？
A: 检查 Supabase 环境变量是否正确设置

### Q: 数据库连接失败？
A: 确认 SQL 执行成功，表已创建

### Q: 想修改内容？
A: 修改代码后推送到 GitHub，Vercel 会自动重新部署

## 📞 需要帮助？

如果遇到问题：
1. 检查每一步是否按照教程执行
2. 确认所有账号都已正确注册
3. 验证环境变量设置正确

## 🎯 下一步

部署成功后，你可以：
- 自定义网站样式和内容
- 添加更多接码网站和项目
- 优化用户体验
- 添加更多功能

恭喜你成功部署了接码避坑指南平台！🎉