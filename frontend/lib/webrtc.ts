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

  onConnectionStateChange(callback: (state: RTCPeerConnectionState) => void) {
    this.onConnectionStateChangeCallback = callback;
  }

  onDataChannel(callback: (channel: RTCDataChannel) => void) {
    this.onDataChannelCallback = callback;
  }

  // Getters
  get connectionState(): RTCPeerConnectionState | null {
    return this.peerConnection?.connectionState || null;
  }

  get isConnected(): boolean {
    return this.peerConnection?.connectionState === 'connected';
  }

  get callQualityStatus(): 'excellent' | 'good' | 'fair' | 'poor' {
    return this.callQuality;
  }

  get networkStatsSnapshot() {
    return { ...this.networkStats };
  }

  get isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
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

  // Quality monitoring
  private startQualityMonitoring() {
    if (!this.peerConnection) return;

    const interval = setInterval(async () => {
      if (!this.peerConnection || this.peerConnection.connectionState !== 'connected') {
        clearInterval(interval);
        return;
      }

      try {
        const stats = await this.peerConnection.getStats();
        this.analyzeCallQuality(stats);
      } catch (error) {
        console.error('Failed to get call stats:', error);
      }
    }, 5000); // Check every 5 seconds
  }

  private analyzeCallQuality(stats: RTCStatsReport) {
    let inboundAudio: RTCInboundRtpStreamStats | null = null;
    let outboundAudio: RTCOutboundRtpStreamStats | null = null;

    stats.forEach((report) => {
      if (report.type === 'inbound-rtp' && report.kind === 'audio') {
        inboundAudio = report as RTCInboundRtpStreamStats;
      } else if (report.type === 'outbound-rtp' && report.kind === 'audio') {
        outboundAudio = report as RTCOutboundRtpStreamStats;
      }
    });

    if (inboundAudio) {
      const packetsLost = inboundAudio.packetsLost || 0;
      const packetsReceived = inboundAudio.packetsReceived || 0;
      const packetLossRate = packetsLost / (packetsLost + packetsReceived);
      
      this.networkStats.packetLoss = packetLossRate;
      
      // Determine call quality based on packet loss
      if (packetLossRate < 0.01) {
        this.callQuality = 'excellent';
      } else if (packetLossRate < 0.03) {
        this.callQuality = 'good';
      } else if (packetLossRate < 0.05) {
        this.callQuality = 'fair';
      } else {
        this.callQuality = 'poor';
      }
    }
  }

  // Screen sharing
  async startScreenShare(): Promise<MediaStream> {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      const videoTrack = screenStream.getVideoTracks()[0];
      const sender = this.peerConnection?.getSenders().find(s => s.track?.kind === 'video');

      if (sender && videoTrack) {
        await sender.replaceTrack(videoTrack);
        console.log('🖥️ Screen sharing started');
      }

      // Handle screen share end
      videoTrack.onended = () => {
        this.stopScreenShare();
      };

      return screenStream;
    } catch (error) {
      console.error('❌ Failed to start screen share:', error);
      throw error;
    }
  }

  async stopScreenShare() {
    try {
      // Get camera stream back
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      const videoTrack = cameraStream.getVideoTracks()[0];
      const sender = this.peerConnection?.getSenders().find(s => s.track?.kind === 'video');

      if (sender && videoTrack) {
        await sender.replaceTrack(videoTrack);
        console.log('📱 Screen sharing stopped, camera resumed');
      }
    } catch (error) {
      console.error('❌ Failed to stop screen share:', error);
    }
  }

  // Recording functionality
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  async startRecording(): Promise<void> {
    if (!this.localStream) throw new Error('No local stream available');

    try {
      this.recordedChunks = [];
      this.mediaRecorder = new MediaRecorder(this.localStream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(1000); // Collect data every second
      console.log('🎙️ Recording started');
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      throw error;
    }
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        console.log('🎙️ Recording stopped');
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  // Noise cancellation (if supported)
  async enableNoiseCancellation(enable: boolean) {
    if (!this.localStream) return false;

    try {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack && 'applyConstraints' in audioTrack) {
        await audioTrack.applyConstraints({
          noiseSuppression: enable,
          echoCancellation: enable,
          autoGainControl: enable
        });
        console.log('🎧 Noise cancellation:', enable ? 'enabled' : 'disabled');
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to toggle noise cancellation:', error);
    }
    return false;
  }

  // Audio level monitoring
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;

  async startAudioLevelMonitoring(): Promise<() => number> {
    if (!this.localStream) throw new Error('No local stream available');

    try {
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      const source = this.audioContext.createMediaStreamSource(this.localStream);
      
      source.connect(this.analyser);
      this.analyser.fftSize = 256;
      
      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      return () => {
        if (!this.analyser) return 0;
        this.analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        return average / 255; // Normalize to 0-1
      };
    } catch (error) {
      console.error('❌ Failed to start audio monitoring:', error);
      throw error;
    }
  }

  // Send data channel message
  sendDataChannelMessage(message: string) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(message);
      console.log('📨 Data channel message sent:', message);
      return true;
    }
    return false;
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