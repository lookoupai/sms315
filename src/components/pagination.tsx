import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showInfo?: boolean
  totalItems?: number
  itemsPerPage?: number
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  showInfo = true,
  totalItems = 0,
  itemsPerPage = 20
}: PaginationProps) {
  const { t } = useTranslation()
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  // 生成页码数组
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5 // 最多显示5个页码

    if (totalPages <= maxVisible) {
      // 如果总页数不超过最大显示数，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 复杂的页码显示逻辑
      if (currentPage <= 3) {
        // 当前页在前面
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // 当前页在后面
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // 当前页在中间
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
      {showInfo && (
        <div className="text-sm text-gray-700 order-2 sm:order-1">
          {t('pagination.showing')} <span className="font-medium">{startItem}</span> {t('pagination.to')}{' '}
          <span className="font-medium">{endItem}</span> {t('pagination.of')}{' '}
          <span className="font-medium">{totalItems}</span> {t('pagination.records')}
        </div>
      )}
      
      <div className="flex items-center space-x-1 order-1 sm:order-2">
        {/* 第一页 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="hidden sm:flex"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        
        {/* 上一页 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">{t('pagination.previous')}</span>
        </Button>

        {/* 页码 */}
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-gray-500">...</span>
              ) : (
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className="min-w-[40px]"
                >
                  {page}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* 下一页 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <span className="hidden sm:inline mr-1">{t('pagination.next')}</span>
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* 最后一页 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="hidden sm:flex"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}