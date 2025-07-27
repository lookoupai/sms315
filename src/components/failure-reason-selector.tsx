import React, { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { AlertTriangle, Wifi, Server, Shield, HelpCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { FailureReason } from '../lib/supabase'

interface FailureReasonSelectorProps {
  value?: string
  onChange: (reasonId: string) => void
  className?: string
}

const FailureReasonSelector: React.FC<FailureReasonSelectorProps> = ({
  value,
  onChange,
  className
}) => {
  const [reasons, setReasons] = useState<FailureReason[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFailureReasons()
  }, [])

  const loadFailureReasons = async () => {
    try {
      const { data, error } = await supabase
        .from('failure_reasons')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error
      setReasons(data || [])
    } catch (error) {
      console.error('加载失败原因失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <Wifi className="h-4 w-4" />
      case 'service': return <Server className="h-4 w-4" />
      case 'policy': return <Shield className="h-4 w-4" />
      default: return <HelpCircle className="h-4 w-4" />
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'technical': return '技术问题'
      case 'service': return '服务问题'
      case 'policy': return '政策限制'
      default: return '其他问题'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-blue-100 text-blue-800'
      case 'service': return 'bg-orange-100 text-orange-800'
      case 'policy': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <SelectValue placeholder="加载中..." />
        </SelectTrigger>
      </Select>
    )
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="选择失败原因（可选）" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">不选择原因</SelectItem>
        {Object.entries(
          reasons.reduce((acc, reason) => {
            if (!acc[reason.category]) acc[reason.category] = []
            acc[reason.category].push(reason)
            return acc
          }, {} as Record<string, FailureReason[]>)
        ).map(([category, categoryReasons]) => (
          <div key={category}>
            <div className="px-2 py-1.5 text-sm font-medium text-gray-500 flex items-center space-x-2">
              {getCategoryIcon(category)}
              <span>{getCategoryName(category)}</span>
            </div>
            {categoryReasons.map(reason => (
              <SelectItem key={reason.id} value={reason.id} className="pl-8">
                <div className="flex items-center justify-between w-full">
                  <span>{reason.name}</span>
                  <Badge className={`ml-2 text-xs ${getCategoryColor(category)}`}>
                    {getCategoryName(category)}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </div>
        ))}
      </SelectContent>
    </Select>
  )
}

export default FailureReasonSelector