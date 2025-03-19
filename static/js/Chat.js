// DOM元素引用
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const messageContainer = document.getElementById('messageContainer');

// 发送消息功能
function sendMessage() {
    const content = messageInput.value.trim();
    if (!content) return;

    // 创建消息元素
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';

    // 添加内容
    messageDiv.innerHTML = `
             <div>${escapeHtml(content)}</div>
             <span class="timestamp">${getCurrentTime()}</span>
         `;

    // 添加到消息容器
    messageContainer.appendChild(messageDiv);

    // 清空输入框
    messageInput.value = '';

    // 模拟系统回复
    setTimeout(() => {
        const replyDiv = document.createElement('div');
        replyDiv.className = 'message system-message';
        replyDiv.innerHTML = `
                 <div>已收到您的咨询，专家正在处理...</div>
                 <span class="timestamp">${getCurrentTime()}</span>
             `;
        messageContainer.appendChild(replyDiv);
        scrollToBottom();
    }, 1000);

    // 滚动到底部
    scrollToBottom();
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

// 自动滚动到底部
function scrollToBottom() {
    messageContainer.scrollTop = messageContainer.scrollHeight;
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