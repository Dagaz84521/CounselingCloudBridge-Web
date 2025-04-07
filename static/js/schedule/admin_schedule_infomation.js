let currentType;

async function getTodayInformation() {
  date = new Date()

  const month = date.getMonth() + 1
  const day = date.getDate()
  const weeks = new Array("周日", "周一", "周二", "周三", "周四", "周五", "周六");
  const nowWeek = weeks[new Date().getDay()];

  try {
    const response = await fetch('/api/admin/schedule/' + (new Date().getDay() + 1), {
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

    } else {
      console.log(res.message || '服务器发生错误，无法获取在线咨询师信息');
    }
  } catch (error) {
    console.log("发生错误")
  }

  result = {
    date: month + "月" + day + "日 " + nowWeek,
    counselorList: data.counselorList,
    supervisorList: data.supervisorList,
  }

  return result;
}





function renderStaffList(datas) {
  const staffList = document.querySelector('.staff-list')
  staffList.innerHTML = '';

  // 生成新的 staff-item
  datas.forEach(data => {
    const newItem = document.createElement('div')
    newItem.className = 'staff-item'

    avatar = document.createElement('div')
    avatar.className = 'staff-avatar'
    newItem.appendChild(avatar)

    nameSpan = document.createElement('span')
    nameSpan.innerHTML = data.realName
    newItem.appendChild(nameSpan)

    button = document.createElement('button')
    button.className = "status-btn remove"
    button.innerHTML = "移除"
    newItem.appendChild(button)

    // 插入到列表最前面
    staffList.insertBefore(newItem, staffList.firstChild)

    // 添加移除功能（可选）
    newItem.querySelector('.remove').addEventListener('click', () => {
      staffList.removeChild(newItem)
    })
  })
}



function createModal(type) {
  console.log(type)

  // 创建容器
  const modalContainer = document.createElement('div');
  modalContainer.className = 'modal-container';
  modalContainer.style.display = 'none';

  // 创建内容容器
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';

  // 创建标题部分
  const title = document.createElement('h2');
  title.className = 'modal-title';
  title.textContent = '添加' + (type == 'counselor' ? '咨询师' : '督导');

  const subtitle = document.createElement('div');
  subtitle.className = 'modal-subtitle';
  subtitle.textContent = "为选中日期添加值班" + (type == 'counselor' ? '咨询师' : '督导');

  const modalLine = document.createElement('div');
  modalLine.className = 'modal-line';
  modalLine.textContent = "搜索" + (type == 'counselor' ? '咨询师' : '督导');

  const inputLine = document.createElement('input');
  inputLine.className = 'modal-input';
  inputLine.placeholder = '请输入' + (type == 'counselor' ? '咨询师' : '督导') + '姓名';


  // 创建按钮行
  const buttonLine = document.createElement('div');
  buttonLine.className = 'modal-button-line';

  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'modal-btn';
  confirmBtn.textContent = '确定';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'modal-btn';
  cancelBtn.textContent = '取消';

  // 添加点击事件监听
  confirmBtn.addEventListener('click', () => {
    // 添加关闭动画
    modalContainer.style.opacity = '0';

    // 动画完成后移除元素
    setTimeout(() => {
      modalContainer.remove();
    }, 300); // 保持与CSS过渡时间一致
  });

  // 添加点击事件监听
  cancelBtn.addEventListener('click', () => {
    // 添加关闭动画
    modalContainer.style.opacity = '0';

    // 动画完成后移除元素
    setTimeout(() => {
      modalContainer.remove();
    }, 300); // 保持与CSS过渡时间一致
  });

  buttonLine.append(confirmBtn, cancelBtn);


  // 组装所有元素
  modalContent.append(
    title,
    subtitle,
    modalLine,
    inputLine,
    buttonLine
  );


  modalContainer.appendChild(modalContent);
  document.body.appendChild(modalContainer);
  modalContainer.style.display = 'flex'
}