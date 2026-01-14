
import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';
import { FaceDetectionConfig, DetectionState } from '../types';
import { MEDIAPIPE_WASM_PATH, FACE_DETECTION_MODEL_PATH, DEFAULT_CONFIG } from '../constants';

interface ContextType {
  detector: FaceDetector | null;
  state: DetectionState;
  updateResults: (results: any, fps: number) => void;
  config: FaceDetectionConfig;
}

const FaceDetectionContext = createContext<ContextType | undefined>(undefined);

export const FaceDetectionProvider: React.FC<{
  children: React.ReactNode;
  config?: Partial<FaceDetectionConfig>;
}> = ({ children, config: userConfig }) => {
  const [detector, setDetector] = useState<FaceDetector | null>(null);
  const [state, setState] = useState<DetectionState>({
    isLoading: true,
    error: null,
    results: null,
    fps: 0,
  });

  const mergedConfig = { ...DEFAULT_CONFIG, ...userConfig };

  useEffect(() => {
    let active = true;

    async function initDetector() {
      try {
        const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_PATH);
        const instance = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: FACE_DETECTION_MODEL_PATH,
            delegate: mergedConfig.delegate,
          },
          minDetectionConfidence: mergedConfig.minDetectionConfidence,
          minSuppressionThreshold: mergedConfig.minSuppressionThreshold,
          runningMode: mergedConfig.runningMode,
        });

        if (active) {
          setDetector(instance);
          setState(prev => ({ ...prev, isLoading: false }));
        } else {
          instance.close();
        }
      } catch (err) {
        console.error('Failed to initialize face detector:', err);
        if (active) {
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: 'Failed to initialize vision model. Check your connection or hardware acceleration.' 
          }));
        }
      }
    }

    initDetector();

    return () => {
      active = false;
      if (detector) {
        detector.close();
      }
    };
  }, []);

  const updateResults = useCallback((results: any, fps: number) => {
    setState(prev => ({ ...prev, results, fps }));
  }, []);

  return (
    <FaceDetectionContext.Provider value={{ detector, state, updateResults, config: mergedConfig }}>
      {children}
    </FaceDetectionContext.Provider>
  );
};

export const useFaceDetectionContext = () => {
  const context = useContext(FaceDetectionContext);
  if (!context) {
    throw new Error('useFaceDetectionContext must be used within a FaceDetectionProvider');
  }
  return context;
};
