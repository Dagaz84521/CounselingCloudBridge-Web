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
        const name = row.querySelector('[data-field="name"]').innerHTML;
        const supervisor = row.querySelector('[data-field="supervisor"]').innerHTML;
        const schedule = row.querySelector('[data-field="schedule"]').innerHTML ;

        // 填充数据
        modal.querySelector('input[placeholder="输入咨询师姓名"]').value = name;
        modal.querySelector('input[placeholder="输入督导姓名"]').value = supervisor;

        // 初始化日期选择
        if(schedule != '')
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
    document.querySelector('.confirm-btn').addEventListener('click', async () => {
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
        
        try {
            const response =  await fetch('/api/admin/counselor', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'token': localStorage.getItem('authToken')
                },
                body:JSON.stringify({
                    counselorId : currentRow.querySelector('[data-field="type"]').id,
                    supervisorId : currentRow.querySelector('[data-field="supervisor"]').id,
                    realName : currentRow.querySelector('[data-field="name"]').textContent,
                    schedule : sortedDays.split('、'),
                }),
            });
            console.log(response)
            const res = await response.json();
            console.log(res)
            if (response.ok) {
                // 解构数据结构
                data = res.data;
                console.log(data)
    
            } else {
                console.log(res.message || '服务器发生错误，无法添加督导');
            }
        } catch (error) {
            console.log(error)
        }
        console.log('提交数据...');

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


    // 关闭模态框
    document.querySelectorAll('.cancel-btn, .confirm-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    });

    // 确认按钮点击处理
    document.getElementById('add-confirm-btn').addEventListener('click', async () => {
        // 获取所有输入组
        const inputGroups = document.querySelectorAll('.input-group');
        const formData = {};

        inputGroups.forEach(group => {
            const label = group.querySelector('label').textContent.trim();
            let value;

            // 根据标签内容处理不同字段
            switch (label) {
                case '性别':
                    // 处理单选按钮
                    const selectedRadio = group.querySelector('input[name="gender"]:checked');
                    value = selectedRadio ? selectedRadio.value : '';
                    value = ((value == '男') ? 'male' : 'female');
                    break;
                default:
                    // 处理普通输入框
                    const input = group.querySelector('input:not([type="radio"])');
                    value = input ? input.value : '';
                    break;
            }

            // 将字段名转换为英文键（可选）
            const key = {
                '姓名': 'realName',
                '性别': 'gender',
                '年龄': 'age',
                '电话': 'phoneNumber',
                '督导ID': 'supervisorId',
                '头像URL': 'avatarUrl',
                '咨询师资质': 'certification',
                '擅长领域': 'expertise'
            }[label] || label; // 若无映射，直接使用原文本

            formData[key] = value;
        });

        try {
            const response = await fetch('/api/admin/counselor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token': localStorage.getItem('authToken')
                },
                body: JSON.stringify({
                    phoneNumber: formData['phoneNumber'],
                    realName: formData['realName'],
                    gender: formData['gender'],
                    age: formData['age'],
                    supervisorId: formData['supervisorId'],
                    avatarUrl: formData['avatarUrl'],
                    certification: formData['certification'],
                    expertise: formData['expertise']
                }),
            });

            const res = await response.json();
            console.log(res)
            if (response.ok) {
                // 解构数据结构
                data = res.data;
                console.log(data)

            } else {
                console.log(res.message || '服务器发生错误，无法添加咨询师');
            }
        } catch (error) {
            console
        }
        console.log(formData);

        console.log('提交数据...');
        modal.style.display = 'none';
    });
});

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/admin/counselor?name&page=1&pagesize=10', {
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
            renderCounselorTable(data)
        } else {
            console.log(res.message || '服务器发生错误，无法获取在线咨询师信息');
        }
    } catch (error) {
        console
    }

});

function addTableRow(data) {
    rowLine = document.createElement('div');
    rowLine.className = "table-row";

    // 客户姓名
    const counselorCell = document.createElement('div');
    counselorCell.innerHTML = data.counselorName;
    counselorCell.dataset.field = "name";

    // 身份
    const roleCell = document.createElement('div');
    roleCell.innerHTML = "咨询师";
    roleCell.dataset.field = "type";
    roleCell.id = data.counselorId
    
    // 督导
    const supervisorCell = document.createElement('div');
    supervisorCell.innerHTML = data.supervisorName;
    supervisorCell.dataset.field = "supervisor";
    supervisorCell.id = data.supervisorId;
    // 总咨询数
    const sessionCell = document.createElement('div');
    sessionCell.textContent = data.totalSessions;
    sessionCell.dataset.field = "sessions";

    // 持续时间
    const durationCell = document.createElement('div');
    durationCell.textContent = data.totalHours;
    durationCell.dataset.field = "duration";

    // 评分
    const ratingCell = document.createElement('div');
    ratingCell.className = "rating";
    ratingCell.dataset.field = "rating";

    const starContainer = document.createElement('div');
    starContainer.className = "star-container"; // 新增容器
    starContainer.style.display = "flex"; // 添加弹性布局
    for (let i = 0; i < 5; i++) {
        const star = document.createElement('span');
        star.className = i < data.rating ? "star-rating" : "star-rating-placeholder";
        star.textContent = "★";
        starContainer.appendChild(star);
    }
    ratingCell.appendChild(starContainer);
    

    //周排班安排
    const scheduleCell = document.createElement('div');
    length = data.schedule.length
    const weekOrder = { 
        '周一': 0, '周二': 1, '周三': 2, 
        '周四': 3, '周五': 4, '周六': 5, '周日': 6 
    };
    scheduleCell.innerHTML += data.schedule.sort((a, b) => weekOrder[a] - weekOrder[b]).join('、');
    scheduleCell.dataset.field = "schedule";

    // 操作按钮
    const actionsCell = document.createElement('div');
    actionsCell.className = "actions";

    // 创建查看详情按钮
    const detailBtn = document.createElement('button');
    detailBtn.className = 'update';
    detailBtn.textContent = '查看详情';
    detailBtn.dataset.id = data.counselorId; // 绑定唯一ID

    actionsCell.append(detailBtn);

    // 组装元素
    [counselorCell, roleCell, supervisorCell, sessionCell, durationCell, ratingCell, scheduleCell, actionsCell].forEach(cell => {
        rowLine.appendChild(cell);
    });

    return rowLine
}

function renderCounselorTable(datas)
{
    recordsTable = document.getElementById('counselor-table');
    datas.forEach(data =>{
    
        rowLine = addTableRow(data) 
        recordsTable.appendChild(rowLine)
      })
}