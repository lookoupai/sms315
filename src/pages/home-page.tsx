import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { AlertTriangle, Send, Heart, Shield, Search, Filter, TrendingUp, Users, User } from 'lucide-react';
import { getSubmissions } from '../services/database';
import { useNavigate } from 'react-router-dom';
import AdDisplay from '../components/ad-display';

import type { Submission } from '../lib/supabase';

export default function HomePage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState<'all' | 'success' | 'failure'>('all');
  const [includePersonal, setIncludePersonal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const result = await getSubmissions(1, 20);
      setSubmissions(result.data);
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    // 搜索过滤
    const matchesSearch = searchTerm === '' || 
      submission.website?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.country?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.project?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.note?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 结果过滤
    const matchesFilter = filterResult === 'all' || submission.result === filterResult;
    
    // 个人服务过滤
    const matchesPersonal = includePersonal || submission.website?.status !== 'personal';
    
    return matchesSearch && matchesFilter && matchesPersonal;
  });

  const successCount = submissions.filter(s => s.result === 'success').length;
  const failureCount = submissions.filter(s => s.result === 'failure').length;
  const totalCount = submissions.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* 公告栏 */}
        <AdDisplay 
          position="notice" 
          className="mb-6"
        />

        {/* 主标题区域 - 统一风格 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="heading-primary text-blue-900">
              帮助他人避坑
            </h1>
          </div>
          <p className="text-body text-xl max-w-2xl mx-auto">
            分享你的接码失败经历，让其他人少花冤枉钱
          </p>
        </div>

        {/* 横幅广告 */}
        <AdDisplay 
          position="banner" 
          className="mb-8"
        />

        {/* 统计卡片区域 - 统一风格 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="card-primary">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-blue-600 mr-2" />
                <span className="text-2xl font-bold text-blue-600">{totalCount}</span>
              </div>
              <p className="text-gray-600">总提交数</p>
            </CardContent>
          </Card>
          
          <Card className="card-success">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Shield className="h-6 w-6 text-green-600 mr-2" />
                <span className="text-2xl font-bold text-green-600">{successCount}</span>
              </div>
              <p className="text-green-700">成功案例</p>
            </CardContent>
          </Card>
          
          <Card className="card-error">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
                <span className="text-2xl font-bold text-red-600">{failureCount}</span>
              </div>
              <p className="text-red-700">失败案例</p>
            </CardContent>
          </Card>
        </div>

        {/* 搜索和筛选区域 - 统一风格 */}
        <Card className="mb-8 border border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="搜索网站、国家或项目..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="md:w-48">
                  <Select value={filterResult} onValueChange={(value: 'all' | 'success' | 'failure') => setFilterResult(value)}>
                    <option value="all">全部结果</option>
                    <option value="success">仅成功</option>
                    <option value="failure">仅失败</option>
                  </Select>
                </div>
              </div>
              
              {/* 调试信息 */}
              <div className="text-xs text-gray-500 bg-yellow-100 p-2 rounded">
                调试: includePersonal = {includePersonal.toString()}
              </div>
              
              {/* 个人服务切换开关 - 使用内联样式确保显示 */}
              <div 
                className="flex items-center justify-between p-4 rounded-lg border-2"
                style={{ 
                  backgroundColor: '#dbeafe', 
                  borderColor: '#3b82f6',
                  minHeight: '60px'
                }}
              >
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5" style={{ color: '#3b82f6' }} />
                  <span className="text-sm font-medium" style={{ color: '#1e40af' }}>
                    显示个人服务
                  </span>
                  <span 
                    className="text-xs px-2 py-1 rounded"
                    style={{ 
                      backgroundColor: '#bfdbfe', 
                      color: '#1d4ed8' 
                    }}
                  >
                    个人接码者、私人发卡网站等
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includePersonal}
                    onChange={(e) => {
                      console.log('开关被点击:', e.target.checked);
                      setIncludePersonal(e.target.checked);
                    }}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 快速操作按钮 - 统一风格 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
          <Button 
            onClick={() => navigate('/submit')}
            className="btn-primary flex items-center gap-2 px-8 py-3 text-lg"
          >
            <Send className="h-5 w-5" />
            分享接码经历
          </Button>
          <Button 
            onClick={() => navigate('/guide')}
            className="btn-secondary flex items-center gap-2 px-8 py-3 text-lg"
          >
            <TrendingUp className="h-5 w-5" />
            查看完整指南
          </Button>
        </div>

        {/* 最新提交列表 - 统一风格 */}
        <Card className="card-primary">
          <CardHeader>
            <CardTitle className="heading-secondary flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              最新提交记录
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">加载中...</p>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">暂无匹配的记录</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSubmissions.slice(0, 10).map((submission) => (
                  <div
                    key={submission.id}
                    className={`p-4 rounded-lg border-l-4 transition-colors ${
                      submission.result === 'success'
                        ? 'border-l-green-500 bg-green-50 hover:bg-green-100'
                        : 'border-l-red-500 bg-red-50 hover:bg-red-100'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-gray-900">{submission.website?.name}</span>
                            {submission.website?.status === 'personal' && (
                              <>
                                <User className="h-3 w-3 text-blue-600" />
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">个人</span>
                              </>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-600">{submission.country?.name}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-600">{submission.project?.name}</span>
                        </div>
                        {submission.result === 'failure' && submission.note && (
                          <p className="text-sm text-red-600 mt-1">
                            备注: {submission.note}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          submission.result === 'success'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {submission.result === 'success' ? '成功' : '失败'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(submission.created_at).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 温馨提示 - 统一风格 */}
        <Card className="card-warning mt-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-2">温馨提示</h3>
                <div className="text-yellow-700 space-y-2 text-sm">
                  <p>• 失败原因具有时效性，但仍具参考价值，建议谨慎选择这些组合</p>
                  <p>• 成功案例仅供参考，不保证100%成功，请根据实际情况判断</p>
                  <p>• 如有疑问或需要帮助，请联系管理员</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}