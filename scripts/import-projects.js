// 项目数据批量导入脚本
import { createClient } from '@supabase/supabase-js'
import { SMS_ACTIVATE_PROJECTS } from '../src/data/projects.js'

// Supabase 配置
const supabaseUrl = 'https://ptgfnwftmjdmuclndqmc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Z2Zud2Z0bWpkbXVjbG5kcW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MTM2MzMsImV4cCI6MjA2OTA4OTYzM30.-3ug0wxcAv7M5qY-CdP_VcDcL4DJRXexvevcHGMmVKA'

const supabase = createClient(supabaseUrl, supabaseKey)

// 分批导入函数
async function importProjectsInBatches() {
  console.log(`开始导入 ${SMS_ACTIVATE_PROJECTS.length} 个项目...`)
  
  const batchSize = 50 // 每批50个项目
  const totalBatches = Math.ceil(SMS_ACTIVATE_PROJECTS.length / batchSize)
  
  for (let i = 0; i < totalBatches; i++) {
    const start = i * batchSize
    const end = Math.min(start + batchSize, SMS_ACTIVATE_PROJECTS.length)
    const batch = SMS_ACTIVATE_PROJECTS.slice(start, end)
    
    console.log(`正在导入第 ${i + 1}/${totalBatches} 批 (${start + 1}-${end})...`)
    
    try {
      // 准备批量数据
      const projectsData = batch.map(project => ({
        name: project.name,
        code: project.code,
        sms_activate_id: project.id,
        is_popular: isPopularProject(project.code),
        category: getProjectCategory(project.name, project.code)
      }))
      
      // 批量插入
      const { data, error } = await supabase
        .from('projects')
        .upsert(projectsData, {
          onConflict: 'code',
          ignoreDuplicates: false
        })
      
      if (error) {
        console.error(`第 ${i + 1} 批导入失败:`, error)
      } else {
        console.log(`✅ 第 ${i + 1} 批导入成功 (${batch.length} 个项目)`)
      }
      
      // 避免请求过于频繁，稍作延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
    } catch (error) {
      console.error(`第 ${i + 1} 批导入异常:`, error)
    }
  }
  
  console.log('🎉 所有项目导入完成！')
}

// 判断是否为热门项目
function isPopularProject(code) {
  const popularCodes = [
    'tg', 'ig', 'go', 'fb', 'tw', 'wa', 'tk', 'wc', 'qq', 'wb', 'ap', 
    'tb', 'jd', 'pdd', 'bl', 'xhs', 'ks', 'mt', 'elm', 'dd', 'am', 
    'apl', 'pp', 'oa', 'ln', 'ub', 'ab', 'nf', 'sp', 'st', 'pg'
  ]
  return popularCodes.includes(code)
}

// 获取项目分类
function getProjectCategory(name, code) {
  if (name.includes('微信') || name.includes('QQ') || name.includes('Telegram') || 
      name.includes('WhatsApp') || name.includes('Discord') || name.includes('LINE')) {
    return '通讯工具'
  }
  
  if (name.includes('Instagram') || name.includes('Facebook') || name.includes('Twitter') || 
      name.includes('Tiktok') || name.includes('微博') || name.includes('小红书')) {
    return '社交媒体'
  }
  
  if (name.includes('淘宝') || name.includes('京东') || name.includes('拼多多') || 
      name.includes('Amazon') || name.includes('Shopee') || name.includes('eBay')) {
    return '电商购物'
  }
  
  if (name.includes('支付宝') || name.includes('Paypal') || name.includes('微信支付') || 
      name.includes('Coinbase') || name.includes('OKX')) {
    return '金融支付'
  }
  
  if (name.includes('Steam') || name.includes('PUBG') || name.includes('Roblox') || 
      name.includes('Nintendo') || name.includes('米哈游')) {
    return '游戏平台'
  }
  
  if (name.includes('美团') || name.includes('饿了么') || name.includes('滴滴') || 
      name.includes('Uber') || name.includes('Grab')) {
    return '生活服务'
  }
  
  if (name.includes('Gmail') || name.includes('Yahoo') || name.includes('Outlook') || 
      name.includes('Hotmail')) {
    return '邮箱服务'
  }
  
  if (name.includes('Tinder') || name.includes('Bumble') || name.includes('探探') || 
      name.includes('陌陌')) {
    return '约会交友'
  }
  
  if (name.includes('哔哩哔哩') || name.includes('YouTube') || name.includes('爱奇艺') || 
      name.includes('Netflix')) {
    return '视频娱乐'
  }
  
  return '其他应用'
}

// 执行导入
importProjectsInBatches().catch(console.error)