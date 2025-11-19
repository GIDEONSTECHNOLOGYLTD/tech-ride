import admin from 'firebase-admin';

class FirebaseService {
  private initialized = false;

  initialize() {
    if (this.initialized) return;

    try {
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as any),
      });

      this.initialized = true;
      console.log('✅ Firebase Admin initialized');
    } catch (error) {
      console.error('❌ Firebase initialization error:', error);
    }
  }

  // Send push notification to single device
  async sendToDevice(fcmToken: string, title: string, body: string, data?: any) {
    if (!this.initialized) this.initialize();

    try {
      const message = {
        notification: {
          title,
          body,
        },
        data: data || {},
        token: fcmToken,
        android: {
          priority: 'high' as const,
          notification: {
            sound: 'default',
            channelId: 'ride_updates',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      return { success: true, messageId: response };
    } catch (error: any) {
      console.error('Push notification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send to multiple devices
  async sendToMultipleDevices(fcmTokens: string[], title: string, body: string, data?: any) {
    if (!this.initialized) this.initialize();

    try {
      const message = {
        notification: {
          title,
          body,
        },
        data: data || {},
        tokens: fcmTokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error: any) {
      console.error('Multicast notification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send to topic (for broadcast messages)
  async sendToTopic(topic: string, title: string, body: string, data?: any) {
    if (!this.initialized) this.initialize();

    try {
      const message = {
        notification: {
          title,
          body,
        },
        data: data || {},
        topic,
      };

      const response = await admin.messaging().send(message);
      return { success: true, messageId: response };
    } catch (error: any) {
      console.error('Topic notification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Subscribe user to topic
  async subscribeToTopic(fcmTokens: string | string[], topic: string) {
    if (!this.initialized) this.initialize();

    try {
      const tokens = Array.isArray(fcmTokens) ? fcmTokens : [fcmTokens];
      await admin.messaging().subscribeToTopic(tokens, topic);
      return { success: true };
    } catch (error: any) {
      console.error('Topic subscription error:', error);
      return { success: false, error: error.message };
    }
  }

  // Unsubscribe from topic
  async unsubscribeFromTopic(fcmTokens: string | string[], topic: string) {
    if (!this.initialized) this.initialize();

    try {
      const tokens = Array.isArray(fcmTokens) ? fcmTokens : [fcmTokens];
      await admin.messaging().unsubscribeFromTopic(tokens, topic);
      return { success: true };
    } catch (error: any) {
      console.error('Topic unsubscription error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new FirebaseService();
