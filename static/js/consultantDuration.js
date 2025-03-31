const endCounselButton = document.getElementById('endCounsel');

document.addEventListener('DOMContentLoaded', function () {
  // 计时器变量提升到外层作用域
  let timer;  // ← 这里声明计时器变量

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
  timer = setInterval(() => {
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

  // 添加点击事件监听（确保元素存在）
  if (endCounselButton) {
    endCounselButton.addEventListener('click', () => {
      clearInterval(timer);
      console.log('计时器已停止');
      document.getElementById("evaluation-modal").style.display='flex';
    });
    
  } else {
    console.error('找不到结束按钮元素');
  }

});

document.getElementById("evaluation-comfirm").addEventListener('click',()=>{
  document.getElementById("evaluation-modal").style.display='none';
  document.getElementById("consult-evaluations-content").style.display='block';
  document.getElementById("counsult-records-header").innerHTML = "咨询记录"
})