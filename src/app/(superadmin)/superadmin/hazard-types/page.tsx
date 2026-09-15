import { getHazardTypes } from "@/actions/masterData/hazardTypes";
import { HazardTypeClient } from "@/components/superadmin/HazardTypeClient";
import Link from "next/link";

export const revalidate = 0;

export default async function HazardTypesPage() {
    const hazardTypes = await getHazardTypes();

    return (
        <div className="space-y-6">
            <HazardTypeClient initialData={hazardTypes} />
        </div>
    );
}
