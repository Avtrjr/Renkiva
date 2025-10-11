import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

interface WebRTCConfig {
  channelId: string;
  isHost: boolean;
  onRemoteStream: (stream: MediaStream) => void;
  onError: (error: Error) => void;
  onConnectionStateChange: (state: RTCPeerConnectionState) => void;
}

export class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private channel: RealtimeChannel | null = null;
  private config: WebRTCConfig;
  private iceCandidateQueue: RTCIceCandidate[] = [];
  private remoteDescriptionSet = false;

  constructor(config: WebRTCConfig) {
    this.config = config;
  }

  async initialize(): Promise<MediaStream> {
    try {
      // Get local media stream with flexible constraints
      // First try with ideal constraints, fall back to basic if that fails
      let constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      try {
        this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (error: any) {
        // If specific constraints fail, try with basic constraints
        console.log('Falling back to basic constraints');
        constraints = {
          video: true,
          audio: true
        } as any;
        this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      }

      // Create peer connection
      this.peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Add local stream tracks to peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });

      // Handle remote stream
      this.peerConnection.ontrack = (event) => {
        console.log('Received remote track:', event.track.kind);
        if (event.streams && event.streams[0]) {
          this.config.onRemoteStream(event.streams[0]);
        }
      };

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Sending ICE candidate');
          this.sendSignal('ice-candidate', { candidate: event.candidate });
        }
      };

      // Handle connection state changes
      this.peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', this.peerConnection?.connectionState);
        if (this.peerConnection) {
          this.config.onConnectionStateChange(this.peerConnection.connectionState);
        }
      };

      // Set up signaling channel
      await this.setupSignalingChannel();

      return this.localStream;
    } catch (error: any) {
      console.error('Error initializing WebRTC:', error);
      
      // Provide more helpful error messages
      let userMessage = 'Failed to access camera/microphone';
      if (error.name === 'NotFoundError') {
        userMessage = 'No camera or microphone found. Please connect a camera/microphone and try again.';
      } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        userMessage = 'Camera/microphone access denied. Please grant permissions in your browser settings.';
      } else if (error.name === 'NotReadableError') {
        userMessage = 'Camera/microphone is already in use by another application.';
      }
      
      const enhancedError = new Error(userMessage);
      this.config.onError(enhancedError);
      throw enhancedError;
    }
  }

  private async setupSignalingChannel() {
    this.channel = supabase.channel(`video-chat-${this.config.channelId}`);

    this.channel
      .on('broadcast', { event: 'signal' }, async ({ payload }) => {
        console.log('Received signal:', payload.type);
        await this.handleSignal(payload);
      })
      .subscribe(async (status) => {
        console.log('Channel status:', status);
        if (status === 'SUBSCRIBED' && this.config.isHost) {
          // Host creates and sends offer
          await this.createOffer();
        }
      });
  }

  private async handleSignal(signal: any) {
    try {
      switch (signal.type) {
        case 'offer':
          await this.handleOffer(signal.data);
          break;
        case 'answer':
          await this.handleAnswer(signal.data);
          break;
        case 'ice-candidate':
          await this.handleIceCandidate(signal.data.candidate);
          break;
      }
    } catch (error) {
      console.error('Error handling signal:', error);
      this.config.onError(error as Error);
    }
  }

  private async createOffer() {
    if (!this.peerConnection) return;

    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      console.log('Created offer');
      this.sendSignal('offer', offer);
    } catch (error) {
      console.error('Error creating offer:', error);
      this.config.onError(error as Error);
    }
  }

  private async handleOffer(offer: RTCSessionDescriptionInit) {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      this.remoteDescriptionSet = true;
      console.log('Set remote description (offer)');

      // Process queued ICE candidates
      await this.processIceCandidateQueue();

      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      console.log('Created answer');
      this.sendSignal('answer', answer);
    } catch (error) {
      console.error('Error handling offer:', error);
      this.config.onError(error as Error);
    }
  }

  private async handleAnswer(answer: RTCSessionDescriptionInit) {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      this.remoteDescriptionSet = true;
      console.log('Set remote description (answer)');

      // Process queued ICE candidates
      await this.processIceCandidateQueue();
    } catch (error) {
      console.error('Error handling answer:', error);
      this.config.onError(error as Error);
    }
  }

  private async handleIceCandidate(candidate: RTCIceCandidateInit) {
    if (!this.peerConnection) return;

    try {
      const iceCandidate = new RTCIceCandidate(candidate);
      
      // Queue ICE candidates if remote description not set yet
      if (!this.remoteDescriptionSet) {
        console.log('Queueing ICE candidate');
        this.iceCandidateQueue.push(iceCandidate);
      } else {
        console.log('Adding ICE candidate');
        await this.peerConnection.addIceCandidate(iceCandidate);
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  private async processIceCandidateQueue() {
    console.log(`Processing ${this.iceCandidateQueue.length} queued ICE candidates`);
    for (const candidate of this.iceCandidateQueue) {
      try {
        await this.peerConnection?.addIceCandidate(candidate);
      } catch (error) {
        console.error('Error adding queued ICE candidate:', error);
      }
    }
    this.iceCandidateQueue = [];
  }

  private sendSignal(type: string, data: any) {
    if (!this.channel) return;

    this.channel.send({
      type: 'broadcast',
      event: 'signal',
      payload: { type, data }
    });
  }

  toggleVideo(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  toggleAudio(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  async disconnect() {
    console.log('Disconnecting WebRTC');
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.channel) {
      await supabase.removeChannel(this.channel);
      this.channel = null;
    }

    this.iceCandidateQueue = [];
    this.remoteDescriptionSet = false;
  }
}
