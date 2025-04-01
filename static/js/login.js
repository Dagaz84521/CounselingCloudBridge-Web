// 登录状态管理
let isSubmitting = false;

// 错误提示
const errorModal = document.getElementById('error-modal');
const errorMessage = document.getElementById('error-message');

// 提交处理
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (isSubmitting) return;

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const submitBtn = document.querySelector('#loginForm button[type="submit"]');

  // 基础验证
  if (!username || !password) {
    showError('账号和密码不能为空');
    return;
  }

  // 提交
  isSubmitting = true;
  submitBtn.disabled = true;
  submitBtn.textContent = '验证中...';

  try {
    const response = await fetch('/api/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
      })
    });

    const res = await response.json();
    
    if (response.ok) {
      // 解构数据结构
      const { token, usertype: role, userId } = res.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('userRole', role); 
      localStorage.setItem('userId', userId);

      // 跳转逻辑
      const redirectMap = {
        admin: '/admin/base',
        counselor: '/counselor/base',
        supervisor: '/supervisor/base'
      };
      window.location.href = redirectMap[role] || '/login';
    } else {
      showError(res.message || '认证失败');
    }
  } catch (error) {
    showError('网络连接异常');
  }
});
// 工具函数
function showError(msg) {
  errorMessage.textContent = msg;
  errorModal.style.display = 'flex';
}

function closeError() {
  errorModal.style.display = 'none';
}