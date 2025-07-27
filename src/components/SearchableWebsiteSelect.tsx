import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import type { Website } from '../lib/supabase'

interface SearchableWebsiteSelectProps {
  websites: Website[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
}

export default function SearchableWebsiteSelect({
  websites,
  value,
  onValueChange,
  placeholder = "请选择网站"
}: SearchableWebsiteSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredWebsites, setFilteredWebsites] = useState<Website[]>(websites)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // 获取选中的网站信息
  const selectedWebsite = websites.find(website => website.id === value)

  // 过滤网站列表
  useEffect(() => {
    if (!searchTerm) {
      setFilteredWebsites(websites)
    } else {
      const filtered = websites.filter(website =>
        website.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        website.url.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredWebsites(filtered)
    }
  }, [searchTerm, websites])

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 打开下拉框时聚焦搜索框
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (website: Website) => {
    onValueChange(website.id)
    setIsOpen(false)
    setSearchTerm('')
  }

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation()
    onValueChange('')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:border-gray-400"
      >
        <span className={selectedWebsite ? "text-gray-900" : "text-gray-500"}>
          {selectedWebsite 
            ? `${selectedWebsite.name} (${selectedWebsite.url})`
            : placeholder
          }
        </span>
        <div className="flex items-center gap-1">
          {selectedWebsite && (
            <X 
              className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer" 
              onClick={clearSelection}
            />
          )}
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* 下拉框 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
          {/* 搜索框 */}
          <div className="flex items-center border-b px-3 py-2">
            <Search className="h-4 w-4 text-gray-400 mr-2" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="搜索网站名称或网址..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
            {searchTerm && (
              <X 
                className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer ml-2" 
                onClick={() => setSearchTerm('')}
              />
            )}
          </div>

          {/* 选项列表 */}
          <div className="max-h-48 overflow-auto">
            {filteredWebsites.length > 0 ? (
              <>
                {filteredWebsites.map(website => (
                  <button
                    key={website.id}
                    type="button"
                    onClick={() => handleSelect(website)}
                    className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 text-left"
                  >
                    <span className="flex-1">
                      {website.name} ({website.url})
                    </span>
                    {value === website.id && (
                      <span className="absolute right-2 h-3.5 w-3.5">✓</span>
                    )}
                  </button>
                ))}
                
                {/* 自定义选项 */}
                <button
                  type="button"
                  onClick={() => {
                    onValueChange('custom')
                    setIsOpen(false)
                    setSearchTerm('')
                  }}
                  className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 text-left border-t border-gray-200"
                >
                  <span className="flex-1">🔧 自定义网站</span>
                  {value === 'custom' && (
                    <span className="absolute right-2 h-3.5 w-3.5">✓</span>
                  )}
                </button>
              </>
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                没有找到匹配的网站
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}