import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Plus, User, AlertTriangle } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import type { Website } from '../lib/supabase'

interface SearchableWebsiteSelectProps {
  websites: Website[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  includePersonal?: boolean
  includeScammer?: boolean
}

export default function SearchableWebsiteSelect({
  websites,
  value,
  onValueChange,
  placeholder = "请选择网站",
  includePersonal = false,
  includeScammer = false
}: SearchableWebsiteSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 过滤网站列表
  const filteredWebsites = websites.filter(website => {
    const matchesSearch = website.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         website.url.toLowerCase().includes(searchTerm.toLowerCase())
    
    // 根据筛选条件过滤
    if (!includePersonal && website.status === 'personal') {
      return false
    }
    
    if (!includeScammer && website.status === 'scammer') {
      return false
    }
    
    return matchesSearch
  })

  // 获取选中的网站信息
  const selectedWebsite = websites.find(w => w.id === value)

  // 点击外部关闭下拉框
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (websiteId: string) => {
    onValueChange(websiteId)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 选择按钮 */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between h-12 px-4 text-left font-normal"
      >
        <span className="flex items-center gap-2">
          {selectedWebsite ? (
            <>
              {selectedWebsite.status === 'personal' && (
                <User className="h-4 w-4 text-blue-600" />
              )}
              {selectedWebsite.status === 'scammer' && (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <span className="truncate">{selectedWebsite.name}</span>
              {selectedWebsite.status === 'personal' && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">个人</span>
              )}
              {selectedWebsite.status === 'scammer' && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">骗子</span>
              )}
            </>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* 下拉框 */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-hidden">
          {/* 搜索框 */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索网站名称或网址..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
                autoFocus
              />
            </div>
          </div>

          {/* 选项列表 */}
          <div className="max-h-60 overflow-y-auto">
            {filteredWebsites.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                没有找到匹配的网站
              </div>
            ) : (
              <>
                {filteredWebsites.map((website) => (
                  <button
                    key={website.id}
                    type="button"
                    onClick={() => handleSelect(website.id)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                      value === website.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {website.status === 'personal' && (
                          <User className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        )}
                        {website.status === 'scammer' && (
                          <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{website.name}</div>
                          <div className="text-xs text-gray-500 truncate">{website.url}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {website.status === 'personal' && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex-shrink-0">
                            个人
                          </span>
                        )}
                        {website.status === 'scammer' && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded flex-shrink-0">
                            骗子
                          </span>
                        )}
                        {website.status === 'pending' && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded flex-shrink-0">
                            待审核
                          </span>
                        )}
                        {website.status === 'inactive' && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex-shrink-0">
                            维护中
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </>
            )}

            {/* 自定义选项 */}
            <button
              type="button"
              onClick={() => handleSelect('custom')}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-t border-gray-200 ${
                value === 'custom' ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-green-600" />
                <div>
                  <div className="font-medium">添加新网站</div>
                  <div className="text-xs text-gray-500">没有找到？添加新的接码网站</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}