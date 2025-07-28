import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Option {
  value: string
  label: string
}

interface SearchableSelectProps {
  options: Option[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  className?: string
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "选择选项",
  searchPlaceholder = "搜索...",
  className
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 过滤选项
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.value.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 获取当前选中项的标签
  const selectedOption = options.find(option => option.value === value)
  const selectedLabel = selectedOption ? selectedOption.label : placeholder

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

  // 打开下拉框时聚焦搜索输入框
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        className="w-full justify-between min-h-[44px] text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={cn(
          "truncate",
          !selectedOption && "text-muted-foreground"
        )}>
          {selectedLabel}
        </span>
        <ChevronDown className={cn(
          "ml-2 h-4 w-4 shrink-0 transition-transform",
          isOpen && "rotate-180"
        )} />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-hidden">
          {/* 搜索输入框 */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                ref={inputRef}
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
          </div>

          {/* 选项列表 */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                没有找到匹配的选项
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between",
                    value === option.value && "bg-blue-50 text-blue-600"
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {value === option.value && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}