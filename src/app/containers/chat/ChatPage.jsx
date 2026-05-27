import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Icon, Button, Input, Dropdown, Header, Segment, Message, Modal,
} from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import {
  sendMessage, getChatSettings, saveChatSettings,
  AVAILABLE_MODELS, API_PRESETS, testConnection,
} from '@/app/services/chatService';
import './Chat.scss';

const ChatPage = () => {
  const user = useSelector((s) => s.auth.user);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(getChatSettings);
  const [testStatus, setTestStatus] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState('OpenAI');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `Hello${user ? `, ${user.firstName}` : ''}! I'm your MeroEdu AI assistant.\n\nI can help you with:\n• **Course recommendations** — Find the right courses\n• **Learning guidance** — Plan your curriculum\n• **Platform help** — Navigate MeroEdu features\n• **Team collaboration** — Work with your peers\n\n${!settings.enabled ? '⚠️ *Configure your AI settings using the gear icon to enable real AI responses. For now, I\'ll use built-in responses.*' : ''}\n\nHow can I help you today?`,
      timestamp: new Date(),
    }]);
  }, [user, settings.enabled]);

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
          stream: true,
          onChunk: (chunk) => setStreamText((prev) => prev + chunk),
        }
      );

      const assistantMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: result.text || 'Sorry, I could not generate a response.',
        timestamp: new Date(),
        mock: result.mock,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStreamText('');
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
        error: true,
      }]);
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

  const handleSaveSettings = () => {
    saveChatSettings(settings);
    setShowSettings(false);
    // Show confirmation in chat
    setMessages((prev) => [...prev, {
      id: `system_${Date.now()}`,
      role: 'assistant',
      content: settings.enabled
        ? `✅ AI settings saved! Model: **${settings.model}**\n\nI'm now connected and ready to help you with real AI responses.`
        : 'ℹ️ AI mode disabled. I\'ll use built-in responses. Enable AI in settings for smarter answers.',
      timestamp: new Date(),
    }]);
  };

  const handleTestConnection = async () => {
    setTestStatus({ testing: true });
    const result = await testConnection(settings);
    setTestStatus(result);
    setTimeout(() => setTestStatus(null), 4000);
  };

  const handlePresetChange = (_, { value }) => {
    setSelectedPreset(value);
    const preset = API_PRESETS.find((p) => p.name === value);
    if (preset) {
      setSettings((s) => ({
        ...s,
        apiBase: preset.base,
        model: preset.models[0] || s.model,
      }));
    }
  };

  const formatContent = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
      if (formatted.startsWith('• ') || formatted.startsWith('- ')) {
        return <div key={i} className='chat-bullet'><span dangerouslySetInnerHTML={{ __html: formatted.substring(2) }} /></div>;
      }
      if (formatted.trim() === '') return <div key={i} className='chat-line-break' />;
      return <div key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  const modelOptions = AVAILABLE_MODELS.map((m) => ({
    key: m.id,
    value: m.id,
    text: m.name,
  }));

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>

        <div className='dashboard-header'>
          <div className='header-left'>
            <h1 className='page-title'>AI Chat</h1>
            <p className='page-subtitle'>
              {isLoading ? 'Thinking...' : streamText ? 'Typing...' : settings.enabled ? `Connected • ${settings.model}` : 'Built-in responses'}
            </p>
          </div>
          <div className='header-right'>
            <Button icon onClick={() => setShowSettings(true)} title='AI Settings'>
              <Icon name='cog' />
            </Button>
          </div>
        </div>

        <div className='chat-page'>
          {/* Messages */}
          <div className='chat-messages'>
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.role} ${msg.error ? 'error' : ''} ${msg.mock ? 'mock' : ''}`}>
                <div className='chat-avatar'>
                  {msg.role === 'user' ? (
                    <img src={user?.avatar || 'https://i.pravatar.cc/150?img=3'} alt='You' />
                  ) : (
                    <div className='ai-avatar'><Icon name='child' /></div>
                  )}
                </div>
                <div className='chat-bubble'>
                  <div className='chat-content'>{formatContent(msg.content)}</div>
                  <div className='chat-time'>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {msg.mock && <span className='mock-badge'>demo</span>}
                  </div>
                </div>
              </div>
            ))}

            {streamText && (
              <div className='chat-message assistant'>
                <div className='chat-avatar'><div className='ai-avatar'><Icon name='robot' /></div></div>
                <div className='chat-bubble'><div className='chat-content'>{formatContent(streamText)}</div></div>
              </div>
            )}

            {isLoading && !streamText && (
              <div className='chat-message assistant'>
                <div className='chat-avatar'><div className='ai-avatar'><Icon name='robot' /></div></div>
                <div className='chat-bubble typing'><div className='typing-dots'><span /><span /><span /></div></div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className='chat-input-area'>
            <Segment className='chat-input-segment' style={{ padding: '12px 16px' }}>
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
                <Button primary icon onClick={handleSend} disabled={!input.trim() || isLoading} className='chat-send-btn'>
                  <Icon name='send' />
                </Button>
              </div>
            </Segment>
          </div>
        </div>

        {/* Settings Modal */}
        <Modal open={showSettings} onClose={() => setShowSettings(false)} size='small'>
          <Header icon='cog' content='AI Chat Settings' />
          <Modal.Content>
            <Segment>
              <h4>API Provider</h4>
              <Dropdown
                selection
                options={API_PRESETS.map((p) => ({ key: p.name, value: p.name, text: p.name }))}
                value={selectedPreset}
                onChange={handlePresetChange}
                fluid
                style={{ marginBottom: 12 }}
              />

              <h4>API Key</h4>
              <Input
                type='password'
                placeholder='sk-... or your API key'
                value={settings.apiKey}
                onChange={(e) => setSettings((s) => ({ ...s, apiKey: e.target.value }))}
                fluid
                style={{ marginBottom: 12 }}
              />

              <h4>API Base URL</h4>
              <Input
                placeholder='https://api.openai.com/v1'
                value={settings.apiBase}
                onChange={(e) => setSettings((s) => ({ ...s, apiBase: e.target.value }))}
                fluid
                style={{ marginBottom: 12 }}
              />

              <h4>Model</h4>
              <Dropdown
                selection
                options={modelOptions}
                value={settings.model}
                onChange={(e, { value }) => setSettings((s) => ({ ...s, model: value }))}
                fluid
                style={{ marginBottom: 16 }}
              />

              <Button primary onClick={handleTestConnection} loading={testStatus?.testing} style={{ marginRight: 8 }}>
                Test Connection
              </Button>

              {testStatus && !testStatus.testing && (
                <Message success={testStatus.success} error={!testStatus.success}>
                  <p>{testStatus.success ? '✅ Connection successful!' : `❌ ${testStatus.error}`}</p>
                </Message>
              )}
            </Segment>
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={() => setShowSettings(false)}>Cancel</Button>
            <Button
              primary
              onClick={handleSaveSettings}
              disabled={!settings.apiKey}
            >
              Save & Enable
            </Button>
          </Modal.Actions>
        </Modal>
      </div>
    </div>
  );
};

export default ChatPage;
