"use server";

import { adminDb } from "@/lib/firebase/admin";
import { auth } from "@/lib/auth";
import { z } from "zod";

export interface EmergencyTeam {
    name: string;
    phone: string;
}

export interface EmergencyContactsData {
    teams: EmergencyTeam[]; // Should contain exactly 3 teams
}

const emergencyContactsSchema = z.object({
    teams: z.array(z.object({
        name: z.string().min(1, "Nama tidak boleh kosong"),
        phone: z.string().min(5, "Nomor HP tidak valid"),
    })).length(3, "Harus ada tepat 3 tim"),
});

const defaultContacts: EmergencyContactsData = {
    teams: [
        { name: "Rico", phone: "082115395987" },
        { name: "Mahran", phone: "081541116753" },
        { name: "Adam", phone: "081230337461" },
    ]
};

export async function getEmergencyContacts(): Promise<EmergencyContactsData> {
    try {
        const doc = await adminDb.collection("settings").doc("emergency_contacts").get();
        if (!doc.exists) {
            return defaultContacts;
        }
        return doc.data() as EmergencyContactsData;
    } catch (error) {
        console.error("Error fetching emergency contacts:", error);
        return defaultContacts;
    }
}

export async function updateEmergencyContacts(input: unknown) {
    const session = await auth();
    if (session?.user?.role !== "superadmin") {
        throw new Error("Unauthorized");
    }

    const data = emergencyContactsSchema.parse(input);

    await adminDb.collection("settings").doc("emergency_contacts").set(data, { merge: true });

    return { success: true };
}

export async function getActiveEmergencyContact(): Promise<EmergencyTeam> {
    const contacts = await getEmergencyContacts();
    
    // Rotasi: Ganti otomatis 2 hari sekali.
    // Offset UTC+7 = 7 * 60 * 60 * 1000
    // Biar pergantiannya dihitung berdasarkan waktu Indonesia (WIB)
    const msPerDay = 1000 * 60 * 60 * 24;
    const nowLocal = Date.now() + (7 * 60 * 60 * 1000);
    const daysSinceEpoch = Math.floor(nowLocal / msPerDay);
    
    // Dibagi 2 karena jadwal ganti per 2 hari
    const shiftCycle = Math.floor(daysSinceEpoch / 2);
    
    // Modulo dengan 3 karena ada 3 tim
    const currentTeamIndex = shiftCycle % 3;

    return contacts.teams[currentTeamIndex];
}
