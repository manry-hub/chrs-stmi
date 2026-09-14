"use client";

import { useState } from "react";
import { updateEmergencyContacts, EmergencyContactsData } from "@/actions/settings/emergencyContacts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import toast from "react-hot-toast";
import { ShieldAlert, Loader2 } from "lucide-react";

interface EmergencyContactSettingsCardProps {
  initialData: EmergencyContactsData;
}

export function EmergencyContactSettingsCard({ initialData }: EmergencyContactSettingsCardProps) {
  const [teams, setTeams] = useState(initialData.teams);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleTeamChange = (index: number, field: "name" | "phone", value: string) => {
    const newTeams = [...teams];
    newTeams[index] = { ...newTeams[index], [field]: value };
    setTeams(newTeams);
  };

  async function handleSave() {
    setLoading(true);
    try {
      await updateEmergencyContacts({ teams });
      toast.success("Kontak satpam berhasil diperbarui!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui pengaturan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Kontak Darurat (Satpam)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola nomor WhatsApp Satpam. Jadwal akan berganti otomatis setiap 2 hari.
            </p>
          </div>
        </div>
        <span className="text-slate-400 text-sm">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4">
          <div className="space-y-6 max-w-2xl">
            {teams.map((team, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`team-name-${index}`}>Nama Tim {index + 1}</Label>
                  <Input
                    id={`team-name-${index}`}
                    type="text"
                    value={team.name}
                    placeholder="Contoh: Rico"
                    onChange={(e) => handleTeamChange(index, "name", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`team-phone-${index}`}>No. WhatsApp (awalan 08 / 62)</Label>
                  <Input
                    id={`team-phone-${index}`}
                    type="text"
                    value={team.phone}
                    placeholder="08xxxxxxxxxx"
                    onChange={(e) => handleTeamChange(index, "phone", e.target.value)}
                  />
                </div>
              </div>
            ))}
            
            <div className="flex justify-end pt-2 border-t border-slate-100">
                <Button onClick={handleSave} disabled={loading} className="shrink-0 bg-blue-600 hover:bg-blue-700">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Simpan Kontak
                </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
