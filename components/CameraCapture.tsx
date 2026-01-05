import React, { useRef, useState, useCallback } from 'react';
import { Camera, Upload, X, RefreshCw } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  const startCamera = async () => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
      setStream(newStream);
      setIsStreamActive(true);
      setError('');
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Unable to access camera. Please use upload.");
    }
  };


  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreamActive(false);
  }, [stream]);

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
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center space-y-8">
      {isStreamActive ? (
        <div className="w-full max-w-lg animate-in zoom-in-95 duration-300">
          <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-black shadow-[0_0_50px_rgba(0,180,216,0.3)] border-4 border-white/10">
            <video
              ref={(el) => {
                (videoRef as any).current = el;
                if (el && stream) {
                  el.srcObject = stream;
                }
              }}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />

            {/* Camera Overlay Decor */}
            <div className="absolute inset-0 border-[20px] border-black/20 pointer-events-none" />
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white/40" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/40" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white/40" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-white/40" />

            <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-8">
              <button
                onClick={stopCamera}
                className="p-4 bg-slate-900/60 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-all border border-white/20"
                title="Cancel"
              >
                <X className="w-6 h-6" />
              </button>

              <button
                onClick={capturePhoto}
                className="group relative p-1 bg-white rounded-full shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-110 active:scale-90 transition-all"
              >
                <div className="w-16 h-16 rounded-full border-4 border-[#0f172a] flex items-center justify-center bg-white">
                  <div className="w-12 h-12 bg-gradient-to-tr from-vibez-blue to-vibez-purple rounded-full shadow-inner" />
                </div>
              </button>

              <div className="w-14" /> {/* Spacer for symmetry */}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-8 p-2">
          <button
            onClick={startCamera}
            className="group flex flex-col items-center justify-center p-10 bg-white rounded-3xl border border-gray-200 hover:border-2 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            style={{
              borderColor: undefined
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#00B4D8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '';
            }}
          >
            {/* Icon with gradient background */}
            <div className="w-28 h-28 rounded-2xl mb-6 flex items-center justify-center transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 180, 216, 0.08), rgba(114, 9, 183, 0.08))'
              }}
            >
              <Camera className="w-14 h-14 text-vibez-blue transition-transform duration-300 group-hover:scale-110" strokeWidth={2.5} />
            </div>
            <span className="font-action text-lg uppercase text-gray-900 mb-2 tracking-wide">CAMERA</span>
            <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">Take a Selfie</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="group flex flex-col items-center justify-center p-10 bg-white rounded-3xl border border-gray-200 hover:border-2 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            style={{
              borderColor: undefined
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#7209B7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '';
            }}
          >
            {/* Icon with gradient background */}
            <div className="w-28 h-28 rounded-2xl mb-6 flex items-center justify-center transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(114, 9, 183, 0.08), rgba(0, 180, 216, 0.08))'
              }}
            >
              <Upload className="w-14 h-14 text-vibez-purple transition-transform duration-300 group-hover:scale-110" strokeWidth={2.5} />
            </div>
            <span className="font-action text-lg uppercase text-gray-900 mb-2 tracking-wide">FILE</span>
            <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">Upload a Selfie</span>
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
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl animate-in shake duration-500">
          <p className="text-red-400 text-center text-sm font-bold uppercase tracking-widest">{error}</p>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;