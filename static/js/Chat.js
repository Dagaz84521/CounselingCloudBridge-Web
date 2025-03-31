// DOM元素引用
import { WebSocketClient }  from "./WebSocketClient.js";

const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const messageContainer = document.getElementById('messageContainer');

const requestHelpButton = document.getElementById('requestHelp');
const requestMessageInput = document.getElementById('requestMessageInput');
const requestMessageContainer = document.getElementById('requestMessageContainer');
const requestSendButton =document.getElementById('requestSendButton');

ws = new WebSocketClient("ws://localhost:8080");
ws.connect();
ws.onMessage(receiveClientMessage);
// 发送消息功能
function sendMessage() {
    const content = messageInput.value.trim();
    if (!content) return;
    console.log("发送信息");

    ws.sendMessage(content);

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
    receiveClientMessage("作业写完没有")
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

function createAvatarDiv(){
    const avater = document.createElement('div')
    avater.className = "message-avatar"
    const img = document.createElement("img")
    img.alt="用户头像";
    avater.appendChild(img);
    return avater;
}

requestHelpButton.addEventListener('click',function(){
    document.getElementById("supervisor-content").style.display = "flex"
})

function receiveClientMessage(message)
{
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

function receiveSupervisorMessage(message){
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