// MeshTV Noise Mesh Protocol v1 (MNMP) Type Definitions
// MIT Licensed - Open Source

export interface MNMPPacket {
  version: number; // 1 byte - Protocol version (1)
  type: PacketType; // 1 byte - Packet type
  ttl: number; // 1 byte - Time-to-live (hop limit)
  flags: PacketFlags; // 1 byte - Compressed? Encrypted? Fragmented?
  timestamp: number; // 8 bytes - Epoch milliseconds
  senderId: string; // 8 bytes - Truncated public key hash
  receiverId: string; // 8 bytes - Truncated (0xFF..FF = broadcast)
  payloadLength: number; // 2 bytes - Length of encrypted content
  signature?: Uint8Array; // 64 bytes - Optional Ed25519 signature
  payload: Uint8Array; // variable - Media, metadata, etc.
}

export enum PacketType {
  STREAM_START = 0x01,
  STREAM_FRAGMENT = 0x02,
  STREAM_END = 0x03,
  META_UPDATE = 0x04,
  USER_FAVORITE = 0x05,
  UPLOAD_ANNOUNCE = 0x06,
  PING = 0x07,
  PONG = 0x08,
  KEY_EXCHANGE = 0x09
}

export interface PacketFlags {
  compressed: boolean;
  encrypted: boolean;
  fragmented: boolean;
  broadcast: boolean;
}

export interface StreamFragment {
  streamId: string; // UUID of the stream
  fragmentIndex: number; // Integer index
  totalFragments: number;
  data: Uint8Array; // Chunk of video data (512 KB max)
  checksum: string; // SHA256 of full stream (first packet)
}

export interface NoiseState {
  handshakeState: 'initial' | 'sending_e' | 'waiting_e' | 'sending_s' | 'waiting_s' | 'complete';
  localKeyPair?: CryptoKeyPair;
  remotePublicKey?: CryptoKey;
  encryptionKey?: CryptoKey;
  decryptionKey?: CryptoKey;
  nonce: number;
}

export interface MeshNode {
  id: string;
  publicKey: string;
  signalStrength: number;
  lastSeen: number;
  capabilities: string[];
  location?: { lat: number; lng: number };
}

export interface ProtocolStats {
  packetsReceived: number;
  packetsSent: number;
  bytesReceived: number;
  bytesSent: number;
  activeStreams: number;
  connectedNodes: number;
  encryptionEnabled: boolean;
  protocolVersion: number;
}