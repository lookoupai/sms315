import React, { memo } from 'react'
import { useOptimizedTextReplacement, useOptimizedUrlReplacement } from '../hooks/useLinkReplacement'

// 文本链接替换组件 - 使用 memo 优化性能
interface TextLinkReplacerProps {
  children: string
  className?: string
}

export const TextLinkReplacer = memo<TextLinkReplacerProps>(({ children, className }) => {
  const replacedText = useOptimizedTextReplacement(children)
  
  return (
    <span className={className} dangerouslySetInnerHTML={{ __html: replacedText }} />
  )
})

TextLinkReplacer.displayName = 'TextLinkReplacer'

// URL链接替换组件 - 用于 <a> 标签
interface UrlLinkReplacerProps {
  href: string
  children: React.ReactNode
  className?: string
  target?: string
  rel?: string
}

export const UrlLinkReplacer = memo<UrlLinkReplacerProps>(({ 
  href, 
  children, 
  className, 
  target = '_blank',
  rel = 'nofollow noopener noreferrer',
  ...props 
}) => {
  const replacedUrl = useOptimizedUrlReplacement(href)
  
  return (
    <a 
      href={replacedUrl} 
      className={className}
      target={target}
      rel={rel}
      {...props}
    >
      {children}
    </a>
  )
})

UrlLinkReplacer.displayName = 'UrlLinkReplacer'

// 智能链接替换组件 - 自动检测文本中的链接并替换
interface SmartLinkReplacerProps {
  children: string
  className?: string
}

export const SmartLinkReplacer = memo<SmartLinkReplacerProps>(({ children, className }) => {
  const replacedText = useOptimizedTextReplacement(children)
  
  // 将文本中的URL转换为可点击的链接
  const processedText = replacedText.replace(
    /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/gi,
    '<a href="$1" target="_blank" rel="nofollow noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>'
  )
  
  return (
    <span 
      className={className} 
      dangerouslySetInnerHTML={{ __html: processedText }} 
    />
  )
})

SmartLinkReplacer.displayName = 'SmartLinkReplacer'

// 条件链接替换组件 - 只在有替换规则时才处理
interface ConditionalLinkReplacerProps {
  children: string
  className?: string
  fallback?: React.ComponentType<{ children: string; className?: string }>
}

export const ConditionalLinkReplacer = memo<ConditionalLinkReplacerProps>(({ 
  children, 
  className, 
  fallback: Fallback 
}) => {
  const replacedText = useOptimizedTextReplacement(children)
  
  // 如果没有发生替换，使用fallback组件或直接显示文本
  if (replacedText === children) {
    if (Fallback) {
      return <Fallback className={className}>{children}</Fallback>
    }
    return <span className={className}>{children}</span>
  }
  
  return (
    <span className={className} dangerouslySetInnerHTML={{ __html: replacedText }} />
  )
})

ConditionalLinkReplacer.displayName = 'ConditionalLinkReplacer'