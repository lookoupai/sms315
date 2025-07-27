# 🖥️ VPS 部署完整指南

## 📋 VPS 部署概述

VPS（Virtual Private Server）部署提供了更多的控制权和自定义选项，适合需要完全控制服务器环境的用户。

### 🎯 适用场景

- 需要完全控制服务器环境
- 有特殊的网络或安全要求
- 希望降低长期运营成本
- 需要集成其他服务或应用
- 对数据存储位置有特殊要求

### 💰 成本对比

| 方案 | 月费用 | 优势 | 劣势 |
|------|--------|------|------|
| Vercel | $0-20 | 零配置，自动扩展 | 功能限制，依赖第三方 |
| VPS | $5-50 | 完全控制，可定制 | 需要运维知识 |

## 🛠️ 服务器要求

### 最低配置
```
CPU: 1核心
内存: 1GB RAM
存储: 20GB SSD
带宽: 1TB/月
操作系统: Ubuntu 20.04+ / CentOS 8+
```

### 推荐配置
```
CPU: 2核心
内存: 2GB RAM
存储: 40GB SSD
带宽: 2TB/月
操作系统: Ubuntu 22.04 LTS
```

### 推荐 VPS 提供商

1. **国外服务商**
   - [DigitalOcean](https://www.digitalocean.com/) - $5/月起
   - [Vultr](https://www.vultr.com/) - $2.5/月起
   - [Linode](https://www.linode.com/) - $5/月起
   - [AWS Lightsail](https://aws.amazon.com/lightsail/) - $3.5/月起

2. **国内服务商**
   - [阿里云ECS](https://www.aliyun.com/product/ecs) - ¥30/月起
   - [腾讯云CVM](https://cloud.tencent.com/product/cvm) - ¥25/月起
   - [华为云ECS](https://www.huaweicloud.com/product/ecs.html) - ¥30/月起

## 🚀 部署步骤

### 第一步：服务器初始化

#### 1. 连接服务器

```bash
# 使用 SSH 连接（替换为你的服务器 IP）
ssh root@your-server-ip

# 或使用密钥连接
ssh -i your-key.pem root@your-server-ip
```

#### 2. 更新系统

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
# 或者 (CentOS 8+)
sudo dnf update -y
```

#### 3. 创建非 root 用户

```bash
# 创建新用户
sudo adduser smsguide

# 添加到 sudo 组
sudo usermod -aG sudo smsguide

# 切换到新用户
su - smsguide
```

#### 4. 配置防火墙

```bash
# Ubuntu (ufw)
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# CentOS (firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 第二步：安装必要软件

#### 1. 安装 Node.js

```bash
# 使用 NodeSource 仓库安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version

# 安装 PM2 进程管理器
sudo npm install -g pm2
```

#### 2. 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt install nginx -y

# CentOS/RHEL
sudo yum install nginx -y
# 或者
sudo dnf install nginx -y

# 启动并设置开机自启
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 3. 安装 Git

```bash
# Ubuntu/Debian
sudo apt install git -y

# CentOS/RHEL
sudo yum install git -y
```

#### 4. 安装 SSL 证书工具

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y
```

### 第三步：部署应用

#### 1. 克隆项目

```bash
# 切换到用户目录
cd /home/smsguide

# 克隆项目
git clone https://github.com/lookoupai/sms315.git
cd sms315

# 安装依赖
npm install
```

#### 2. 配置环境变量

```bash
# 创建环境变量文件
nano .env

# 添加以下内容：
VITE_SUPABASE_URL=https://你的项目ID.supabase.co
VITE_SUPABASE_ANON_KEY=你的anon_public_key
VITE_ADMIN_PASSWORD=你的强密码
VITE_APP_TITLE=SMS避坑指南
VITE_APP_DESCRIPTION=专业的短信服务避坑指南平台

# 保存文件 (Ctrl+X, Y, Enter)
```

#### 3. 构建项目

```bash
# 构建生产版本
npm run build

# 验证构建结果
ls -la dist/
```

#### 4. 配置 PM2

```bash
# 创建 PM2 配置文件
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'sms-guide',
    script: 'npx',
    args: 'serve -s dist -l 3000',
    cwd: '/home/smsguide/sms315',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

```bash
# 启动应用
pm2 start ecosystem.config.js

# 设置开机自启
pm2 startup
pm2 save

# 查看应用状态
pm2 status
pm2 logs sms-guide
```

### 第四步：配置 Nginx

#### 1. 创建 Nginx 配置

```bash
# 创建站点配置文件
sudo nano /etc/nginx/sites-available/sms-guide
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL 配置（稍后由 Certbot 自动配置）
    
    # 网站根目录
    root /home/smsguide/sms315/dist;
    index index.html;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API 代理（如果需要）
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

#### 2. 启用站点配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/sms-guide /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 第五步：配置 SSL 证书

#### 1. 获取 SSL 证书

```bash
# 使用 Certbot 自动配置 SSL
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 按提示输入邮箱和同意条款
```

#### 2. 设置自动续期

```bash
# 测试自动续期
sudo certbot renew --dry-run

# 添加定时任务
sudo crontab -e

# 添加以下行（每天检查证书续期）
0 12 * * * /usr/bin/certbot renew --quiet
```

### 第六步：配置域名解析

#### 1. DNS 配置

在你的域名提供商处添加以下记录：

```
类型: A
名称: @
值: 你的服务器IP地址
TTL: 300

类型: A  
名称: www
值: 你的服务器IP地址
TTL: 300
```

#### 2. 验证解析

```bash
# 检查域名解析
nslookup your-domain.com
dig your-domain.com

# 测试网站访问
curl -I https://your-domain.com
```

## 🔧 高级配置

### 1. 数据库配置（可选）

如果你想在 VPS 上运行自己的数据库而不是使用 Supabase：

#### 安装 PostgreSQL

```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib -y

# 启动服务
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 创建数据库和用户
sudo -u postgres psql

CREATE DATABASE sms_guide;
CREATE USER smsguide WITH ENCRYPTED PASSWORD 'your-strong-password';
GRANT ALL PRIVILEGES ON DATABASE sms_guide TO smsguide;
\q
```

#### 配置数据库连接

```bash
# 修改环境变量
nano .env

# 添加数据库配置
DATABASE_URL=postgresql://smsguide:your-password@localhost:5432/sms_guide
```

### 2. Redis 缓存（可选）

```bash
# 安装 Redis
sudo apt install redis-server -y

# 启动服务
sudo systemctl start redis-server
sudo systemctl enable redis-server

# 测试连接
redis-cli ping
```

### 3. 监控配置

#### 安装监控工具

```bash
# 安装 htop
sudo apt install htop -y

# 安装 netdata（实时监控）
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

#### PM2 监控

```bash
# 安装 PM2 监控
pm2 install pm2-server-monit

# 查看监控面板
pm2 monit
```

### 4. 备份配置

#### 创建备份脚本

```bash
# 创建备份目录
mkdir -p /home/smsguide/backups

# 创建备份脚本
nano /home/smsguide/backup.sh
```

```bash
#!/bin/bash

# 备份配置
BACKUP_DIR="/home/smsguide/backups"
DATE=$(date +%Y%m%d_%H%M%S)
PROJECT_DIR="/home/smsguide/sms315"

# 创建备份
tar -czf "$BACKUP_DIR/sms-guide-$DATE.tar.gz" -C "$PROJECT_DIR" .

# 保留最近7天的备份
find "$BACKUP_DIR" -name "sms-guide-*.tar.gz" -mtime +7 -delete

echo "备份完成: sms-guide-$DATE.tar.gz"
```

```bash
# 设置执行权限
chmod +x /home/smsguide/backup.sh

# 添加定时任务（每天凌晨2点备份）
crontab -e

# 添加以下行
0 2 * * * /home/smsguide/backup.sh
```

## 🔒 安全配置

### 1. SSH 安全

#### 配置密钥认证

```bash
# 在本地生成密钥对
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# 复制公钥到服务器
ssh-copy-id smsguide@your-server-ip

# 或手动复制
cat ~/.ssh/id_rsa.pub | ssh smsguide@your-server-ip "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

#### 禁用密码登录

```bash
# 编辑 SSH 配置
sudo nano /etc/ssh/sshd_config

# 修改以下配置
PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin no
Port 2222  # 更改默认端口

# 重启 SSH 服务
sudo systemctl restart sshd
```

### 2. 防火墙配置

```bash
# 更新防火墙规则（如果更改了SSH端口）
sudo ufw delete allow ssh
sudo ufw allow 2222

# 限制连接频率
sudo ufw limit 2222

# 查看防火墙状态
sudo ufw status verbose
```

### 3. 安装 Fail2Ban

```bash
# 安装 Fail2Ban
sudo apt install fail2ban -y

# 创建配置文件
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = 2222
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 2

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 2
```

```bash
# 启动 Fail2Ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# 查看状态
sudo fail2ban-client status
```

## 📊 监控和维护

### 1. 系统监控

#### 安装监控脚本

```bash
# 创建监控脚本
nano /home/smsguide/monitor.sh
```

```bash
#!/bin/bash

# 系统监控脚本
LOG_FILE="/home/smsguide/logs/monitor.log"
mkdir -p /home/smsguide/logs

echo "=== 系统监控报告 $(date) ===" >> $LOG_FILE

# CPU 使用率
echo "CPU 使用率:" >> $LOG_FILE
top -bn1 | grep "Cpu(s)" >> $LOG_FILE

# 内存使用率
echo "内存使用率:" >> $LOG_FILE
free -h >> $LOG_FILE

# 磁盘使用率
echo "磁盘使用率:" >> $LOG_FILE
df -h >> $LOG_FILE

# 网络连接
echo "网络连接:" >> $LOG_FILE
ss -tuln >> $LOG_FILE

# PM2 状态
echo "PM2 状态:" >> $LOG_FILE
pm2 status >> $LOG_FILE

echo "==========================================" >> $LOG_FILE
```

```bash
# 设置执行权限
chmod +x /home/smsguide/monitor.sh

# 添加定时任务（每小时执行一次）
crontab -e

# 添加以下行
0 * * * * /home/smsguide/monitor.sh
```

### 2. 日志管理

#### 配置日志轮转

```bash
# 创建日志轮转配置
sudo nano /etc/logrotate.d/sms-guide
```

```
/home/smsguide/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 smsguide smsguide
}
```

### 3. 自动更新

#### 创建更新脚本

```bash
# 创建更新脚本
nano /home/smsguide/update.sh
```

```bash
#!/bin/bash

# 自动更新脚本
PROJECT_DIR="/home/smsguide/sms315"
LOG_FILE="/home/smsguide/logs/update.log"

echo "=== 开始更新 $(date) ===" >> $LOG_FILE

cd $PROJECT_DIR

# 拉取最新代码
git pull origin main >> $LOG_FILE 2>&1

# 安装依赖
npm install >> $LOG_FILE 2>&1

# 构建项目
npm run build >> $LOG_FILE 2>&1

# 重启应用
pm2 restart sms-guide >> $LOG_FILE 2>&1

echo "=== 更新完成 $(date) ===" >> $LOG_FILE
```

```bash
# 设置执行权限
chmod +x /home/smsguide/update.sh

# 手动执行更新
./update.sh
```

## 🚨 故障排除

### 常见问题和解决方案

#### 1. 应用无法启动

```bash
# 检查 PM2 状态
pm2 status
pm2 logs sms-guide

# 检查端口占用
sudo netstat -tlnp | grep :3000

# 重启应用
pm2 restart sms-guide
```

#### 2. Nginx 配置错误

```bash
# 测试 Nginx 配置
sudo nginx -t

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 重启 Nginx
sudo systemctl restart nginx
```

#### 3. SSL 证书问题

```bash
# 检查证书状态
sudo certbot certificates

# 手动续期
sudo certbot renew

# 测试 SSL 配置
openssl s_client -connect your-domain.com:443
```

#### 4. 数据库连接问题

```bash
# 检查 PostgreSQL 状态
sudo systemctl status postgresql

# 测试数据库连接
psql -h localhost -U smsguide -d sms_guide

# 查看数据库日志
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### 性能优化

#### 1. Nginx 优化

```nginx
# 在 /etc/nginx/nginx.conf 中添加
worker_processes auto;
worker_connections 1024;

# 启用 HTTP/2
listen 443 ssl http2;

# 启用 Brotli 压缩（如果支持）
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

#### 2. PM2 优化

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'sms-guide',
    script: 'npx',
    args: 'serve -s dist -l 3000',
    instances: 'max', // 使用所有CPU核心
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

## 📞 技术支持

### 获取帮助

1. **官方文档**
   - [Nginx 文档](https://nginx.org/en/docs/)
   - [PM2 文档](https://pm2.keymetrics.io/docs/)
   - [Let's Encrypt 文档](https://letsencrypt.org/docs/)

2. **社区支持**
   - [DigitalOcean 社区](https://www.digitalocean.com/community)
   - [Stack Overflow](https://stackoverflow.com/)
   - [GitHub Issues](https://github.com/lookoupai/sms315/issues)

3. **紧急联系**
   - 检查服务器提供商状态页面
   - 查看系统日志：`journalctl -xe`
   - 联系服务器提供商技术支持

### 维护检查清单

#### 每日检查
- [ ] 检查应用运行状态：`pm2 status`
- [ ] 查看系统资源使用：`htop`
- [ ] 检查磁盘空间：`df -h`

#### 每周检查
- [ ] 更新系统包：`sudo apt update && sudo apt upgrade`
- [ ] 检查备份文件
- [ ] 查看安全日志：`sudo tail /var/log/auth.log`

#### 每月检查
- [ ] 更新 SSL 证书：`sudo certbot renew`
- [ ] 清理日志文件
- [ ] 检查防火墙规则
- [ ] 更新应用代码

---

**🎉 完成 VPS 部署后，你将拥有一个完全自主控制的 SMS 避坑指南平台！**

**优势：**
- ✅ 完全控制服务器环境
- ✅ 可自定义配置和优化
- ✅ 数据完全掌控
- ✅ 成本可控且透明
- ✅ 可扩展性强

**注意：** VPS 部署需要一定的 Linux 运维知识，建议先在测试环境练习。