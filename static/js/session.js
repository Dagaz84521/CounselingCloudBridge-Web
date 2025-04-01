// 每小时检查一次Token存在性 保持登录状态
// 未登录则跳转至登录页
setInterval(() => {
    if (!localStorage.getItem('authToken')) {
      localStorage.clear();
      window.location.href = '/login';
    }
  }, 60 * 60 * 1000);
  
  // 统一登出方法
  function logout() {
    localStorage.clear();
    window.location.href = '/login';
  }