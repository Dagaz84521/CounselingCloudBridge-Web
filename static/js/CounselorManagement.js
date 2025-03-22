document.addEventListener('DOMContentLoaded', () => {
    let currentRow = null;
    let selectedDays = [];
    const dayOrder = ['一', '二', '三', '四', '五', '六', '日'];

    // 事件委托处理查看详情
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('.update')) {
            currentRow = e.target.closest('.table-row');
            showModal(currentRow);
        }
    });

    // 显示模态框
    function showModal(row) {
        const modal = document.getElementById('counselor-information');
        const name = row.querySelector('[data-field="name"]').textContent;
        const supervisor = row.querySelector('[data-field="supervisor"]').textContent;
        const schedule = row.querySelector('[data-field="schedule"]').textContent;

        // 填充数据
        modal.querySelector('input[placeholder="输入咨询师姓名"]').value = name;
        modal.querySelector('input[placeholder="输入督导姓名"]').value = supervisor;
        
        // 初始化日期选择
        selectedDays = schedule.split('、').map(d => d.replace('周', ''));
        updateDaySelection();

        modal.style.display = 'flex';
    }

    // 日期点击处理
    document.querySelectorAll('.day-group span').forEach(day => {
        day.addEventListener('click', () => {
            const dayValue = day.textContent.replace('周', '');
            const index = selectedDays.indexOf(dayValue);
            
            if (index > -1) {
                selectedDays.splice(index, 1);
            } else {
                selectedDays.push(dayValue);
            }
            
            day.classList.toggle('selected');
        });
    });

    // 更新日期选择状态
    function updateDaySelection() {
        document.querySelectorAll('.day-group span').forEach(day => {
            const dayValue = day.textContent.replace('周', '');
            day.classList.toggle('selected', selectedDays.includes(dayValue));
        });
    }

    // 确认按钮
    document.querySelector('.confirm-btn').addEventListener('click', () => {
        if (!currentRow) return;

        // 更新数据
        currentRow.querySelector('[data-field="name"]').textContent = 
            document.querySelector('input[placeholder="输入咨询师姓名"]').value;
        
        currentRow.querySelector('[data-field="supervisor"]').textContent = 
            document.querySelector('input[placeholder="输入督导姓名"]').value;

        // 格式化值班安排
        const sortedDays = selectedDays.sort((a, b) => 
            dayOrder.indexOf(a) - dayOrder.indexOf(b)
        ).map(d => `周${d}`).join('、');

        currentRow.querySelector('[data-field="schedule"]').textContent = sortedDays;

        closeModal();
    });

    // 关闭模态框
    function closeModal() {
        document.getElementById('counselor-information').style.display = 'none';
        currentRow = null;
        selectedDays = [];
    }

    // 取消按钮
    document.querySelector('.cancel-btn').addEventListener('click', closeModal);
});

document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.querySelector('.add-counselor');
    const modal = document.getElementById('addCounselorModal');
    
    // 显示模态框
    addBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    // 选项卡切换
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有激活状态
            document.querySelectorAll('.tab-btn, .tab-content').forEach(el => {
                el.classList.remove('active');
            });
            
            // 添加当前激活状态
            this.classList.add('active');
            const tabId = this.dataset.tab;
            document.getElementById(tabId).classList.add('active');
        });
    });

    // 关闭模态框
    document.querySelectorAll('.cancel-btn, .confirm-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    });

    // 确认按钮点击处理（示例）
    document.querySelector('.confirm-btn').addEventListener('click', () => {
        // 这里添加数据收集和验证逻辑
        console.log('提交数据...');
        modal.style.display = 'none';
    });
});