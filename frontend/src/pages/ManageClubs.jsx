import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { Edit2, Trash2, Shield, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const ManageClubs = () => {
  const { user } = useContext(AuthContext);
  const [clubs, setClubs] = useState([]);
  const navigate = useNavigate();

  const [editingClub, setEditingClub] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchClubs();
  }, [user, navigate]);

  const fetchClubs = async () => {
    try {
      const res = await api.get('/api/clubs');
      setClubs(res.data);
    } catch (err) {
      console.error('Error fetching clubs', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this club? All their data will be removed.')) return;
    try {
      await api.delete(`/api/clubs/${id}`);
      fetchClubs();
    } catch (err) {
      alert('Error deleting club');
    }
  };

  const handleEditClick = (club) => {
    setEditingClub(club._id);
    setEditForm(club);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/clubs/${editingClub}`, editForm);
      setEditingClub(null);
      fetchClubs();
    } catch (err) {
      alert('Error updating club');
    }
  };

  if (user?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center gap-2"><Shield className="text-primary w-8 h-8" /> Manage Clubs</h1>
          <button onClick={() => navigate('/create-club')} className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl transition flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> New Club
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {clubs.map(club => (
            <div key={club._id} className="bg-surface/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              {editingClub === club._id ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Head Name" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white" />
                    <input type="text" value={editForm.clubName} onChange={e => setEditForm({...editForm, clubName: e.target.value})} placeholder="Club Name" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white" />
                    <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} placeholder="Login Email" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white" />
                    <select value={editForm.clubType} onChange={e => setEditForm({...editForm, clubType: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white">
                      <option value="coding">Coding</option>
                      <option value="tech">Tech & Dev</option>
                      <option value="drama">Drama</option>
                      <option value="singing">Singing / Music</option>
                      <option value="social">Social</option>
                      <option value="health">Health & Wellness</option>
                      <option value="other">Other</option>
                    </select>
                    <textarea value={editForm.clubDescription} onChange={e => setEditForm({...editForm, clubDescription: e.target.value})} placeholder="Description" rows="2" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white md:col-span-2" />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-medium">Save</button>
                    <button type="button" onClick={() => setEditingClub(null)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium">Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-white/5">
                      {club.clubLogo ? <img src={club.clubLogo} alt="Logo" className="w-full h-full object-cover" /> : <Shield className="w-8 h-8 text-gray-500" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{club.clubName}</h3>
                      <p className="text-sm text-gray-400">Head: {club.name} | Type: <span className="capitalize">{club.clubType}</span></p>
                      <p className="text-sm text-gray-500 mt-1">{club.clubDescription}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <button onClick={() => handleEditClick(club)} className="flex-1 md:flex-none px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white transition flex items-center justify-center gap-2">
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={() => handleDelete(club._id)} className="flex-1 md:flex-none px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition flex items-center justify-center gap-2">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {clubs.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              No clubs have been created yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageClubs;
