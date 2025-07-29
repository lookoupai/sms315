import { supabase } from '../lib/supabase';

export interface Ad {
  id: number;
  title: string;
  content?: string;
  image_url?: string;
  link_url?: string;
  position: 'banner' | 'sidebar' | 'popup' | 'notice';
  type: 'ad' | 'notice';
  priority: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  click_count: number;
  view_count: number;
  target_blank: boolean;
  mobile_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAdData {
  title: string;
  content?: string;
  image_url?: string;
  link_url?: string;
  position: string;
  type: string;
  priority?: number;
  is_active?: boolean;
  start_date?: string | null;
  end_date?: string | null;
  target_blank?: boolean;
  mobile_image_url?: string;
}

// 获取所有公告（避免广告拦截器）
export async function getAllAds(): Promise<Ad[]> {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取公告列表失败:', error);
    throw error;
  }

  return data || [];
}

// 获取活跃的公告
export async function getActiveAds(position?: string): Promise<Ad[]> {
  let query = supabase
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false });

  if (position) {
    query = query.eq('position', position);
  }

  const { data, error } = await query;

  if (error) {
    console.error('获取活跃公告失败:', error);
    throw error;
  }

  // 过滤时间范围
  const now = new Date();
  const filteredData = (data || []).filter(ad => {
    const startDate = ad.start_date ? new Date(ad.start_date) : null;
    const endDate = ad.end_date ? new Date(ad.end_date) : null;
    
    if (startDate && startDate > now) return false;
    if (endDate && endDate < now) return false;
    
    return true;
  });

  return filteredData;
}

// 创建公告
export async function createAd(adData: CreateAdData): Promise<Ad> {
  const { data, error } = await supabase
    .from('announcements')
    .insert([adData])
    .select()
    .single();

  if (error) {
    console.error('创建公告失败:', error);
    throw error;
  }

  return data;
}

// 更新公告
export async function updateAd(id: number, adData: Partial<CreateAdData>): Promise<Ad> {
  const { data, error } = await supabase
    .from('announcements')
    .update(adData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('更新公告失败:', error);
    throw error;
  }

  return data;
}

// 删除公告
export async function deleteAd(id: number): Promise<void> {
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('删除公告失败:', error);
    throw error;
  }
}

// 增加展示次数
export async function incrementViewCount(id: number): Promise<void> {
  const { error } = await supabase.rpc('increment_announcement_views', {
    announcement_id: id
  });

  if (error) {
    console.error('增加展示次数失败:', error);
    throw error;
  }
}

// 增加点击次数
export async function incrementClickCount(id: number): Promise<void> {
  const { error } = await supabase.rpc('increment_announcement_clicks', {
    announcement_id: id
  });

  if (error) {
    console.error('增加点击次数失败:', error);
    throw error;
  }
}

// 获取统计信息
export async function getAdStats() {
  const { data, error } = await supabase
    .from('announcements')
    .select('id, is_active, click_count, view_count');

  if (error) {
    console.error('获取统计信息失败:', error);
    throw error;
  }

  const stats = {
    totalAds: data?.length || 0,
    activeAds: data?.filter(ad => ad.is_active).length || 0,
    totalClicks: data?.reduce((sum, ad) => sum + (ad.click_count || 0), 0) || 0,
    totalViews: data?.reduce((sum, ad) => sum + (ad.view_count || 0), 0) || 0
  };

  return stats;
}