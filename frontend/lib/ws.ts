import { EventEmitter } from 'events';

// WebSocket client for Phase 2 real-time features
class AisleWS extends EventEmitter {
  private ws?: WebSocket;
  private reconnectTimeout?: NodeJS.Timeout;
  private reconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  connect(token: string) {
    try {
      const wsUrl = process.env.EXPO_PUBLIC_BACKEND_URL?.replace('http', 'ws') || 'ws://localhost:8001';
      this.ws = new WebSocket(`${wsUrl}/ws?jwt=${token}`);
      
      this.ws.onopen = () => {
        console.log('🔌 AisleWS connected');
        this.reconnectDelay = 1000;
        this.reconnectAttempts = 0;
        this.emit('open');
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('🔌 AisleWS disconnected:', event.code, event.reason);
        this.emit('close', event);
        this.scheduleReconnect(token);
      };

      this.ws.onerror = (error) => {
        console.error('🔌 AisleWS error:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.scheduleReconnect(token);
    }
  }

  private handleMessage(message: any) {
    console.log('📨 WebSocket message:', message.type);
    
    switch (message.type) {
      // DM Events
      case 'message.new':
      case 'typing':
      case 'receipt.read':
        this.emit('dm', message);
        break;

      // Call Signaling
      case 'CALL_RING':
      case 'CALL_ANSWER':
      case 'CALL_DECLINE':
      case 'CALL_END':
      case 'ICE_CANDIDATE':
      case 'CALL_MUTE':
      case 'CALL_VIDEO_TOGGLE':
        this.emit('call', message);
        break;

      // Channel Events
      case 'CHANNEL_BROADCAST':
      case 'CHANNEL_PIN':
      case 'CHANNEL_JOIN':
      case 'CHANNEL_LEAVE':
        this.emit('channel', message);
        break;

      // LiveSale Events
      case 'LIVESALE_START':
      case 'LIVESALE_TICK':
      case 'STOCK_UPDATE':
      case 'LIVESALE_END':
      case 'VIEWER_JOIN':
      case 'VIEWER_LEAVE':
      case 'PRODUCT_FEATURE':
      case 'REWARD_EARNED':
        this.emit('livesale', message);
        break;

      // Lead Events
      case 'LEAD_UPDATE':
      case 'LEAD_NOTE':
      case 'LEAD_ACTIVITY':
        this.emit('lead', message);
        break;

      default:
        this.emit('message', message);
    }
  }

  send(payload: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
      return true;
    } else {
      console.warn('WebSocket not connected, message queued');
      // TODO: Implement offline message queue
      return false;
    }
  }

  private scheduleReconnect(token: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    this.reconnectTimeout = setTimeout(() => {
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
      this.reconnectAttempts++;
      this.connect(token);
    }, this.reconnectDelay);

    // Exponential backoff
    this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, this.maxReconnectDelay);
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Call signaling helpers
  sendCallSignal(type: string, callId: string, data: any = {}) {
    return this.send({
      type,
      call_id: callId,
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  // Channel helpers
  sendChannelMessage(channelId: string, content: string, messageType: string = 'text') {
    return this.send({
      type: 'CHANNEL_MESSAGE',
      channel_id: channelId,
      content,
      message_type: messageType,
      timestamp: new Date().toISOString()
    });
  }

  // LiveSale helpers
  joinLiveSale(livesaleId: string) {
    return this.send({
      type: 'LIVESALE_JOIN',
      livesale_id: livesaleId,
      timestamp: new Date().toISOString()
    });
  }

  leaveLiveSale(livesaleId: string) {
    return this.send({
      type: 'LIVESALE_LEAVE',
      livesale_id: livesaleId,
      timestamp: new Date().toISOString()
    });
  }
}

// Global WebSocket instance
export const aisleWS = new AisleWS();