import { Resend } from 'resend';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import cron from 'node-cron';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Firebase Admin
initializeApp({
  credential: applicationDefault()
});

const db = getFirestore();

const emailScheduler = () => {
  console.log('Email scheduler started...');

  // Runs every minute
  cron.schedule('* * * * *', async () => {
    console.log('Checking for due emails...');

    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);

    try {
      const snapshot = await db.collection('emails')
        .where('deliveryDate', '==', currentDate)
        .where('deliveryTime', '==', currentTime)
        .where('delivered', '==', false)
        .get();

      if (snapshot.empty) return;

      snapshot.forEach(async (doc) => {
        const data = doc.data();
        
        try {
          await resend.emails.send({
            from: `Time Capsule <noreply@${process.env.DOMAIN}>`,
            to: data.recipientEmail,
            subject: 'A Message from the Past ⏳',
            text: data.message,
          });

          await db.collection('emails').doc(doc.id).update({ delivered: true });
          console.log(`Email sent to ${data.recipientEmail}`);
        } catch (error) {
          console.error('Failed to send email:', error);
        }
      });
    } catch (error) {
      console.error('Error fetching emails:', error);
    }
  });
};

export default emailScheduler;
