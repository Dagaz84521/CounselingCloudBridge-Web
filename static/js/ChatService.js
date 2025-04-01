class ChatService {
    constructor(config) {

        this.config = {
            sessionId: config.sessionId,
            userId: config.userId,
            brokerURL: config.brokerURL,
            reconnectDelay: config.reconnectDelay || 5000
        };
        // STOMP客户端初始化
        this.stompClient = new Client({
            brokerURL: this.config.brokerURL,
            reconnectDelay: this.config.reconnectDelay,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000
        });
        this.subscriptions = new Map();
        this._eventListeners = new Map();
    }
  
    _setupSubscriptions() {
        const createMessageHandler = (type) => (message) => {
            try {
                const parsed = JSON.parse(message.body);
                const enhancedMessage = {
                    ...parsed,
                    type,
                    _channel: message.headers.destination
                };
        
                this.config.messageHandlers.onSessionMessage(enhancedMessage);
                this._emit('session_message', enhancedMessage);
            } catch (error) {
                this._handleParseError(error, message.body);
            }
        };
    
        // 会话聊天订阅
        const sessionSub = this.stompClient.subscribe(
            `/topic/session/${this.config.sessionId}`,
            createMessageHandler('session')
        );
        this.subscriptions.set('session', sessionSub.id);
    
        // 错误订阅
        const errorSub = this.stompClient.subscribe(
            '/user/queue/errors',
            message => {
                try {
                    const parsed = JSON.parse(message.body);
                    this.config.messageHandlers.onErrorMessage(parsed);
                    this._emit('error', parsed);
                } catch (error) {
                    this._handleParseError(error, message.body);
                }
            }
        );
        this.subscriptions.set('error', errorSub.id);
    }

    /**
     * 订阅事件
     * @param {string} event 事件名称
     * @param {Function} listener 监听函数
     * @returns {Function} 取消订阅函数
     */
    on(event, listener) {
        if (!this._eventListeners.has(event)) {
            this._eventListeners.set(event, new Set());
        }
        this._eventListeners.get(event).add(listener);
        return () => this.off(event, listener);
    }

    /**
     * 取消订阅
     * @param {string} event 事件名称
     * @param {Function} [listener] 要移除的监听函数（不传则移除全部）
     */
    off(event, listener) {
        if (!this._eventListeners.has(event)) return;
            const listeners = this._eventListeners.get(event);
        if (listener) {
            listeners.delete(listener);
        } else {
            listeners.clear();
        }
    }

    // 更新后的_emit方法
    _emit(event, payload) {
        // 触发内置监听器
        if (this._eventListeners.has(event)) {
            this._eventListeners.get(event).forEach(listener => {
            try {
                listener(payload);
            } catch (err) {
                console.error(`Event handler error for ${event}:`, err);
            }
        });
        }
        if (this.config.eventEmitter) {
            this.config.eventEmitter.emit(event, payload);
        }
    }

  
    _handleParseError(error, rawData) {
        const errorPayload = {
            code: 500,
            message: 'Message parse failed',
            details: {
            rawData: rawData.slice(0, 200), // 防止大数据量
            error: error instanceof Error ? error.message : String(error)
            }
        };
        
        this.config.messageHandlers.onErrorMessage(errorPayload);
        this._emit('parse_error', errorPayload);
    }
  
    // 连接管理方法示例
    connect() {
        this.stompClient.connect({}, () => {
            this._setupSubscriptions();
            console.log('Connected!');
        }, (error) => {
            this._emit('connection_error', error);
        });
    }
  
    disconnect() {
        this.subscriptions.forEach((id, type) => {
            this.stompClient.unsubscribe(id);
        });
        this.stompClient.disconnect();
    }
    /**
     * 发送带用户上下文的文本消息
     * @param {string} text - 原始消息内容
     * @returns {Promise<Object>} 包含完整消息元数据的Promise
     */
    async sendMessage(text) {
        // 上下文验证
        // if (!this._validateContext()) {
        //     const err = new Error('用户上下文不完整 (ECTX)');
        //     this._emit('error', { code: 'ECTX', message: err.message });
        //     throw err;
        // }
    
        // 构造完整消息结构
        const message = {
            meta: {
                id: this._generateMsgId(),
                session_id: this.config.sessionId,
                user_id: this.config.userId
            },
            content: this._processContent(text)
        };
    
        try {
            await this._send(message);
            this._emit('sent', message.meta);
            return message.meta;
        } catch (err) {
            this._emit('error', {
                code: 'ESEND',
                message: `消息投递失败: ${err.message}`,
                meta: message.meta
            });
            throw err;
        }
    }
    
    // 上下文验证
    _validateContext() {
        return [
        this.config?.sessionId?.length >= 12, // session_id最小长度
        /^usr-\d+$/.test(this.config?.userId), // 用户ID格式校验
        this.stompClient?.connected // 连接状态
        ].every(Boolean);
    }
    
    // 内容处理流水线
    _processContent(text) {
        return this._sanitize(text)
        .substring(0, 2000) // 长度截断
        .replace(/\s+/g, ' ') // 合并空白字符
        .trim();
    }
    
    // 增强的净化处理
    _sanitize(text) {
        return String(text)
        .replace(/[<>"']/g, m => ({
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[m]));
    }
    // STOMP发送适配器
    async _send(payload) {
        return new Promise((resolve, reject) => {
            const receiptId = `msg-${payload.meta.id}`;
            
            this.stompClient.send(
                '/queue/messages',
                {
                    'content-type': 'application/json',
                    'receipt': receiptId,
                    'user-id': payload.meta.user_id // 添加协议头
                },
                JSON.stringify(payload)
            );
    
            // 15秒超时机制
            const timer = setTimeout(() => {
                reject(new Error('服务器响应超时'));
            }, 15000);
    
            // 回执监听
            this.once(`receipt:${receiptId}`, () => {
                clearTimeout(timer);
                resolve();
            });
        });
    }
}
  
// 使用示例
// 配置参数示例
// const config = {
//      sessionId: 1, 
//      userId: 1,                
//      brokerURL: 'ws://chat.example.com:61614/ws',
//      reconnectDelay: 3000
// };

// const client = new ChatClient(config);
  
// 事件监听示例
// client.config.eventEmitter = new EventEmitter();
// client.config.eventEmitter.on('session_message', (msg) => {
//     if(msg.type === 'private') {
//       // 处理私有消息
//     }
// });
