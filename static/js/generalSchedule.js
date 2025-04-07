// 初始化日历
async function initCalendar() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 月份从0开始需要+1
    
    
    // 更新排班表标题
    updateCalendarTitle(currentYear, currentMonth);
    
    generateCalendar(currentYear, currentMonth);
    addCalendarInteractions();
}

// 新增更新标题函数
function updateCalendarTitle(year, month) {
    const titleElement = document.querySelector('.schedule-title');
    const monthNames = ["1月","2月","3月","4月","5月","6月",
                       "7月","8月","9月","10月","11月","12月"];
    
    if (titleElement) {
        titleElement.textContent = `${year}年${monthNames[month-1]}排班表`;
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
        const firstDay = new Date(year, month-1, 1);
        const startOffset = (firstDay.getDay() + 6) % 7; // 将周日转换为6，周一转换为0

        // 添加偏移空白格
        for (let i = 0; i < startOffset; i++) {
            calendarGrid.appendChild(createEmptyCell());
        }

        // 生成日期格
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const cell = createDayCell(year, month, day);
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
        console.log('选中日期:', cell.dataset);
        currentDate = document.getElementById("currentDate")
        currentDate.innerHTML = cell.dataset.monthField+"月"+cell.dataset.dateField+"日 "+ cell.dataset.weekdayName
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
function createDayCell(year, month, day) {
    const cell = document.createElement('div');
    cell.className = `day-cell ${isWorkingDay(day) ? 'working-day' : ''}`;

    // 计算星期几（0=周一 到 6=周日）
    const targetDate = new Date(year, month-1, day);
    const weekdayIndex = (targetDate.getDay() + 6) % 7; // 转换周日从0到6
    const weekdaysCN = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

    // 添加数据属性
    cell.dataset.yearField = year;    // data-year-field
    cell.dataset.monthField = month;  // data-month-field
    cell.dataset.dateField = day;     // data-date-field
    cell.dataset.weekdayField = weekdayIndex; // 数字形式存储
    cell.dataset.weekdayName = weekdaysCN[weekdayIndex]; 

    cell.innerHTML = `<div class="day-number">${day}</div><div class="staff-info"><div>咨询师</div><div>督导</div></div>`;
    return cell;
}