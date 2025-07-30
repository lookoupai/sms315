-- SMS 避坑指南 - 链接替换功能数据库设置脚本
-- 请在 Supabase SQL Editor 中执行此脚本

-- 1. 创建链接替换表
CREATE TABLE IF NOT EXISTS link_replacements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_url TEXT NOT NULL UNIQUE,
  replacement_url TEXT NOT NULL,
  match_type VARCHAR(20) DEFAULT 'exact' CHECK (match_type IN ('exact', 'domain', 'contains')),
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_link_replacements_active ON link_replacements(is_active);
CREATE INDEX IF NOT EXISTS idx_link_replacements_original_url ON link_replacements(original_url);
CREATE INDEX IF NOT EXISTS idx_link_replacements_match_type ON link_replacements(match_type);

-- 3. 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. 创建触发器
DROP TRIGGER IF EXISTS update_link_replacements_updated_at ON link_replacements;
CREATE TRIGGER update_link_replacements_updated_at 
    BEFORE UPDATE ON link_replacements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. 插入示例数据（可选）
INSERT INTO link_replacements (original_url, replacement_url, match_type, description, is_active) VALUES
('https://sms-activate.io', 'https://sms-activate.io/?ref=486565', 'exact', 'SMS-Activate 推广链接 - 精确匹配', true),
('sms-activate.io', 'https://sms-activate.io/?ref=486565', 'domain', 'SMS-Activate 推广链接 - 域名匹配', true)
ON CONFLICT (original_url) DO NOTHING;

-- 6. 设置 RLS (Row Level Security) 策略
ALTER TABLE link_replacements ENABLE ROW LEVEL SECURITY;

-- 允许所有用户读取活跃的替换规则
CREATE POLICY IF NOT EXISTS "Allow read active link replacements" ON link_replacements
    FOR SELECT USING (is_active = true);

-- 只允许认证用户管理替换规则（需要根据实际认证方式调整）
CREATE POLICY IF NOT EXISTS "Allow admin manage link replacements" ON link_replacements
    FOR ALL USING (true); -- 这里需要根据实际的管理员认证逻辑调整

-- 7. 验证表创建成功
SELECT 
    'link_replacements 表创建成功' as status,
    COUNT(*) as total_rules,
    COUNT(*) FILTER (WHERE is_active = true) as active_rules
FROM link_replacements;

-- 8. 显示表结构
\d link_replacements;

-- 完成提示
SELECT '🎉 链接替换功能数据库设置完成！' as message;