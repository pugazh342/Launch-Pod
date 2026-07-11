import { useState } from 'react';
import { supabase } from '../lib/supabase';

// Replace with the actual UUID generated from your SQL INSERT statement
const EVENT_ID = 'd5fcc130-f480-46c4-a720-27e203342115'; 

export default function AdminDashboard() {
  const [targetUrl, setTargetUrl] = useState('https://cyberwolf.example.com');
  const [loading, setLoading] = useState(false);
  const [launchStatus, setLaunchStatus] = useState('Standby');

  const triggerLaunch = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Update the database to trigger the countdown across all clients
    const { error } = await supabase
      .from('launch_config')
      .update({ 
        status: 'countdown', 
        target_url: targetUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', EVENT_ID);

    if (error) {
      console.error('Launch failed:', error);
      setLaunchStatus('Error: Check Console');
    } else {
      setLaunchStatus('Launch Triggered Successfully!');
    }
    
    setLoading(false);
  };

  const resetLaunch = async () => {
     await supabase
      .from('launch_config')
      .update({ status: 'closed', target_url: '' })
      .eq('id', EVENT_ID);
      setLaunchStatus('Reset to Closed state.');
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
        <h1 className="text-3xl font-bold text-center mb-2 text-cyan-400">Command Center</h1>
        <p className="text-center text-gray-400 mb-8">System Status: {launchStatus}</p>

        <form onSubmit={triggerLaunch} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Destination URL
            </label>
            <input
              type="url"
              required
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-white transition-all"
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
          className="w-full mt-6 py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          Reset Environment for Testing
        </button>
      </div>
    </div>
  );
}