import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { TextInput, Button, Group, ScrollArea, Stack, Text, Avatar, Badge, Tooltip } from '@mantine/core';
import { Check, ChevronDown, Hash, Paperclip, Send, Smile, Users, X } from 'lucide-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { chatStore, getUserById, getUsers } from '@/app/store/chatStore';
import './Slack.scss';

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
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>
        <div className='slack-layout'>
          <div className='slack-channels'>
            <div className='slack-workspace-header'><h3>MeroEdu <ChevronDown size={14} /></h3></div>
            <div className='slack-section'><div className='slack-section-header'>Channels</div>
              {channels.map((ch) => (<div key={ch.id} className={`slack-channel-item ${activeChannel === ch.id ? 'active' : ''}`} onClick={() => chatStore.setActiveChannel(ch.id)}><span className='channel-icon'>#</span><span className='channel-name'>{ch.name}</span>{ch.unread > 0 && <span className='unread-badge'>{ch.unread}</span>}</div>))}
            </div>
            <div className='slack-section'><div className='slack-section-header'>Direct Messages</div>
              {users.filter((u) => u.id !== user?.id).map((u) => (<div key={u.id} className={`slack-channel-item dm ${activeDM === u.id ? 'active' : ''}`} onClick={() => chatStore.setActiveDM(u.id)}><span className={`user-status-dot ${u.status}`} /><span className='channel-name'>{u.name}</span></div>))}
            </div>
          </div>

          <div className='slack-main'>
            <div className='slack-chat-header'>
              <div className='chat-header-left'>
                {activeDMUser ? (<><span className={`user-status-dot ${activeDMUser.status}`} /><h3>{activeDMUser.name}</h3><span className='user-role'>{activeDMUser.role}</span></>) : (<><span className='channel-icon'>#</span><h3>{activeChannelData?.name}</h3><span className='channel-description'>{activeChannelData?.description}</span></>)}
              </div>
              <div className='chat-header-right'><Button size="xs" variant="default" onClick={() => setShowUserPanel(!showUserPanel)}><Users size={14} /></Button></div>
            </div>

            <ScrollArea className='slack-messages' h="calc(100vh - 200px)">
              {groupedMessages.map((item) => {
                if (item.type === 'header') return (<div key={item.id} className='date-divider'><span>{item.text}</span></div>);
                const msgUser = getUserById(item.userId); const isOwn = item.userId === user?.id;
                return (
                  <div key={item.id} className={`slack-message ${isOwn ? 'own' : ''}`}>
                    <Avatar src={msgUser?.avatar || 'https://i.pravatar.cc/150?img=3'} size={36} radius="sm" />
                    <div className='message-body'>
                      <div className='message-header'><span className='message-author'>{msgUser?.name || 'Unknown'}</span><span className='message-time'>{formatTime(item.timestamp)}</span></div>
                      <div className='message-text'>{item.text}</div>
                      {Object.keys(item.reactions || {}).length > 0 && (
                        <div className='message-reactions'>
                          {Object.entries(item.reactions).map(([emoji, userIds]) => (<button key={emoji} className={`reaction-btn ${userIds.includes(user?.id) ? 'active' : ''}`} onClick={() => handleReaction(item.id, emoji)}><span>{emoji}</span><span className='reaction-count'>{userIds.length}</span></button>))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {typingUsers.length > 0 && (<div className='typing-indicator'><div className='typing-dots'><span /><span /><span /></div><span>{typingUsers.map((id) => getUserById(id)?.name).join(', ')} typing...</span></div>)}
              <div ref={messagesEndRef} />
            </ScrollArea>

            <div className='slack-input-area'>
              <div className='slack-input-wrapper'>
                <TextInput ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={`Message ${activeDMUser ? activeDMUser.name : `#${activeChannelData?.name || ''}`}`} className='slack-textarea' style={{ flex: 1 }} />
                <div className='slack-input-actions'>
                  <Button size="xs" variant="subtle"><Smile size={14} /></Button>
                  <Button size="xs" variant="subtle"><Paperclip size={14} /></Button>
                  <Button size="xs" onClick={handleSend} disabled={!input.trim()}><Send size={14} /></Button>
                </div>
              </div>
            </div>
          </div>

          {showUserPanel && (
            <div className='slack-users-panel'>
              <div className='users-panel-header'><h4>Members</h4><Button size="xs" variant="subtle" onClick={() => setShowUserPanel(false)}><X size={14} /></Button></div>
              <div className='users-panel-list'>
                {users.map((u) => (
                  <div key={u.id} className='user-panel-item' onClick={() => { chatStore.setActiveDM(u.id); setShowUserPanel(false); }}>
                    <div className='user-panel-avatar'><Avatar src={u.avatar} size={32} radius="xl" /><span className={`user-status-dot ${u.status}`} /></div>
                    <div className='user-panel-info'><div className='user-panel-name'>{u.name}</div><div className='user-panel-role'>{u.role}</div></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SlackChat;
