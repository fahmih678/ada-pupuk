import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, X, Check, Image as ImageIcon, FlipHorizontal } from 'lucide-react';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
  title?: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Foto KTP / Wajah Penerima'
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode, capturedImage]);

  const startCamera = async () => {
    stopCamera();
    setErrorMsg(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMsg('Kamera browser tidak didukung. Silakan gunakan tombol Ambil dari Galeri.');
        return;
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setErrorMsg('Tidak dapat mengakses kamera langsung. Silakan unggah foto dari galeri / kamera HP.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleSnap = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // Kompres ke JPEG 0.75 agar ringan saat sync ke Google Drive
      const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCapturedImage(reader.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const toggleFacing = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Preview */}
        <div className="p-4 bg-slate-900 flex-1 flex flex-col items-center justify-center min-h-[300px] relative">
          {capturedImage ? (
            <div className="relative w-full max-h-[340px] rounded-xl overflow-hidden flex items-center justify-center bg-black">
              <img src={capturedImage} alt="Hasil Foto" className="max-h-[340px] w-auto object-contain" />
              <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
                Siap Dipakai
              </div>
            </div>
          ) : (
            <div className="relative w-full h-[320px] rounded-xl overflow-hidden bg-black flex items-center justify-center">
              {errorMsg ? (
                <div className="p-4 text-center text-slate-300">
                  <p className="text-xs mb-3 text-amber-300">{errorMsg}</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow hover:bg-emerald-700"
                  >
                    Pilih File Foto / Kamera HP
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay Frame Panduan KTP */}
                  <div className="absolute inset-x-8 top-12 bottom-12 border-2 border-dashed border-white/60 rounded-xl pointer-events-none flex items-center justify-center">
                    <span className="text-[11px] text-white/80 bg-black/40 px-2.5 py-1 rounded-md backdrop-blur-xs">
                      Posisikan KTP / Penerima di sini
                    </span>
                  </div>

                  {/* Flip camera button */}
                  <button
                    onClick={toggleFacing}
                    className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-xs"
                    title="Balik Kamera"
                  >
                    <FlipHorizontal className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          )}

          {/* Hidden File Input Fallback */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
          {!capturedImage ? (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
              >
                <ImageIcon className="w-4 h-4 text-slate-500" />
                <span>Pilih Galeri</span>
              </button>

              <button
                type="button"
                onClick={handleSnap}
                disabled={!!errorMsg}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-600/30 active:scale-95 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Ambil Foto</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Foto Ulang</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 active:scale-95 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Gunakan Foto</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

