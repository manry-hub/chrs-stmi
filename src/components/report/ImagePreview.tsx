import React, { useState, useEffect } from "react";
import { ImagePlus, X, Camera, ImageIcon } from "lucide-react";
import { Button } from "../ui/Button";
import imageCompression from "browser-image-compression";

interface ImagePreviewProps {
    onImageSelected: (file: File | null) => void;
    error?: string;
}

export function ImagePreview({ onImageSelected, error }: ImagePreviewProps) {
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validasi tipe
        if (!file.type.startsWith("image/")) {
            alert("File harus berupa gambar");
            return;
        }

        // 🔥 Compress options
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1280,
            useWebWorker: true,
            fileType: "image/webp",
        };

        try {
            const compressedFile = await imageCompression(file, options);

            console.log("Original:", file.size / 1024 / 1024, "MB");
            console.log("Compressed:", compressedFile.size / 1024 / 1024, "MB");

            setPreview(URL.createObjectURL(compressedFile));
            onImageSelected(compressedFile);
        } catch (error) {
            console.error("Compression error:", error);
            alert("Gagal memproses gambar");
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
                <div
                    className={`flex flex-col items-center justify-center w-full min-h-[200px] rounded-md border-2 border-dashed transition-colors p-6 ${
                        error ? "border-red-300 bg-red-50" : "border-slate-300 bg-slate-50"
                    }`}
                >
                    <div className="flex flex-col items-center mb-5">
                        <ImagePlus className={`w-10 h-10 mb-2 ${error ? "text-red-400" : "text-slate-400"}`} />
                        <p className={`mb-1 font-medium ${error ? "text-red-500" : "text-slate-700"}`}>Pilih foto kejadian</p>
                        <p className={`text-xs ${error ? "text-red-400" : "text-slate-500"}`}>PNG, JPG max 5MB</p>
                    </div>

                    <div className="flex w-full max-w-sm gap-3">
                        <label className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold shadow-sm shadow-blue-500/20 active:scale-[0.98]">
                                <Camera className="w-4 h-4" />
                                Kamera
                            </div>
                            <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />
                        </label>

                        <label className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-300 py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors text-sm font-semibold shadow-sm active:scale-[0.98]">
                                <ImageIcon className="w-4 h-4" />
                                Galeri
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                    </div>
                </div>
            )}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}
