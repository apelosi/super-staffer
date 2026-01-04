import React, { useRef, useState, useCallback } from 'react';
import { Camera, Upload, X, RefreshCw } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [error, setError] = useState<string>('');

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreamActive(true);
        setError('');
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Unable to access camera. Please use upload.");
    }
  };

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreamActive(false);
    }
  }, []);

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg');
        onCapture(base64);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onCapture(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  React.useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {isStreamActive ? (
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4] shadow-xl">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover transform scale-x-[-1]" 
          />
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6">
            <button 
              onClick={stopCamera}
              className="p-3 bg-red-500 rounded-full text-white hover:bg-red-600 transition"
            >
              <X className="w-6 h-6" />
            </button>
            <button 
              onClick={capturePhoto}
              className="p-4 bg-white rounded-full border-4 border-vibez-purple shadow-lg hover:scale-110 transition"
            >
              <div className="w-4 h-4 bg-vibez-purple rounded-full" />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={startCamera}
            className="flex flex-col items-center justify-center p-8 bg-slate-800 rounded-2xl border-2 border-dashed border-slate-600 hover:border-vibez-blue hover:bg-slate-700 transition group"
          >
            <Camera className="w-10 h-10 text-vibez-blue mb-2 group-hover:scale-110 transition" />
            <span className="text-slate-300 font-bold">Use Camera</span>
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-8 bg-slate-800 rounded-2xl border-2 border-dashed border-slate-600 hover:border-vibez-purple hover:bg-slate-700 transition group"
          >
            <Upload className="w-10 h-10 text-vibez-purple mb-2 group-hover:scale-110 transition" />
            <span className="text-slate-300 font-bold">Upload File</span>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileUpload}
            />
          </button>
        </div>
      )}
      {error && <p className="text-red-400 text-center text-sm">{error}</p>}
    </div>
  );
};

export default CameraCapture;