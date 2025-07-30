import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Link, TestTube, CheckCircle, AlertCircle } from 'lucide-react'
import { 
  UrlLinkReplacer, 
  SmartLinkReplacer, 
  ConditionalLinkReplacer 
} from '../components/link-replacer'
import { useLinkReplacement } from '../hooks/useLinkReplacement'

export default function TestLinkReplacementPage() {
  const { loading, error, hasReplacements, refresh } = useLinkReplacement()

  // 测试数据
  const testTexts = [
    "我在 https://sms-activate.io 上接码失败了",
    "推荐使用 sms-activate.io 这个网站",
    "访问 https://sms-activate.io/pricing 查看价格",
    "这个网站 https://example.com 没有配置替换规则"
  ]

  const testUrls = [
    "https://sms-activate.io",
    "https://sms-activate.io/pricing",
    "https://example.com",
    "sms-activate.io"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TestTube className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              链接替换测试页面
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            测试和验证链接替换功能是否正常工作
          </p>
        </div>

        {/* 状态信息 */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              系统状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                ) : hasReplacements ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                )}
                <span className="text-sm">
                  {loading ? '加载中...' : hasReplacements ? '替换规则已加载' : '暂无替换规则'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {error ? (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                <span className="text-sm">
                  {error ? `错误: ${error}` : '服务正常'}
                </span>
              </div>
              
              <Button 
                onClick={refresh} 
                size="sm" 
                variant="outline"
                disabled={loading}
              >
                刷新规则
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 文本链接替换测试 */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>文本链接替换测试</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testTexts.map((text, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-600">原始文本:</span>
                    <p className="text-sm text-gray-800">{text}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">替换后:</span>
                    <div className="text-sm text-gray-800">
                      <SmartLinkReplacer>{text}</SmartLinkReplacer>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* URL链接替换测试 */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>URL链接替换测试</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testUrls.map((url, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-600">原始URL:</span>
                    <p className="text-sm text-gray-800 break-all">{url}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">替换后链接:</span>
                    <div className="text-sm">
                      <UrlLinkReplacer 
                        href={url}
                        className="text-blue-600 hover:text-blue-800 underline break-all"
                      >
                        {url}
                      </UrlLinkReplacer>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 条件替换测试 */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>条件替换测试</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-600">测试文本:</span>
                  <p className="text-sm text-gray-800">访问 https://sms-activate.io 进行接码</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">条件替换结果:</span>
                  <div className="text-sm text-gray-800">
                    <ConditionalLinkReplacer
                      fallback={({ children, className }) => (
                        <span className={`${className} text-gray-500`}>
                          {children} (无替换规则)
                        </span>
                      )}
                    >
                      访问 https://sms-activate.io 进行接码
                    </ConditionalLinkReplacer>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 使用说明 */}
        <Card className="bg-blue-50/80 backdrop-blur-sm border-blue-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <TestTube className="h-5 w-5" />
              测试说明
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700 space-y-2 text-sm">
            <p>• 此页面用于测试链接替换功能是否正常工作</p>
            <p>• 如果配置了 SMS-Activate 的替换规则，上面的链接应该会自动替换为推广链接</p>
            <p>• 可以在管理后台的"链接替换"页面添加测试规则</p>
            <p>• 建议添加规则：原始链接 "https://sms-activate.io"，推广链接 "https://sms-activate.io/?ref=486565"</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}