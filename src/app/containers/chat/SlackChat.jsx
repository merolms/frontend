import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Icon, Button, Input, Header, Label, Popup } from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { chatStore, getUserById, getUsers } from '@/app/store/chatStore';
import './Slack.scss';

const EMOJI_LIST = ['👍', '❤️', '🔥', '🎉', '😂', '🚀', '👀', '💯', '✅', '🙌'];

const SlackChat = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = useSelector((s) => s.auth.user);
  const [storeState, setStoreState] = useState(chatStore.getState());
  const [input, setInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatStore.init(user);
    const unsub = chatStore.subscribe(setStoreState);
    return unsub;
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [storeState.messages, storeState.activeChannel, storeState.activeDM]);

  const { channels, messages, activeChannel, activeDM, currentUser } = storeState;

  const activeChatId = activeDM ? `dm_${activeDM}` : activeChannel;
  const activeMessages = messages[activeChatId] || [];
  const activeChannelData = channels.find((c) => c.id === activeChannel);
  const activeDMUser = activeDM ? getUserById(activeDM) : null;
  const typingUsers = chatStore.getTypingUsers(activeDM || activeChannel, !!activeDM);

  const handleSend = () => {
    if (!input.trim()) return;
    chatStore.sendMessage(input, activeDM || activeChannel, !!activeDM);
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReaction = (messageId, emoji) => {
    chatStore.toggleReaction(messageId, emoji, activeDM || activeChannel, !!activeDM);
    setShowEmojiPicker(null);
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatDateHeader = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000) return 'Today';
    if (diff < 172800000) return 'Yesterday';
    return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  // Group messages by date
  const groupedMessages = [];
  let lastDate = '';
  activeMessages.forEach((msg) => {
    const dateStr = new Date(msg.timestamp).toDateString();
    if (dateStr !== lastDate) {
      lastDate = dateStr;
      groupedMessages.push({ type: 'header', text: formatDateHeader(msg.timestamp), id: `date_${dateStr}` });
    }
    groupedMessages.push({ type: 'message', ...msg });
  });

  const users = getUsers();

  return (
    <div className='dashboard-layout'>
      <SideBar sidebarOpen={sidebarOpen} onToggle={setSidebarOpen} />
      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

        <div className='slack-layout'>

          {/* ─── Channel Sidebar ─── */}
          <div className='slack-channels'>
            <div className='slack-workspace-header'>
              <h3>MeroEdu</h3>
              <Icon name='chevron down' size='small' />
            </div>

            <div className='slack-section'>
              <div className='slack-section-header'>Channels</div>
              {channels.map((ch) => (
                <div
                  key={ch.id}
                  className={`slack-channel-item ${activeChannel === ch.id ? 'active' : ''}`}
                  onClick={() => chatStore.setActiveChannel(ch.id)}
                >
                  <span className='channel-icon'>#</span>
                  <span className='channel-name'>{ch.name}</span>
                  {ch.unread > 0 && <span className='unread-badge'>{ch.unread}</span>}
                </div>
              ))}
            </div>

            <div className='slack-section'>
              <div className='slack-section-header'>Direct Messages</div>
              {users.filter((u) => u.id !== user?.id).map((u) => (
                <div
                  key={u.id}
                  className={`slack-channel-item dm ${activeDM === u.id ? 'active' : ''}`}
                  onClick={() => chatStore.setActiveDM(u.id)}
                >
                  <span className={`user-status-dot ${u.status}`} />
                  <span className='channel-name'>{u.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Main Chat Area ─── */}
          <div className='slack-main'>

            {/* Channel Header */}
            <div className='slack-chat-header'>
              <div className='chat-header-left'>
                {activeDMUser ? (
                  <>
                    <span className={`user-status-dot ${activeDMUser.status}`} />
                    <h3>{activeDMUser.name}</h3>
                    <span className='user-role'>{activeDMUser.role}</span>
                  </>
                ) : (
                  <>
                    <span className='channel-icon'>#</span>
                    <h3>{activeChannelData?.name}</h3>
                    <span className='channel-description'>{activeChannelData?.description}</span>
                  </>
                )}
              </div>
              <div className='chat-header-right'>
                <Button icon size='mini' onClick={() => setShowUserPanel(!showUserPanel)}>
                  <Icon name='users' />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className='slack-messages'>
              {groupedMessages.map((item) => {
                if (item.type === 'header') {
                  return (
                    <div key={item.id} className='date-divider'>
                      <span>{item.text}</span>
                    </div>
                  );
                }

                const msgUser = getUserById(item.userId);
                const isOwn = item.userId === user?.id;

                return (
                  <div key={item.id} className={`slack-message ${isOwn ? 'own' : ''}`}>
                    <img
                      src={msgUser?.avatar || 'https://i.pravatar.cc/150?img=3'}
                      alt={msgUser?.name}
                      className='message-avatar'
                    />
                    <div className='message-body'>
                      <div className='message-header'>
                        <span className='message-author'>{msgUser?.name || 'Unknown'}</span>
                        <span className='message-time'>{formatTime(item.timestamp)}</span>
                      </div>
                      <div className='message-text'>{item.text}</div>

                      {/* Reactions */}
                      {Object.keys(item.reactions || {}).length > 0 && (
                        <div className='message-reactions'>
                          {Object.entries(item.reactions).map(([emoji, userIds]) => (
                            <button
                              key={emoji}
                              className={`reaction-btn ${userIds.includes(user?.id) ? 'active' : ''}`}
                              onClick={() => handleReaction(item.id, emoji)}
                            >
                              <span>{emoji}</span>
                              <span className='reaction-count'>{userIds.length}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Emoji picker popup */}
                      <Popup
                        trigger={
                          <button className='add-reaction-btn'>
                            <Icon name='smile outline' size='mini' />
                          </button>
                        }
                        on='click'
                        position='top right'
                        open={showEmojiPicker === item.id}
                        onOpen={() => setShowEmojiPicker(item.id)}
                        onClose={() => setShowEmojiPicker(null)}
                      >
                        <div className='emoji-picker'>
                          {EMOJI_LIST.map((emoji) => (
                            <button key={emoji} onClick={() => handleReaction(item.id, emoji)}>
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </Popup>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div className='typing-indicator'>
                  <div className='typing-dots'><span /><span /><span /></div>
                  <span>
                    {typingUsers.map((id) => getUserById(id)?.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className='slack-input-area'>
              <div className='slack-input-wrapper'>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${activeDMUser ? activeDMUser.name : `#${activeChannelData?.name || ''}`}`}
                  rows={1}
                  className='slack-textarea'
                />
                <div className='slack-input-actions'>
                  <Button icon size='mini' className='input-action-btn'>
                    <Icon name='smile outline' />
                  </Button>
                  <Button icon size='mini' className='input-action-btn'>
                    <Icon name='paperclip' />
                  </Button>
                  <Button
                    primary
                    size='mini'
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className='send-btn'
                  >
                    <Icon name='send' />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* ─── User Panel (right side) ─── */}
          {showUserPanel && (
            <div className='slack-users-panel'>
              <div className='users-panel-header'>
                <h4>Members</h4>
                <Button icon size='mini' onClick={() => setShowUserPanel(false)}>
                  <Icon name='close' />
                </Button>
              </div>
              <div className='users-panel-list'>
                {users.map((u) => (
                  <div
                    key={u.id}
                    className='user-panel-item'
                    onClick={() => { chatStore.setActiveDM(u.id); setShowUserPanel(false); }}
                  >
                    <div className='user-panel-avatar'>
                      <img src={u.avatar} alt={u.name} />
                      <span className={`user-status-dot ${u.status}`} />
                    </div>
                    <div className='user-panel-info'>
                      <div className='user-panel-name'>{u.name}</div>
                      <div className='user-panel-role'>{u.role}</div>
                    </div>
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
