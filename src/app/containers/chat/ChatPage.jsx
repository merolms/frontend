import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Bot, Plus, Send, Settings, User } from "lucide-react";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Paper } from "@/components/ui/card";
import {
  sendMessage,
  getChatSettings,
  saveChatSettings,
  AVAILABLE_MODELS,
  API_PRESETS,
  testConnection,
} from "@/app/services/chatService";

const ChatPage = () => {
  const user = useSelector((s) => s.auth.user);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(getChatSettings);
  const [testStatus, setTestStatus] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState("OpenAI");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `Hello${user ? `, ${user.firstName}` : ""}! I'm your MeroEdu AI assistant.\n\nI can help you with:\n• Course recommendations\n• Learning guidance\n• Platform help\n• Team collaboration\n\nHow can I help you today?`,
        timestamp: new Date(),
      },
    ]);
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamText]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    const userMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setStreamText("");
    try {
      const result = await sendMessage([...messages, userMessage], {
        stream: true,
        onChunk: (chunk) => setStreamText((prev) => prev + chunk),
      });
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant_${Date.now()}`,
          role: "assistant",
          content: result.text || "Sorry, I could not generate a response.",
          timestamp: new Date(),
          mock: result.mock,
        },
      ]);
      setStreamText("");
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error_${Date.now()}`,
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          timestamp: new Date(),
          error: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatContent = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, i) => {
      let f = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      f = f.replace(/\*(.*?)\*/g, "<em>$1</em>");
      if (f.trim() === "") return <div key={i} />;
      return <div key={i} dangerouslySetInnerHTML={{ __html: f }} />;
    });
  };

  return (
    <>
      <DashboardLayout
        title="AI Chat"
        subtitle={
          isLoading
            ? "Thinking..."
            : streamText
              ? "Typing..."
              : settings.enabled
                ? `Connected • ${settings.model}`
                : "Built-in responses"
        }
      >
        {/* Settings button */}
        <div className="mb-4 flex items-center justify-end">
          <Button variant="default" size="sm" onClick={() => setShowSettings(true)}>
            <Settings size={14} /> Settings
          </Button>
        </div>

        {/* Messages */}
        <div
          className="mb-4 flex-1 space-y-3 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 280px)" }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className="bg-bg-surface-active flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div
                className={`max-w-[70%] rounded-lg px-3 py-2 ${msg.role === "user" ? "bg-primary text-white" : "bg-bg-surface border-border border"}`}
              >
                <div className="text-sm" style={{ whiteSpace: "pre-wrap" }}>
                  {msg.content}
                </div>
                <div className="mt-1 text-right text-[10px] opacity-60">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {msg.mock && <span className="text-warning ml-1">demo</span>}
                </div>
              </div>
            </div>
          ))}
          {streamText && (
            <div className="flex gap-3">
              <div className="bg-bg-surface-active flex h-8 w-8 items-center justify-center rounded-full">
                <Bot size={16} />
              </div>
              <div className="bg-bg-surface border-border max-w-[70%] rounded-lg border px-3 py-2">
                <div className="text-sm" style={{ whiteSpace: "pre-wrap" }}>
                  {streamText}
                </div>
              </div>
            </div>
          )}
          {isLoading && !streamText && (
            <div className="flex gap-3">
              <div className="bg-bg-surface-active flex h-8 w-8 items-center justify-center rounded-full">
                <Bot size={16} />
              </div>
              <div className="bg-bg-surface border-border rounded-lg border px-3 py-2">
                <div className="flex gap-1">
                  <span className="bg-text-muted h-2 w-2 animate-bounce rounded-full" />
                  <span
                    className="bg-text-muted h-2 w-2 animate-bounce rounded-full"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <span
                    className="bg-text-muted h-2 w-2 animate-bounce rounded-full"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <Paper className="p-3">
          <div className="flex items-center gap-2">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="max-h-[120px] min-h-[40px] flex-1"
              rows={1}
            />
            <Button size="sm" onClick={handleSend} disabled={!input.trim() || isLoading}>
              <Send size={14} /> Send
            </Button>
          </div>
        </Paper>
      </DashboardLayout>

      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        {showSettings && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>AI Chat Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-text-primary text-xs font-medium">API Provider</label>
                <Select
                  value={selectedPreset}
                  onValueChange={(v) => {
                    setSelectedPreset(v);
                    const preset = API_PRESETS.find((p) => p.name === v);
                    if (preset)
                      setSettings((s) => ({
                        ...s,
                        apiBase: preset.base,
                        model: preset.models[0] || s.model,
                      }));
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {API_PRESETS.map((p) => (
                      <SelectItem key={p.name} value={p.name}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-text-primary text-xs font-medium">API Key</label>
                <Input
                  type="password"
                  value={settings.apiKey}
                  onChange={(e) => setSettings((s) => ({ ...s, apiKey: e.target.value }))}
                  placeholder="sk-... or your API key"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-text-primary text-xs font-medium">API Base URL</label>
                <Input
                  value={settings.apiBase}
                  onChange={(e) => setSettings((s) => ({ ...s, apiBase: e.target.value }))}
                  placeholder="https://api.openai.com/v1"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-text-primary text-xs font-medium">Model</label>
                <Select
                  value={settings.model}
                  onValueChange={(v) => setSettings((s) => ({ ...s, model: v }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_MODELS.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={async () => {
                    setTestStatus({ testing: true });
                    const result = await testConnection(settings);
                    setTestStatus(result);
                    setTimeout(() => setTestStatus(null), 4000);
                  }}
                  disabled={testStatus?.testing}
                >
                  Test Connection
                </Button>
                {testStatus && !testStatus.testing && (
                  <span
                    className={`ml-2 text-sm ${testStatus.success ? "text-success" : "text-error"}`}
                  >
                    {testStatus.success ? "✅ Connection successful!" : `❌ ${testStatus.error}`}
                  </span>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="default" onClick={() => setShowSettings(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    saveChatSettings(settings);
                    setShowSettings(false);
                  }}
                  disabled={!settings.apiKey}
                >
                  Save & Enable
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
};

export default ChatPage;
