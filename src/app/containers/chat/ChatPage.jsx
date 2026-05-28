import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Paper, TextInput, Button, Select, Modal, Text, Stack, Group, ScrollArea, Alert } from '@mantine/core';
import { Bot, Plus, Send, Settings, User } from 'lucide-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { sendMessage, getChatSettings, saveChatSettings, AVAILABLE_MODELS, API_PRESETS, testConnection } from '@/app/services/chatService';
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
    setMessages([{ id: 'welcome', role: 'assistant', content: `Hello${user ? `, ${user.firstName}` : ''}! I'm your MeroEdu AI assistant.\n\nI can help you with:\n• Course recommendations\n• Learning guidance\n• Platform help\n• Team collaboration\n\nHow can I help you today?`, timestamp: new Date() }]);
  }, [user]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, streamText]);

  const handleSend = async () => {
    const text = input.trim(); if (!text || isLoading) return;
    const userMessage = { id: `user_${Date.now()}`, role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]); setInput(''); setIsLoading(true); setStreamText('');
    try {
      const result = await sendMessage([...messages, userMessage], { stream: true, onChunk: (chunk) => setStreamText((prev) => prev + chunk) });
      setMessages((prev) => [...prev, { id: `assistant_${Date.now()}`, role: 'assistant', content: result.text || 'Sorry, I could not generate a response.', timestamp: new Date(), mock: result.mock }]);
      setStreamText('');
    } catch (err) {
      setMessages((prev) => [...prev, { id: `error_${Date.now()}`, role: 'assistant', content: 'Sorry, something went wrong. Please try again.', timestamp: new Date(), error: true }]);
    } finally { setIsLoading(false); inputRef.current?.focus(); }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const formatContent = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => { let f = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); f = f.replace(/\*(.*?)\*/g, '<em>$1</em>'); if (f.trim() === '') return <div key={i} />; return <div key={i} dangerouslySetInnerHTML={{ __html: f }} />; });
  };

  return (
    <div className='dashboard-layout'>
      <SideBar />
      <div className='dashboard-main'>
        <div className='dashboard-header'>
          <div className='header-left'><h1 className='page-title'>AI Chat</h1><p className='page-subtitle'>{isLoading ? 'Thinking...' : streamText ? 'Typing...' : settings.enabled ? `Connected • ${settings.model}` : 'Built-in responses'}</p></div>
          <div className='header-right'><Plus onClick={() => setShowSettings(true)} variant="default"><Settings size={16} /></Plus></div>
        </div>

        <div className='chat-page'>
          <ScrollArea className='chat-messages' h="calc(100vh - 200px)">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.role} ${msg.error ? 'error' : ''} ${msg.mock ? 'mock' : ''}`}>
                <div className='chat-avatar'>{msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}</div>
                <div className='chat-bubble'>
                  <div className='chat-content'>{formatContent(msg.content)}</div>
                  <div className='chat-time'>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{msg.mock && <span className='mock-badge'>demo</span>}</div>
                </div>
              </div>
            ))}
            {streamText && (<div className='chat-message assistant'><div className='chat-avatar'><Bot size={20} /></div><div className='chat-bubble'><div className='chat-content'>{formatContent(streamText)}</div></div></div>)}
            {isLoading && !streamText && (<div className='chat-message assistant'><div className='chat-avatar'><Bot size={20} /></div><div className='chat-bubble typing'><div className='typing-dots'><span /><span /><span /></div></div></div>)}
            <div ref={messagesEndRef} />
          </ScrollArea>

          <Paper className='chat-input-segment' p="sm" radius="md" withBorder>
            <Group>
              <TextInput ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type your message..." style={{ flex: 1 }} disabled={isLoading} className='chat-textarea' />
              <Button leftSection={<Send size={14} />} onClick={handleSend} disabled={!input.trim() || isLoading} className='chat-send-btn'>Send</Button>
            </Group>
          </Paper>
        </div>

        <Modal opened={showSettings} onClose={() => setShowSettings(false)} title="AI Chat Settings" size="md">
          <Stack>
            <Select label="API Provider" data={API_PRESETS.map((p) => ({ value: p.name, label: p.name }))} value={selectedPreset} onChange={(v) => { setSelectedPreset(v); const preset = API_PRESETS.find((p) => p.name === v); if (preset) setSettings((s) => ({ ...s, apiBase: preset.base, model: preset.models[0] || s.model })); }} />
            <TextInput label="API Key" type="password" value={settings.apiKey} onChange={(e) => setSettings((s) => ({ ...s, apiKey: e.target.value }))} placeholder="sk-... or your API key" />
            <TextInput label="API Base URL" value={settings.apiBase} onChange={(e) => setSettings((s) => ({ ...s, apiBase: e.target.value }))} placeholder="https://api.openai.com/v1" />
            <Select label="Model" data={AVAILABLE_MODELS.map((m) => ({ value: m.id, label: m.name }))} value={settings.model} onChange={(v) => setSettings((s) => ({ ...s, model: v }))} />
            <Group>
              <Button onClick={async () => { setTestStatus({ testing: true }); const result = await testConnection(settings); setTestStatus(result); setTimeout(() => setTestStatus(null), 4000); }} loading={testStatus?.testing}>Test Connection</Button>
              {testStatus && !testStatus.testing && <Alert color={testStatus.success ? 'green' : 'red'}>{testStatus.success ? '✅ Connection successful!' : `❌ ${testStatus.error}`}</Alert>}
            </Group>
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setShowSettings(false)}>Cancel</Button>
              <Button onClick={() => { saveChatSettings(settings); setShowSettings(false); }} disabled={!settings.apiKey}>Save & Enable</Button>
            </Group>
          </Stack>
        </Modal>
      </div>
    </div>
  );
};

export default ChatPage;
