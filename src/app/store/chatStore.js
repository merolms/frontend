// Chat Store — manages channels, messages, DMs for the mini Slack
// All state in-memory with localStorage persistence for messages

const STORAGE_KEY = 'meroedu_slack_messages';
const CHANNELS_KEY = 'meroedu_slack_channels';

// ─── Seed Data ───────────────────────────────────────────────

const seedChannels = [
  { id: 'general', name: 'general', type: 'channel', description: 'General discussion for everyone', unread: 0 },
  { id: 'random', name: 'random', type: 'channel', description: 'Off-topic fun and chatter', unread: 0 },
  { id: 'help', name: 'help', type: 'channel', description: 'Ask for help with courses and platform', unread: 2 },
  { id: 'announcements', name: 'announcements', type: 'channel', description: 'Important announcements', unread: 1 },
  { id: 'engineering', name: 'engineering', type: 'channel', description: 'Engineering team discussions', unread: 0 },
];

const seedMessages = {
  general: [
    { id: 'g1', userId: 1, text: 'Hey everyone! Welcome to the general channel 👋', timestamp: Date.now() - 3600000 * 5, reactions: { '👋': [2, 3] } },
    { id: 'g2', userId: 2, text: 'Thanks John! Excited to be here.', timestamp: Date.now() - 3600000 * 4.5, reactions: {} },
    { id: 'g3', userId: 3, text: 'Has anyone tried the new React course? It\'s really well structured.', timestamp: Date.now() - 3600000 * 3, reactions: { '🔥': [1, 4] } },
    { id: 'g4', userId: 4, text: 'Yes! I just finished the hooks section. The exercises are great.', timestamp: Date.now() - 3600000 * 2.5, reactions: {} },
    { id: 'g5', userId: 2, text: 'I\'m planning to add more advanced content on state management soon.', timestamp: Date.now() - 3600000 * 2, reactions: { '👍': [1, 3, 4] } },
    { id: 'g6', userId: 1, text: 'That would be awesome! Maybe cover Zustand and Jotai too?', timestamp: Date.now() - 3600000, reactions: {} },
    { id: 'g7', userId: 3, text: 'Also, the team lead meeting is tomorrow at 10 AM.', timestamp: Date.now() - 1800000, reactions: {} },
  ],
  random: [
    { id: 'r1', userId: 4, text: 'Anyone up for a code challenge this weekend?', timestamp: Date.now() - 7200000, reactions: {} },
    { id: 'r2', userId: 3, text: 'Sure! What kind of challenge?', timestamp: Date.now() - 7000000, reactions: {} },
    { id: 'r3', userId: 4, text: 'Maybe a small project — like building a todo app with React hooks', timestamp: Date.now() - 6800000, reactions: { '💯': [1, 2] } },
    { id: 'r4', userId: 2, text: 'I\'m in! Could be a good learning exercise.', timestamp: Date.now() - 3600000, reactions: {} },
  ],
  help: [
    { id: 'h1', userId: 4, text: 'How do I enroll in a course?', timestamp: Date.now() - 5400000, reactions: {} },
    { id: 'h2', userId: 2, text: 'Go to the Courses page, find the course you want, and click "Enroll Now". If it\'s published, you\'ll get instant access!', timestamp: Date.now() - 5200000, reactions: { '✅': [4] } },
    { id: 'h3', userId: 4, text: 'Thanks Jane! What if I want to unenroll?', timestamp: Date.now() - 5000000, reactions: {} },
    { id: 'h4', userId: 2, text: 'You can drop a course from the course detail page. Just be aware that your progress will be saved if you re-enroll later.', timestamp: Date.now() - 4800000, reactions: {} },
  ],
  announcements: [
    { id: 'a1', userId: 1, text: '📢 **New Course Available**: "Advanced JavaScript Patterns" is now live! Check it out in the courses section.', timestamp: Date.now() - 86400000, reactions: { '🎉': [2, 3, 4] } },
    { id: 'a2', userId: 1, text: '📢 **Platform Update**: We\'ve added team performance tracking. Team leads can now see detailed analytics.', timestamp: Date.now() - 43200000, reactions: { '👍': [2, 3] } },
  ],
  engineering: [
    { id: 'e1', userId: 2, text: 'The new curriculum builder is ready for testing. Who wants to try it out?', timestamp: Date.now() - 1800000, reactions: {} },
    { id: 'e2', userId: 3, text: 'I\'ll test it! Send me the link.', timestamp: Date.now() - 1600000, reactions: {} },
    { id: 'e3', userId: 1, text: 'Great work on the drag-and-drop feature Jane! 🎉', timestamp: Date.now() - 900000, reactions: { '🚀': [2, 3] } },
  ],
};

// ─── Store ───────────────────────────────────────────────────

let state = {
  channels: [],
  messages: {},
  activeChannel: 'general',
  activeDM: null, // userId or null
  typingUsers: {}, // { channelId/userId: [userIds] }
  currentUser: null,
};

let listeners = [];

const loadFromStorage = () => {
  try {
    const savedChannels = localStorage.getItem(CHANNELS_KEY);
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    state.channels = savedChannels ? JSON.parse(savedChannels) : seedChannels;
    state.messages = savedMessages ? JSON.parse(savedMessages) : seedMessages;
  } catch {
    state.channels = seedChannels;
    state.messages = seedMessages;
  }
};

const persistToStorage = () => {
  try {
    localStorage.setItem(CHANNELS_KEY, JSON.stringify(state.channels));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.messages));
  } catch {
    // ignore
  }
};

const notify = () => {
  listeners.forEach((fn) => fn(state));
};

// ─── Public API ──────────────────────────────────────────────

export const chatStore = {
  init(user) {
    loadFromStorage();
    state.currentUser = user;
    // Ensure channels exist
    if (!state.channels.length) {
      state.channels = seedChannels;
      state.messages = seedMessages;
      persistToStorage();
    }
    notify();
  },

  subscribe(fn) {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter((l) => l !== fn);
    };
  },

  getState() {
    return state;
  },

  // ── Channel actions ──

  setActiveChannel(channelId) {
    state.activeChannel = channelId;
    state.activeDM = null;
    // Clear unread
    const ch = state.channels.find((c) => c.id === channelId);
    if (ch) ch.unread = 0;
    notify();
  },

  // ── DM actions ──

  setActiveDM(userId) {
    state.activeDM = userId;
    state.activeChannel = null;
    // Ensure DM message list exists
    const dmKey = `dm_${userId}`;
    if (!state.messages[dmKey]) {
      state.messages[dmKey] = [];
    }
    notify();
  },

  // ── Messages ──

  sendMessage(text, targetId, isDM = false) {
    if (!text.trim() || !state.currentUser) return;

    const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const message = {
      id,
      userId: state.currentUser.id,
      text: text.trim(),
      timestamp: Date.now(),
      reactions: {},
    };

    const key = isDM ? `dm_${targetId}` : targetId;
    if (!state.messages[key]) state.messages[key] = [];
    state.messages[key].push(message);
    persistToStorage();
    notify();

    // Simulate bot/AI response in #general and #help
    if (!isDM && (targetId === 'general' || targetId === 'help')) {
      setTimeout(() => this.simulateResponse(targetId), 1500 + Math.random() * 2000);
    }
  },

  // ── Simulated responses ──

  simulateResponse(channelId) {
    const responses = {
      general: [
        { userId: 2, text: 'Great point! I agree with this approach.' },
        { userId: 3, text: 'Thanks for sharing! This is really helpful.' },
        { userId: 1, text: 'Let me look into that and get back to you.' },
        { userId: 4, text: 'I was just thinking the same thing! 👍' },
        { userId: 2, text: 'We should add this to the roadmap.' },
      ],
      help: [
        { userId: 1, text: 'Feel free to reach out if you need any further assistance!' },
        { userId: 2, text: 'You can also check the documentation for more details.' },
        { userId: 3, text: 'I had the same question — glad it\'s resolved!' },
      ],
    };

    const pool = responses[channelId] || responses.general;
    const resp = pool[Math.floor(Math.random() * pool.length)];

    const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const message = {
      id,
      userId: resp.userId,
      text: resp.text,
      timestamp: Date.now(),
      reactions: {},
    };

    if (!state.messages[channelId]) state.messages[channelId] = [];
    state.messages[channelId].push(message);
    persistToStorage();
    notify();
  },

  // ── Reactions ──

  toggleReaction(messageId, emoji, targetId, isDM = false) {
    const key = isDM ? `dm_${targetId}` : targetId;
    const msgs = state.messages[key];
    if (!msgs) return;

    const msg = msgs.find((m) => m.id === messageId);
    if (!msg) return;

    if (!msg.reactions[emoji]) msg.reactions[emoji] = [];
    const idx = msg.reactions[emoji].indexOf(state.currentUser?.id);
    if (idx >= 0) {
      msg.reactions[emoji].splice(idx, 1);
      if (!msg.reactions[emoji].length) delete msg.reactions[emoji];
    } else {
      msg.reactions[emoji].push(state.currentUser?.id);
    }

    persistToStorage();
    notify();
  },

  // ── Typing indicator ──

  setTyping(targetId, userId, isTyping, isDM = false) {
    const key = isDM ? `dm_${targetId}_typing` : `${targetId}_typing`;
    if (!state.typingUsers[key]) state.typingUsers[key] = [];
    if (isTyping && !state.typingUsers[key].includes(userId)) {
      state.typingUsers[key].push(userId);
    } else if (!isTyping) {
      state.typingUsers[key] = state.typingUsers[key].filter((id) => id !== userId);
    }
    notify();
  },

  getTypingUsers(targetId, isDM = false) {
    const key = isDM ? `dm_${targetId}_typing` : `${targetId}_typing`;
    return (state.typingUsers[key] || []).filter((id) => id !== state.currentUser?.id);
  },
};

// ─── Helper: get users ───────────────────────────────────────

export const getUsers = () => [
  { id: 1, name: 'John Doe', role: 'Administrator', avatar: 'https://i.pravatar.cc/150?img=1', status: 'online' },
  { id: 2, name: 'Jane Smith', role: 'Instructor', avatar: 'https://i.pravatar.cc/150?img=5', status: 'online' },
  { id: 3, name: 'Diana Prince', role: 'Team Lead', avatar: 'https://i.pravatar.cc/150?img=10', status: 'away' },
  { id: 4, name: 'Bob Wilson', role: 'Student', avatar: 'https://i.pravatar.cc/150?img=3', status: 'offline' },
];

export const getUserById = (id) => getUsers().find((u) => u.id === id);
