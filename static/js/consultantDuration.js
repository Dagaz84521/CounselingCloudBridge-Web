
document.addEventListener('DOMContentLoaded', function() {
    const timeSpan = document.querySelector('.consult-duration span');
    
    // 如果找不到元素则直接返回
    if (!timeSpan) {
      console.error('找不到时间显示元素');
      return;
    }
  
    // 初始时间解析（兼容空元素情况）
    const initialTime = timeSpan.textContent.trim() || '00:00:00';
    let [hours, minutes, seconds] = initialTime.split(':').map(Number);
    let totalSeconds = hours * 3600 + minutes * 60 + seconds;
  
    // 启动计时器
    const timer = setInterval(() => {
      totalSeconds++;
      
      // 时间计算
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
  
      // 更新显示
      timeSpan.textContent = 
        `${h.toString().padStart(2, '0')}:` +
        `${m.toString().padStart(2, '0')}:` +
        `${s.toString().padStart(2, '0')}`;
    }, 1000);
});

// 如果需要停止（比如组件卸载时）
// clearInterval(timer);