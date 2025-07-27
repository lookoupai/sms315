import React, { useState, useEffect } from 'react'
import { Alert, AlertDescription } from './ui/alert'
import { Badge } from './ui/badge'
import { AlertTriangle, Shield, Info, TrendingUp } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { RiskCombination } from '../lib/supabase'

interface RiskWarningProps {
  websiteId?: string
  countryId?: string
  projectId?: string
  className?: string
}

const RiskWarning: React.FC<RiskWarningProps> = ({
  websiteId,
  countryId,
  projectId,
  className
}) => {
  const [riskData, setRiskData] = useState<RiskCombination | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (websiteId && countryId && projectId) {
      checkRiskLevel()
    } else {
      setRiskData(null)
    }
  }, [websiteId, countryId, projectId])

  const checkRiskLevel = async () => {
    if (!websiteId || !countryId || !projectId) return

    setLoading(true)
    try {
      // 查询该组合的历史记录
      const { data: submissions, error } = await supabase
        .from('submissions')
        .select(`
          result,
          created_at,
          website:websites(name),
          country:countries(name),
          project:projects(name)
        `)
        .eq('website_id', websiteId)
        .eq('country_id', countryId)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (submissions && submissions.length > 0) {
        const failureCount = submissions.filter(s => s.result === 'failure').length
        const successCount = submissions.filter(s => s.result === 'success').length
        const totalCount = submissions.length
        const failureRate = totalCount > 0 ? (failureCount / totalCount) * 100 : 0

        // 获取最近的失败记录
        const lastFailure = submissions.find(s => s.result === 'failure')

        let riskLevel: 'low' | 'medium' | 'high' = 'low'
        if (failureRate >= 80) riskLevel = 'high'
        else if (failureRate >= 50) riskLevel = 'medium'

        // 如果最近7天内有失败记录，提升风险等级
        if (lastFailure) {
          const daysSinceLastFailure = Math.floor(
            (Date.now() - new Date(lastFailure.created_at).getTime()) / (1000 * 60 * 60 * 24)
          )
          if (daysSinceLastFailure <= 7 && riskLevel === 'low') {
            riskLevel = 'medium'
          }
        }

        setRiskData({
          website_name: (submissions[0].website as any)?.name || '',
          country_name: (submissions[0].country as any)?.name || '',
          project_name: (submissions[0].project as any)?.name || '',
          failure_count: failureCount,
          success_count: successCount,
          failure_rate: failureRate,
          last_failure_date: lastFailure?.created_at || '',
          risk_level: riskLevel
        })
      } else {
        setRiskData(null)
      }
    } catch (error) {
      console.error('检查风险等级失败:', error)
      setRiskData(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-100 rounded-lg p-4 ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    )
  }

  if (!riskData) return null

  const getRiskConfig = (level: string) => {
    switch (level) {
      case 'high':
        return {
          icon: AlertTriangle,
          color: 'destructive',
          bgColor: 'bg-red-50 border-red-200',
          textColor: 'text-red-800',
          title: '⚠️ 高风险警告',
          description: '该组合失败率很高，建议谨慎使用或寻找替代方案'
        }
      case 'medium':
        return {
          icon: Shield,
          color: 'secondary',
          bgColor: 'bg-yellow-50 border-yellow-200',
          textColor: 'text-yellow-800',
          title: '⚡ 中等风险提醒',
          description: '该组合有一定失败风险，请注意相关问题'
        }
      default:
        return {
          icon: Info,
          color: 'default',
          bgColor: 'bg-blue-50 border-blue-200',
          textColor: 'text-blue-800',
          title: '💡 使用提示',
          description: '该组合相对安全，但仍建议关注最新动态'
        }
    }
  }

  const config = getRiskConfig(riskData.risk_level)
  const Icon = config.icon

  return (
    <Alert className={`${config.bgColor} ${className}`}>
      <Icon className="h-4 w-4" />
      <AlertDescription className={config.textColor}>
        <div className="space-y-2">
          <div className="font-medium">{config.title}</div>
          <div className="text-sm">{config.description}</div>
          
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline" className="bg-white">
              <TrendingUp className="h-3 w-3 mr-1" />
              失败率: {riskData.failure_rate.toFixed(1)}%
            </Badge>
            <Badge variant="outline" className="bg-white">
              失败: {riskData.failure_count}次
            </Badge>
            <Badge variant="outline" className="bg-white">
              成功: {riskData.success_count}次
            </Badge>
            {riskData.last_failure_date && (
              <Badge variant="outline" className="bg-white">
                最近失败: {new Date(riskData.last_failure_date).toLocaleDateString('zh-CN')}
              </Badge>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}

export default RiskWarning