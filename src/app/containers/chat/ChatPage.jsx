import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Segment, Icon, Button, Input, Dropdown, Header,
} from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { sendMessage } from '@/app/services/chatService';
import './Chat.scss';

const ChatPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = useSelector((s) => s.auth.user);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState('gpt-5-nano');
  const [availableModels, setAvailableModels] = useState([]);
  const [streamText, setStreamText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Load welcome message
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hello${user ? `, ${user.firstName}` : ''}! I'm your MeroEdu AI assistant. I can help you with:\n\n• **Course recommendations** — Find the right courses for your goals\n• **Learning guidance** — Plan your curriculum and track progress\n• **Platform help** — Navigate MeroEdu features\n\nHow can I help you today?`,
        timestamp: new Date(),
      },
    ]);
  }, [user]);

  useEffect(() => {
    // Load available models
    import('@/app/services/chatService').then(({ listModels }) => {
      listModels().then(setAvailableModels).catch(() => {});
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamText]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamText('');

    try {
      const result = await sendMessage(
        [...messages, userMessage],
        {
          model,
          stream: true,
          onChunk: (chunk) => {
            setStreamText((prev) => prev + chunk);
          },
        }
      );

      const assistantMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: result.text || streamText || 'I apologize, but I was unable to generate a response.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStreamText('');
    } catch (err) {
      const errorMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatContent = (text) => {
    if (!text) return null;
    // Simple markdown-like formatting
    return text.split('\n').map((line, i) => {
      // Bold
      let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Bullet points
      if (formatted.startsWith('• ')) {
        return (
          <div key={i} className='chat-bullet'>
            <span dangerouslySetInnerHTML={{ __html: formatted.substring(2) }} />
          </div>
        );
      }
      if (formatted.trim() === '') return <div key={i} className='chat-line-break' />;
      return <div key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  const modelOptions = availableModels.map((m) => ({
    key: m.id,
    value: m.id,
    text: m.name,
    content: (
      <span>
        {m.name}
        <span style={{ opacity: 0.5, fontSize: 11, marginLeft: 8 }}>{m.provider}</span>
      </span>
    ),
  }));

  return (
    <div className='dashboard-layout'>
      <SideBar sidebarOpen={sidebarOpen} onToggle={setSidebarOpen} />
      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

        <div className='dashboard-header'>
          <div className='header-left'>
            <h1 className='page-title'>AI Chat</h1>
            <p className='page-subtitle'>
              {isLoading ? 'Thinking...' : streamText ? 'Typing...' : 'Ask me anything about your courses'}
            </p>
          </div>
          <div className='header-right'>
            {modelOptions.length > 0 && (
              <Dropdown
                selection
                options={modelOptions}
                value={model}
                onChange={(_, { value }) => setModel(value)}
                className='chat-model-dropdown'
              />
            )}
          </div>
        </div>

        <div className='chat-page'>

          {/* Messages Area */}
          <div className='chat-messages'>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message ${msg.role} ${msg.error ? 'error' : ''}`}
              >
                <div className='chat-avatar'>
                  {msg.role === 'user' ? (
                    <img
                      src={user?.avatar || 'https://i.pravatar.cc/150?img=3'}
                      alt='You'
                    />
                  ) : (
                    <div className='ai-avatar'>
                      <Icon name='robot' />
                    </div>
                  )}
                </div>
                <div className='chat-bubble'>
                  <div className='chat-content'>
                    {formatContent(msg.content)}
                  </div>
                  <div className='chat-time'>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {/* Streaming response */}
            {streamText && (
              <div className='chat-message assistant'>
                <div className='chat-avatar'>
                  <div className='ai-avatar'>
                    <Icon name='robot' />
                  </div>
                </div>
                <div className='chat-bubble'>
                  <div className='chat-content'>{formatContent(streamText)}</div>
                </div>
              </div>
            )}

            {/* Typing indicator */}
            {isLoading && !streamText && (
              <div className='chat-message assistant'>
                <div className='chat-avatar'>
                  <div className='ai-avatar'>
                    <Icon name='robot' />
                  </div>
                </div>
                <div className='chat-bubble typing'>
                  <div className='typing-dots'>
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className='chat-input-area'>
            <Segment className='chat-input-segment'>
              <div className='chat-input-wrapper'>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder='Type your message... (Enter to send, Shift+Enter for new line)'
                  rows={1}
                  disabled={isLoading}
                  className='chat-textarea'
                />
                <Button
                  primary
                  icon
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className='chat-send-btn'
                >
                  <Icon name='send' />
                </Button>
              </div>
              <div className='chat-input-hint'>
                Powered by AI • Responses may not always be accurate
              </div>
            </Segment>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
