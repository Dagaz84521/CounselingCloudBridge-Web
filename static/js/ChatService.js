export class ChatService {
  constructor(userId) {
    this.userId = userId; // 新增用户标识
    this._connection = null; // 主连接实例
    this._emitter = new SessionEmitter(userId);
    this._pendingQueue = []; // 全局待处理队列
    this._setupConnection();
  }

  // 初始化WebSocket连接
  _setupConnection() {
    console.log("connecting....");
    this._connection = new WebSocket(`ws://localhost:8090/chat/${this.userId}`);
    console.log("connected....");
    this._connection.onopen = () => {
      this._emitter.emit('connected');
      this._flushPendingQueue();
    };

    this._connection.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket原始数据:", data);
      // 创建基础事件对象
      const baseEvent = {
        type: data.type,
        senderId: data.senderId,
        content: data.content,
        createdAt: data.createdAt
      };
      // 条件分支处理
      let finalEvent;
      switch(data.type) {
        case 'session':
          finalEvent = {
            ...baseEvent,
            sessionId: data.sessionId // 确保服务器返回此字段
          };
          break;
          
        case 'request':
          finalEvent = {
            ...baseEvent,
            requestId: data.requestId // 确保服务器返回此字段
          };
          break;
        default:
          console.warn('未知消息类型:', data.type);
          return; // 不处理未知类型
      }
      this._emitter.emit('message', finalEvent);
    };

    this._connection.onclose = () => {
      this._emitter.emit('disconnected');
    };

    this._connection.onerror = (error) => {
      this._emitter.emit('error', error);
    };
  }

  // 订阅事件
  subscribe(eventType, handler) {
    if (this.isConnected) {
      this._emitter.on(eventType, handler);
    } else {
      this._pendingQueue.push({ type: 'subscribe', data: { eventType, handler } });
    }
    return this;
  }

  // 发送消息
  send(roomId, receiverId, content, type) {
    const payload = {
      roomId : roomId,
      senderId : this.userId,
      receiverId : receiverId,
      content : content,
      type: type
    };

    if (this.isConnected) {
      this._connection.send(JSON.stringify(payload));
    } else {
      this._pendingQueue.push({ type: 'send', data: payload });
    }
    return this;
  }

  // 关闭连接
  destroy() {
    if (this._connection) {
      this._connection.close();
      this._emitter.destroy();
      this._pendingQueue = [];
    }
  }

  // 处理等待队列
  _flushPendingQueue() {
    this._pendingQueue.forEach(item => {
      if (item.type === 'send') {
        this._connection.send(JSON.stringify(item.data));
      } else {
        this._emitter.on(item.data.eventType, item.data.handler);
      }
    });
    this._pendingQueue = [];
  }

  // 连接状态
  get isConnected() {
    return this._connection?.readyState === WebSocket.OPEN;
  }
}

class SessionEmitter {
  constructor(userId) {
    this.userId = userId;
    this.handlers = new Map();
  }

  on(eventType, handler) {
    const handlers = this.handlers.get(eventType) || new Set();
    handlers.add(handler);
    this.handlers.set(eventType, handlers);
  }

  emit(eventType, data) {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => handler({ ...data, userId: this.userId }));
    }
  }

  destroy() {
    this.handlers.clear();
  }
}

/ // 传入当前userId
// chatService = new ChatService (senderId);
// //注册接收消息时候的处理事件
// 如果是request的聊天则数据结构为 
// {
//   requestId : data.requestId,
//   type: data.type,
//   senderId: data.senderId,
//   content: data.content,
//   createdAt: data.createdAt
// };
// chatService.subscribe('message', (msg) => {
//   console.log(msg.requestId);       
//   console.log(msg.type);        
//   console.log(msg.senderId);
//   console.log(msg.content);
//   console.log(msg.createdAt);
// })
// 如果是sessionId的聊天则数据结构为 
// {
//   sessionId : data.sessionId,
//   type: data.type,
//   senderId: data.senderId,
//   content: data.content,
//   createdAt: data.createdAt
// };
// chatService.subscribe('message', (msg) => {
//   console.log(msg.sessionId);       //这里roomId等于sessionId或者requestId
//   console.log(msg.type);         //这里type等于request或者session
//   console.log(msg.senderId);
//   console.log(msg.content);
//   console.log(msg.createdAt);
// })
// //发送消息
// chatService.send(roomId,receiverId,content, type);


// 标准输入测试用代码
// import { createRequire } from 'node:module'
// import { WebSocket } from 'ws'
// import readline from 'node:readline'
// import process from 'node:process'
// // 兼容性处理
// const require = createRequire(import.meta.url)
// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
//   terminal: false
// });

// class ChatClient {
//   constructor() {
//     this.chatService = null;
//     this._init().catch(err => this._handleError(err));
//   }

//   async _init() {
//     try {
//       // 阶段1：获取用户凭证
//       const userId = await this._question('请输入用户ID: ');
//       this._validateUserId(userId);
//       // 初始化聊天服务
//       this.chatService = new ChatService(userId);
      
//       // 注册消息监听
//       this.chatService.subscribe('message', this._handleMessage.bind(this))
//         .subscribe('error', this._handleError.bind(this));
//       // 进入消息发送循环
//       await this._messageLoop();
//     } catch (error) {
//       this._handleError(error);
//     } finally {
//       rl.close();
//       this.chatService?.destroy();
//     }
//   }

//   async _messageLoop() {
//     while (true) {
//       try {
//         const input = await this._question('\n请输入消息格式 [房间ID 接收者ID 内容 类型] (或输入exit退出):\n');
//         if (input.toLowerCase() === 'exit') break;

//         const [roomId, receiverId, content, type] = input.split(' ');
//         this._validateMessageParams(roomId, receiverId, content, type);

//         this.chatService.send(roomId, receiverId, content, type);
//         console.log(`[${new Date().toISOString()}] 消息已加入发送队列`);
//       } catch (error) {
//         console.error('输入格式错误:', error.message);
//       }
//     }
//   }

//   // 以下为工具方法
//   _question(prompt) {
//     return new Promise(resolve => rl.question(prompt, resolve));
//   }

//   _validateUserId(userId) {
//     if (!/^[a-zA-Z0-9_-]{1,20}$/.test(userId)) {
//       throw new Error('用户ID必须是5-20位字母数字或_-符号');
//     }
//   }

//   _validateMessageParams(...params) {
//     if (params.some(p => !p)) {
//       throw new Error('缺少必要参数，需要：房间ID 接收者ID 内容 类型');
//     }
//   }

//   _handleMessage(msg) {
//     console.log(`\n[新消息] ${msg.createdAt} 
// 会话ID: ${msg.roomId}
// 发送者: ${msg.senderId}
// 内容: ${msg.content}
// 类型: ${msg.type}`);
//   }

//   _handleError(err) {
//     console.error('\n[系统错误]', err.message || err);
//     process.exit(1);
//   }
// }

// // 启动客户端
// new ChatClient();
