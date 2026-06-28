import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { websiteAPI, chatAPI } from '../services/api';
import { 
  MessageSquareCode, 
  Send, 
  Globe, 
  PlusCircle, 
  ExternalLink,
  Copy,
  RotateCcw,
  Sparkles,
  Search,
  Check,
  ChevronRight,
  Info,
  Download
} from 'lucide-react';
import { ChatSkeleton } from '../components/LoadingSkeleton';
import Toast from '../components/Toast';
import { documentationAPI } from '../services/api';

const ChatInterface = () => {
  const [websites, setWebsites] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingSites, setLoadingSites] = useState(true);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedSources, setSelectedSources] = useState(null);
  
  // Clipboard copy tracker
  const [copiedMsgId, setCopiedMsgId] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Toast settings
  const [toastShow, setToastShow] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "What is this website about?",
    "What are their main services or products?",
    "Are there any contact details available?",
    "Summarize the key information."
  ];

  // Auto Scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Load Websites on startup
  useEffect(() => {
    const fetchWebsites = async () => {
      try {
        const res = await websiteAPI.list();
        const readySites = (res.data.websites || []).filter(w => w.status === 'ready');
        setWebsites(readySites);
        
        // Handle URL search parameter website selection
        const siteParam = searchParams.get('site');
        if (siteParam) {
          setSelectedSiteId(siteParam);
        } else if (readySites.length > 0) {
          setSelectedSiteId(readySites[0]._id);
        }
      } catch (err) {
        console.error('Failed to load websites:', err);
      }
      setLoadingSites(false);
    };

    fetchWebsites();
  }, [searchParams]);

  // Load conversations when selected website changes
  useEffect(() => {
    if (!selectedSiteId) {
      setConversations([]);
      setActiveConvId('');
      setMessages([]);
      return;
    }

    const loadConversations = async () => {
      setLoadingChats(true);
      try {
        const res = await chatAPI.listConversations(selectedSiteId);
        const list = res.data.conversations || [];
        setConversations(list);
        
        if (list.length > 0) {
          setActiveConvId(list[0]._id);
        } else {
          // Auto create a conversation if empty
          handleNewChat(selectedSiteId);
        }
      } catch (err) {
        console.error('Error listing chats:', err);
      }
      setLoadingChats(false);
    };

    loadConversations();
  }, [selectedSiteId]);

  // Load message history when active conversation changes
  useEffect(() => {
    if (!activeConvId) {
      setMessages([]);
      return;
    }

    const loadHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await chatAPI.getHistory(activeConvId);
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error('Error fetching chat history:', err);
      }
      setLoadingHistory(false);
    };

    loadHistory();
  }, [activeConvId]);

  const handleNewChat = async (siteId = selectedSiteId) => {
    if (!siteId) return;
    const targetSite = websites.find(w => w._id === siteId);
    const title = `Chat with ${targetSite ? targetSite.name : 'Website'}`;
    
    try {
      const res = await chatAPI.createConversation(siteId, title);
      const newConv = res.data.conversation;
      setConversations(prev => [newConv, ...prev]);
      setActiveConvId(newConv._id);
      setMessages([]);
    } catch (err) {
      console.error('Failed to create conversation:', err);
    }
  };

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim() || !activeConvId || isTyping) return;

    // 1. Add User message to local UI state
    const userMsgText = textToSend;
    setInputText('');
    
    const tempUserMsg = {
      _id: 'temp-user-' + Date.now(),
      sender: 'user',
      text: userMsgText,
      createdAt: new Date()
    };
    
    // Create temporary AI message placeholder for streaming
    const tempAiMsgId = 'temp-ai-' + Date.now();
    const tempAiMsg = {
      _id: tempAiMsgId,
      sender: 'ai',
      text: '',
      sources: [],
      createdAt: new Date()
    };

    setMessages(prev => [...prev, tempUserMsg, tempAiMsg]);
    setIsTyping(true);

    // 2. Open EventSource for SSE streaming from backend
    const streamUrl = chatAPI.getStreamUrl(activeConvId, userMsgText);
    const eventSource = new EventSource(streamUrl);

    eventSource.addEventListener('sources', (e) => {
      try {
        const sources = JSON.parse(e.data);
        setMessages(prev => prev.map(m => 
          m._id === tempAiMsgId ? { ...m, sources } : m
        ));
      } catch (err) {
        console.error('Failed to parse sources metadata:', err);
      }
    });

    eventSource.onmessage = (e) => {
      try {
        const chunk = JSON.parse(e.data);
        setMessages(prev => prev.map(m => 
          m._id === tempAiMsgId ? { ...m, text: m.text + chunk.text } : m
        ));
      } catch (err) {
        console.error('Error handling SSE stream chunk:', err);
      }
    };

    eventSource.addEventListener('done', () => {
      eventSource.close();
      setIsTyping(false);
      
      // Reload history to replace temp objects with official database documents containing _id
      reloadHistorySilent();
    });

    eventSource.onerror = (err) => {
      console.error('EventSource error:', err);
      eventSource.close();
      setIsTyping(false);
      
      setMessages(prev => prev.map(m => 
        m._id === tempAiMsgId ? { ...m, text: m.text + '\n\n*Error: Connection to streaming server lost. Please retry.*' } : m
      ));
    };
  };

  const reloadHistorySilent = async () => {
    if (!activeConvId) return;
    try {
      const res = await chatAPI.getHistory(activeConvId);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Error silent loading history:', err);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setToastMsg('Response copied to clipboard!');
    setToastType('success');
    setToastShow(true);
    
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleRegenerate = async (messageText) => {
    if (isTyping) return;
    handleSendMessage(messageText);
  };

  return (
    <div className="flex h-full w-full overflow-hidden glassmorphism rounded-3xl border border-slate-800/40 relative shadow-2xl">
      
      {/* 1. Left Chat Panel: Website Selector & Conversations List */}
      <aside className="w-72 border-r border-slate-800/60 bg-slate-950/20 flex flex-col h-full shrink-0">
        
        {/* Selector */}
        <div className="p-4 border-b border-slate-850">
          <label className="block text-[9px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Select Assistant Website</label>
          <div className="relative">
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="block w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500/60 appearance-none"
              disabled={loadingSites}
            >
              {loadingSites ? (
                <option>Loading assistants...</option>
              ) : websites.length === 0 ? (
                <option>No trained assistants</option>
              ) : (
                websites.map(site => (
                  <option key={site._id} value={site._id}>
                    {site.name}
                  </option>
                ))
              )}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
              ▼
            </div>
          </div>
        </div>

        {/* History Room Creator */}
        <div className="p-3">
          <button
            onClick={() => handleNewChat()}
            disabled={!selectedSiteId}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-800 hover:border-indigo-500/20 bg-slate-900/40 hover:bg-indigo-600/5 text-slate-300 hover:text-indigo-400 text-xs font-bold transition-all"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* List of Previous conversations */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          <span className="block text-[9px] font-bold text-slate-500 px-3 py-2 uppercase tracking-wider">Chat History</span>
          {loadingChats ? (
            <div className="px-3 py-4 text-xs text-slate-600">Loading chat rooms...</div>
          ) : conversations.length === 0 ? (
            <div className="px-3 py-4 text-xs text-slate-600 text-center font-medium">Create a new chat room above.</div>
          ) : (
            conversations.map(conv => {
              const active = activeConvId === conv._id;
              return (
                <button
                  key={conv._id}
                  onClick={() => setActiveConvId(conv._id)}
                  className={`flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    active 
                      ? 'bg-slate-800/60 text-slate-200 border border-slate-700/30' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30 border border-transparent'
                  }`}
                >
                  <MessageSquareCode className="h-4 w-4 text-slate-500" />
                  <span className="truncate flex-1">{conv.title}</span>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* 2. Center Chat Panel: Active Thread Area */}
      <section className="flex-1 flex flex-col h-full bg-slate-950/5 relative overflow-hidden">
        
        {/* Chat Header with Export */}
        {activeConvId && (
          <div className="h-14 border-b border-slate-800/50 flex items-center justify-between px-6 bg-slate-900/40 shrink-0">
            <h2 className="text-xs font-bold text-slate-300">
              {conversations.find(c => c._id === activeConvId)?.title || 'Chat Session'}
            </h2>
            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold rounded-lg transition-colors border border-slate-700"
              >
                <Download className="h-3 w-3" /> Export
              </button>
              
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50">
                  {['PDF', 'TXT'].map(format => (
                    <a 
                      key={format}
                      href={documentationAPI.getChatExportUrl(activeConvId, format)}
                      download
                      onClick={() => setShowExportMenu(false)}
                      className="block px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors"
                    >
                      Export {format}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6" onClick={() => setShowExportMenu(false)}>
          {loadingHistory ? (
            <ChatSkeleton />
          ) : !activeConvId ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <Globe className="h-10 w-10 text-slate-600 mb-3" />
              <h3 className="text-sm font-bold text-slate-400">No active conversation selected</h3>
              <p className="text-xs text-slate-600 max-w-xs mt-1">Select a website assistant and start a conversation room to begin.</p>
            </div>
          ) : messages.length === 0 ? (
            // Empty chat prompt + suggested questions
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
              <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <MessageSquareCode className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-200">Chat with Website AI Agent</h3>
              <p className="text-xs text-slate-400 mt-1 mb-8">
                The agent answers questions grounded strictly in crawled page contents. Ask anything about services, pricing, terms, or contact information.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(q)}
                    className="p-3 text-left rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/60 hover:bg-slate-850 text-xs font-medium text-slate-400 hover:text-slate-200 transition-all flex justify-between items-center group"
                  >
                    <span>{q}</span>
                    <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Message feed list
            <div className="space-y-6">
              {messages.map((m, index) => {
                const isUser = m.sender === 'user';
                return (
                  <div key={m._id || index} className={`flex items-start gap-4 ${isUser ? 'justify-end' : ''}`}>
                    
                    {/* Bot avatar */}
                    {!isUser && (
                      <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-md shrink-0">
                        AI
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5 max-w-[80%]">
                      {/* Message Box */}
                      <div className={`p-4 rounded-2xl border text-xs leading-relaxed font-normal ${
                        isUser 
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-950/20 rounded-tr-none' 
                          : 'bg-slate-900 border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap'
                      }`}>
                        {m.text}

                        {/* Citation badges for AI messages */}
                        {!isUser && m.sources && m.sources.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-slate-800/40 flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                              <Search className="h-3 w-3" />
                              <span>Sources:</span>
                            </span>
                            
                            {m.sources.map((src, i) => (
                              <button
                                key={i}
                                onClick={() => setSelectedSources(m.sources)}
                                title={src.url}
                                className="px-2.5 py-0.5 rounded bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-[9px] flex items-center gap-1 transition-colors"
                              >
                                <span>[{i+1}]</span>
                                <span className="max-w-[80px] truncate">{src.title}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Message actions (Copy / Regenerate / View Sources) */}
                      {!isUser && m.text && (
                        <div className="flex items-center gap-3 px-1 text-[10px] text-slate-500 font-semibold uppercase">
                          <button 
                            onClick={() => copyToClipboard(m.text, m._id)}
                            className="hover:text-slate-300 flex items-center gap-1 transition-colors"
                          >
                            {copiedMsgId === m._id ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                          
                          {/* Find previous user message to regenerate */}
                          {index > 0 && messages[index - 1].sender === 'user' && (
                            <button 
                              onClick={() => handleRegenerate(messages[index - 1].text)}
                              className="hover:text-slate-300 flex items-center gap-1 transition-colors"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              <span>Regenerate</span>
                            </button>
                          )}
                          
                          {m.sources && m.sources.length > 0 && (
                            <button 
                              onClick={() => setSelectedSources(m.sources)}
                              className="hover:text-slate-300 flex items-center gap-1 transition-colors"
                            >
                              <Info className="h-3.5 w-3.5" />
                              <span>Citations</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* User avatar */}
                    {isUser && (
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center text-xs font-extrabold shadow-md shrink-0">
                        ME
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-md shrink-0 animate-pulse">
                    AI
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 rounded-tl-none flex items-center justify-center">
                    <div className="typing-indicator flex items-center h-4">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input Form */}
        {activeConvId && (
          <div className="p-4 border-t border-slate-850 bg-slate-950/20">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }}
              className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-2xl px-4 py-2.5 focus-within:border-indigo-500/60 transition-colors"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask anything about this website..."
                className="flex-1 bg-transparent border-none text-slate-100 placeholder-slate-600 focus:outline-none text-xs"
                disabled={isTyping || loadingHistory}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping || loadingHistory}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold transition-all shadow-md shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        )}
      </section>

      {/* 3. Citations sidebar overlay on clicking "Sources" */}
      {selectedSources && (
        <aside className="absolute inset-y-0 right-0 w-80 bg-slate-900 border-l border-slate-800/80 shadow-2xl flex flex-col h-full z-10 animate-slide-in">
          <div className="p-4 border-b border-slate-850 flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-200 flex items-center gap-2">
              <Search className="h-4 w-4 text-indigo-400" />
              <span>Grounding Citations</span>
            </h3>
            <button 
              onClick={() => setSelectedSources(null)}
              className="text-slate-400 hover:text-slate-100 text-xs font-semibold"
            >
              Close
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedSources.map((src, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 space-y-2.5">
                <div className="flex items-start justify-between gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Context Chunk [{i+1}]</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 text-[8px] font-extrabold uppercase border border-indigo-500/10">
                    {Math.round(src.score * 100)}% Match
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-300 leading-snug line-clamp-2">{src.title}</h4>
                <a 
                  href={src.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-indigo-400 hover:underline"
                >
                  <span className="truncate max-w-[200px]">{src.url}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>
            ))}
          </div>
        </aside>
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

export default ChatInterface;
