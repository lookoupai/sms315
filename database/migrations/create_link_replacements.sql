-- 创建链接替换表
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

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_link_replacements_active ON link_replacements(is_active);
CREATE INDEX IF NOT EXISTS idx_link_replacements_original_url ON link_replacements(original_url);

-- 插入示例数据
INSERT INTO link_replacements (original_url, replacement_url, match_type, description) VALUES
('https://sms-activate.io', 'https://sms-activate.io/?ref=486565', 'exact', 'SMS-Activate 推广链接'),
('sms-activate.io', 'https://sms-activate.io/?ref=486565', 'domain', 'SMS-Activate 域名匹配')
ON CONFLICT (original_url) DO NOTHING;

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_link_replacements_updated_at 
    BEFORE UPDATE ON link_replacements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();