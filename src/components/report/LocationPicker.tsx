import React, { useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";

interface LocationPickerProps {
    onLocationChange: (location: { name: string; lat: number; lng: number }) => void;
    error?: string;
    nameError?: string;
}

export function LocationPicker({ onLocationChange, error, nameError }: LocationPickerProps) {
    const [name, setName] = useState("");
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const getLocation = () => {
        setIsLoading(true);
        if ("geolocation" in navigator) {
            // navigator.geolocation.getCurrentPosition(
            //   (position) => {
            //     const newCoords = {
            //       lat: position.coords.latitude,
            //       lng: position.coords.longitude,
            //     };
            //     setCoords(newCoords);
            //     onLocationChange({ name, ...newCoords });
            //     setIsLoading(false);
            //   },
            //   (error) => {
            //     console.error("Error fetching location", error);
            //     alert("Gagal mendapatkan lokasi. Pastikan izin lokasi diberikan.");
            //     setIsLoading(false);
            //   }
            // );
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newCoords = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setCoords(newCoords);
                    onLocationChange({ name, ...newCoords });
                    setIsLoading(false);
                },
                (error) => {
                    console.error("Error fetching location", error);
                    alert("Gagal mendapatkan lokasi. Pastikan izin lokasi diberikan.");
                    setIsLoading(false);
                },
                {
                    enableHighAccuracy: true, // 🔥 penting
                    timeout: 10000,
                    maximumAge: 0,
                }
            );
        } else {
            alert("Browser Anda tidak mendukung geolokasi.");
            setIsLoading(false);
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);
        if (coords) {
            onLocationChange({ name: newName, ...coords });
        } else {
            // Provide default/fallback coordinates if none fetched yet
            onLocationChange({ name: newName, lat: 0, lng: 0 });
        }
    };

    return (
        <div className="space-y-3">
            <div>
                <Label htmlFor="locationName">Nama/Detail Lokasi</Label>
                <div className="flex gap-2 mt-1">
                    <Input
                        id="locationName"
                        placeholder="Contoh: Gedung A Lantai 2"
                        value={name}
                        onChange={handleNameChange}
                        className={nameError ? "border-red-500" : ""}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={getLocation}
                        disabled={isLoading}
                        className="shrink-0"
                        title="Dapatkan Koordinat GPS"
                    >
                        <MapPin className={`w-4 h-4 mr-2 ${coords ? "text-green-500" : "text-slate-500"}`} />
                        {isLoading ? "Mencari..." : "GPS"}
                    </Button>
                </div>
                {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
            </div>

            {coords && (
                <div className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-100 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>
                        Koordinat tersimpan: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                    </span>
                </div>
            )}
            {error && !nameError && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}
