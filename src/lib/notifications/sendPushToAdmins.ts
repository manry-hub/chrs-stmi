import webpush from 'web-push';
import { adminDb } from '../firebase/admin';

// VAPID keys should be generated and set in environment variables
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:admin@stmi.ac.id',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

export async function sendPushToAdmins(payload: { title: string; body: string; url?: string }) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('VAPID keys not set. Skipping push notification.');
    return;
  }

  try {
    // Fetch all admin and superadmin subscriptions
    const snapshot = await adminDb
      .collection('pushSubscriptions')
      .where('role', 'in', ['admin', 'superadmin'])
      .get();

    if (snapshot.empty) {
      console.log('No admin push subscriptions found.');
      return;
    }

    const notifications = snapshot.docs.map(async (doc) => {
      const subscription = doc.data().subscription;
      try {
        await webpush.sendNotification(
          subscription,
          JSON.stringify(payload)
        );
      } catch (error: unknown) {
        // If subscription has expired or is invalid, remove it
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
    console.error('Error in sendPushToAdmins:', error);
  }
}
