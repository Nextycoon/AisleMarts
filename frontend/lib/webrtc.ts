// WebRTC helpers for voice/video calls

export interface CallConfig {
  video: boolean;
  audio: boolean;
}

export interface ICECandidate {
  candidate: string;
  sdpMid: string | null;
  sdpMLineIndex: number | null;
}

class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private onRemoteStreamCallback?: (stream: MediaStream) => void;
  private onICECandidateCallback?: (candidate: ICECandidate) => void;
  private onConnectionStateChangeCallback?: (state: RTCPeerConnectionState) => void;
  private onDataChannelCallback?: (channel: RTCDataChannel) => void;
  private dataChannel: RTCDataChannel | null = null;
  private callQuality: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';
  private networkStats: { bitrate: number; packetLoss: number; latency: number } = { bitrate: 0, packetLoss: 0, latency: 0 };

  // ICE server configuration with multiple STUN servers for better connectivity
  private iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun.voip.blackberry.com:3478' },
    { urls: 'stun:openrelay.metered.ca:80' },
    // TURN servers for production (when available)
    // {
    //   urls: 'turn:your-turn-server.com:3478',
    //   username: 'your-username',
    //   credential: 'your-password'
    // }
  ];

  async initialize(config: CallConfig) {
    try {
      // Create peer connection
      this.peerConnection = new RTCPeerConnection({
        iceServers: this.iceServers,
        iceCandidatePoolSize: 10,
      });

      // Set up event handlers
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate && this.onICECandidateCallback) {
          this.onICECandidateCallback({
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
          });
        }
      };

      this.peerConnection.ontrack = (event) => {
        console.log('📹 Remote stream received');
        this.remoteStream = event.streams[0];
        if (this.onRemoteStreamCallback) {
          this.onRemoteStreamCallback(this.remoteStream);
        }
      };

      this.peerConnection.onconnectionstatechange = () => {
        console.log('🔗 Connection state:', this.peerConnection?.connectionState);
        if (this.onConnectionStateChangeCallback && this.peerConnection) {
          this.onConnectionStateChangeCallback(this.peerConnection.connectionState);
        }
        
        // Start monitoring call quality when connected
        if (this.peerConnection?.connectionState === 'connected') {
          this.startQualityMonitoring();
        }
      };

      this.peerConnection.ondatachannel = (event) => {
        const channel = event.channel;
        console.log('📡 Data channel received:', channel.label);
        if (this.onDataChannelCallback) {
          this.onDataChannelCallback(channel);
        }
      };

      // Create data channel for text messages during calls
      this.dataChannel = this.peerConnection.createDataChannel('messages', {
        ordered: true
      });

      this.dataChannel.onopen = () => {
        console.log('📡 Data channel opened');
      };

      this.dataChannel.onmessage = (event) => {
        console.log('📨 Data channel message:', event.data);
      };

      // Get local media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: config.video,
        audio: config.audio,
      });

      // Add local stream to peer connection
      this.localStream.getTracks().forEach((track) => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      console.log('✅ WebRTC initialized');
      return this.localStream;

    } catch (error) {
      console.error('❌ WebRTC initialization failed:', error);
      throw error;
    }
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await this.peerConnection.setLocalDescription(offer);
      console.log('📞 Offer created');
      
      return offer;
    } catch (error) {
      console.error('❌ Failed to create offer:', error);
      throw error;
    }
  }

  async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    try {
      await this.peerConnection.setRemoteDescription(offer);
      
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      console.log('📞 Answer created');
      return answer;
    } catch (error) {
      console.error('❌ Failed to create answer:', error);
      throw error;
    }
  }

  async setRemoteAnswer(answer: RTCSessionDescriptionInit) {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    try {
      await this.peerConnection.setRemoteDescription(answer);
      console.log('📞 Remote answer set');
    } catch (error) {
      console.error('❌ Failed to set remote answer:', error);
      throw error;
    }
  }

  async addICECandidate(candidate: ICECandidate) {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate({
        candidate: candidate.candidate,
        sdpMid: candidate.sdpMid,
        sdpMLineIndex: candidate.sdpMLineIndex,
      }));
      console.log('❄️ ICE candidate added');
    } catch (error) {
      console.error('❌ Failed to add ICE candidate:', error);
    }
  }

  // Media controls
  toggleAudio(): boolean {
    if (!this.localStream) return false;
    
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      console.log('🎤 Audio:', audioTrack.enabled ? 'enabled' : 'disabled');
      return audioTrack.enabled;
    }
    return false;
  }

  toggleVideo(): boolean {
    if (!this.localStream) return false;
    
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      console.log('📹 Video:', videoTrack.enabled ? 'enabled' : 'disabled');
      return videoTrack.enabled;
    }
    return false;
  }

  async switchCamera() {
    if (!this.localStream) return;

    try {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        // @ts-ignore - facing mode constraint
        const currentFacingMode = videoTrack.getSettings().facingMode;
        const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: newFacingMode },
          audio: true,
        });

        // Replace video track
        const newVideoTrack = newStream.getVideoTracks()[0];
        const sender = this.peerConnection?.getSenders().find(s => s.track?.kind === 'video');
        
        if (sender && newVideoTrack) {
          await sender.replaceTrack(newVideoTrack);
          
          // Update local stream
          videoTrack.stop();
          this.localStream.removeTrack(videoTrack);
          this.localStream.addTrack(newVideoTrack);
          
          console.log('📱 Camera switched');
        }
      }
    } catch (error) {
      console.error('❌ Failed to switch camera:', error);
    }
  }

  // Event handlers
  onRemoteStream(callback: (stream: MediaStream) => void) {
    this.onRemoteStreamCallback = callback;
  }

  onICECandidate(callback: (candidate: ICECandidate) => void) {
    this.onICECandidateCallback = callback;
  }

  // Clean up
  cleanup() {
    console.log('🧹 Cleaning up WebRTC');
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStream = null;
    this.onRemoteStreamCallback = undefined;
    this.onICECandidateCallback = undefined;
  }

  // Getters
  get connectionState(): RTCPeerConnectionState | null {
    return this.peerConnection?.connectionState || null;
  }

  get isConnected(): boolean {
    return this.peerConnection?.connectionState === 'connected';
  }
}

// Global WebRTC manager instance
export const webRTCManager = new WebRTCManager();

// Helper functions
export const startCall = async (config: CallConfig) => {
  const localStream = await webRTCManager.initialize(config);
  const offer = await webRTCManager.createOffer();
  return { localStream, offer };
};

export const acceptCall = async (offer: RTCSessionDescriptionInit, config: CallConfig) => {
  const localStream = await webRTCManager.initialize(config);
  const answer = await webRTCManager.createAnswer(offer);
  return { localStream, answer };
};

export const endCall = () => {
  webRTCManager.cleanup();
};