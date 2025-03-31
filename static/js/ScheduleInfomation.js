const datas = [
  {
    img: "",
    name: "小李"
  },
  {
    img: "",
    name: "小王"
  },
]

document.addEventListener('DOMContentLoaded', function () {
  // 获取需要操作的DOM元素
  const dayCells = document.querySelectorAll('.day-cell');
  const currentDateDiv = document.querySelector('.currentDate');
  const statusList = document.querySelector('.status-list');
  const addOperation = document.querySelector('.add_operation');
  const scheduleTitle = document.querySelector('.schedule-title');

  let currentType = 'counselor';

  renderStaffList(datas);

  // 初始化添加按钮事件（只需要绑定一次）
  addOperation.addEventListener('click', function () {
    createModal(currentType); // 使用动态类型参数
  });

  // 从标题中提取年份和月份
  const [_, year, month] = scheduleTitle.textContent.match(/(\d{4})年(\d{1,2})月/);

  // 为每个日期单元格添加点击事件
  dayCells.forEach(cell => {
    cell.addEventListener('click', function () {
      console.log(scheduleTitle.textContent)
    });
  });

  document.querySelectorAll('.option_container > div').forEach(option => {
    option.addEventListener('click', function () {
      // 切换选项状态
      document.querySelectorAll('.option_container > div').forEach(opt => {
        opt.classList.toggle('option_content-activate', opt === this);
        opt.classList.toggle('option_content', opt !== this); // 显式切换两种状态
      });


      // 更新当前类型和按钮文字
      currentType = this.dataset.type; // 使用data-type获取类型
      addOperation.textContent = "添加" + this.textContent.trim();

      renderStaffList(datas)
    })
  });

  // 初始设置（确保按钮状态同步）
  const initialActive = document.querySelector('.option_content-activate');
  if (initialActive) {
    currentType = initialActive.dataset.type;
    addOperation.textContent = "添加" + initialActive.textContent.trim();
  }
});



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
    nameSpan.innerHTML = data.name
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
  title.textContent = '添加' + (type=='counselor'?'咨询师':'督导');

  const subtitle = document.createElement('div');
  subtitle.className = 'modal-subtitle';
  subtitle.textContent = "为选中日期添加值班" + (type=='counselor'?'咨询师':'督导');

  const modalLine = document.createElement('div');
  modalLine.className = 'modal-line';
  modalLine.textContent = "搜索" + (type=='counselor'?'咨询师':'督导');

  const inputLine = document.createElement('input');
  inputLine.className = 'modal-input';
  inputLine.placeholder = '请输入'+ (type=='counselor'?'咨询师':'督导') + '姓名';


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