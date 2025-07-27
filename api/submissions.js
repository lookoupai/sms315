// Vercel Serverless Function for handling submissions
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    if (req.method === 'GET') {
      // 获取提交记录
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          websites(name, url),
          countries(name, code),
          projects(name, code)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      return res.status(200).json({ data })
    }

    if (req.method === 'POST') {
      const { website_id, country_id, project_id, result, note } = req.body

      // 简单的IP限制检查
      const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress
      
      // 检查IP提交频率（简化版）
      const { data: recentSubmissions } = await supabase
        .from('submissions')
        .select('*')
        .eq('ip_address', clientIP)
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // 1小时内

      if (recentSubmissions && recentSubmissions.length >= 10) {
        return res.status(429).json({ error: '提交过于频繁，请稍后再试' })
      }

      // 插入新记录
      const { data, error } = await supabase
        .from('submissions')
        .insert([
          {
            website_id,
            country_id,
            project_id,
            result,
            note,
            ip_address: clientIP
          }
        ])
        .select()

      if (error) throw error

      return res.status(201).json({ data })
    }

    return res.status(405).json({ error: '方法不允许' })
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: '服务器错误' })
  }
}