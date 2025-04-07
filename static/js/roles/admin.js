document.addEventListener('DOMContentLoaded', async () => {
    const requiredRole = 'admin';
    const storedRole = localStorage.getItem('userRole');
    
    if (storedRole !== requiredRole) {
      localStorage.clear();
      window.location.href = '/login';
    }

    try {
      const response = await fetch('/api/admin/home', {
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

        document.querySelector('[data-type="sessions"]').dataset.value = data['todaySessions'];
        document.querySelector('[data-type="hours"]').dataset.value = data['todayHours']
        document.querySelector('[data-type="currentSessions"]').dataset.value = data['currentSessions']
        document.querySelector('[data-type="currentRequests"]').dataset.value = data['currentRequests']
        
      } else {
        console.log(res.message || '服务器发生错误');
      }
    } catch (error) {
      console.log('网络连接异常');
    }

    
});


//在线心理咨询师
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/api/admin/onlinecounselor?page=1&pagesize=9', {
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

      listContainer = document.getElementById('counselor-list');
      listContainer.innerHTML='';
      datas.forEach(data => {
          card = createCounselorCard(data)
          listContainer.appendChild(card)
      });
      
    } else {
      console.log(res.message || '服务器发生错误，无法获取在线咨询师信息');
    }
  } catch (error) {
    console.log('网络连接异常');

  }
})

//在线督导
document.addEventListener('DOMContentLoaded', async ()=>{
  try {
    const response = await fetch('/api/admin/onlinesupervisor?page=1&pagesize=3', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'token': localStorage.getItem('authToken')
      },
      
    });


    const res = await response.json();
    
    if (response.ok) {
      datas = res.data;

      listContainer = document.getElementById('supervisor-list');
      listContainer.innerHTML='';
      datas.forEach(data => {
          card = createCounselorCard(data)
          listContainer.appendChild(card)
      });
      
    } else {
      console.log(res.message || '服务器发生错误，无法获取在线咨询师信息');
    }
  } catch (error) {
    console.log('网络连接异常');
  }
})

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
