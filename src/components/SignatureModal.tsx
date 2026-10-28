import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { X, Check, RotateCcw, PenTool } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureBase64: string) => void;
  petaniName: string;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onSave,
  petaniName
}) => {
  const sigPadRef = useRef<SignatureCanvas | null>(null);

  if (!isOpen) return null;

  const handleClear = () => {
    sigPadRef.current?.clear();
  };

  const handleSave = () => {
    if (sigPadRef.current?.isEmpty()) {
      alert('Silakan tanda tangan terlebih dahulu pada kotak yang disediakan.');
      return;
    }
    const dataUrl = sigPadRef.current?.getTrimmedCanvas().toDataURL('image/png');
    if (dataUrl) {
      onSave(dataUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Tanda Tangan Penebusan</h3>
              <p className="text-xs text-slate-500 truncate max-w-[220px]">
                Petani: <span className="font-semibold text-slate-700">{petaniName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Area */}
        <div className="p-4 bg-slate-50 flex-1 flex flex-col items-center">
          <div className="w-full bg-white border-2 border-dashed border-emerald-300 rounded-xl overflow-hidden shadow-inner relative">
            <SignatureCanvas
              ref={sigPadRef}
              penColor="#0f172a"
              canvasProps={{
                className: 'w-full h-52 bg-white touch-none cursor-crosshair'
              }}
            />
            <div className="absolute bottom-2 left-3 pointer-events-none text-[11px] text-slate-400 italic">
              ✍️ Tanda tangan menggunakan jari / stylus di area ini
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-2 text-center">
            Dengan bertanda tangan, penerima menyatakan telah menerima pupuk subsidi sesuai kuota e-RDKK yang sah.
          </p>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between space-x-3">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-xs active:scale-95 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Hapus Ulang</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 font-medium text-xs transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Gunakan Tanda Tangan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

