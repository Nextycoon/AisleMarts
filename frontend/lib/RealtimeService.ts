/**
 * ⚡ AisleMarts Real-time Service
 * WebSocket-based real-time updates for rewards, notifications, and live events
 */

export interface RealtimeMessage {
  type: string;
  data: any;
  timestamp: string;
  celebration?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

export interface ConnectionConfig {
  userId: string;
  reconnectAttempts: number;
  reconnectDelay: number;
  heartbeatInterval: number;
}

export type MessageHandler = (message: RealtimeMessage) => void;
export type ConnectionHandler = (connected: boolean) => void;
export type ErrorHandler = (error: Error) => void;

class RealtimeService {
  private ws: WebSocket | null = null;
  private config: ConnectionConfig;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private connectionHandlers: ConnectionHandler[] = [];
  private errorHandlers: ErrorHandler[] = [];
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private shouldReconnect = true;

  constructor(userId: string) {
    this.config = {
      userId,
      reconnectAttempts: 5,
      reconnectDelay: 3000,
      heartbeatInterval: 30000
    };
  }

  private getWebSocketUrl(endpoint: string): string {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.EXPO_PUBLIC_BACKEND_URL || 'https://infinity-stories.preview.emergentagent.com';
    
    const protocol = baseUrl.startsWith('https:') ? 'wss:' : 'ws:';
    const wsUrl = baseUrl.replace(/^https?:/, protocol);
    
    return `${wsUrl}/ws/${endpoint}/${this.config.userId}`;
  }

  async connectToRewards(): Promise<void> {
    return this.connect('rewards');
  }

  async connectToNotifications(): Promise<void> {
    return this.connect('notifications');
  }

  async connectToLive(roomId: string): Promise<void> {
    return this.connect(`live/${roomId}`);
  }

  private async connect(endpoint: string): Promise<void> {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isConnecting = true;

    try {
      const url = this.getWebSocketUrl(endpoint);
      console.log(`🔌 Connecting to ${url}`);

      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log(`✅ Connected to ${endpoint}`);
        this.isConnecting = false;
        this.notifyConnectionHandlers(true);
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: RealtimeMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log(`❌ WebSocket closed: ${event.code} ${event.reason}`);
        this.isConnecting = false;
        this.notifyConnectionHandlers(false);
        this.stopHeartbeat();

        if (this.shouldReconnect && event.code !== 1000) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        this.notifyErrorHandlers(new Error('WebSocket connection failed'));
      };

    } catch (error) {
      this.isConnecting = false;
      this.notifyErrorHandlers(error as Error);
    }
  }

  private handleMessage(message: RealtimeMessage): void {
    console.log(`📨 Received message: ${message.type}`, message);

    // Handle special message types
    switch (message.type) {
      case 'mission_progress_update':
        this.handleMissionUpdate(message);
        break;
      case 'reward_claimed':
        this.handleRewardClaimed(message);
        break;
      case 'league_advancement':
        this.handleLeagueAdvancement(message);
        break;
      case 'streak_milestone':
        this.handleStreakMilestone(message);
        break;
      case 'system_announcement':
        this.handleSystemAnnouncement(message);
        break;
      case 'withdrawal_update':
        this.handleWithdrawalUpdate(message);
        break;
      case 'leaderboard_update':
        this.handleLeaderboardUpdate(message);
        break;
      default:
        // Handle generic messages
        break;
    }

    // Notify registered handlers
    const handlers = this.messageHandlers.get(message.type) || [];
    const globalHandlers = this.messageHandlers.get('*') || [];

    [...handlers, ...globalHandlers].forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Message handler error:', error);
      }
    });
  }

  private handleMissionUpdate(message: RealtimeMessage): void {
    const { missionId, progress, completed } = message.data;
    console.log(`🎯 Mission update: ${missionId} - ${Math.round(progress * 100)}%`);

    if (completed) {
      this.showCelebration('Mission completed! 🎉');
    }
  }

  private handleRewardClaimed(message: RealtimeMessage): void {
    const { reward, message: rewardMessage } = message.data;
    console.log(`🎁 Reward claimed: ${reward.type} ${reward.value}`);
    
    if (message.celebration) {
      this.showCelebration(rewardMessage || 'Reward claimed! 🎉');
    }
  }

  private handleLeagueAdvancement(message: RealtimeMessage): void {
    const { newLeague, oldLeague } = message.data;
    console.log(`🏆 League advancement: ${oldLeague} → ${newLeague}`);
    
    if (message.celebration) {
      this.showCelebration(`Promoted to ${newLeague} League! 🏆`);
    }
  }

  private handleStreakMilestone(message: RealtimeMessage): void {
    const { streakType, days, milestone } = message.data;
    console.log(`🔥 Streak milestone: ${days} day ${streakType} streak`);
    
    if (message.celebration) {
      this.showCelebration(`${days} day streak! Keep it up! 🔥`);
    }
  }

  private handleSystemAnnouncement(message: RealtimeMessage): void {
    const { title, content, priority } = message.data;
    console.log(`📢 System announcement: ${title}`);
    
    // Could show as toast, modal, or notification based on priority
    this.showNotification(title, content, priority);
  }

  private handleWithdrawalUpdate(message: RealtimeMessage): void {
    const { status, amount, method } = message.data;
    console.log(`💰 Withdrawal update: ${status} - ${amount} via ${method}`);
    
    this.showNotification(
      'Withdrawal Update',
      `Your withdrawal of ${amount} AisleCoins is now ${status}`,
      'medium'
    );
  }

  private handleLeaderboardUpdate(message: RealtimeMessage): void {
    const { topVendors, userRank } = message.data;
    console.log(`📊 Leaderboard update - Your rank: ${userRank}`);
  }

  private showCelebration(message: string): void {
    // In a real app, this would trigger confetti animations or other celebrations
    console.log(`🎉 CELEBRATION: ${message}`);
    
    // Could dispatch custom events for UI components to handle
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('rewards-celebration', {
        detail: { message }
      }));
    }
  }

  private showNotification(title: string, content: string, priority: string = 'low'): void {
    console.log(`🔔 NOTIFICATION [${priority.toUpperCase()}]: ${title} - ${content}`);
    
    // Could dispatch custom events for notification components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('rewards-notification', {
        detail: { title, content, priority }
      }));
    }
  }

  // Public methods for message handling

  onMessage(messageType: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    
    this.messageHandlers.get(messageType)!.push(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(messageType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  onConnection(handler: ConnectionHandler): () => void {
    this.connectionHandlers.push(handler);
    
    return () => {
      const index = this.connectionHandlers.indexOf(handler);
      if (index > -1) {
        this.connectionHandlers.splice(index, 1);
      }
    };
  }

  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.push(handler);
    
    return () => {
      const index = this.errorHandlers.indexOf(handler);
      if (index > -1) {
        this.errorHandlers.splice(index, 1);
      }
    };
  }

  // WebSocket control methods

  send(type: string, data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message = {
        type,
        data,
        timestamp: new Date().toISOString()
      };
      
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  subscribeToMission(missionId: string): void {
    this.send('subscribe_mission', { mission_id: missionId });
  }

  subscribeToLeaderboard(): void {
    this.send('subscribe_leaderboard', {});
  }

  subscribeToNotificationChannel(channel: string): void {
    this.send('subscribe_channel', { channel });
  }

  ping(): void {
    this.send('ping', {});
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Private helper methods

  private notifyConnectionHandlers(connected: boolean): void {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(connected);
      } catch (error) {
        console.error('Connection handler error:', error);
      }
    });
  }

  private notifyErrorHandlers(error: Error): void {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (handlerError) {
        console.error('Error handler error:', handlerError);
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    console.log(`🔄 Reconnecting in ${this.config.reconnectDelay}ms...`);
    
    this.reconnectTimer = setTimeout(() => {
      if (this.shouldReconnect) {
        this.connect('rewards'); // Default to rewards connection
      }
    }, this.config.reconnectDelay);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.ping();
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

// Export singleton instance
let realtimeService: RealtimeService | null = null;

export const getRealtimeService = (userId: string = 'current_user'): RealtimeService => {
  if (!realtimeService) {
    realtimeService = new RealtimeService(userId);
  }
  return realtimeService;
};

export default RealtimeService;