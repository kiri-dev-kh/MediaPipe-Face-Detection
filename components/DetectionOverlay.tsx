
import React, { useRef, useEffect } from 'react';
import { useFaceDetectionContext } from './FaceDetectionProvider';
import { KEYPOINT_LABELS } from '../constants';

interface DetectionOverlayProps {
  video: HTMLVideoElement | null;
}

export const DetectionOverlay: React.FC<DetectionOverlayProps> = ({ video }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { detector, updateResults, state } = useFaceDetectionContext();
  // Fix: useRef requires an initial value argument when using generics in some TypeScript configurations.
  // Added undefined as the initial value to satisfy the 1-argument requirement.
  const requestRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(performance.now());
  const framesRef = useRef<number>(0);

  const draw = () => {
    if (!detector || !video || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Detection
    const startTime = performance.now();
    const results = detector.detectForVideo(video, startTime);
    
    // FPS calculation
    framesRef.current++;
    if (startTime - lastTimeRef.current >= 1000) {
      const fps = Math.round((framesRef.current * 1000) / (startTime - lastTimeRef.current));
      updateResults(results, fps);
      framesRef.current = 0;
      lastTimeRef.current = startTime;
    }

    // Sync canvas size to video rendered size
    if (canvas.width !== video.clientWidth || canvas.height !== video.clientHeight) {
      canvas.width = video.clientWidth;
      canvas.height = video.clientHeight;
    }

    // Clear and Flip (matching the mirrored camera feed)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    if (results.detections && results.detections.length > 0) {
      results.detections.forEach((detection, index) => {
        const bbox = detection.boundingBox;
        if (!bbox) return;

        // Scaling coordinates
        // MediaPipe returns coordinates relative to video native resolution
        const scaleX = canvas.width / video.videoWidth;
        const scaleY = canvas.height / video.videoHeight;

        const x = bbox.originX * scaleX;
        const y = bbox.originY * scaleY;
        const width = bbox.width * scaleX;
        const height = bbox.height * scaleY;

        // Draw Bounding Box
        ctx.strokeStyle = '#6366f1'; // Indigo-500
        ctx.lineWidth = 3;
        ctx.beginPath();
        // Rounded corners
        const r = 8;
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + width - r, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + r);
        ctx.lineTo(x + width, y + height - r);
        ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
        ctx.lineTo(x + r, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.stroke();

        // Draw Semi-transparent Fill
        ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
        ctx.fill();

        // Label Tag Background
        ctx.fillStyle = '#6366f1';
        ctx.beginPath();
        ctx.roundRect(x, y - 25, 60, 20, 4);
        ctx.fill();

        // Score Text
        ctx.save();
        ctx.translate(x + width, y - 25);
        ctx.scale(-1, 1); // Flip back for text readability
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Inter';
        const scoreText = `ID: ${index + 1} (${Math.round(detection.categories[0].score * 100)}%)`;
        ctx.fillText(scoreText, -55, 14);
        ctx.restore();

        // Draw Keypoints
        if (detection.keypoints) {
          detection.keypoints.forEach((kp, kpIndex) => {
            const kX = kp.x * video.videoWidth * scaleX;
            const kY = kp.y * video.videoHeight * scaleY;

            // Glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#818cf8';
            ctx.fillStyle = '#818cf8';
            ctx.beginPath();
            ctx.arc(kX, kY, 4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Inner point
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(kX, kY, 1.5, 0, 2 * Math.PI);
            ctx.fill();
          });
        }
      });
    }

    ctx.restore();
    requestRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(draw);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [detector, video]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-20"
    />
  );
};
