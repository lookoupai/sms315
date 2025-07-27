import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import type { Country } from '../lib/supabase'

interface SearchableCountrySelectProps {
  countries: Country[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
}

export default function SearchableCountrySelect({
  countries,
  value,
  onValueChange,
  placeholder = "请选择国家"
}: SearchableCountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCountries, setFilteredCountries] = useState<Country[]>(countries)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // 获取选中的国家信息
  const selectedCountry = countries.find(country => country.id === value)

  // 过滤国家列表 - 智能搜索逻辑
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCountries(countries)
    } else {
      const searchLower = searchTerm.toLowerCase()
      
      // 如果搜索内容包含+号，优先匹配区号
      if (searchTerm.includes('+')) {
        const filtered = countries.filter(country =>
          country.phone_code && country.phone_code.includes(searchTerm)
        )
        setFilteredCountries(filtered)
      } 
      // 如果是纯数字搜索，优先匹配区号数字部分
      else if (/^\d+$/.test(searchTerm)) {
        const filtered = countries.filter(country => {
          // 优先匹配区号中的数字（去掉+号）
          const phoneCodeNumber = country.phone_code?.replace('+', '')
          return phoneCodeNumber && phoneCodeNumber.includes(searchTerm)
        })
        
        // 如果没有匹配的区号，再搜索国家名称和代码
        if (filtered.length === 0) {
          const fallbackFiltered = countries.filter(country =>
            country.name.toLowerCase().includes(searchLower) ||
            country.code.toLowerCase().includes(searchLower)
          )
          setFilteredCountries(fallbackFiltered)
        } else {
          setFilteredCountries(filtered)
        }
      }
      // 普通文本搜索
      else {
        const filtered = countries.filter(country =>
          country.name.toLowerCase().includes(searchLower) ||
          country.code.toLowerCase().includes(searchLower) ||
          (country.phone_code && country.phone_code.includes(searchTerm))
        )
        setFilteredCountries(filtered)
      }
    }
  }, [searchTerm, countries])

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

  const handleSelect = (country: Country) => {
    onValueChange(country.id)
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
        <span className={selectedCountry ? "text-gray-900" : "text-gray-500"}>
          {selectedCountry 
            ? `${selectedCountry.name} (${selectedCountry.code})${selectedCountry.phone_code ? ` ${selectedCountry.phone_code}` : ''}`
            : placeholder
          }
        </span>
        <div className="flex items-center gap-1">
          {selectedCountry && (
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
              placeholder="搜索国家名称、代码或区号（+86匹配区号，86匹配数字）..."
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
            {filteredCountries.length > 0 ? (
              <>
                {filteredCountries.map(country => (
                  <button
                    key={country.id}
                    type="button"
                    onClick={() => handleSelect(country)}
                    className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 text-left"
                  >
                    <span className="flex-1">
                      {country.name} ({country.code}){country.phone_code ? ` ${country.phone_code}` : ''}
                    </span>
                    {value === country.id && (
                      <span className="absolute right-2 h-3.5 w-3.5">✓</span>
                    )}
                  </button>
                ))}
              </>
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                没有找到匹配的国家
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}