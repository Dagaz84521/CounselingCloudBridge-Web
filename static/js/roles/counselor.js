document.addEventListener('DOMContentLoaded', async () => {
  const requiredRole = 'counselor';
  const storedRole = localStorage.getItem('userRole');

  if (storedRole !== requiredRole) {
    localStorage.clear();
    window.location.href = '/login';
  }

  try {
    const response = await fetch('/api/counselor/home', {
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

      renderRecentSessions(data.recentSessions)

      document.querySelector('[data-type="todayHours"]').dataset.value = data.counselorInfo['todayHours'];
      document.querySelector('[data-type="todaySessions"]').dataset.value = data.counselorInfo['todaySessions']
      document.querySelector('[data-type="totalSessions"]').dataset.value = data.counselorInfo['totalSessions']
      document.querySelector('[data-type="currentSessions"]').dataset.value = data.counselorInfo['currentSessions']

      initCalendar(data.schedule)

      renderSessionList(data.sessionList)



    } else {
      console.log(res.message || '认证失败');
    }
  } catch (error) {
    console.log('网络连接异常');
  }
});

function renderSessionList(sessionList) {
  listContainer = document.getElementById('session-list')
  sessionList.forEach(session => {
    line = addSessionItem(session);
    listContainer.appendChild(line)
  })
}


function renderRecentSessions(recentSessions) {

  recordsTable = document.querySelector('.records-table');
  recentSessions.forEach(recentSession => {

    rowLine = addTableRow(recentSession)
    recordsTable.appendChild(rowLine)
  })
}

function addTableRow(data) {
  rowLine = document.createElement('div');
  rowLine.className = "table-row";


  // 客户姓名
  const clientCell = document.createElement('div');
  clientCell.textContent = data.realName;


  // 持续时间
  const durationCell = document.createElement('div');
  durationCell.className = "duration";
  durationCell.textContent = data.duration;

  // 日期
  const dateCell = document.createElement('div');
  dateCell.className = "date";
  dateCell.textContent = formatDateFromArray(data.startTime);

  // 评分
  const ratingCell = document.createElement('div');
  ratingCell.className = "rating";

  const starContainer = document.createElement('div');
  starContainer.className = "star-container"; // 新增容器
  starContainer.style.display = "flex"; // 添加弹性布局
  // 创建5个星标
  for (let i = 0; i < 5; i++) {
    const star = document.createElement('span');
    star.className = i < data.rating ? "star-rating" : "star-rating-placeholder";
    star.textContent = "★";
    starContainer.appendChild(star);
  }

  ratingCell.appendChild(starContainer);

  // 操作按钮
  const actionsCell = document.createElement('div');
  actionsCell.className = "actions";

  // 创建查看详情按钮
  const detailBtn = document.createElement('button');
  detailBtn.className = 'recordButton view-detail';
  detailBtn.textContent = '查看详情';
  detailBtn.dataset.id = data.id; // 绑定唯一ID

  // 创建导出按钮
  const exportBtn = document.createElement('button');
  exportBtn.className = 'recordButton export';
  exportBtn.textContent = '导出记录';

  // 事件监听逻辑
  detailBtn.addEventListener('click', function () {
    const recordId = this.dataset.id;
    // const recordData = getRecordDataById(recordId); // 获取对应数据
    createModal(modalData);
  });

  actionsCell.append(detailBtn, exportBtn);

  // 组装元素
  [clientCell, durationCell, dateCell, ratingCell, actionsCell].forEach(cell => {
    rowLine.appendChild(cell);
  });

  return rowLine
}

function formatDateFromArray(arr) {
  // 处理月份偏移（输入的 4 表示实际 5 月，需要减 1）
  const [year, month, day, hour, minute, second] = arr;
  const date = new Date(year, month - 1, day, hour, minute, second);

  // 格式化成 YYYY-M-D HH:mm:ss
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ` +
    `${date.getHours().toString().padStart(2, '0')}:` +
    `${date.getMinutes().toString().padStart(2, '0')}:` +
    `${date.getSeconds().toString().padStart(2, '0')}`;
}

// 初始化日历
function initCalendar(data) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // 月份从0开始需要+1

  // 更新排班表标题
  updateCalendarTitle(currentYear, currentMonth);

  generateCalendar(currentYear, currentMonth, data);
  addCalendarInteractions();
}

// 新增更新标题函数
function updateCalendarTitle(year, month) {
  const titleElement = document.querySelector('.schedule-title');
  const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月",
    "7月", "8月", "9月", "10月", "11月", "12月"];

  if (titleElement) {
    titleElement.textContent = `${year}年${monthNames[month - 1]}排班表`;
  }
}

// 日历生成函数（带错误处理）
function generateCalendar(year, month, data) {
  try {
    const calendarGrid = document.querySelector('.calendar-grid');
    if (!calendarGrid) throw new Error('日历容器未找到');

    // 清空现有内容
    calendarGrid.innerHTML =
      '<div class="day-header">周一</div>' +
      '<div class="day-header">周二</div>' +
      '<div class="day-header">周三</div>' +
      '<div class="day-header">周四</div>' +
      '<div class="day-header">周五</div>' +
      '<div class="day-header">周六</div>' +
      '<div class="day-header">周日</div>';

    // 计算日期偏移（核心修改点）
    const firstDay = new Date(year, month - 1, 1);
    const startOffset = (firstDay.getDay() + 6) % 7; // 将周日转换为6，周一转换为0

    // 添加偏移空白格
    for (let i = 0; i < startOffset; i++) {
      calendarGrid.appendChild(createEmptyCell());
    }

    // 生成日期格
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const cell = createDayCell(year, month, day, data);
      calendarGrid.appendChild(cell);
    }

  } catch (error) {
    console.error('日历生成失败:', error);
  }
}

// 工作日判断逻辑（示例实现）
function isWorkingDay(day) {
  // 示例逻辑：每周三、五、日值班
  const date = new Date(2020, 11, day);
  return [3, 5, 0].includes(date.getDay());
}

// 添加交互功能
function addCalendarInteractions() {
  const calendar = document.querySelector('.calendar-grid');
  calendar.addEventListener('click', handleCellClick);
  calendar.addEventListener('mouseover', handleCellHover);
}

// 事件处理函数
function handleCellClick(event) {
  const cell = event.target.closest('.day-cell');
  if (cell) {
    console.log('选中日期:', cell.querySelector('.day-number').textContent);
  }
}

function handleCellHover(event) {
  const cell = event.target.closest('.day-cell');
  if (cell) {
    cell.style.transform = 'scale(1.02)';
    cell.addEventListener('mouseout', () => {
      cell.style.transform = 'none';
    });
  }
}


// 辅助函数：创建空白单元格
function createEmptyCell() {
  const cell = document.createElement('div');
  cell.className = 'day-cell empty-cell';
  return cell;
}

// 辅助函数：创建日期单元格
function createDayCell(year, month, day, data) {
  const cell = document.createElement('div');
  // 创建对应日期的Date对象（月份从0开始，所以month需要减1）
  const date = new Date(year, month - 1, day);
  // 获取星期几（0表示周日，1-6表示周一到周六）
  const dayOfWeek = date.getDay(); // 0（周日）到6（周六）
  const dayName = getChineseDayName(dayOfWeek); // 转换为中文星期名称

  const isWorkingDay = data.includes(dayName);
  cell.className = `day-cell ${isWorkingDay ? 'working-day' : ''}`;

  cell.innerHTML = `<div class="day-number">${day}</div>`;
  return cell;
}

// 将数字星期转换为中文名称（0 -> 周日，6 -> 周六）
function getChineseDayName(dayOfWeek) {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return days[dayOfWeek];
}

function addSessionItem(session) {

  itemLine = document.createElement('div');
  itemLine.className = 'user-item-container';

  linkItem = document.createElement('a');
  linkItem.href = "/counselor/chat/" + session.sessionId;
  linkItem.className = "user-item-content";
  linkItem.draggable = false;

  clientSpan = document.createElement('span');
  clientSpan.className = "user-item";
  clientSpan.innerHTML = session.realName;
  linkItem.appendChild(clientSpan)


  menuItem = document.createElement('div')
  menuItem.className = 'menu-actions';

  buttonItem = document.createElement('button')
  buttonItem.className = 'delete-btn';
  buttonItem.innerHTML = '删除';
  buttonItem.addEventListener('click', function (event) {
    handleDelete(event.currentTarget);
  });


  menuItem.appendChild(buttonItem)

  itemLine.appendChild(linkItem)
  itemLine.appendChild(menuItem)

  setupSwipeHandlers(itemLine);
  return itemLine;
}

function handleDelete(btn) {
  const container = btn.closest('.user-item-container');
  container.style.transform = 'translateX(-100%)';
  setTimeout(() => container.remove(), 300);
}


// 全局点击复位
document.addEventListener('click', (e) => {
  if (!e.target.closest('.user-item-container')) {
    document.querySelectorAll('.user-item-content').forEach(el => {
      el.style.transform = '';
    });
  }
});

function setupSwipeHandlers(container) {
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let startTime = 0;
  const CLICK_THRESHOLD = 5;
  const TIME_THRESHOLD = 200;

  const content = container.querySelector('.user-item-content');
  const link = container.querySelector('a'); // 获取链接元素
  const menuWidth = 80; // 需要与CSS中menu-actions的宽度一致

  // 移除原生的双击选中文本行为
  content.style.userSelect = 'none';

  // 双击事件处理
  link.addEventListener('dblclick', (e) => {
    e.preventDefault();
    window.location.href = link.href; // 执行跳转
  });

  // 单击延迟处理 (用于区分单击/滑动)
  link.addEventListener('click', (e) => {
    e.preventDefault();
    clickCount++;

    if (clickCount === 1) {
      clickTimer = setTimeout(() => {
        clickCount = 0; // 超时重置
      }, DOUBLE_CLICK_DELAY);
    } else if (clickCount === 2) {
      clearTimeout(clickTimer);
      clickCount = 0;
      // 双击已经在 dblclick 事件处理
    }
  });

  // 阻止链接默认拖拽行为
  content.addEventListener('dragstart', (e) => e.preventDefault());

  container.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startTime = Date.now();
    content.style.transition = 'none';
  });

  container.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaX = startX - e.clientX;
    const deltaY = Math.abs(e.clientY - startY);

    if (deltaY > CLICK_THRESHOLD) {
      resetState();
      return;
    }

    if (deltaX > 0) {
      const translateX = Math.min(deltaX, menuWidth);
      content.style.transform = `translateX(-${translateX}px)`;
    }
  });

  container.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    content.style.transition = 'transform 0.3s ease';

    const deltaX = startX - e.clientX;
    const deltaTime = Date.now() - startTime;

    if (deltaX > CLICK_THRESHOLD || deltaTime > TIME_THRESHOLD) {
      handleSwipe(deltaX);
      e.preventDefault();
    } else {
      content.style.transform = '';
    }
  });

  function handleSwipe(deltaX) {
    const shouldOpen = Math.abs(deltaX) > menuWidth / 2;
    content.style.transform = shouldOpen ?
      `translateX(-${menuWidth}px)` : '';
  }

  function resetState() {
    content.style.transform = '';
    isDragging = false;
  }
}