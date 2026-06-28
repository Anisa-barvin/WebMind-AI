import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { websiteAPI } from '../services/api';
import { 
  FolderHeart, 
  Globe, 
  Calendar, 
  FileText, 
  Database,
  ChevronRight
} from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Toast from '../components/Toast';
import WebsiteSummaryDashboard from '../components/WebsiteSummaryDashboard';

const WebsiteManagement = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState(null);
  
  // Toast settings
  const [toastShow, setToastShow] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  const navigate = useNavigate();

  const fetchWebsites = async () => {
    try {
      const res = await websiteAPI.list();
      setWebsites(res.data.websites || []);
      if (res.data.websites?.length > 0 && !selectedSite) {
        setSelectedSite(res.data.websites[0]);
      }
    } catch (err) {
      console.error('Error fetching websites:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this website? All pages, vector indexes, and conversations will be deleted forever.')) {
      return;
    }

    try {
      await websiteAPI.delete(id);
      setToastMsg('Website deleted successfully');
      setToastType('success');
      setToastShow(true);
      
      // Update local state
      const updated = websites.filter(site => site._id !== id);
      setWebsites(updated);
      
      if (selectedSite?._id === id) {
        setSelectedSite(updated.length > 0 ? updated[0] : null);
      }
    } catch (err) {
      setToastMsg(err.response?.data?.error || 'Failed to delete website');
      setToastType('error');
      setToastShow(true);
    }
  };

  const handleRetrain = async (id) => {
    try {
      await websiteAPI.retrain(id);
      setToastMsg('Retraining started in the background.');
      setToastType('success');
      setToastShow(true);
      
      // Update local status to crawling
      setWebsites(prev => prev.map(site => site._id === id ? { ...site, status: 'crawling' } : site));
      if (selectedSite?._id === id) {
        setSelectedSite(prev => ({ ...prev, status: 'crawling' }));
      }
      
      navigate('/train');
    } catch (err) {
      setToastMsg(err.response?.data?.error || 'Failed to retrain website');
      setToastType('error');
      setToastShow(true);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <FolderHeart className="h-7 w-7 text-indigo-500" />
          <span>Manage Trained Websites</span>
        </h2>
        <p className="text-slate-400 text-xs mt-1">Review trained websites, browse AI-generated overview summaries, retrain, or delete indexes.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <LoadingSkeleton.List />
          </div>
          <div className="md:col-span-1">
            <LoadingSkeleton.Card />
          </div>
        </div>
      ) : websites.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center bg-slate-900/10 border border-dashed border-slate-800 rounded-3xl max-w-2xl mx-auto">
          <Globe className="h-12 w-12 text-slate-600 mb-4" />
          <h3 className="text-base font-bold text-slate-300">No trained websites found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mb-6">You need to submit and crawl a website URL before you can manage resources or chat with documents.</p>
          <Link to="/train" className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white transition-colors glow-indigo">
            Train New Website
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Area: List of Websites */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {websites.map((site) => {
                const isSelected = selectedSite?._id === site._id;
                return (
                  <div 
                    key={site._id}
                    onClick={() => setSelectedSite(site)}
                    className={`glassmorphism p-5 rounded-2xl cursor-pointer border hover:border-slate-700/60 flex flex-col justify-between gap-4 transition-all duration-300 ${
                      isSelected ? 'border-indigo-500/40 ring-1 ring-indigo-500/20 bg-indigo-950/5' : 'border-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}>
                          <Globe className="h-4.5 w-4.5" />
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-sm font-bold truncate text-slate-200">{site.name}</h4>
                          <p className="text-[10px] text-slate-500 truncate">{site.url}</p>
                        </div>
                      </div>
                      <ChevronRight className={`h-4.5 w-4.5 text-slate-500 transition-transform ${isSelected ? 'translate-x-1' : ''}`} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[11px] font-semibold text-slate-400 border-t border-slate-850 pt-3">
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-slate-500" />
                        <span>Pages: <b className="text-slate-200">{site.totalPages}</b></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Database className="h-3.5 w-3.5 text-slate-500" />
                        <span>Chunks: <b className="text-slate-200">{site.totalChunks}</b></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-850 pt-3 text-[10px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Trained: {new Date(site.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        site.status === 'ready' 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20'
                          : site.status === 'failed'
                          ? 'bg-rose-950 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-950 text-amber-400 border border-amber-500/20 animate-pulse'
                      }`}>
                        {site.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Area: AI Summary Dashboard */}
          {selectedSite && (
            <WebsiteSummaryDashboard 
              site={selectedSite} 
              onRetrain={handleRetrain} 
              onDelete={handleDelete} 
            />
          )}
        </div>
      )}

      {toastShow && (
        <Toast
          message={toastMsg}
          type={toastType}
          onClose={() => setToastShow(false)}
        />
      )}
    </div>
  );
};

export default WebsiteManagement;
