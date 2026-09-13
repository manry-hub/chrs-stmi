import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { LocationDocument, UserDocument } from "@/types";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; adminIds: string[] }) => Promise<void>;
  isSubmitting: boolean;
  admins: UserDocument[];
  editingLocation?: LocationDocument | null;
}

export function LocationModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  admins,
  editingLocation,
}: LocationModalProps) {
  const [newName, setNewName] = useState("");
  const [selectedAdminIds, setSelectedAdminIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (editingLocation) {
        setNewName(editingLocation.name);
        setSelectedAdminIds(editingLocation.adminIds || []);
      } else {
        setNewName("");
        setSelectedAdminIds([]);
      }
    }
  }, [isOpen, editingLocation]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ name: newName, adminIds: selectedAdminIds });
  };

  const toggleAdmin = (adminId: string) => {
    setSelectedAdminIds(prev =>
      prev.includes(adminId)
        ? prev.filter(id => id !== adminId)
        : [...prev, adminId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            {editingLocation ? "Edit Lokasi" : "Tambah Lokasi Baru"}
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
              Nama Lokasi
            </Label>
            <input
              id="name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="contoh: Gedung A Lantai 1"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <Label className="mb-2 block text-sm">
              Penanggung Jawab (Cleaning Service)
            </Label>
            {admins.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Belum ada admin terdaftar.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-md p-3">
                {admins.map((admin) => (
                  <label
                    key={admin.id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAdminIds.includes(admin.id)}
                      onChange={() => toggleAdmin(admin.id)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{admin.name}</p>
                      <p className="text-xs text-slate-500 truncate">{admin.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {selectedAdminIds.length > 0 && (
              <p className="text-xs text-slate-500 mt-2">
                {selectedAdminIds.length} penanggung jawab dipilih
              </p>
            )}
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
