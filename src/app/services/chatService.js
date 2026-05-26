// Chat Service
// Direct fetch to any OpenAI-compatible API (OpenAI, Anthropic, OpenRouter, etc.)
// No third-party SDK required. User provides their own API key.

const STORAGE_KEY = 'meroedu_chat_settings';

const DEFAULT_SETTINGS = {
  apiKey: '',
  apiBase: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  enabled: false,
};

export const getChatSettings = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
};

export const saveChatSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
};

// Mock responses for when no API key is configured
const MOCK_RESPONSES = {
  greeting: "Hello! I'm your MeroEdu AI assistant. I can help you with courses, learning paths, and platform questions. How can I help you today?",
  help: "I can help you with:\n\n• **Course recommendations** — Find the right course for your goals\n• **Learning paths** — Plan your curriculum\n• **Platform questions** — Navigate MeroEdu features\n• **Progress tracking** — Check your enrollment status\n\nWhat would you like to explore?",
  course: "We have some great courses available! Here are a few popular ones:\n\n• **Introduction to React** — Perfect for getting started with frontend development\n• **Advanced CSS Techniques** — Master modern layouts with Grid and Flexbox\n• **JavaScript Fundamentals** — A complete guide to modern JavaScript\n• **UI/UX Design Principles** — Learn core design concepts\n\nI'd recommend starting with **JavaScript Fundamentals** if you're new to programming.",
  team: "Teams in MeroEdu help you collaborate with other learners. You can:\n\n• Join existing teams in your organization\n• Track team progress and performance\n• Share courses and learning resources",
  default: "That's a great question! I'd be happy to help you with that. Could you tell me more about what you're looking for? I can assist with course recommendations, learning guidance, or platform features.",
};

const getMockResponse = (userText) => {
  const lower = userText.toLowerCase();
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) return MOCK_RESPONSES.greeting;
  if (lower.includes('help') || lower.includes('what can you')) return MOCK_RESPONSES.help;
  if (lower.includes('course') || lower.includes('learn') || lower.includes('class')) return MOCK_RESPONSES.course;
  if (lower.includes('team') || lower.includes('group')) return MOCK_RESPONSES.team;
  return MOCK_RESPONSES.default;
};

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const sendMessage = async (messages, options = {}) => {
  const { onChunk } = options;
  const settings = getChatSettings();

  // If no API key configured, use mock responses
  if (!settings.enabled || !settings.apiKey) {
    await delay(600 + Math.random() * 800);
    const lastMessage = messages[messages.length - 1];
    const responseText = getMockResponse(lastMessage?.content || '');

    if (stream && onChunk) {
      const words = responseText.split(' ');
      for (let i = 0; i < words.length; i++) {
        await delay(25 + Math.random() * 40);
        onChunk(words[i] + ' ');
      }
    }

    return { stream: false, text: responseText, mock: true };
  }

  // Real API call
  const apiMessages = messages.map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  }));

  try {
    const response = await fetch(`${settings.apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        messages: apiMessages,
        stream: false,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || 'No response generated.';
    return { stream: false, text, mock: false };
  } catch (err) {
    console.warn('API call failed:', err.message);
    // Fallback to mock on error
    const lastMessage = messages[messages.length - 1];
    const responseText = getMockResponse(lastMessage?.content || '');
    return { stream: false, text: responseText, mock: true };
  }
};

export const testConnection = async (settings) => {
  try {
    const response = await fetch(`${settings.apiBase}/models`, {
      headers: { 'Authorization': `Bearer ${settings.apiKey}` },
    });
    if (response.ok) return { success: true };
    return { success: false, error: `HTTP ${response.status}` };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const AVAILABLE_MODELS = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', provider: 'Anthropic' },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'Anthropic' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Google' },
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', provider: 'OpenRouter' },
  { id: 'deepseek-chat', name: 'DeepSeek V3', provider: 'DeepSeek' },
];

export const API_PRESETS = [
  { name: 'OpenAI', base: 'https://api.openai.com/v1', models: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'] },
  { name: 'Anthropic', base: 'https://api.anthropic.com/v1', models: ['claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022'] },
  { name: 'OpenRouter', base: 'https://openrouter.ai/api/v1', models: ['llama-3.3-70b-versatile', 'deepseek-chat'] },
  { name: 'DeepSeek', base: 'https://api.deepseek.com/v1', models: ['deepseek-chat'] },
  { name: 'Google AI', base: 'https://generativelanguage.googleapis.com/v1beta', models: ['gemini-2.0-flash'] },
];
