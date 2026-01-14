
import React, { useState } from 'react';
import { FaceDetectionProvider, useFaceDetectionContext } from './components/FaceDetectionProvider';
import { CameraFeed } from './components/CameraFeed';
import { DetectionOverlay } from './components/DetectionOverlay';

const Dashboard: React.FC = () => {
  const { state, config } = useFaceDetectionContext();
  const [showStats, setShowStats] = useState(true);

  const faceCount = state.results?.detections?.length || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Sidebar / Controls */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <i className="fas fa-microchip text-xl text-white"></i>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-none">VisionFace</h1>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Real-Time Core</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowStats(!showStats)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              showStats ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <i className={`fas ${showStats ? 'fa-chart-simple' : 'fa-chart-pie'} mr-2`}></i>
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </button>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Video Feed */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/10 border border-slate-800 bg-slate-900">
            <CameraFeed>
              {(video) => (
                <DetectionOverlay video={video} />
              )}
            </CameraFeed>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon="fa-user-check" label="Faces Active" value={faceCount} color="text-indigo-400" />
            <StatCard icon="fa-bolt" label="Process Speed" value={`${state.fps} FPS`} color="text-amber-400" />
            <StatCard icon="fa-microchip" label="Hardware" value={config.delegate} color="text-green-400" />
            <StatCard icon="fa-shield-halved" label="Confidence" value={`${Math.round(config.minDetectionConfidence * 100)}%`} color="text-blue-400" />
          </div>
        </div>

        {/* Right Column: Information & Controls */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status Panel */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Detection Status</h2>
            <div className="space-y-4">
              <StatusRow label="WASM Module" active={!state.isLoading} loading={state.isLoading} />
              <StatusRow label="Model Loaded" active={!state.isLoading && !state.error} />
              <StatusRow label="GPU Acceleration" active={config.delegate === 'GPU'} />
            </div>

            {state.error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-red-400 text-sm">
                <i className="fas fa-circle-exclamation mt-0.5"></i>
                <p>{state.error}</p>
              </div>
            )}
          </div>

          {/* Keypoints Legend */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Tracking Points</h2>
            <div className="grid grid-cols-2 gap-2">
              {['R. Eye', 'L. Eye', 'Nose', 'Mouth', 'R. Ear', 'L. Ear'].map((point, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg text-xs font-medium text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  {point}
                </div>
              ))}
            </div>
          </div>

          {/* Technical Info */}
          <div className="p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl">
            <h3 className="text-indigo-400 font-semibold mb-2 flex items-center gap-2">
              <i className="fas fa-circle-info"></i>
              System Optimization
            </h3>
            <p className="text-xs text-indigo-300/80 leading-relaxed">
              Detection is running via MediaPipe BlazeFace Short Range. Bounding boxes and 6 key-points are normalized and mapped to the CSS overlay in real-time using requestAnimationFrame for zero-lag visuals.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-800 py-8 px-6 text-center text-slate-500 text-xs">
        <p>&copy; 2024 VisionFace Module. Built with MediaPipe v0.10+ and React 18.</p>
      </footer>
    </div>
  );
};

const StatCard: React.FC<{ icon: string; label: string; value: string | number; color: string }> = ({ icon, label, value, color }) => (
  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
    <div className={`text-xl mb-1 ${color}`}>
      <i className={`fas ${icon}`}></i>
    </div>
    <div className="text-slate-500 text-[10px] font-bold uppercase tracking-tight">{label}</div>
    <div className="text-xl font-bold text-white">{value}</div>
  </div>
);

const StatusRow: React.FC<{ label: string; active?: boolean; loading?: boolean }> = ({ label, active, loading }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
    <span className="text-sm text-slate-400">{label}</span>
    {loading ? (
      <i className="fas fa-circle-notch fa-spin text-indigo-500 text-xs"></i>
    ) : (
      <i className={`fas ${active ? 'fa-check-circle text-green-500' : 'fa-times-circle text-slate-600'} text-xs`}></i>
    )}
  </div>
);

const App: React.FC = () => {
  return (
    <FaceDetectionProvider config={{ minDetectionConfidence: 0.5 }}>
      <Dashboard />
    </FaceDetectionProvider>
  );
};

export default App;
