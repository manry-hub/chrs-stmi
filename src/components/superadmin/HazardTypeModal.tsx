import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { HazardTypeDocument } from "@/types";

interface HazardTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { id?: string; name: string }) => Promise<void>;
  isSubmitting: boolean;
  editingHazard?: HazardTypeDocument | null;
}

export function HazardTypeModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  editingHazard,
}: HazardTypeModalProps) {
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (editingHazard) {
        setNewName(editingHazard.name);
      } else {
        setNewName("");
      }
    }
  }, [isOpen, editingHazard]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ id: editingHazard?.id, name: newName });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            {editingHazard ? "Edit Kategori" : "Tambah Kategori Baru"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-4">

          <div>
            <Label htmlFor="name" className="mb-1 block text-sm">
              Nama Kategori (Label)
            </Label>
            <input
              id="name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="contoh: Lantai Licin / Rusak"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="pt-4 flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
