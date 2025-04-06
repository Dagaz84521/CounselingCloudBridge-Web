export class SessionMessagingSystem {
  constructor() {
    this._sessions = new Map();       // sessionId -> { emitter, ws }
    this._metadata = new Map();       // sessionId -> { senderId, receiverId }
    this._pendingActions = new Map(); // 待处理操作队列
  }

  session(sessionId, senderId, receiverId) {
    // 首次调用时立即建立连接
    if (senderId && receiverId) {
      if (!this._metadata.has(sessionId)) {
        this._metadata.set(sessionId, { senderId, receiverId });
        this._initializeSession(sessionId); // 立即创建连接
      } else {
        console.warn('会话已存在，忽略重复初始化参数');
      }
    }

    const controller = {
      subscribe: (eventType, handler) => {
        this._validateSession(sessionId);
        
        if (this._sessions.has(sessionId)) {
          this._sessions.get(sessionId).emitter.on(eventType, handler);
        } else {
          this._queueAction(sessionId, 'subscribe', { eventType, handler });
        }
        return controller;
      },

      send: (payload) => {
        this._validateSession(sessionId);
        const meta = this._metadata.get(sessionId);
        
        const message = {
          sessionId: sessionId,
          senderId: meta.senderId,
          receiverId: meta.receiverId,
          content: payload,
        };

        if (this._isReady(sessionId)) {
          this._sessions.get(sessionId).ws.send(JSON.stringify(message));
        } else {
          this._queueAction(sessionId, 'send', message);
        }
        return controller;
      },

      destroy: () => {
        if (this._sessions.has(sessionId)) {
          const session = this._sessions.get(sessionId);
          session.ws.close();
          session.emitter.destroy();
          this._sessions.delete(sessionId);
        }
        this._metadata.delete(sessionId);
        this._pendingActions.delete(sessionId);
      }
    };
    return controller;
  }

  _initializeSession(sessionId) {
    const meta = this._metadata.get(sessionId);
    const ws = new WebSocket(`ws://localhost:8080/chat/${sessionId}`);
    const emitter = new SessionEmitter(sessionId);
    console.log("initializing");
    ws.onopen = () => {
      emitter.emit('connected');
      this._processPendingActions(sessionId, ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      emitter.emit('message', {
        sessionId: data.sessionId,
        senderId: data.senderId,
        content: data.content,
        time: data.createdAt,
      });
    };

    ws.onclose = () => emitter.emit('disconnected');
    ws.onerror = (error) => {
      console.log("service error:", error);
      emitter.emit('error', error);
    }

    this._sessions.set(sessionId, { emitter, ws });
  }

  _queueAction(sessionId, type, data) {
    const queue = this._pendingActions.get(sessionId) || [];
    queue.push({ type, data });
    this._pendingActions.set(sessionId, queue);
  }

  _processPendingActions(sessionId, ws) {
    const pending = this._pendingActions.get(sessionId) || [];
    pending.forEach(action => {
      if (action.type === 'send') {
        ws.send(JSON.stringify(action.data));
      } else {
        this._sessions.get(sessionId).emitter.on(
          action.data.eventType,
          action.data.handler
        );
      }
    });
    this._pendingActions.delete(sessionId);
  }

  _validateSession(sessionId) {
    if (!this._metadata.has(sessionId)) {
      throw new Error('会话未初始化，请先提供senderId和receiverId');
    }
  }

  _isReady(sessionId) {
    const session = this._sessions.get(sessionId);
    return session && session.ws.readyState === WebSocket.OPEN;
  }
}

class SessionEmitter {
  constructor(sessionId) {
    this.sessionId = sessionId;
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
      handlers.forEach(handler => handler({ ...data, sessionId: this.sessionId }));
    }
  }

  destroy() {
    this.handlers.clear();
  }
}


