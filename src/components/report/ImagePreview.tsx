import React, { useState, useEffect } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "../ui/Button";

interface ImagePreviewProps {
  onImageSelected: (file: File | null) => void;
  error?: string;
}

export function ImagePreview({ onImageSelected, error }: ImagePreviewProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file maksimal 5MB");
        return;
      }
      setPreview(URL.createObjectURL(file));
      onImageSelected(file);
    }
  };

  const clearImage = () => {
    setPreview(null);
    onImageSelected(null);
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div className="w-full">
      {preview ? (
        <div className="relative w-full aspect-video rounded-md overflow-hidden bg-slate-100 border border-slate-200">
          <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 rounded-full h-8 w-8"
            onClick={clearImage}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <label className={`flex flex-col items-center justify-center w-full aspect-video rounded-md border-2 border-dashed cursor-pointer hover:bg-slate-50 transition-colors ${error ? 'border-red-300 bg-red-50' : 'border-slate-300'}`}>
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <ImagePlus className={`w-10 h-10 mb-3 ${error ? 'text-red-400' : 'text-slate-400'}`} />
            <p className={`mb-2 text-sm ${error ? 'text-red-500' : 'text-slate-500'}`}>
              <span className="font-semibold">Klik untuk unggah</span> atau seret file
            </p>
            <p className={`text-xs ${error ? 'text-red-400' : 'text-slate-400'}`}>PNG, JPG max 5MB</p>
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </label>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
