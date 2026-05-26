// Chat Service
// Wrapper around Puter.js AI chat API with fallback to mock responses
import * as puter from 'puter';

const MOCK_RESPONSES = [
  "That's a great question! Let me think about that...",
  "I'd be happy to help you with that. Here's what I think...",
  "Interesting! Here's my perspective on this topic...",
  "Great point! Let me elaborate on that...",
  "I understand what you're asking. Here's my take...",
];

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const sendMessage = async (messages, options = {}) => {
  const { stream = false, model = 'gpt-5-nano', onChunk } = options;

  // Try Puter.js first
  if (puter && puter.ai) {
    try {
      const chatMessages = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      if (stream) {
        const response = await puter.ai.chat(chatMessages, {
          model,
          stream: true,
        });
        return { stream: true, response };
      }

      const response = await puter.ai.chat(chatMessages, { model });
      return { stream: false, text: response.text || response };
    } catch (err) {
      console.warn('Puter.ai failed, falling back to mock:', err.message);
    }
  }

  // Fallback: mock response
  await delay(800 + Math.random() * 1200);

  const lastMessage = messages[messages.length - 1];
  const userText = lastMessage?.content || '';

  let responseText;
  const lower = userText.toLowerCase();

  if (lower.includes('hello') || lower.includes('hi')) {
    responseText = "Hello! I'm your AI assistant. How can I help you today? I can help you with courses, learning paths, or any questions about the platform.";
  } else if (lower.includes('help')) {
    responseText = "I can help you with:\n\n• **Course recommendations** — Find the right course for your goals\n• **Learning paths** — Plan your curriculum\n• **Platform questions** — Navigate MeroEdu features\n• **Progress tracking** — Check your enrollment status\n\nWhat would you like to explore?";
  } else if (lower.includes('course') || lower.includes('learn')) {
    responseText = "We have some great courses available! Here are a few popular ones:\n\n• **Introduction to React** — Perfect for getting started with frontend development\n• **Advanced CSS Techniques** — Master modern layouts with Grid and Flexbox\n• **JavaScript Fundamentals** — A complete guide to modern JavaScript\n• **UI/UX Design Principles** — Learn core design concepts\n\nI'd recommend starting with **JavaScript Fundamentals** if you're new to programming. Would you like more details about any of these courses?";
  } else if (lower.includes('thank')) {
    responseText = "You're welcome! Is there anything else I can help you with? Feel free to ask about courses, your learning progress, or any platform features.";
  } else if (lower.includes('team')) {
    responseText = "Teams in MeroEdu help you collaborate with other learners. You can:\n\n• Join existing teams in your organization\n• Track team progress and performance\n• Share courses and learning resources\n\nWould you like to know more about a specific team or how to join one?";
  } else {
    responseText = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)] +
      `\n\nI noticed you mentioned: "${userText.substring(0, 50)}${userText.length > 50 ? '...' : ''}". ` +
      "Feel free to ask me about courses, learning paths, teams, or any feature of the MeroEdu platform. I'm here to help!";
  }

  if (stream && onChunk) {
    // Simulate streaming by sending chunks
    const words = responseText.split(' ');
    for (let i = 0; i < words.length; i++) {
      await delay(30 + Math.random() * 50);
      onChunk(words[i] + ' ');
    }
    return { stream: true, text: responseText };
  }

  return { stream: false, text: responseText };
};

export const listModels = async () => {
  if (puter && puter.ai) {
    try {
      return await puter.ai.listModels();
    } catch {
      // Fall through
    }
  }
  return [
    { id: 'gpt-5-nano', name: 'GPT-5 Nano', provider: 'openai' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
    { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', provider: 'anthropic' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google' },
  ];
};
