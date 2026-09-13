"use client";

import { useState } from "react";
import { LocationDocument, UserDocument } from "@/types";
import { createLocation, updateLocation, deleteLocation } from "@/actions/masterData/locations";
import { Button } from "../ui/Button";
import { Trash2, Plus, Edit2, QrCode, MapPin, Download } from "lucide-react";
import toast from "react-hot-toast";
import { QRCodeCanvas } from "qrcode.react";
import { LocationModal } from "./LocationModal";

interface LocationClientProps {
    initialData: LocationDocument[];
    admins: UserDocument[];
}

export function LocationClient({ initialData, admins }: LocationClientProps) {
    const [locations, setLocations] = useState<LocationDocument[]>(initialData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<LocationDocument | null>(null);

    const [showQR, setShowQR] = useState<string | null>(null); // location id to show QR

    const handleSubmit = async (data: { name: string; adminIds: string[] }) => {
        setIsSubmitting(true);
        // Resolve admin names from IDs
        const adminNames = data.adminIds.map(id => {
            const admin = admins.find(a => a.id === id);
            return admin ? admin.name : "Unknown";
        });

        try {
            if (editingLocation) {
                const res = await updateLocation(editingLocation.id, { name: data.name, adminIds: data.adminIds, adminNames });
                if (res.success) {
                    toast.success("Lokasi berhasil diupdate");
                    setLocations(prev => prev.map(loc => loc.id === editingLocation.id ? { ...loc, name: data.name, adminIds: data.adminIds, adminNames } : loc));
                    setIsModalOpen(false);
                } else {
                    toast.error(res.error || "Gagal mengupdate lokasi");
                }
            } else {
                const res = await createLocation({ name: data.name, adminIds: data.adminIds, adminNames });
                if (res.success) {
                    toast.success("Lokasi berhasil ditambahkan");
                    setLocations(prev => [...prev, { id: res.id || crypto.randomUUID(), name: data.name, adminIds: data.adminIds, adminNames, createdAt: {} as any }]);
                    setIsModalOpen(false);
                } else {
                    toast.error(res.error || "Gagal menambahkan lokasi");
                }
            }
        } catch (error) {
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus lokasi ini?")) return;
        
        try {
            const res = await deleteLocation(id);
            if (res.success) {
                toast.success("Lokasi berhasil dihapus");
                setLocations(prev => prev.filter(l => l.id !== id));
            } else {
                toast.error(res.error || "Gagal menghapus lokasi");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan sistem");
        }
    };

    const handleCreateClick = () => {
        setEditingLocation(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (loc: LocationDocument) => {
        setEditingLocation(loc);
        setIsModalOpen(true);
    };

    const getReportUrl = (locId: string) => {
        if (typeof window === "undefined") return "";
        return `${window.location.origin}/dashboard?loc=${locId}`;
    };

    const handleDownloadQR = () => {
        const canvas = document.getElementById("qr-canvas") as HTMLCanvasElement;
        if (!canvas) return;

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const ctx = tempCanvas.getContext("2d");
        if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            ctx.drawImage(canvas, 0, 0);
            
            const jpgUrl = tempCanvas.toDataURL("image/jpeg");
            const downloadLink = document.createElement("a");
            downloadLink.href = jpgUrl;
            downloadLink.download = `QR_Lokasi_${showQR}.jpg`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            toast.success("QR Code berhasil diunduh");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-start">
                <Button onClick={handleCreateClick} className="shadow-lg shadow-blue-500/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Lokasi Baru
                </Button>
            </div>

            {locations.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-slate-700">Belum ada lokasi</h3>
                    <p className="text-sm text-slate-500">Lokasi yang ditambahkan akan muncul di sini.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-800">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-600">Nama Lokasi</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600">Penanggung Jawab</th>
                                    <th className="px-6 py-4 font-semibold text-right text-slate-600">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {locations.map((loc) => (
                                    <tr key={loc.id} className="hover:bg-blue-50/30 transition-colors duration-150">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-slate-900">{loc.name}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {loc.adminIds && loc.adminIds.length > 0 ? (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {loc.adminNames.map((name, idx) => (
                                                        <span key={loc.adminIds[idx]} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-800 tracking-wide uppercase">
                                                            {name}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic bg-slate-100 px-2 py-1 rounded-md">Belum di-assign</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => setShowQR(loc.id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-[1.05] active:scale-[0.95]"
                                                title="Lihat QR Code"
                                            >
                                                <QrCode className="w-3.5 h-3.5" />
                                                QR Code
                                            </button>
                                            <button
                                                onClick={() => handleEditClick(loc)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-[1.05] active:scale-[0.95]"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(loc.id)}
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

            {/* QR Modal */}
            {showQR && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">QR Code Lokasi</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Scan QR Code ini untuk otomatis mengisi lokasi pada form pelaporan.
                        </p>
                        
                        <div className="flex justify-center bg-white p-4 rounded-lg border border-slate-100 mb-6 inline-block">
                            <QRCodeCanvas id="qr-canvas" value={getReportUrl(showQR)} size={200} level="H" includeMargin />
                        </div>
                        
                        <div className="space-y-3">
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={handleDownloadQR}>
                                <Download className="w-4 h-4 mr-2" />
                                Export ke JPG
                            </Button>
                           
                            <Button variant="outline" className="w-full" onClick={() => setShowQR(null)}>
                                Tutup
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <LocationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                admins={admins}
                editingLocation={editingLocation}
            />
        </div>
    );
}
