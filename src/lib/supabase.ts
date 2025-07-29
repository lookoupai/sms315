import { createClient } from '@supabase/supabase-js'

// 使用环境变量配置 Supabase，提高安全性
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ptgfnwftmjdmuclndqmc.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Z2Zud2Z0bWpkbXVjbG5kcW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MTM2MzMsImV4cCI6MjA2OTA4OTYzM30.-3ug0wxcAv7M5qY-CdP_VcDcL4DJRXexvevcHGMmVKA'

export const supabase = createClient(supabaseUrl, supabaseKey)

// 数据库表类型定义
export interface Website {
  id: string
  name: string
  url: string
  status: 'active' | 'inactive' | 'discontinued' | 'pending' | 'personal'
  created_at: string
  risk_level?: 'low' | 'medium' | 'high' // 新增：风险等级
  warning_message?: string // 新增：警告信息
}

export interface Country {
  id: string
  name: string
  code: string
  phone_code: string
  created_at: string
  risk_level?: 'low' | 'medium' | 'high' // 新增：风险等级
}

export interface Project {
  id: string
  name: string
  code: string
  created_at: string
  risk_level?: 'low' | 'medium' | 'high' // 新增：风险等级
}

// 新增：失败原因类型
export interface FailureReason {
  id: string
  name: string
  description: string
  category: 'technical' | 'service' | 'policy' | 'other'
  created_at: string
}

export interface Submission {
  id: string
  website_id: string
  country_id: string
  project_id: string
  result: 'success' | 'failure'
  note?: string
  created_at: string
  website?: Website
  country?: Country
  project?: Project
  failure_reason_id?: string // 新增：失败原因ID
  failure_reason?: FailureReason // 新增：失败原因详情
  helpful_votes?: number // 新增：有用投票数
  unhelpful_votes?: number // 新增：无用投票数
}

// 新增：用户投票记录
export interface UserVote {
  id: string
  submission_id: string
  vote_type: 'helpful' | 'unhelpful'
  user_ip: string
  created_at: string
}

// 新增：风险组合统计
export interface RiskCombination {
  website_name: string
  country_name: string
  project_name: string
  failure_count: number
  success_count: number
  failure_rate: number
  last_failure_date: string
  risk_level: 'low' | 'medium' | 'high'
}