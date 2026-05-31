// Notification Service — Mock data for now

let mockNotifications = [
  {
    id: 1,
    type: "enrollment",
    title: "New enrollment",
    message: 'Jane Smith enrolled in "Advanced React Patterns"',
    read: false,
    createdAt: Date.now() - 1000 * 60 * 5, // 5 mins ago
  },
  {
    id: 2,
    type: "course",
    title: "Course published",
    message: '"Python for Data Science" has been published successfully',
    read: false,
    createdAt: Date.now() - 1000 * 60 * 30, // 30 mins ago
  },
  {
    id: 3,
    type: "team",
    title: "Team member added",
    message: "John Doe was added to Team Alpha",
    read: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
  },
  {
    id: 4,
    type: "completion",
    title: "Course completed",
    message: 'Bob Wilson completed "Introduction to React"',
    read: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
  },
  {
    id: 5,
    type: "system",
    title: "System update",
    message: "Platform maintenance scheduled for tonight at 2:00 AM",
    read: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
  },
];

let nextId = 6;

export const fetchNotifications = async () => {
  await new Promise((r) => setTimeout(r, 200));
  return [...mockNotifications].sort((a, b) => b.createdAt - a.createdAt);
};

export const markAsRead = async (id) => {
  await new Promise((r) => setTimeout(r, 100));
  const n = mockNotifications.find((n) => n.id === id);
  if (n) n.read = true;
  return true;
};

export const markAllAsRead = async () => {
  await new Promise((r) => setTimeout(r, 100));
  mockNotifications.forEach((n) => {
    n.read = true;
  });
  return true;
};

export const getUnreadCount = () => {
  return mockNotifications.filter((n) => !n.read).length;
};

export const getTimeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};
