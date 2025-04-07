document.addEventListener('DOMContentLoaded', async () => {
  const requiredRole = 'supervisor';
  const storedRole = localStorage.getItem('userRole');

  if (storedRole !== requiredRole) {
    localStorage.clear();
    window.location.href = '/login';
  }

  

  try {
    const response = await fetch('/api/supervisor/onlinecounselor?page=1&pagesize=9', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'token': localStorage.getItem('authToken')
      },
    });

    const res = await response.json();

    if (response.ok) {
      // 解构数据结构
      datas = res.data;
      console.log(datas)

      listContainer = document.getElementById('counselor-list');
      listContainer.innerHTML='';
      datas.forEach(data => {
          card = createCounselorCard(data)
          listContainer.appendChild(card)
      });


    } else {
      console.log(res.message || '获取在线咨询师失败');
    }

  } catch (error) {
    console.log('网络连接异常');
  }

  try {
    const response = await fetch('/api/supervisor/home', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'token': localStorage.getItem('authToken')
      },
    });
    const res = await response.json();
    if (response.ok) {
      // 解构数据结构
      data = res.data;    
      console.log(data)

    } else {
      console.log(res.message || '认证失败');
    }
  }catch (error) {
    console.log('网络连接异常');
  }

});

function createCounselorCard(data)
{
  card = document.createElement('div')
  card.className = 'counselor-card';

  cardName = document.createElement('div');
  cardName.className = 'counselor-name';
  cardName.innerHTML = data.realName
  card.appendChild(cardName)
  
  statusIndicator = document.createElement('div');
  statusText = document.createElement('div');
  statusText.className = 'status-text';

  if(data.isFree)
  {
    statusIndicator.className = "status-indicator status-available";
    statusText.innerHTML = "空闲";
  }
  else
  {
    statusIndicator.className = "status-indicator status-busy";
    statusText.innerHTML = "忙碌";
  }
  card.appendChild(statusIndicator)
  card.appendChild(statusText)

  return card
}