import { get, set, del, update, keys } from 'idb-keyval';

export type DraftStatus = 'PENDING' | 'SYNCING' | 'FAILED';

export interface OfflineDraft {
  id: string; // client-generated UUID
  createdAt: number;
  status: DraftStatus;
  formData: {
    reporterName: string;
    deviceId?: string;
    description: string;
    additionalMessage?: string;
    locationId?: string;
    assignedAdminId?: string;
    location: {
      name: string;
      lat?: number;
      lng?: number;
      accuracy?: number;
    };
  };
  imageFile: File; // File object stored as Blob/File in IDB
  errorMessage?: string;
}

/** Draft sebagaimana dibentuk pemanggil, sebelum status dan waktu dilekatkan. */
export type OfflineDraftInput = Omit<OfflineDraft, 'createdAt' | 'status'>;

const STORE_PREFIX = 'draft_';

export async function saveDraft(draft: OfflineDraftInput): Promise<OfflineDraft> {
  const newDraft: OfflineDraft = {
    ...draft,
    createdAt: Date.now(),
    status: 'PENDING',
  };
  
  await set(`${STORE_PREFIX}${newDraft.id}`, newDraft);
  return newDraft;
}

export async function getDrafts(): Promise<OfflineDraft[]> {
  try {
    const allKeys = await keys();
    const draftKeys = allKeys.filter((key) => typeof key === 'string' && key.startsWith(STORE_PREFIX));
    
    const drafts: OfflineDraft[] = [];
    for (const key of draftKeys) {
      const draft = await get<OfflineDraft>(key);
      if (draft) drafts.push(draft);
    }
    
    // Sort by createdAt descending (newest first)
    return drafts.sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    console.error('Failed to get drafts:', err);
    return [];
  }
}

export async function updateDraftStatus(id: string, status: DraftStatus, errorMessage?: string): Promise<void> {
  await update(`${STORE_PREFIX}${id}`, (val: any) => {
    if (!val) return val;
    const updated = { ...val, status };
    if (errorMessage) {
      updated.errorMessage = errorMessage;
    } else {
      delete updated.errorMessage;
    }
    return updated;
  });
}

export async function deleteDraft(id: string): Promise<void> {
  await del(`${STORE_PREFIX}${id}`);
}
