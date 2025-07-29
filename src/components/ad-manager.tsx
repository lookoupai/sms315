import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Switch } from './ui/switch'
import { 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  MousePointer,
  Calendar,
  Image,
  Link,
  Save,
  X,
  Megaphone,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import { getAllAds, createAd, updateAd, deleteAd, getAdStats } from '../services/ads'
import { AdsCacheManager } from '../hooks/use-ads-cache'
import { adRefreshManager } from '../utils/ad-refresh-manager'
import type { Ad, CreateAdData } from '../services/ads'

interface AdManagerProps {
  onClose?: () => void
}

export default function AdManager({ onClose }: AdManagerProps) {
  const [ads, setAds] = useState<Ad[]>([])
  const [stats, setStats] = useState({
    totalAds: 0,
    activeAds: 0,
    totalClicks: 0,
    totalViews: 0
  })
  const [loading, setLoading] = useState(false)
  const [editingAd, setEditingAd] = useState<Ad | null>(null)
  const [showForm, setShowForm] = useState(false)
  
  // 表单状态
  const [formData, setFormData] = useState<CreateAdData>({
    title: '',
    content: '',
    image_url: '',
    link_url: '',
    position: 'banner',
    type: 'ad',
    priority: 0,
    is_active: true,
    start_date: '',
    end_date: '',
    target_blank: true,
    mobile_image_url: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [adsData, statsData] = await Promise.all([
        getAllAds(),
        getAdStats()
      ])
      setAds(adsData)
      setStats(statsData)
    } catch (error) {
      console.error('加载广告数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshCache = async () => {
    setLoading(true)
    try {
      // 清除所有广告缓存
      AdsCacheManager.clearAll()
      
      // 通知所有组件刷新
      adRefreshManager.notifyRefresh()
      
      // 重新加载管理界面数据
      await loadData()
      
      console.log(`广告缓存已刷新，已通知 ${adRefreshManager.getListenerCount()} 个组件`)
      alert(`广告缓存已刷新！已通知 ${adRefreshManager.getListenerCount()} 个前端组件更新显示。`)
    } catch (error) {
      console.error('刷新缓存失败:', error)
      alert('刷新缓存失败，请重试。')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) return

    try {
      // 处理空的日期字段，将空字符串转换为null
      const processedData = {
        ...formData,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null
      }

      if (editingAd) {
        await updateAd(editingAd.id, processedData)
      } else {
        await createAd(processedData)
      }
      
      resetForm()
      await loadData()
      
      // 清除缓存并通知所有组件刷新
      AdsCacheManager.clearAll()
      adRefreshManager.notifyRefresh()
      
      console.log('广告已保存，已通知前端组件刷新')
    } catch (error) {
      console.error('保存广告失败:', error)
      alert('保存失败: ' + (error as any).message)
    }
  }

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad)
    setFormData({
      title: ad.title,
      content: ad.content || '',
      image_url: ad.image_url || '',
      link_url: ad.link_url || '',
      position: ad.position,
      type: ad.type,
      priority: ad.priority,
      is_active: ad.is_active,
      start_date: ad.start_date ? ad.start_date.split('T')[0] : '',
      end_date: ad.end_date ? ad.end_date.split('T')[0] : '',
      target_blank: ad.target_blank,
      mobile_image_url: ad.mobile_image_url || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个广告吗？')) return
    
    try {
      await deleteAd(id)
      await loadData()
      
      // 清除缓存并通知所有组件刷新
      AdsCacheManager.clearAll()
      adRefreshManager.notifyRefresh()
      
      console.log('广告已删除，已通知前端组件刷新')
    } catch (error) {
      console.error('删除广告失败:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      image_url: '',
      link_url: '',
      position: 'banner',
      type: 'ad',
      priority: 0,
      is_active: true,
      start_date: '',
      end_date: '',
      target_blank: true,
      mobile_image_url: ''
    })
    setEditingAd(null)
    setShowForm(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const getPositionLabel = (position: string) => {
    const labels: Record<string, string> = {
      banner: '横幅广告',
      sidebar: '侧边栏',
      popup: '弹窗',
      notice: '公告栏'
    }
    return labels[position] || position
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ad: '广告',
      notice: '公告'
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Megaphone className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">广告管理</h1>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            关闭
          </Button>
        )}
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{stats.totalAds}</div>
            <div className="text-sm text-gray-600">总广告数</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Eye className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{stats.activeAds}</div>
            <div className="text-sm text-gray-600">活跃广告</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <MousePointer className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{stats.totalClicks}</div>
            <div className="text-sm text-gray-600">总点击数</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Eye className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{stats.totalViews}</div>
            <div className="text-sm text-gray-600">总展示数</div>
          </CardContent>
        </Card>
      </div>

      {/* 操作按钮和说明 */}
      <div className="space-y-3">
        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={handleRefreshCache}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新缓存
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              const stats = AdsCacheManager.getStats()
              alert(`缓存统计:\n缓存项数: ${stats.totalCached}\n缓存键: ${stats.cacheKeys.join(', ')}\n内存占用: ${Math.round(stats.totalMemory / 1024)} KB`)
            }}
          >
            查看缓存
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            添加广告
          </Button>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>💡 提示：</strong>
            修改广告后会自动通知前端页面刷新显示。当前有 {adRefreshManager.getListenerCount()} 个广告组件在监听更新。
            如果前端页面没有立即显示更新，可以点击"刷新缓存"按钮强制刷新。
          </p>
        </div>
      </div>

      {/* 广告表单 */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {editingAd ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingAd ? '编辑广告' : '添加广告'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">标题 *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="广告标题"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">类型</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ad">广告</SelectItem>
                      <SelectItem value="notice">公告</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">内容</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="广告内容描述"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="image_url">图片链接</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mobile_image_url">移动端图片链接</Label>
                  <Input
                    id="mobile_image_url"
                    value={formData.mobile_image_url}
                    onChange={(e) => setFormData({...formData, mobile_image_url: e.target.value})}
                    placeholder="https://example.com/mobile-image.jpg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="link_url">跳转链接</Label>
                  <Input
                    id="link_url"
                    value={formData.link_url}
                    onChange={(e) => setFormData({...formData, link_url: e.target.value})}
                    placeholder="https://example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="position">广告位置</Label>
                  <Select value={formData.position} onValueChange={(value) => setFormData({...formData, position: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="banner">横幅广告</SelectItem>
                      <SelectItem value="sidebar">侧边栏</SelectItem>
                      <SelectItem value="popup">弹窗</SelectItem>
                      <SelectItem value="notice">公告栏</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">优先级</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="start_date">开始时间</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end_date">结束时间</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label htmlFor="is_active">启用广告</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="target_blank"
                    checked={formData.target_blank}
                    onCheckedChange={(checked) => setFormData({...formData, target_blank: checked})}
                  />
                  <Label htmlFor="target_blank">新窗口打开</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingAd ? '更新广告' : '创建广告'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  取消
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 广告列表 */}
      <div className="space-y-4">
        {ads.map(ad => (
          <Card key={ad.id} className={`${!ad.is_active ? 'opacity-60' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{ad.title}</h3>
                    <Badge variant={ad.is_active ? 'default' : 'secondary'}>
                      {ad.is_active ? '启用' : '禁用'}
                    </Badge>
                    <Badge variant="outline">
                      {getTypeLabel(ad.type)}
                    </Badge>
                    <Badge variant="outline">
                      {getPositionLabel(ad.position)}
                    </Badge>
                  </div>
                  
                  {ad.content && (
                    <p className="text-gray-600">{ad.content}</p>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4 text-gray-400" />
                      <span>展示: {ad.view_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MousePointer className="h-4 w-4 text-gray-400" />
                      <span>点击: {ad.click_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-4 w-4 text-gray-400" />
                      <span>优先级: {ad.priority}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(ad.created_at)}</span>
                    </div>
                  </div>
                  
                  {(ad.image_url || ad.link_url) && (
                    <div className="flex flex-wrap gap-2 text-sm">
                      {ad.image_url && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <Image className="h-4 w-4" />
                          <span>有图片</span>
                        </div>
                      )}
                      {ad.link_url && (
                        <div className="flex items-center gap-1 text-green-600">
                          <Link className="h-4 w-4" />
                          <span>有链接</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {(ad.start_date || ad.end_date) && (
                    <div className="text-sm text-gray-500">
                      {ad.start_date && <span>开始: {formatDate(ad.start_date)}</span>}
                      {ad.start_date && ad.end_date && <span> | </span>}
                      {ad.end_date && <span>结束: {formatDate(ad.end_date)}</span>}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(ad)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(ad.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {ads.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">暂无广告，点击上方按钮添加第一个广告</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}