import webpush from 'web-push';
import { adminDb } from '../firebase/admin';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:admin@stmi.ac.id',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

/**
 * Shared helper to send push notifications.
 * Handles the actual pushing and expired subscription cleanup.
 */
async function sendToQuery(
  query: FirebaseFirestore.Query,
  payload: { title: string; body: string; url?: string },
  filterFn?: (data: FirebaseFirestore.DocumentData) => boolean
) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.error('❌ VAPID Keys belum diset! Notifikasi tidak dikirim.');
    return;
  }

  try {
    const snapshot = await query.get();

    if (snapshot.empty) {
      console.log('No push subscriptions found for this query.');
      return;
    }

    const notifications = snapshot.docs.map(async (doc) => {
      const data = doc.data();

      // Apply custom filter if provided
      if (filterFn && !filterFn(data)) {
        return;
      }

      const subscription = data.subscription;
      try {
        await webpush.sendNotification(
          subscription,
          JSON.stringify(payload)
        );
      } catch (error: unknown) {
        if (error !== null && typeof error === 'object' && 'statusCode' in error) {
          const pushError = error as { statusCode: number };
          if (pushError.statusCode === 410 || pushError.statusCode === 404) {
            console.log(`Push subscription for user ${doc.id} expired. Removing.`);
            await doc.ref.delete();
          } else {
            console.error(`Error sending push to ${doc.id}:`, error);
          }
        } else {
          console.error(`Error sending push to ${doc.id}:`, error);
        }
      }
    });

    await Promise.allSettled(notifications);
  } catch (error) {
    console.error('Error in sendToQuery:', error);
  }
}

export async function sendPushToAdmins(payload: { title: string; body: string; url?: string }, targetAdminId?: string) {
  const query = adminDb.collection('pushSubscriptions').where('role', 'in', ['admin', 'superadmin']);
  
  await sendToQuery(query, payload, (data) => {
    // If there's a target admin, only send to that admin AND superadmins
    if (targetAdminId && data.role === 'admin' && data.userId !== targetAdminId) {
      return false;
    }
    return true;
  });
}

export async function sendPushToSuperadmins(payload: { title: string; body: string; url?: string }) {
  const query = adminDb.collection('pushSubscriptions').where('role', '==', 'superadmin');
  await sendToQuery(query, payload);
}

export async function sendPushToAll(payload: { title: string; body: string; url?: string }, excludeUserId?: string) {
  const query = adminDb.collection('pushSubscriptions');
  await sendToQuery(query, payload, (data) => {
    // Skip the excluded user (e.g. the reporter)
    if (excludeUserId && data.userId === excludeUserId) {
      return false;
    }
    return true;
  });
}
