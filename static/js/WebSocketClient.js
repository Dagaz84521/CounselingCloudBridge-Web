export class WebSocketClient {
    constructor(url = "ws://localhost:8080") {
        // 初始化 WebSocket 服务器的 URL 和相关属性
        this.url = url;
        this.socket = null;
        this.messageCallback = null; // 接收消息的回调函数
        this.errorCallback = null;   // 错误处理的回调函数
    }

    // 建立 WebSocket 连接
    connect() {
        this.socket = new WebSocket(this.url);

        // 连接打开时的处理
        this.socket.onopen = () => {
            console.log('WebSocket 连接已打开');
        };

        // 接收后端消息时的处理
        this.socket.onmessage = (event) => {
            if (this.messageCallback) {
                this.messageCallback(event.data);
            }
        };

        // 发生错误时的处理
        this.socket.onerror = (error) => {
            if (this.errorCallback) {
                this.errorCallback(error);
            } else {
                console.error('WebSocket 错误:', error);
            }
        };

        // 连接关闭时的处理
        this.socket.onclose = () => {
            console.log('WebSocket 连接已关闭');
        };
    }

    // 发送消息到后端
    sendMessage(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        } else {
            console.error('WebSocket 未连接或已关闭');
        }
    }

    // 注册接收消息的回调函数
    onMessage(callback) {
        this.messageCallback = callback;
    }

    // 注册错误处理的回调函数
    onError(callback) {
        this.errorCallback = callback;
    }

    // 关闭 WebSocket 连接
    close() {
        if (this.socket) {
            this.socket.close();
        }
    }
}