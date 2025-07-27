import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Send, Heart, Shield } from 'lucide-react';
import { getWebsites, getCountries, getProjects } from '../services/database';
import SearchableCountrySelect from '../components/SearchableCountrySelect';
import type { Website, Country, Project } from '../lib/supabase';

const HomePage = () => {
  const [formData, setFormData] = useState({
    website: '',
    country: '',
    project: '',
    result: '',
    note: ''
  });

  // 数据状态
  const [websites, setWebsites] = useState<Website[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const [websitesData, countriesData, projectsData] = await Promise.all([
          getWebsites(),
          getCountries(),
          getProjects()
        ]);
        
        setWebsites(websitesData);
        setCountries(countriesData);
        setProjects(projectsData);
      } catch (error) {
        console.error('加载数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('提交数据:', formData);
    // 这里将来会连接到API
    alert('感谢分享！你的经验将帮助其他人避坑。');
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 主标题区域 */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-4 rounded-full shadow-lg">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="title-main mb-4">帮助他人避坑</h1>
          <p className="text-xl text-gray-600 mb-2">分享你的接码失败经历，让其他人少花冤枉钱</p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Heart className="h-4 w-4 text-red-500" />
            <span>你的分享很有价值</span>
          </div>
        </div>

        {/* 主要表单区域 */}
        <div className="form-section animate-fade-in-up">
          <div className="flex items-center space-x-3 mb-8">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <h2 className="title-section">分享接码经历</h2>
          </div>
          
          <p className="text-gray-600 mb-8 text-lg">
            刚刚接码失败了？分享一下，让其他人避免同样的损失
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 接码网站选择 */}
            <div>
              <Label className="form-label">
                接码网站 <span className="text-red-500">*</span>
              </Label>
              <Select
                className="form-select"
                value={formData.website}
                onValueChange={(value: string) => setFormData({...formData, website: value})}
                required
              >
                <option value="">请选择接码网站</option>
                {websites.map(site => (
                  <option key={site.id} value={site.id}>
                    {site.name} ({site.url})
                  </option>
                ))}
              </Select>
            </div>

            {/* 接码国家选择 */}
            <div>
              <Label className="form-label">
                接码国家 <span className="text-red-500">*</span>
              </Label>
              <SearchableCountrySelect
                countries={countries}
                value={formData.country}
                onValueChange={(value: string) => setFormData({...formData, country: value})}
                placeholder="请选择国家（可搜索名称、代码或区号）"
              />
            </div>

            {/* 接码项目选择 */}
            <div>
              <Label className="form-label">
                接码项目 <span className="text-red-500">*</span>
              </Label>
              <Select
                className="form-select"
                value={formData.project}
                onValueChange={(value: string) => setFormData({...formData, project: value})}
                required
              >
                <option value="">请选择项目</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* 接码结果选择 */}
            <div>
              <Label className="form-label">
                接码结果 <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <label className={`radio-option failure ${formData.result === 'failure' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="result"
                    value="failure"
                    checked={formData.result === 'failure'}
                    onChange={(e) => setFormData({...formData, result: e.target.value})}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full border-2 border-red-400 flex items-center justify-center">
                      {formData.result === 'failure' && (
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-red-700">接码失败</div>
                      <div className="text-sm text-red-600">帮助他人避坑</div>
                    </div>
                  </div>
                </label>

                <label className={`radio-option success ${formData.result === 'success' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="result"
                    value="success"
                    checked={formData.result === 'success'}
                    onChange={(e) => setFormData({...formData, result: e.target.value})}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full border-2 border-green-400 flex items-center justify-center">
                      {formData.result === 'success' && (
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-green-700">接码成功</div>
                      <div className="text-sm text-green-600">分享经验</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* 备注说明 */}
            <div>
              <Label className="form-label">备注说明 (可选)</Label>
              <Textarea
                className="form-textarea"
                placeholder="可以描述具体的失败原因或成功经验..."
                value={formData.note}
                onChange={(e) => setFormData({...formData, note: e.target.value})}
                rows={4}
              />
            </div>

            {/* 提交按钮 */}
            <div className="pt-6">
              <Button type="submit" className="btn-primary w-full md:w-auto">
                <Send className="h-5 w-5 mr-2" />
                提交分享
              </Button>
            </div>
          </form>
        </div>

        {/* 温馨提示 */}
        <div className="mt-12 animate-fade-in-up">
          <div className="card-modern p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <AlertTriangle className="h-6 w-6 text-blue-500 mr-2" />
              温馨提示
            </h3>
            <div className="space-y-3 text-gray-600">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                <p>分享失败经历可以帮助其他人避免重复付费</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                <p>你的分享是匿名的，不会记录个人信息</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                <p>如果没有找到合适的选项，可以联系管理员添加</p>
              </div>
            </div>
          </div>
        </div>

        {/* 重要提醒 */}
        <div className="mt-8 animate-fade-in-up">
          <div className="warning-card">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
              <h3 className="text-xl font-bold text-yellow-800">重要提醒</h3>
            </div>
            <p className="text-yellow-700 text-lg">
              失败信息有时效性，但近期的失败记录参考价值很高，建议避开这些组合
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;