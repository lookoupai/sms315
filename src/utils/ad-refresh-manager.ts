// 广告刷新管理器 - 用于通知所有广告组件刷新
class AdRefreshManager {
  private listeners: Set<() => void> = new Set();

  // 添加监听器
  addListener(callback: () => void) {
    this.listeners.add(callback);
    console.log(`[AdRefreshManager] 添加监听器，当前监听器数量: ${this.listeners.size}`);
  }

  // 移除监听器
  removeListener(callback: () => void) {
    this.listeners.delete(callback);
    console.log(`[AdRefreshManager] 移除监听器，当前监听器数量: ${this.listeners.size}`);
  }

  // 通知所有监听器刷新
  notifyRefresh() {
    console.log(`[AdRefreshManager] 通知 ${this.listeners.size} 个组件刷新`);
    this.listeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('[AdRefreshManager] 刷新回调执行失败:', error);
      }
    });
  }

  // 获取监听器数量
  getListenerCount() {
    return this.listeners.size;
  }
}

// 导出单例实例
export const adRefreshManager = new AdRefreshManager();

// 在开发环境下将实例挂载到window对象，便于调试
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).adRefreshManager = adRefreshManager;
}