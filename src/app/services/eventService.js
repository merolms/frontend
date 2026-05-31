// Events Service — Mock data for now

let mockEvents = [
  {
    id: 1,
    title: "React Advanced Patterns Workshop",
    description:
      "Deep dive into advanced React patterns including compound components, render props, and custom hooks.",
    type: "workshop",
    color: "#6366F1",
    startDate: "2025-07-15T10:00:00",
    endDate: "2025-07-15T14:00:00",
    location: "Virtual — Zoom",
    instructor: "Jane Smith",
    maxAttendees: 50,
    enrolledCount: 32,
    status: "upcoming",
    tags: ["react", "javascript", "advanced"],
    createdAt: "2025-06-01",
    updatedAt: "2025-06-10",
  },
  {
    id: 2,
    title: "Data Science Career Fair",
    description: "Meet top employers in the data science field. Bring your resume and portfolio.",
    type: "career",
    color: "#8B5CF6",
    startDate: "2025-07-18T09:00:00",
    endDate: "2025-07-18T17:00:00",
    location: "Main Hall, Building A",
    instructor: null,
    maxAttendees: 200,
    enrolledCount: 145,
    status: "upcoming",
    tags: ["career", "networking", "data-science"],
    createdAt: "2025-06-05",
    updatedAt: "2025-06-12",
  },
  {
    id: 3,
    title: "Python for Beginners — Live Session",
    description: "Interactive live coding session covering Python fundamentals.",
    type: "live_class",
    color: "#22C55E",
    startDate: "2025-07-12T15:00:00",
    endDate: "2025-07-12T17:00:00",
    location: "Virtual — Google Meet",
    instructor: "Bob Wilson",
    maxAttendees: 100,
    enrolledCount: 78,
    status: "upcoming",
    tags: ["python", "beginner", "live"],
    createdAt: "2025-06-08",
    updatedAt: "2025-06-08",
  },
  {
    id: 4,
    title: "UI/UX Design Review Session",
    description:
      "Bring your designs for peer review and expert feedback from industry professionals.",
    type: "review",
    color: "#EC4899",
    startDate: "2025-07-20T11:00:00",
    endDate: "2025-07-20T13:00:00",
    location: "Design Lab, Room 302",
    instructor: "Diana Prince",
    maxAttendees: 30,
    enrolledCount: 22,
    status: "upcoming",
    tags: ["ui", "ux", "design", "review"],
    createdAt: "2025-06-10",
    updatedAt: "2025-06-15",
  },
  {
    id: 5,
    title: "Team Alpha Sprint Planning",
    description: "Q3 sprint planning session for the Alpha engineering team.",
    type: "meeting",
    color: "#F59E0B",
    startDate: "2025-07-14T09:00:00",
    endDate: "2025-07-14T11:00:00",
    location: "Conference Room B",
    instructor: null,
    maxAttendees: 15,
    enrolledCount: 12,
    status: "upcoming",
    tags: ["meeting", "agile", "team"],
    createdAt: "2025-06-12",
    updatedAt: "2025-06-12",
  },
  {
    id: 6,
    title: "Kubernetes Deep Dive",
    description:
      "Hands-on workshop covering Kubernetes architecture, deployment strategies, and monitoring.",
    type: "workshop",
    color: "#06B6D4",
    startDate: "2025-07-22T13:00:00",
    endDate: "2025-07-22T17:00:00",
    location: "Virtual — Teams",
    instructor: "John Doe",
    maxAttendees: 40,
    enrolledCount: 35,
    status: "upcoming",
    tags: ["kubernetes", "devops", "cloud"],
    createdAt: "2025-06-15",
    updatedAt: "2025-06-18",
  },
  {
    id: 7,
    title: "Graduation Ceremony — Summer 2025",
    description: "Celebrate the achievements of our summer cohort graduates.",
    type: "ceremony",
    color: "#EF4444",
    startDate: "2025-07-25T16:00:00",
    endDate: "2025-07-25T19:00:00",
    location: "Grand Auditorium",
    instructor: null,
    maxAttendees: 500,
    enrolledCount: 380,
    status: "upcoming",
    tags: ["ceremony", "graduation", "celebration"],
    createdAt: "2025-05-20",
    updatedAt: "2025-06-20",
  },
  {
    id: 8,
    title: "Study Group — Machine Learning",
    description: "Weekly study group working through the ML fundamentals course together.",
    type: "study_group",
    color: "#10B981",
    startDate: "2025-07-16T18:00:00",
    endDate: "2025-07-16T20:00:00",
    location: "Library, Study Room 5",
    instructor: null,
    maxAttendees: 20,
    enrolledCount: 14,
    status: "upcoming",
    tags: ["study-group", "machine-learning", "peer-learning"],
    createdAt: "2025-06-18",
    updatedAt: "2025-06-18",
  },
];

let nextId = 9;

export const fetchEvents = async (params = {}) => {
  await new Promise((r) => setTimeout(r, 300));
  let results = [...mockEvents];

  if (params.search) {
    const q = params.search.toLowerCase();
    results = results.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        (e.instructor || "").toLowerCase().includes(q) ||
        e.tags.some((t) => t.includes(q))
    );
  }
  if (params.type && params.type !== "all") {
    results = results.filter((e) => e.type === params.type);
  }
  if (params.status && params.status !== "all") {
    results = results.filter((e) => e.status === params.status);
  }
  if (params.startDate) {
    results = results.filter((e) => e.startDate >= params.startDate);
  }
  if (params.endDate) {
    results = results.filter((e) => e.startDate <= params.endDate);
  }

  // Sort by start date
  results.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  const page = params.page || 1;
  const limit = params.limit || 10;
  const total = results.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const events = results.slice(start, start + limit);

  return { events, total, page, limit, totalPages };
};

export const fetchEventById = async (id) => {
  await new Promise((r) => setTimeout(r, 200));
  return mockEvents.find((e) => e.id === parseInt(id)) || null;
};

export const fetchEventsForMonth = async (year, month) => {
  await new Promise((r) => setTimeout(r, 200));
  return mockEvents.filter((e) => {
    const d = new Date(e.startDate);
    return d.getFullYear() === year && d.getMonth() === month;
  });
};

export const fetchUpcomingEvents = async (limit = 5) => {
  await new Promise((r) => setTimeout(r, 200));
  const now = new Date().toISOString();
  return mockEvents
    .filter((e) => e.startDate >= now)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, limit);
};

export const createEvent = async (data) => {
  await new Promise((r) => setTimeout(r, 500));
  const newEvent = {
    id: nextId++,
    ...data,
    enrolledCount: 0,
    status: "upcoming",
    createdAt: new Date().toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
  };
  mockEvents.push(newEvent);
  return newEvent;
};

export const updateEvent = async (id, data) => {
  await new Promise((r) => setTimeout(r, 500));
  const index = mockEvents.findIndex((e) => e.id === parseInt(id));
  if (index === -1) throw new Error("Event not found");
  mockEvents[index] = {
    ...mockEvents[index],
    ...data,
    updatedAt: new Date().toISOString().split("T")[0],
  };
  return mockEvents[index];
};

export const deleteEvent = async (id) => {
  await new Promise((r) => setTimeout(r, 300));
  mockEvents = mockEvents.filter((e) => e.id !== parseInt(id));
  return true;
};

export const getEventTypes = () => [
  { value: "all", label: "All Types" },
  { value: "workshop", label: "Workshop" },
  { value: "live_class", label: "Live Class" },
  { value: "meeting", label: "Meeting" },
  { value: "career", label: "Career Fair" },
  { value: "review", label: "Review Session" },
  { value: "ceremony", label: "Ceremony" },
  { value: "study_group", label: "Study Group" },
];

export const getEventColors = () => [
  { value: "#6366F1", label: "Indigo" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#EC4899", label: "Pink" },
  { value: "#22C55E", label: "Green" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#06B6D4", label: "Cyan" },
  { value: "#EF4444", label: "Red" },
  { value: "#3B82F6", label: "Blue" },
];

export const formatEventDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

export const formatEventTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
};

export const getEventStatus = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "ongoing";
  return "completed";
};
