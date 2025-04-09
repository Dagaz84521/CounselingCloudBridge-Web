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
      listContainer.innerHTML = '';
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

      initCalendar(data.schedule)

      document.querySelector('[data-type="todayHours"]').dataset.value = data.supervisorInfo['todayHours'];
      document.querySelector('[data-type="todayRequests"]').dataset.value = data.supervisorInfo['todayRequests']
      document.querySelector('[data-type="totalRequests"]').dataset.value = data.supervisorInfo['totalRequests']
    } else {
      console.log(res.message || '认证失败');
    }
  } catch (error) {
    console.log('网络连接异常');
  }

});

function createCounselorCard(data) {
  card = document.createElement('div')
  card.className = 'counselor-card';

  cardName = document.createElement('div');
  cardName.className = 'counselor-name';
  cardName.innerHTML = data.realName
  card.appendChild(cardName)

  statusIndicator = document.createElement('div');
  statusText = document.createElement('div');
  statusText.className = 'status-text';

  if (data.isFree) {
    statusIndicator.className = "status-indicator status-available";
    statusText.innerHTML = "空闲";
  }
  else {
    statusIndicator.className = "status-indicator status-busy";
    statusText.innerHTML = "忙碌";
  }
  card.appendChild(statusIndicator)
  card.appendChild(statusText)

  return card
}

// 初始化日历
function initCalendar(data) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // 月份从0开始需要+1

  // 更新排班表标题
  updateCalendarTitle(currentYear, currentMonth);
  updateCalendarSubtitle(currentYear, currentMonth, data)

  generateCalendar(currentYear, currentMonth, data);
  addCalendarInteractions();
}

function updateCalendarSubtitle(year, month, schedule) {
  const subtitleElement = document.querySelector('.schedule-subtitle');
  if (!subtitleElement) return;

  // 星期映射表（中文 => 数字）
  const weekDayMap = {
    '周日': 0,
    '周一': 1,
    '周二': 2,
    '周三': 3,
    '周四': 4,
    '周五': 5,
    '周六': 6
  };

  // 转换中文星期到数字格式
  const targetDays = schedule
    .map(day => weekDayMap[day])
    .filter(day => typeof day === 'number');

  // 计算当月信息
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);
  const totalDays = monthEnd.getDate();

  // 计算值班天数
  let dutyDays = 0;
  targetDays.forEach(weekday => {
    dutyDays += calculateWeekdays(monthStart, monthEnd, weekday);
  });

  // 更新副标题内容
  subtitleElement.textContent =
    `本月共${totalDays}天，需值班${dutyDays}天`;
}

// 辅助函数：计算指定周几在日期范围内的出现次数
function calculateWeekdays(startDate, endDate, targetWeekday) {
  let count = 0;
  const date = new Date(startDate);

  // 找到第一个匹配的周几
  while (date.getDay() !== targetWeekday && date <= endDate) {
    date.setDate(date.getDate() + 1);
  }

  // 循环累加每周出现次数
  while (date <= endDate) {
    count++;
    date.setDate(date.getDate() + 7);
  }

  return count;
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