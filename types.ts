
import { FaceDetectorResult } from '@mediapipe/tasks-vision';

export interface FaceDetectionConfig {
  minDetectionConfidence: number;
  minSuppressionThreshold: number;
  runningMode: 'IMAGE' | 'VIDEO';
  delegate: 'CPU' | 'GPU';
}

export interface DetectionState {
  isLoading: boolean;
  error: string | null;
  results: FaceDetectorResult | null;
  fps: number;
}

export interface CameraState {
  isStreaming: boolean;
  permissionDenied: boolean;
  activeDeviceId: string | null;
}

export interface Point {
  x: number;
  y: number;
}
