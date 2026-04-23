import { useRef, useState } from 'react';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  onChange: (base64: string) => void;
  onRemove: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function ImageUpload({ value, onChange, onRemove, size = 'md' }: ImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const dims = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  }[size];

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image trop volumineuse (max 5 Mo)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      // Compress image
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 400;
        let w = img.width, h = img.height;
        if (w > h) { if (w > MAX) { h = h * MAX / w; w = MAX; } }
        else { if (h > MAX) { w = w * MAX / h; h = MAX; } }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', 0.75);
        onChange(compressed);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  if (value) {
    return (
      <div className={`relative group ${dims} rounded-xl overflow-hidden border-2 border-gray-200`}>
        <img src={value} alt="Produit" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
          <button type="button" onClick={() => fileRef.current?.click()}
            className="p-1.5 bg-white rounded-lg hover:bg-gray-100" title="Changer">
            <Camera className="w-4 h-4 text-gray-700" />
          </button>
          <button type="button" onClick={onRemove}
            className="p-1.5 bg-red-500 rounded-lg hover:bg-red-600" title="Supprimer">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>
    );
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => fileRef.current?.click()}
      className={`${dims} rounded-xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-1 transition ${
        dragOver ? 'border-amber-400 bg-amber-50' : 'border-gray-300 bg-gray-50 hover:border-amber-400 hover:bg-amber-50'
      }`}
    >
      {dragOver ? (
        <Upload className="w-5 h-5 text-amber-500" />
      ) : (
        <>
          <ImageIcon className="w-5 h-5 text-gray-400" />
          <span className="text-[10px] text-gray-400 text-center leading-tight px-1">Ajouter une photo</span>
        </>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  );
}
