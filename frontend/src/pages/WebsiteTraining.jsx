import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { websiteAPI } from '../services/api';
import { 
  Globe, 
  Sparkles, 
  Cpu, 
  Terminal, 
  Play, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Loader2
} from 'lucide-react';
import Toast from '../components/Toast';

const WebsiteTraining = () => {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [pagesCrawled, setPagesCrawled] = useState(0);
  const [chunksGenerated, setChunksGenerated] = useState(0);
  const [websiteId, setWebsiteId] = useState(null);
  
  // Toast notifications
  const [toastShow, setToastShow] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  const navigate = useNavigate();
  const pollIntervalRef = useRef(null);
  const logEndRef = useRef(null);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  const handleStartTraining = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setLogs([]);
    setProgress(5);
    setPagesCrawled(0);
    setChunksGenerated(0);

    addLog(`Initiating connection request for: ${url}`, 'info');

    try {
      const res = await websiteAPI.train(url, name || undefined);
      const site = res.data.website;
      setWebsiteId(site._id);
      setIsTraining(true);
      setLoading(false);

      addLog(`Created training task ID: ${site._id}`, 'info');
      addLog(`Status: ${site.status.toUpperCase()} - Spawning same-domain recursive crawler (Max 50 pages)...`, 'info');

      // Start polling
      startPolling(site._id);
    } catch (error) {
      setLoading(false);
      const errMsg = error.response?.data?.error || 'Failed to start training';
      addLog(`Error initializing pipeline: ${errMsg}`, 'error');
      setToastMsg(errMsg);
      setToastType('error');
      setToastShow(true);
    }
  };

  const startPolling = (id) => {
    let checkCount = 0;
    
    pollIntervalRef.current = setInterval(async () => {
      checkCount++;
      try {
        const res = await websiteAPI.getStatus(id);
        const site = res.data.website;

        setPagesCrawled(site.totalPages || 0);
        setChunksGenerated(site.totalChunks || 0);

        // Update progress and logs based on backend status
        if (site.status === 'crawling') {
          // Crawling progress increases slowly
          const nextProgress = Math.min(45, 5 + checkCount * 5);
          setProgress(nextProgress);
          
          if (checkCount === 1) addLog(`Scanning target sitemap and HTML files...`, 'info');
          if (checkCount === 3) addLog(`Cleaning web templates: removing headers, menus, sidebars...`, 'info');
          if (checkCount === 5) addLog(`Crawled page list growing. Visited ${site.totalPages || 0} relative links.`, 'info');
        } 
        else if (site.status === 'indexing') {
          // Indexing progress from 50 to 90
          const nextProgress = Math.min(85, 50 + (checkCount % 10) * 4);
          setProgress(nextProgress);
          
          if (progress < 50) {
            addLog(`Crawl completed. Found ${site.totalPages} pages total.`, 'success');
            addLog(`Splitting extracted page corpuses into 800-character semantic sliding windows...`, 'info');
            addLog(`Calling Google Gemini Embedding Model (text-embedding-004) to project chunks...`, 'info');
          }
          if (checkCount % 3 === 0) {
            addLog(`Generated ${site.totalChunks || (site.totalPages * 4)} vectors. Syncing index to ChromaDB...`, 'info');
          }
        } 
        else if (site.status === 'ready') {
          setProgress(100);
          addLog(`Index synchronization completed successfully!`, 'success');
          addLog(`Calling Gemini model (gemini-1.5-flash) to extract structural summary details...`, 'info');
          addLog(`Website Agent trained and ready for user interactions.`, 'success');
          
          clearInterval(pollIntervalRef.current);
          setIsTraining(false);
          setToastMsg('Website assistant successfully trained!');
          setToastType('success');
          setToastShow(true);
        } 
        else if (site.status === 'failed') {
          addLog(`Critical pipeline failure: Crawl or Index operation terminated prematurely.`, 'error');
          clearInterval(pollIntervalRef.current);
          setIsTraining(false);
          setToastMsg('Training failed. See logs for details.');
          setToastType('error');
          setToastShow(true);
        }
      } catch (err) {
        console.error('Error polling status:', err);
      }
    }, 2000);
  };

  const getStepStatus = (stepIndex) => {
    if (progress === 0) return 'pending';
    
    if (stepIndex === 1) {
      if (progress >= 50) return 'completed';
      return 'active';
    }
    if (stepIndex === 2) {
      if (progress === 100) return 'completed';
      if (progress >= 50) return 'active';
      return 'pending';
    }
    if (stepIndex === 3) {
      if (progress === 100) return 'completed';
      return 'pending';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Globe className="h-7 w-7 text-indigo-500" />
          <span>Train New AI Assistant</span>
        </h2>
        <p className="text-slate-400 text-xs mt-1">Crawl a public website, segment its text, and index embeddings into the vector store.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Input Form */}
        <div className="md:col-span-1 space-y-6">
          <div className="glassmorphism p-6 rounded-2xl border border-slate-800/40">
            <h3 className="font-bold text-sm text-slate-200 mb-4 flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
              <span>Target Configuration</span>
            </h3>

            <form onSubmit={handleStartTraining} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Website URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="block w-full px-3 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 text-xs transition-colors"
                  disabled={isTraining || loading}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Agent Name (Optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Support"
                  className="block w-full px-3 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 text-xs transition-colors"
                  disabled={isTraining || loading}
                />
              </div>

              <button
                type="submit"
                disabled={isTraining || loading || !url}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs shadow-lg shadow-indigo-950/20 transition-all flex items-center justify-center gap-2 glow-indigo"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Launch Training</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Workflow progress status indicators */}
          <div className="glassmorphism p-6 rounded-2xl border border-slate-800/40 space-y-4">
            <h3 className="font-bold text-sm text-slate-200">Execution Stages</h3>
            
            <div className="space-y-4">
              {[
                { step: 1, label: 'Crawl Domain Pages', desc: 'Recursive extraction' },
                { step: 2, label: 'Generate Embeddings', desc: 'Gemini model integration' },
                { step: 3, label: 'Vector Index Sync', desc: 'Save to vector db & mock' }
              ].map((stage) => {
                const state = getStepStatus(stage.step);
                return (
                  <div key={stage.step} className="flex items-start gap-3">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      state === 'completed' 
                        ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-400' 
                        : state === 'active'
                        ? 'bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 animate-pulse'
                        : 'bg-slate-900 border border-slate-800 text-slate-500'
                    }`}>
                      {state === 'completed' ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : stage.step}
                    </div>
                    <div>
                      <h4 className={`text-xs font-semibold ${state === 'pending' ? 'text-slate-500' : 'text-slate-300'}`}>{stage.label}</h4>
                      <p className="text-[10px] text-slate-500">{stage.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Logging Terminal & Console Output */}
        <div className="md:col-span-2 space-y-6">
          {/* Progress Overview */}
          <div className="glassmorphism p-6 rounded-2xl border border-slate-800/40 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-200">Training Progress</h3>
                <p className="text-[11px] text-slate-500">Pipeline logs are generated in real-time</p>
              </div>
              <span className="text-xl font-black text-indigo-400 font-mono">{progress}%</span>
            </div>

            {/* Progress bar container */}
            <div className="h-2.5 w-full bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
                <span className="block text-[10px] font-semibold text-slate-500 uppercase">Pages Crawled</span>
                <span className="text-lg font-black text-slate-200 font-mono">{pagesCrawled}</span>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
                <span className="block text-[10px] font-semibold text-slate-500 uppercase">Chunks Generated</span>
                <span className="text-lg font-black text-slate-200 font-mono">{chunksGenerated}</span>
              </div>
            </div>
          </div>

          {/* Terminal Console logs */}
          <div className="glassmorphism rounded-2xl border border-slate-800/40 overflow-hidden flex flex-col h-80">
            <div className="bg-slate-900/80 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-300 font-mono">webmind_agent_compile.log</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
              </div>
            </div>

            <div className="flex-1 bg-slate-950 p-4 font-mono text-[10px] leading-relaxed overflow-y-auto space-y-1.5 text-slate-400">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-600 text-xs">
                  Console idle. Submit a target configuration to see live outputs.
                </div>
              ) : (
                logs.map((log, index) => {
                  let colorClass = 'text-indigo-400';
                  if (log.type === 'success') colorClass = 'text-emerald-400';
                  if (log.type === 'error') colorClass = 'text-rose-400';
                  return (
                    <div key={index} className="flex items-start gap-2 border-b border-slate-900/50 pb-1">
                      <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                      <span className={colorClass}>&gt;</span>
                      <span className="break-all">{log.message}</span>
                    </div>
                  );
                })
              )}
              <div ref={logEndRef} />
            </div>
          </div>

          {/* Post Completion action */}
          {progress === 100 && websiteId && (
            <button
              onClick={() => navigate(`/chat?site=${websiteId}`)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-950/20 transition-all flex items-center justify-center gap-2 group animate-pulse"
            >
              <span>Launch AI Chat Assistant</span>
              <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>

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

export default WebsiteTraining;
