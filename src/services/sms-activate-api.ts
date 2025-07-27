// SMS-Activate 数据服务
// 注意：项目现在使用手动导入的静态数据，不再通过API实时更新

import { SMS_ACTIVATE_COUNTRIES } from '../data/countries'
import { SMS_ACTIVATE_PROJECTS } from '../data/projects'

// 获取本地国家数据（用于前端显示）
export function getLocalCountries(): Array<{name: string, code: string, id: number, phone_code?: string}> {
  console.log(`📋 使用本地国家数据，共 ${SMS_ACTIVATE_COUNTRIES.length} 个国家`)
  return SMS_ACTIVATE_COUNTRIES
}

// 获取本地项目数据（用于前端显示）
export function getLocalProjects(): Array<{name: string, code: string, id: number}> {
  console.log(`📋 使用本地项目数据，共 ${SMS_ACTIVATE_PROJECTS.length} 个项目`)
  return SMS_ACTIVATE_PROJECTS
}
