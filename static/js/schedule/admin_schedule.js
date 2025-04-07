let data;
let currentType;
let currentData;

// 初始化日历
async function initCalendar() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 月份从0开始需要+1

    try {
        const response = await fetch('/api/admin/schedule', {
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
            console.log(res.message || '服务器发生错误，无法初始化排班表');
        }
    } catch (error) {
        console("初始化排班表时发生错误")
    }

    // 更新排班表标题
    updateCalendarTitle(currentYear, currentMonth);

    generateCalendar(currentYear, currentMonth);
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
function generateCalendar(year, month) {
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
async function handleCellClick(event) {
    const cell = event.target.closest('.day-cell');
    if (cell) {


        try {
            const response = await fetch('/api/admin/schedule/' + (parseInt(cell.dataset['weekdayField']) + 1), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'token': localStorage.getItem('authToken')
                },

            });

            const res = await response.json();

            if (response.ok) {
                // 解构数据结构
                currentData = res.data;
                console.log(currentType)
                if (currentType == 'counselor')
                    renderStaffList(currentData.counselorList)
                else
                    renderStaffList(currentData.supervisorList)

            } else {
                console.log(res.message || '服务器发生错误，无法获取在线咨询师信息');
            }
        } catch (error) {
            console.log("发生错误")
        }
        currentDate = document.getElementById("currentDate")
        currentDate.innerHTML = cell.dataset.monthField + "月" + cell.dataset.dateField + "日 " + cell.dataset.weekdayName
    }
}

function handleCellHover(event) {
    const cell = event.target.closest('.day-cell');
    if (cell) {
        // 悬停时应用缩放和黑色边框
        cell.style.transform = 'scale(1.02)';
        cell.style.border = "3px solid black";
        // 添加一次性鼠标移出事件监听器
        cell.addEventListener('mouseout', () => {
            // 恢复原始样式
            cell.style.transform = 'none';
            cell.style.border = '';
        }, { once: true });
    }
}

// 页面加载时自动执行
window.addEventListener('DOMContentLoaded', initCalendar);

// 辅助函数：创建空白单元格
function createEmptyCell() {
    const cell = document.createElement('div');
    cell.className = 'day-cell empty-cell';
    return cell;
}

// 辅助函数：创建日期单元格
function createDayCell(year, month, day, data) {
    const cell = document.createElement('div');
    cell.className = `day-cell ${isWorkingDay(day) ? 'working-day' : ''}`;

    // 计算星期几（0=周一 到 6=周日）
    const targetDate = new Date(year, month - 1, day);
    const weekdayIndex = (targetDate.getDay() + 6) % 7; // 转换周日从0到6
    const weekdaysCN = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

    // 添加数据属性
    cell.dataset.yearField = year;    // data-year-field
    cell.dataset.monthField = month;  // data-month-field
    cell.dataset.dateField = day;     // data-date-field
    cell.dataset.weekdayField = weekdayIndex; // 数字形式存储
    cell.dataset.weekdayName = weekdaysCN[weekdayIndex];

    cell.innerHTML = `<div class="day-number">${day}</div>`+
        `<div class="staff-info">`+
        `<div style="display:flex;align-items: center;gap:5px"><i class="fas fa-user"></i><div>咨询师：${data[weekdayIndex].counselorNum}</div></div>`+
        `<div style="display:flex;align-items: center;gap:5px"><i class="fas fa-user-tie"></i><div>督导：${data[weekdayIndex].supervisorNum}</div></div></div>`;
    return cell;
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
        nameSpan.innerHTML = data['realName']
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

document.addEventListener('DOMContentLoaded', async function () {
    // 获取需要操作的DOM元素
    const dayCells = document.querySelectorAll('.day-cell');
    const currentDateDiv = document.querySelector('.currentDate');
    const statusList = document.querySelector('.status-list');
    const addOperation = document.querySelector('.add_operation');
    const scheduleTitle = document.querySelector('.schedule-title');

    todayData = await getTodayInformation();

    currentDateDiv.innerHTML = todayData.date;

    currentType = 'counselor';

    renderStaffList(todayData.counselorList);

    // 初始化添加按钮事件（只需要绑定一次）
    addOperation.addEventListener('click', function () {
        createModal(currentType); // 使用动态类型参数
    });

    // 从标题中提取年份和月份
    const [_, year, month] = scheduleTitle.textContent.match(/(\d{4})年(\d{1,2})月/);

    // 为每个日期单元格添加点击事件
    dayCells.forEach(cell => {
        cell.addEventListener('click', function () {
            
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

            if (currentType == 'counselor')
                renderStaffList(currentData.counselorList)
            else
                renderStaffList(currentData.supervisorList)
        })
    });

    // 初始设置（确保按钮状态同步）
    const initialActive = document.querySelector('.option_content-activate');
    if (initialActive) {
        currentType = initialActive.dataset.type;
        addOperation.textContent = "添加" + initialActive.textContent.trim();
    }
});

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