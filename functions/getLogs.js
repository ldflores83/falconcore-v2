// ✅ Cloud Function: getLogs
import functions from 'firebase-functions';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const getLogs = functions.https.onRequest(async (req, res) => {
  try {
    const snapshot = await db.collection('logs').orderBy('timestamp', 'desc').limit(10).get();

    if (snapshot.empty) {
      return res.status(200).json({ message: 'No logs found.' });
    }

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({ logs: data });
  } catch (err) {
    console.error('❌ Error fetching logs:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export { getLogs };
