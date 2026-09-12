import React, { useState, useEffect } from "react";
import { Label } from "../ui/Label";
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
                    assignedAdminId: loc.adminId || undefined
                });
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialLocationId, locations]);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newId = e.target.value;
        setSelectedId(newId);
        
        const loc = locations.find(l => l.id === newId);
        if (loc) {
            onLocationChange({
                name: loc.name,
                locationId: loc.id,
                assignedAdminId: loc.adminId || undefined
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
                    <select
                        id="locationName"
                        value={selectedId}
                        onChange={handleSelectChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${nameError ? "border-red-500" : "border-slate-300"}`}
                    >
                        <option value="">-- Pilih Lokasi --</option>
                        {locations.map(loc => (
                            <option key={loc.id} value={loc.id}>
                                {loc.name}
                            </option>
                        ))}
                    </select>
                </div>
                {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
                {error && !nameError && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
        </div>
    );
}
