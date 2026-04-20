import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, LogOut, Save, Loader2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase';

const SettingsPage = () => {
  const { user, profile, signOut } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [selectedClass, setSelectedClass] = useState(profile?.class || 10);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase.from('profiles').update({
        full_name: fullName,
        class: selectedClass,
      }).eq('id', user.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA]">
      <Sidebar activeItem="Settings" />
      <main className="md:ml-[240px] p-4 md:p-8 pb-24 md:pb-8">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-display flex items-center gap-3">
            <SettingsIcon className="text-gray-500" size={28} /> Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account and preferences</p>
        </header>

        <div className="max-w-2xl space-y-6">
          {/* Profile Section */}
          <div className="bg-white rounded-2xl p-6 border border-gray-50 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <User size={20} className="text-gray-500" />
              <h2 className="text-lg font-bold text-gray-900">Profile</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-teal-500/30 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <input type="email" value={user?.email || ''} disabled
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 bg-gray-50 text-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Class</label>
                <div className="grid grid-cols-4 gap-2">
                  {[9, 10, 11, 12].map(cls => (
                    <button key={cls} onClick={() => setSelectedClass(cls)}
                      className={`py-2.5 rounded-xl text-sm font-bold transition-all ${selectedClass === cls ? 'bg-teal-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                      Class {cls}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleSave} disabled={saving}
                className="mt-2 px-6 py-2.5 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors disabled:opacity-60 flex items-center gap-2">
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Account Section */}
          <div className="bg-white rounded-2xl p-6 border border-gray-50 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Shield size={20} className="text-gray-500" />
              <h2 className="text-lg font-bold text-gray-900">Account</h2>
            </div>

            <button onClick={handleSignOut}
              className="px-6 py-2.5 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors flex items-center gap-2">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
