let recordsTable = document.querySelector('.records-table');


document.addEventListener("DOMContentLoaded", function () {

    datas = [
        {
            client: "李先生",
            id: "001",
            duration: "00:11:45",
            date: "2025/03/15 11:45:14",
            starRating: 5,
            evaluation: "很棒的咨询师"
        },
        {
            client: "周小姐",
            id: "002",
            duration: "00:19:19",
            date: "2025/03/19 19:08:10",
            starRating: 3,
            evaluation: "躺赢狗"
        }
    ];
    console.log(datas)
    datas.forEach(data => {
        addTableRow(data);
    });
})

function addTableRow(data) {
    rowLine = document.createElement('div');
    rowLine.className = "table-row";

    // 客户姓名
    const clientCell = document.createElement('div');
    clientCell.innerHTML = data["client"];

    // 持续时间
    const durationCell = document.createElement('div');
    durationCell.className = "duration";
    durationCell.textContent = data.duration;

    // 日期
    const dateCell = document.createElement('div');
    dateCell.className = "date";
    dateCell.textContent = data.date;

    // 评分
    const ratingCell = document.createElement('div');
    ratingCell.className = "rating";

    const starContainer = document.createElement('div');
    starContainer.className = "star-container"; // 新增容器
    starContainer.style.display = "flex"; // 添加弹性布局
    // 创建5个星标
    for (let i = 0; i < 5; i++) {
        const star = document.createElement('span');
        star.className = i < data.starRating ? "star-rating" : "star-rating-placeholder";
        star.textContent = "★";
        starContainer.appendChild(star);
    }
    // 添加评价文本
    const ratingText = document.createElement('span');
    ratingText.className = "rating-text";
    ratingText.textContent = data.evaluation;
    // 组装元素
    starContainer.appendChild(ratingText);
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

    recordsTable.appendChild(rowLine)
}

function createModal(data) {
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
    title.textContent = '咨询记录';

    const subtitle = document.createElement('div');
    subtitle.className = 'modal-subtitle';
    subtitle.textContent = data.date;

    // 创建咨询类型部分
    const consultType = document.createElement('div');
    consultType.className = 'consult-type';
    consultType.textContent = '咨询类型';

    const consultLine = document.createElement('div');
    consultLine.className = 'consult-line';
    consultLine.textContent = data.consultType;

    // 创建聊天记录容器
    const chatHistorys = document.createElement('div');
    chatHistorys.className = 'modal-chat-historys';

    // 生成聊天记录项
    data.messages.forEach(msg => {
        const historyLine = document.createElement('div');
        historyLine.className = 'modal-chat-history-line';

        // 头像部分
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        const img = document.createElement('img');
        img.alt = '用户头像';
        avatar.appendChild(img);

        // 消息内容部分
        const messageLine = document.createElement('div');
        messageLine.className = 'modal-message-line';

        const messageInfo = document.createElement('div');
        messageInfo.className = 'modal-message-line-info';

        const character = document.createElement('div');
        character.className = 'modal-message-line-character';
        character.textContent = msg.character;

        const timestamp = document.createElement('div');
        timestamp.className = 'modal-message-line-timestamp';
        timestamp.textContent = msg.timestamp;

        const messageContent = document.createElement('div');
        messageContent.className = 'modal-message-content';
        messageContent.textContent = msg.content;

        // 组装元素
        messageInfo.append(character, timestamp);
        messageLine.append(messageInfo, messageContent);
        historyLine.append(avatar, messageLine);
        chatHistorys.appendChild(historyLine);
    });

    // 创建按钮行
    const buttonLine = document.createElement('div');
    buttonLine.className = 'modal-button-line';

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'modal-btn';
    confirmBtn.textContent = '确定';

    // 添加点击事件监听
    confirmBtn.addEventListener('click', () => {
        // 添加关闭动画
        modalContainer.style.opacity = '0';

        // 动画完成后移除元素
        setTimeout(() => {
            modalContainer.remove();
        }, 300); // 保持与CSS过渡时间一致
    });

    buttonLine.append(confirmBtn);

    // 组装所有元素
    modalContent.append(
        title,
        subtitle,
        consultType,
        consultLine,
        chatHistorys,
        buttonLine
    );

    modalContainer.appendChild(modalContent);

    document.body.appendChild(modalContainer);
    modalContainer.style.display = 'flex'
}

// 使用示例
const modalData = {
    date: '2025/03/15',
    consultType: '患者得了MVP',
    messages: [
        {
            character: '用户',
            timestamp: '2025/03/15 11:45:14',
            content: '采一朵花，送给妈妈'
        },
        {
            character: '咨询师',
            timestamp: '2025/03/15 11:45:14',
            content: '作业写完没有！'
        },
        {
            character: '用户',
            timestamp: '2025/03/15 11:45:14',
            content: '啊哈啊哈'
        },
        {
            character: '用户',
            timestamp: '2025/03/15 11:45:14',
            content: '我只是想给你看看这朵花很好看而已的嘛'
        },
        {
            character: '用户',
            timestamp: '2025/03/15 11:45:14',
            content: '今天不送妈妈，送给爸爸'
        },
        {
            character: '用户',
            timestamp: '2025/03/15 11:45:14',
            content: '爸爸爸爸，这个月赚好多米啊'
        },
        // 其他消息项...
    ]
};

