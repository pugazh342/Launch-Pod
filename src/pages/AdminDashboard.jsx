import { useState } from 'react';

export default function AdminDashboard() {
  const [targetUrl, setTargetUrl] = useState('https://pugazhmani-portfolio.web.app');
  const [loading, setLoading] = useState(false);
  const [launchStatus, setLaunchStatus] = useState('Standby');

  const triggerLaunch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLaunchStatus('Broadcasting signal...');

    try {
      // Ping our secure Vercel backend to trigger Pusher
      const response = await fetch('/api/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'countdown', targetUrl })
      });

      if (response.ok) {
        setLaunchStatus('Launch Triggered Successfully!');
      } else {
        setLaunchStatus('Error: Failed to broadcast signal');
      }
    } catch (error) {
      console.error('Launch failed:', error);
      setLaunchStatus('Network Error');
    }
    
    setLoading(false);
  };

  const resetLaunch = async () => {
    setLaunchStatus('Resetting system...');
    try {
      await fetch('/api/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed', targetUrl: '' })
      });
      setLaunchStatus('Reset to Closed state.');
      // Remove the local stamp so you can test the animation again
      localStorage.removeItem('launch_completed');
    } catch (error) {
      setLaunchStatus('Error resetting system');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
        <h1 className="text-3xl font-bold text-center mb-2 text-cyan-400 uppercase tracking-wider">Command Center</h1>
        <p className="text-center text-gray-400 mb-8 font-mono text-sm">System Status: {launchStatus}</p>

        <form onSubmit={triggerLaunch} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wide">
              Destination URL
            </label>
            <input
              type="url"
              required
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-white transition-all font-mono"
              placeholder="https://..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold rounded-lg shadow-lg transform transition-all active:scale-95 uppercase tracking-widest"
          >
            {loading ? 'Initializing...' : 'Trigger Grand Opening'}
          </button>
        </form>

        <button 
          onClick={resetLaunch}
          className="w-full mt-6 py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors uppercase tracking-widest font-mono"
        >
          Reset Environment for Testing
        </button>
      </div>
    </div>
  );
}