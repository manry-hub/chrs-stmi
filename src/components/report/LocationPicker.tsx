import React, { useState, useEffect } from "react";
import { Label } from "../ui/Label";
import { Combobox } from "../ui/Combobox";
import { LocationDocument } from "@/types";

interface LocationPickerProps {
    onLocationChange: (location: { name: string; locationId?: string; assignedAdminId?: string }) => void;
    error?: string;
    nameError?: string;
    locations: LocationDocument[];
    initialLocationId?: string;
}

export function LocationPicker({ onLocationChange, error, nameError, locations, initialLocationId }: LocationPickerProps) {
    const [selectedId, setSelectedId] = useState<string>(initialLocationId || "");

    // Initial load: if initialLocationId is provided, trigger onLocationChange
    useEffect(() => {
        if (initialLocationId) {
            const loc = locations.find(l => l.id === initialLocationId);
            if (loc) {
                onLocationChange({
                    name: loc.name,
                    locationId: loc.id,
                    assignedAdminId: loc.adminIds?.[0] || undefined
                });
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialLocationId, locations]);

    const handleComboboxChange = (newId: string) => {
        setSelectedId(newId);
        
        const loc = locations.find(l => l.id === newId);
        if (loc) {
            onLocationChange({
                name: loc.name,
                locationId: loc.id,
                assignedAdminId: loc.adminIds?.[0] || undefined
            });
        } else {
            onLocationChange({ name: "" });
        }
    };

    return (
        <div className="space-y-3">
            <div>
                <Label htmlFor="locationName">Pilih Lokasi Kejadian</Label>
                <div className="mt-1">
                    <Combobox
                        options={locations.map(loc => ({ value: loc.id!, label: loc.name }))}
                        value={selectedId}
                        onChange={handleComboboxChange}
                        placeholder="Cari dan pilih lokasi kejadian.."
                        allowCustom={false}
                    />
                </div>
                {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
                {error && !nameError && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>

            {selectedId && !nameError && !error && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span>
                        Penanggung Jawab:{" "}
                        <span className="font-medium text-slate-700">
                            {(() => {
                                const loc = locations.find((l) => l.id === selectedId);
                                if (!loc || !loc.adminNames || loc.adminNames.length === 0) return "Belum ditentukan";
                                return loc.adminNames.join(", ");
                            })()}
                        </span>
                    </span>
                </div>
            )}
        </div>
    );
}
