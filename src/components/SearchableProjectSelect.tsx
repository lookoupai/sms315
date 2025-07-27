import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import type { Project } from '../lib/supabase'

interface SearchableProjectSelectProps {
  projects: Project[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
}

export default function SearchableProjectSelect({
  projects,
  value,
  onValueChange,
  placeholder = "请选择项目"
}: SearchableProjectSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // 获取选中的项目信息
  const selectedProject = projects.find(project => project.id === value)

  // 过滤项目列表 - 智能搜索逻辑
  useEffect(() => {
    if (!searchTerm) {
      setFilteredProjects(projects)
    } else {
      const searchLower = searchTerm.toLowerCase()
      
      // 如果是纯数字搜索，优先匹配项目中的数字内容
      if (/^\d+$/.test(searchTerm)) {
        const filtered = projects.filter(project => {
          // 优先匹配项目名称或代码中包含该数字的项目
          return project.name.includes(searchTerm) ||
                 (project.code && project.code.includes(searchTerm))
        })
        setFilteredProjects(filtered)
      }
      // 普通文本搜索
      else {
        const filtered = projects.filter(project =>
          project.name.toLowerCase().includes(searchLower) ||
          (project.code && project.code.toLowerCase().includes(searchLower))
        )
        setFilteredProjects(filtered)
      }
    }
  }, [searchTerm, projects])

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

  const handleSelect = (project: Project) => {
    onValueChange(project.id)
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
        <span className={selectedProject ? "text-gray-900" : "text-gray-500"}>
          {selectedProject 
            ? selectedProject.name
            : placeholder
          }
        </span>
        <div className="flex items-center gap-1">
          {selectedProject && (
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
              placeholder="搜索项目名称或代码（纯数字优先匹配项目）..."
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
            {filteredProjects.length > 0 ? (
              <>
                {filteredProjects.map(project => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => handleSelect(project)}
                    className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 text-left"
                  >
                    <span className="flex-1">
                      {project.name}
                    </span>
                    {value === project.id && (
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
                  <span className="flex-1">🚀 自定义项目</span>
                  {value === 'custom' && (
                    <span className="absolute right-2 h-3.5 w-3.5">✓</span>
                  )}
                </button>
              </>
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                没有找到匹配的项目
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}