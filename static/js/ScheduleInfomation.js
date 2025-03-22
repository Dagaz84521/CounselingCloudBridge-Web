document.addEventListener('DOMContentLoaded', function() {
    // 获取需要操作的DOM元素
    const dayCells = document.querySelectorAll('.day-cell');
    const currentDateDiv = document.querySelector('.currentDate');
    const statusList = document.querySelector('.status-list');
    const addOperation = document.querySelector('.add_operation');
    const scheduleTitle = document.querySelector('.schedule-title');

    // 从标题中提取年份和月份
    const [_, year, month] = scheduleTitle.textContent.match(/(\d{4})年(\d{1,2})月/);

    // 为每个日期单元格添加点击事件
    dayCells.forEach(cell => {
        cell.addEventListener('click', function() {
            
        });
    });
});