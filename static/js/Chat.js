import { ChatService } from './ChatService.js'

// DOM元素引用
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const messageContainer = document.getElementById('messageContainer');

const requestHelpButton = document.getElementById('requestHelp');
const requestMessageInput = document.getElementById('requestMessageInput');
const requestMessageContainer = document.getElementById('requestMessageContainer');
const requestSendButton = document.getElementById('requestSendButton');

const sessionManager = new ChatService(localStorage.getItem('userId'));

const endCounsel = document.getElementById('endCounsel')

// 发送消息功能
function sendMessage() {
    const content = messageInput.value.trim();
    console.log(localStorage.getItem('userId'))

    if (!content) return;
    console.log("发送信息")

    sessionManager.send(localStorage.getItem('sessionId'), localStorage.getItem('clientId'), content);

    const messageLine = document.createElement('div');
    messageLine.className = 'message-line';

    // 创建消息元素
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message system-message';

    // 添加内容
    messageDiv.innerHTML = `
             <div>${escapeHtml(content)}</div>
             <span class="timestamp">${getCurrentTime()}</span>
         `;

    // 添加到消息容器
    messageLine.appendChild(messageDiv);

    var avatar = createAvatarDiv();
    messageLine.appendChild(avatar);

    messageContainer.appendChild(messageLine);

    // 清空输入框
    messageInput.value = '';

    // 滚动到底部
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

// 工具函数：获取当前时间
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).replace(/\//g, '/');
}

// 工具函数：防止XSS攻击
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}



// 事件监听
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// 输入框自动高度
messageInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
});

function createAvatarDiv() {
    const avater = document.createElement('div')
    avater.className = "message-avatar"
    const img = document.createElement("img")
    img.alt = "用户头像";
    avater.appendChild(img);
    return avater;
}

requestHelpButton.addEventListener('click', function () {
    document.getElementById("supervisor-content").style.display = "flex"
    document.getElementById("requestIcon").src = "../../static/image/lightGreen.png"
    document.getElementById("requestHelp").style.color = "#1DABA6"
    document.getElementById("requestHelp").innerHTML = "请求督导中"
})

sessionManager.subscribe('message', (msg) => {
    console.log(msg.sessionId);
    console.log(msg.senderId);
    console.log(msg.content);
    console.log(msg.createdAt);
    receiveClientMessage(msg.content, msg.createdAt)
})

function receiveClientMessage(content) {


    const messageLine = document.createElement('div');
    messageLine.className = 'message-line';

    var avatar = createAvatarDiv();
    messageLine.appendChild(avatar);

    // 创建消息元素
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';

    // 添加内容
    messageDiv.innerHTML = `
             <div>${content}</div>
             <span class="timestamp">${getCurrentTime()}</span>
         `;

    // 添加到消息容器
    messageLine.appendChild(messageDiv);

    messageContainer.appendChild(messageLine);
}

// 发送消息功能
function sendRequestMessage() {
    const content = requestMessageInput.value.trim();
    if (!content) return;
    console.log("发送信息")

    const messageLine = document.createElement('div');
    messageLine.className = 'message-line';

    // 创建消息元素
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message system-message';

    // 添加内容
    messageDiv.innerHTML = `
             <div>${escapeHtml(content)}</div>
             <span class="timestamp">${getCurrentTime()}</span>
         `;

    // 添加到消息容器
    messageLine.appendChild(messageDiv);

    var avatar = createAvatarDiv();
    messageLine.appendChild(avatar);

    requestMessageContainer.appendChild(messageLine);

    // 清空输入框
    requestMessageInput.value = '';

    receiveSupervisorMessage("找到工作没有")

    // 滚动到底部
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

// 事件监听
requestSendButton.addEventListener('click', sendRequestMessage);
requestMessageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendRequestMessage();
    }
});

// 输入框自动高度
requestMessageInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
});

function receiveSupervisorMessage(message) {
    const messageLine = document.createElement('div');
    messageLine.className = 'message-line';

    var avatar = createAvatarDiv();
    messageLine.appendChild(avatar);

    // 创建消息元素
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';

    // 添加内容
    messageDiv.innerHTML = `
             <div>${escapeHtml(message)}</div>
             <span class="timestamp">${getCurrentTime()}</span>
         `;

    // 添加到消息容器
    messageLine.appendChild(messageDiv);

    requestMessageContainer.appendChild(messageLine);
}


endCounsel.addEventListener('click', () => {
    var evaluationModal = document.getElementById('evaluation-modal');
    evaluationModal.style.display = 'flex'
    var sessionId = localStorage.getItem('sessionId')
    var clientId = localStorage.getItem('clientId')

    document.getElementById('evaluation-comfirm').addEventListener('click', async () => {
        try {
            const response = await fetch('/api/counselor/session/' + sessionId + '/' + clientId, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'token': localStorage.getItem('authToken')
                },
                body: JSON.stringify({
                    type: document.getElementById('counsel-type').value,
                    advice: document.getElementById('counsel-evaluation').value
                }),
            });

            const res = await response.json();
            console.log(res)

            if (response.ok) {
                // 解构数据结构
                data = res.data;

                console.log(data)
            } else {
                showError(res.message || '认证失败');
            }
        } catch (error) {
            showError('网络连接异常');
        }

        evaluationModal.style.display = 'none'
        document.getElementById('consult-process-content').style.display = 'none'
        document.getElementById('consult-evaluations-content').style.display = 'flex'
        document.getElementById('counsult-records-header').textContent = '咨询已结束'
    })

    document.getElementById('evaluation-cancel').addEventListener('click', () => {
        evaluationModal.style.display = 'none'
        document.getElementById('consult-process-content').style.display = 'none'
        document.getElementById('consult-evaluations-content').style.display = 'flex'

    })
})


function UpdateDuration(startTimeArray) {
    const timeSpan = document.querySelector('.consult-duration span');

    if (!timeSpan) return;

    // 参数有效性检查
    if (!Array.isArray(startTimeArray)|| startTimeArray.length < 6) {
        timeSpan.textContent = '时间格式错误';
        return;
    }

    var [year, month, day, hour, minute, second] = startTimeArray;
    var startDate = new Date(year, month - 1, day, hour, minute, second);

    var now = new Date();
    var diffMs = now - startDate; // 毫秒差

    // 处理未来时间或无效时间
    if (diffMs < 0 || isNaN(diffMs)) {
        timeSpan.textContent = '00:00:00';
        return;
    }

    var totalSeconds = Math.floor(diffMs / 1000);
    var hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    var minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    var seconds = String(totalSeconds % 60).padStart(2, '0');
    timeSpan.textContent = `${hours}:${minutes}:${seconds}`;

}

document.addEventListener('DOMContentLoaded', async () => {
    var sessionId = localStorage.getItem('sessionId')
    var clientId = localStorage.getItem('clientId')
    const timeSpan = document.querySelector('.consult-duration span');

    let timer;
    let startTime = '';

    // 如果找不到元素则直接返回
    if (!timeSpan) {
        console.error('找不到时间显示元素');
        return;
    }


    try {
        const response = await fetch('/api/counselor/session/' + sessionId + '/' + clientId, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem('authToken')
            },
        });

        const res = await response.json();


        if (response.ok) {
            // 解构数据结构
            var data = res.data;
            console.log(data)
            document.getElementById('user-name').textContent = data.realName
            document.getElementById('user-phone').textContent = data.phoneNumber

            startTime = data.startTime;
            UpdateDuration(startTime);

            // 启动计时器（使用箭头函数保持上下文）
            timer = setInterval(() => UpdateDuration(startTime), 1000);
        } else {
            console.log(res.message || '认证失败');
        }
    } catch (error) {
        console.log(error);
        timeSpan.textContent = '--:--:--'; // 显示错误状态
    }

})

