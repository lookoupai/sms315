# 🚀 Vercel 部署指南

## 📋 部署前准备

### 1. 环境变量配置

在Vercel部署时，管理员密码通过环境变量设置，**不需要修改GitHub代码**。

#### 方法一：Vercel Dashboard 设置（推荐）

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** → **Environment Variables**
4. 添加环境变量：
   ```
   Name: VITE_ADMIN_PASSWORD
   Value: 你的强密码（建议16位以上，包含大小写字母、数字、特殊字符）
   ```
5. 选择环境：**Production**, **Preview**, **Development**
6. 点击 **Save**

#### 方法二：Vercel CLI 设置

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 设置环境变量
vercel env add VITE_ADMIN_PASSWORD
# 输入你的密码
# 选择环境: Production, Preview, Development
```

### 2. 密码安全建议

**强密码示例：**
```
AdminSMS@2024#Secure!
MyProject$2024&Safe
SMS315@Admin#2024!
```

**密码要求：**
- 长度：16-32位
- 包含：大写字母、小写字母、数字、特殊字符
- 避免：生日、常见单词、键盘序列

## 🔧 部署步骤

### 方法一：GitHub 连接部署（推荐）

1. **推送代码到GitHub**
   ```bash
   git add .
   git commit -m "准备部署到Vercel"
   git push origin main
   ```

2. **连接Vercel**
   - 访问 [Vercel](https://vercel.com)
   - 点击 **New Project**
   - 选择你的GitHub仓库
   - 点击 **Import**

3. **配置项目**
   - **Project Name**: `sms-avoid-guide`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (默认)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **设置环境变量**
   - 在部署前，点击 **Environment Variables**
   - 添加 `VITE_ADMIN_PASSWORD`
   - 输入你的管理员密码

5. **部署**
   - 点击 **Deploy**
   - 等待部署完成

### 方法二：Vercel CLI 部署

```bash
# 在项目根目录
cd sms-avoid-guide

# 安装依赖
npm install

# 构建项目
npm run build

# 部署到Vercel
vercel --prod

# 设置环境变量（如果还没设置）
vercel env add VITE_ADMIN_PASSWORD
```

## 🔐 密码管理

### 修改密码

**部署后修改密码：**

1. **Vercel Dashboard方式**
   - 进入项目 Settings → Environment Variables
   - 找到 `VITE_ADMIN_PASSWORD`
   - 点击编辑，输入新密码
   - 保存后会自动重新部署

2. **CLI方式**
   ```bash
   # 删除旧的环境变量
   vercel env rm VITE_ADMIN_PASSWORD
   
   # 添加新的环境变量
   vercel env add VITE_ADMIN_PASSWORD
   
   # 重新部署
   vercel --prod
   ```

### 密码验证

部署完成后，访问 `https://你的域名.vercel.app/admin` 测试：

1. 应该看到登录界面
2. 输入设置的密码
3. 成功登录后可以访问管理后台

## 🌐 域名配置

### 自定义域名

1. **在Vercel Dashboard**
   - 进入项目 Settings → Domains
   - 点击 **Add Domain**
   - 输入你的域名（如：`sms-guide.yourdomain.com`）

2. **DNS配置**
   - 在你的域名提供商处添加CNAME记录
   - 指向Vercel提供的地址

### SSL证书

Vercel自动提供免费SSL证书，支持HTTPS访问。

## 🔄 自动部署

**GitHub集成后，每次推送代码都会自动部署：**

```bash
# 修改代码后
git add .
git commit -m "更新功能"
git push origin main
# Vercel会自动检测并重新部署
```

## 📊 监控和日志

### 查看部署状态

1. **Vercel Dashboard**
   - 查看部署历史
   - 监控网站性能
   - 查看访问日志

2. **实时日志**
   ```bash
   vercel logs 你的项目URL
   ```

## 🛡️ 安全最佳实践

### 1. 环境变量安全
- ✅ 使用环境变量存储密码
- ✅ 不要在代码中硬编码密码
- ✅ 定期更换管理员密码
- ✅ 不要在公共仓库中提交 `.env` 文件

### 2. 访问控制
- ✅ 管理后台需要密码认证
- ✅ 会话有效期限制（2小时）
- ✅ 关闭浏览器需重新认证

### 3. 生产环境建议
- ✅ 启用HTTPS（Vercel默认支持）
- ✅ 设置强密码
- ✅ 定期备份数据
- ✅ 监控异常访问

## 🔧 故障排除

### 常见问题

1. **环境变量不生效**
   - 检查变量名是否正确：`VITE_ADMIN_PASSWORD`
   - 确保在所有环境（Production/Preview/Development）都设置了
   - 重新部署项目

2. **登录失败**
   - 检查密码是否正确
   - 清除浏览器缓存
   - 检查控制台错误信息

3. **部署失败**
   - 检查构建日志
   - 确保依赖安装正确
   - 检查Node.js版本兼容性

### 调试命令

```bash
# 本地测试环境变量
echo $VITE_ADMIN_PASSWORD

# 查看Vercel项目信息
vercel ls

# 查看环境变量
vercel env ls

# 查看部署日志
vercel logs
```

## 📞 技术支持

如果遇到部署问题，可以：

1. 查看 [Vercel文档](https://vercel.com/docs)
2. 检查项目的构建日志
3. 在GitHub Issues中提问
4. 联系Vercel技术支持

---

**总结：使用环境变量管理密码，无需修改GitHub代码，安全且方便！** 🎉