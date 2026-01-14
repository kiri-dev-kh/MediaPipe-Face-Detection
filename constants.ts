
import { FaceDetectionConfig } from './types';

export const MEDIAPIPE_WASM_PATH = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
export const FACE_DETECTION_MODEL_PATH = 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite';

export const DEFAULT_CONFIG: FaceDetectionConfig = {
  minDetectionConfidence: 0.5,
  minSuppressionThreshold: 0.3,
  runningMode: 'VIDEO',
  delegate: 'GPU',
};

export const KEYPOINT_LABELS = [
  'Right Eye',
  'Left Eye',
  'Nose Tip',
  'Mouth Center',
  'Right Ear',
  'Left Ear',
];
