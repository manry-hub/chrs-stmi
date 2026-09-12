"use client";

import { useState } from "react";
import { HazardTypeDocument } from "@/types";
import { createHazardType, updateHazardType, deleteHazardType } from "@/actions/masterData/hazardTypes";
import { Button } from "../ui/Button";
import { Trash2, Plus, ShieldAlert, Edit2 } from "lucide-react";
import toast from "react-hot-toast";
import { HazardTypeModal } from "./HazardTypeModal";

interface HazardTypeClientProps {
    initialData: HazardTypeDocument[];
}

export function HazardTypeClient({ initialData }: HazardTypeClientProps) {
    const [hazardTypes, setHazardTypes] = useState<HazardTypeDocument[]>(initialData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHazard, setEditingHazard] = useState<HazardTypeDocument | null>(null);

    const handleSubmit = async (id: string, name: string) => {
        if (!id || !name) return;
        setIsSubmitting(true);

        try {
            if (editingHazard) {
                const res = await updateHazardType(id, { name });
                if (res.success) {
                    toast.success("Kategori bahaya berhasil diupdate");
                    setHazardTypes(prev => prev.map(h => h.id === id ? { ...h, name } : h));
                    setIsModalOpen(false);
                } else {
                    toast.error(res.error || "Gagal mengupdate kategori");
                }
            } else {
                const res = await createHazardType({ id, name });
                if (res.success) {
                    toast.success("Kategori bahaya berhasil ditambahkan");
                    setHazardTypes(prev => [...prev, { id: id.replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase(), name, createdAt: {} as any }]);
                    setIsModalOpen(false);
                } else {
                    toast.error(res.error || "Gagal menambahkan kategori");
                }
            }
        } catch (error) {
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return;
        
        try {
            const res = await deleteHazardType(id);
            if (res.success) {
                toast.success("Kategori bahaya berhasil dihapus");
                setHazardTypes(prev => prev.filter(h => h.id !== id));
            } else {
                toast.error(res.error || "Gagal menghapus kategori");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan sistem");
        }
    };

    const handleCreateClick = () => {
        setEditingHazard(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (hazard: HazardTypeDocument) => {
        setEditingHazard(hazard);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-start">
                <Button onClick={handleCreateClick} className="shadow-lg shadow-blue-500/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Kategori Baru
                </Button>
            </div>

            {hazardTypes.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-slate-700">Belum ada kategori</h3>
                    <p className="text-sm text-slate-500">Kategori bahaya yang ditambahkan akan muncul di sini.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-800">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-600">ID</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600">Nama Kategori</th>
                                    <th className="px-6 py-4 font-semibold text-right text-slate-600">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {hazardTypes.map((hazard) => (
                                    <tr key={hazard.id} className="hover:bg-blue-50/30 transition-colors duration-150">
                                        <td className="px-6 py-4 font-mono text-xs">{hazard.id}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900">{hazard.name}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleEditClick(hazard)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-[1.05] active:scale-[0.95]"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(hazard.id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-[1.05] active:scale-[0.95]"
                                                title="Hapus"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <HazardTypeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                editingHazard={editingHazard}
            />
        </div>
    );
}
