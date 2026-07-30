import Pusher from 'pusher';

// This runs securely on Vercel's servers, hiding your secret key!
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.VITE_PUSHER_APP_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.VITE_PUSHER_CLUSTER,
  useTLS: true,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { status, targetUrl } = req.body;

  try {
    // Broadcast the "launch-event" to the "cyber-wolf-channel"
    await pusher.trigger('cyber-wolf-channel', 'launch-event', {
      status: status,
      targetUrl: targetUrl,
    });
    
    res.status(200).json({ message: 'Launch signal broadcasted successfully!' });
  } catch (error) {
    console.error('Pusher error:', error);
    res.status(500).json({ error: 'Failed to trigger launch' });
  }
}