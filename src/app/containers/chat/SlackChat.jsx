import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Check, ChevronDown, Hash, Paperclip, Send, Smile, Users, X } from 'lucide-react';
import DashboardLayout from '@/components/ui/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { chatStore, getUserById, getUsers } from '@/app/store/chatStore';

const EMOJI_LIST = ['👍', '❤️', '🔥', '🎉', '😂', '🚀', '👀', '💯', '✅', '🙌'];

const SlackChat = () => {
  const user = useSelector((s) => s.auth.user);
  const [storeState, setStoreState] = useState(chatStore.getState());
  const [input, setInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { chatStore.init(user); const unsub = chatStore.subscribe(setStoreState); return unsub; }, [user]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [storeState.messages, storeState.activeChannel, storeState.activeDM]);

  const { channels, messages, activeChannel, activeDM, currentUser } = storeState;
  const activeChatId = activeDM ? `dm_${activeDM}` : activeChannel;
  const activeMessages = messages[activeChatId] || [];
  const activeChannelData = channels.find((c) => c.id === activeChannel);
  const activeDMUser = activeDM ? getUserById(activeDM) : null;
  const typingUsers = chatStore.getTypingUsers(activeDM || activeChannel, !!activeDM);

  const handleSend = () => { if (!input.trim()) return; chatStore.sendMessage(input, activeDM || activeChannel, !!activeDM); setInput(''); inputRef.current?.focus(); };
  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const handleReaction = (messageId, emoji) => { chatStore.toggleReaction(messageId, emoji, activeDM || activeChannel, !!activeDM); setShowEmojiPicker(null); };
  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const groupedMessages = []; let lastDate = '';
  activeMessages.forEach((msg) => { const dateStr = new Date(msg.timestamp).toDateString(); if (dateStr !== lastDate) { lastDate = dateStr; groupedMessages.push({ type: 'header', text: new Date(msg.timestamp).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }), id: `date_${dateStr}` }); } groupedMessages.push({ type: 'message', ...msg }); });

  const users = getUsers();

  return (
    <DashboardLayout title="Slack Chat" subtitle="Team communication">
      <div className="flex flex-1 overflow-hidden">
        {/* Channels sidebar */}
        <aside className="w-56 shrink-0 border-r border-border flex flex-col overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
          <div className="px-4 py-3 border-b border-border flex items-center gap-1">
            <h3 className="text-sm font-semibold text-text-primary">MeroEdu</h3>
            <ChevronDown size={12} className="text-text-muted" />
          </div>
          <div className="px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">Channels</p>
            {channels.map((ch) => (
              <div key={ch.id} className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer text-xs ${activeChannel === ch.id ? 'bg-bg-surface-active font-medium text-text-primary' : 'text-text-secondary hover:bg-bg-surface-hover'}`} onClick={() => chatStore.setActiveChannel(ch.id)}>
                <Hash size={12} />
                <span>{ch.name}</span>
                {ch.unread > 0 && <span className="ml-auto rounded-full bg-error text-white text-[10px] px-1.5 py-0.5">{ch.unread}</span>}
              </div>
            ))}
          </div>
          <div className="px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">Direct Messages</p>
            {users.filter((u) => u.id !== user?.id).map((u) => (
              <div key={u.id} className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer text-xs ${activeDM === u.id ? 'bg-bg-surface-active font-medium text-text-primary' : 'text-text-secondary hover:bg-bg-surface-hover'}`} onClick={() => chatStore.setActiveDM(u.id)}>
                <span className={`h-2 w-2 rounded-full ${u.status === 'online' ? 'bg-success' : 'bg-text-muted'}`} />
                <span>{u.name}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              {activeDMUser ? (
                <>
                  <span className={`h-2 w-2 rounded-full ${activeDMUser.status === 'online' ? 'bg-success' : 'bg-text-muted'}`} />
                  <h3 className="text-sm font-semibold text-text-primary">{activeDMUser.name}</h3>
                  <span className="text-xs text-text-muted">{activeDMUser.role}</span>
                </>
              ) : (
                <>
                  <Hash size={14} className="text-text-muted" />
                  <h3 className="text-sm font-semibold text-text-primary">{activeChannelData?.name}</h3>
                  <span className="text-xs text-text-muted">{activeChannelData?.description}</span>
                </>
              )}
            </div>
            <Button variant="default" size="icon" onClick={() => setShowUserPanel(!showUserPanel)}>
              <Users size={14} />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {groupedMessages.map((item) => {
              if (item.type === 'header') return <div key={item.id} className="text-center text-xs text-text-muted my-4">{item.text}</div>;
              const msgUser = getUserById(item.userId); const isOwn = item.userId === user?.id;
              return (
                <div key={item.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={msgUser?.avatar || 'https://i.pravatar.cc/150?img=3'} />
                    <AvatarFallback>{(msgUser?.name || 'U')[0]}</AvatarFallback>
                  </Avatar>
                  <div className="max-w-[70%]">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-text-primary">{msgUser?.name || 'Unknown'}</span>
                      <span className="text-[10px] text-text-muted">{formatTime(item.timestamp)}</span>
                    </div>
                    <div className="rounded-lg px-3 py-2 text-sm bg-bg-surface border border-border" style={{ whiteSpace: 'pre-wrap' }}>
                      {item.text}
                    </div>
                    {Object.keys(item.reactions || {}).length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {Object.entries(item.reactions).map(([emoji, userIds]) => (
                          <button key={emoji} className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] border ${userIds.includes(user?.id) ? 'border-primary bg-primary-light' : 'border-border bg-bg-surface'}`} onClick={() => handleReaction(item.id, emoji)}>
                            <span>{emoji}</span><span>{userIds.length}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <div className="flex gap-0.5"><span className="h-1.5 w-1.5 rounded-full bg-text-muted animate-bounce" /><span className="h-1.5 w-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0.1s' }} /><span className="h-1.5 w-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0.2s' }} /></div>
                <span>{typingUsers.map((id) => getUserById(id)?.name).join(', ')} typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-border shrink-0">
            <div className="flex items-center gap-2">
              <Input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={`Message ${activeDMUser ? activeDMUser.name : `#${activeChannelData?.name || ''}`}`} />
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon"><Smile size={14} /></Button>
                <Button variant="ghost" size="icon"><Paperclip size={14} /></Button>
                <Button size="icon" onClick={handleSend} disabled={!input.trim()}><Send size={14} /></Button>
              </div>
            </div>
          </div>
        </div>

        {/* Users panel */}
        {showUserPanel && (
          <aside className="w-56 shrink-0 border-l border-border flex flex-col overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h4 className="text-sm font-semibold text-text-primary">Members</h4>
              <Button variant="ghost" size="icon" onClick={() => setShowUserPanel(false)}><X size={14} /></Button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {users.map((u) => (
                <div key={u.id} className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-bg-surface-hover" onClick={() => { chatStore.setActiveDM(u.id); setShowUserPanel(false); }}>
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={u.avatar} />
                      <AvatarFallback>{u.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-bg-surface ${u.status === 'online' ? 'bg-success' : 'bg-text-muted'}`} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-text-primary">{u.name}</p>
                    <p className="text-[11px] text-text-muted">{u.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SlackChat;
