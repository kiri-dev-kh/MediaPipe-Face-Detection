
import React, { useRef, useEffect, useState, forwardRef } from 'react';
import { CameraState } from '../types';

interface CameraFeedProps {
  onStreamReady?: (video: HTMLVideoElement) => void;
  children?: (video: HTMLVideoElement | null) => React.ReactNode;
}

export const CameraFeed = forwardRef<HTMLVideoElement, CameraFeedProps>(({ onStreamReady, children }, ref) => {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const [cameraState, setCameraState] = useState<CameraState>({
    isStreaming: false,
    permissionDenied: false,
    activeDeviceId: null,
  });

  // Handle both internal and external refs
  const videoRef = (ref as React.RefObject<HTMLVideoElement>) || internalVideoRef;

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function setupCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setCameraState(prev => ({ ...prev, isStreaming: true }));
            if (onStreamReady && videoRef.current) {
              onStreamReady(videoRef.current);
            }
          };
        }
      } catch (err) {
        console.error('Camera access denied:', err);
        setCameraState(prev => ({ ...prev, permissionDenied: true }));
      }
    }

    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onStreamReady]);

  if (cameraState.permissionDenied) {
    return (
      <div className="flex flex-col items-center justify-center bg-slate-800 rounded-xl aspect-video p-8 text-center border-2 border-dashed border-red-500/50">
        <div className="bg-red-500/20 p-4 rounded-full mb-4">
          <i className="fas fa-video-slash text-3xl text-red-500"></i>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Camera Access Denied</h3>
        <p className="text-slate-400 text-sm max-w-xs">
          Please enable camera permissions in your browser settings to use face detection features.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl bg-black ring-1 ring-slate-700 shadow-2xl group">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover scale-x-[-1]"
      />
      
      {!cameraState.isStreaming && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
            <i className="fas fa-camera absolute inset-0 flex items-center justify-center text-slate-500 text-xl"></i>
          </div>
          <span className="mt-4 text-slate-400 font-medium animate-pulse">Initializing Camera...</span>
        </div>
      )}

      {cameraState.isStreaming && children && children(videoRef.current)}
      
      {/* HUD Info Overlay */}
      <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
         <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-mono text-indigo-300 border border-indigo-500/30 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            LIVE FEED
         </div>
      </div>
    </div>
  );
});
