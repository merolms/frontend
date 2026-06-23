// Course Builder Service
// Manages the hierarchical course structure: Course > Section > Module > Lesson > Topic
// All data is in-memory mock. Replace with API calls later.

let nextId = 100;
const uid = () => `${++nextId}`;

// ==================== INITIAL MOCK DATA ====================

const mockCoursesWithStructure = {
  1: {
    id: 1,
    title: "Introduction to React",
    description:
      "Learn the fundamentals of React including components, state, hooks, and building modern web applications.",
    category: "Programming",
    tags: ["react", "javascript", "frontend"],
    status: "published",
    author: "John Doe",
    coverImage: "https://picsum.photos/seed/react/400/250",
    totalLessons: 5,
    enrolledUsers: 45,
    duration: "8 hours",
    sections: [
      {
        id: "s1",
        title: "Getting Started",
        description: "Set up your environment and learn the basics.",
        order: 0,
        status: "published",
        isCollapsed: false,
        modules: [
          {
            id: "m1",
            title: "Environment Setup",
            description: "",
            order: 0,
            lessons: [
              {
                id: "l1",
                title: "Installing Node.js",
                description: "Download and install Node.js and npm on your machine.",
                type: "video",
                duration: "10 mins",
                order: 0,
                status: "published",
                isLocked: false,
                unlockCondition: null,
                points: 10,
                content: {
                  videoUrl: "https://example.com/videos/node-install.mp4",
                  transcript: "In this lesson we cover installing Node.js...",
                },
                topics: [
                  {
                    id: "t1",
                    title: "Download Node.js",
                    type: "text",
                    content: "Go to nodejs.org and download the LTS version.",
                    duration: "3 mins",
                  },
                  {
                    id: "t2",
                    title: "Verify Installation",
                    type: "text",
                    content: "Run node -v and npm -v in your terminal.",
                    duration: "2 mins",
                  },
                ],
              },
              {
                id: "l2",
                title: "Creating Your First App",
                description: "Use create-react-app to scaffold a new project.",
                type: "text",
                duration: "15 mins",
                order: 1,
                status: "published",
                isLocked: false,
                unlockCondition: null,
                points: 15,
                content: {
                  html: "<h2>Creating Your First React App</h2><p>Run <code>npx create-react-app my-app</code> to get started...</p>",
                },
                topics: [],
              },
            ],
          },
          {
            id: "m2",
            title: "Project Structure",
            description: "Understanding the files and folders.",
            order: 1,
            lessons: [
              {
                id: "l3",
                title: "Understanding the File Structure",
                description: "Explore what create-react-app generates.",
                type: "text",
                duration: "8 mins",
                order: 0,
                status: "published",
                isLocked: false,
                unlockCondition: null,
                points: 10,
                content: {
                  html: "<h2>Project Structure</h2><p>The main files you need to know about are...</p>",
                },
                topics: [],
              },
            ],
          },
        ],
      },
      {
        id: "s2",
        title: "Core Concepts",
        description: "Deep dive into React components, state, and props.",
        order: 1,
        status: "published",
        isCollapsed: false,
        modules: [
          {
            id: "m3",
            title: "Components & Props",
            description: "",
            order: 0,
            lessons: [
              {
                id: "l4",
                title: "Function Components",
                description: "Learn to create and use function components.",
                type: "video",
                duration: "20 mins",
                order: 0,
                status: "published",
                isLocked: true,
                unlockCondition: { type: "previous_complete" },
                points: 20,
                content: {
                  videoUrl: "https://example.com/videos/function-components.mp4",
                  transcript: "Function components are the modern way to write React...",
                },
                topics: [
                  {
                    id: "t3",
                    title: "What are Components?",
                    type: "text",
                    content: "Components are reusable building blocks...",
                    duration: "5 mins",
                  },
                  {
                    id: "t4",
                    title: "Props",
                    type: "text",
                    content: "Props allow you to pass data to components...",
                    duration: "5 mins",
                  },
                ],
              },
              {
                id: "l5",
                title: "State with useState",
                description: "Managing local component state.",
                type: "video",
                duration: "25 mins",
                order: 1,
                status: "draft",
                isLocked: true,
                unlockCondition: { type: "previous_complete" },
                points: 25,
                content: {
                  videoUrl: "https://example.com/videos/usestate.mp4",
                  transcript: "The useState hook lets you add state to function components...",
                },
                topics: [],
              },
            ],
          },
        ],
      },
    ],
  },
  // Other courses get a default structure
  2: {
    id: 2,
    title: "Advanced CSS Techniques",
    description: "Master CSS Grid, Flexbox, animations, and modern layout techniques.",
    category: "Design",
    tags: ["css", "design", "frontend"],
    status: "published",
    author: "Jane Smith",
    coverImage: "https://picsum.photos/seed/css/400/250",
    totalLessons: 3,
    enrolledUsers: 32,
    duration: "5 hours",
    sections: [
      {
        id: "s1",
        title: "Layout Foundations",
        description: "",
        order: 0,
        status: "published",
        isCollapsed: false,
        modules: [
          {
            id: "m1",
            title: "CSS Grid",
            description: "",
            order: 0,
            lessons: [
              {
                id: "l1",
                title: "CSS Grid Fundamentals",
                description: "Understanding grid layout",
                type: "video",
                duration: "35 mins",
                order: 0,
                status: "published",
                isLocked: false,
                unlockCondition: null,
                points: 15,
                content: { videoUrl: "", transcript: "" },
                topics: [],
              },
            ],
          },
        ],
      },
    ],
  },
  3: {
    id: 3,
    title: "Python for Data Science",
    description: "Comprehensive introduction to Python for data analysis and machine learning.",
    category: "Data Science",
    tags: ["python", "data", "machine-learning"],
    status: "draft",
    author: "Bob Wilson",
    coverImage: "https://picsum.photos/seed/python/400/250",
    totalLessons: 0,
    enrolledUsers: 0,
    duration: "15 hours",
    sections: [],
  },
};

// ==================== FETCH ====================

export const mockFetchCourseStructure = async (courseId) => {
  await new Promise((r) => setTimeout(r, 300));
  const course = mockCoursesWithStructure[courseId];
  if (!course) return Promise.reject(new Error("Course not found"));
  return JSON.parse(JSON.stringify(course)); // deep clone
};

// ==================== SECTION CRUD ====================

export const mockCreateSection = async (courseId, data) => {
  await new Promise((r) => setTimeout(r, 300));
  const course = mockCoursesWithStructure[courseId];
  if (!course) return Promise.reject(new Error("Course not found"));

  const section = {
    id: uid(),
    title: data.title || "New Section",
    description: data.description || "",
    order: course.sections.length,
    status: "draft",
    isCollapsed: false,
    modules: [],
  };
  course.sections.push(section);
  return section;
};

export const mockUpdateSection = async (courseId, sectionId, data) => {
  await new Promise((r) => setTimeout(r, 300));
  const section = findNode(mockCoursesWithStructure[courseId], sectionId);
  if (!section) return Promise.reject(new Error("Section not found"));
  Object.assign(section, data);
  return section;
};

export const mockDeleteSection = async (courseId, sectionId) => {
  await new Promise((r) => setTimeout(r, 300));
  const course = mockCoursesWithStructure[courseId];
  if (!course) return Promise.reject(new Error("Course not found"));
  course.sections = course.sections.filter((s) => s.id !== sectionId);
  // Reorder
  course.sections.forEach((s, i) => (s.order = i));
  return true;
};

// ==================== MODULE CRUD ====================

export const mockCreateModule = async (courseId, sectionId, data) => {
  await new Promise((r) => setTimeout(r, 300));
  const section = findNode(mockCoursesWithStructure[courseId], sectionId);
  if (!section) return Promise.reject(new Error("Section not found"));

  const module = {
    id: uid(),
    title: data.title || "New Module",
    description: data.description || "",
    order: section.modules.length,
    lessons: [],
  };
  section.modules.push(module);
  return module;
};

export const mockUpdateModule = async (courseId, moduleId, data) => {
  await new Promise((r) => setTimeout(r, 300));
  const mod = findNode(mockCoursesWithStructure[courseId], moduleId);
  if (!mod) return Promise.reject(new Error("Module not found"));
  Object.assign(mod, data);
  return mod;
};

export const mockDeleteModule = async (courseId, moduleId) => {
  await new Promise((r) => setTimeout(r, 300));
  const course = mockCoursesWithStructure[courseId];
  if (!course) return Promise.reject(new Error("Course not found"));
  for (const section of course.sections) {
    const idx = section.modules.findIndex((m) => m.id === moduleId);
    if (idx !== -1) {
      section.modules.splice(idx, 1);
      section.modules.forEach((m, i) => (m.order = i));
      return true;
    }
  }
  return Promise.reject(new Error("Module not found"));
};

// ==================== LESSON CRUD ====================

export const mockCreateLesson = async (courseId, moduleId, data) => {
  await new Promise((r) => setTimeout(r, 300));
  const mod = findNode(mockCoursesWithStructure[courseId], moduleId);
  if (!mod) return Promise.reject(new Error("Module not found"));

  const lesson = {
    id: uid(),
    title: data.title || "New Lesson",
    description: data.description || "",
    type: data.type || "text",
    duration: data.duration || "",
    order: mod.lessons.length,
    status: "draft",
    isLocked: false,
    unlockCondition: null,
    points: 0,
    content: { html: "", videoUrl: "", transcript: "" },
    topics: [],
  };
  mod.lessons.push(lesson);
  return lesson;
};

export const mockUpdateLesson = async (courseId, lessonId, data) => {
  await new Promise((r) => setTimeout(r, 300));
  const lesson = findNode(mockCoursesWithStructure[courseId], lessonId);
  if (!lesson) return Promise.reject(new Error("Lesson not found"));
  Object.assign(lesson, data);
  return lesson;
};

export const mockDeleteLesson = async (courseId, lessonId) => {
  await new Promise((r) => setTimeout(r, 300));
  const course = mockCoursesWithStructure[courseId];
  if (!course) return Promise.reject(new Error("Course not found"));
  for (const section of course.sections) {
    for (const mod of section.modules) {
      const idx = mod.lessons.findIndex((l) => l.id === lessonId);
      if (idx !== -1) {
        mod.lessons.splice(idx, 1);
        mod.lessons.forEach((l, i) => (l.order = i));
        return true;
      }
    }
  }
  return Promise.reject(new Error("Lesson not found"));
};

// ==================== TOPIC CRUD ====================

export const mockCreateTopic = async (courseId, lessonId, data) => {
  await new Promise((r) => setTimeout(r, 300));
  const lesson = findNode(mockCoursesWithStructure[courseId], lessonId);
  if (!lesson) return Promise.reject(new Error("Lesson not found"));

  const topic = {
    id: uid(),
    title: data.title || "New Topic",
    type: data.type || "text",
    content: data.content || "",
    duration: data.duration || "",
  };
  lesson.topics.push(topic);
  return topic;
};

export const mockUpdateTopic = async (courseId, lessonId, topicId, data) => {
  await new Promise((r) => setTimeout(r, 300));
  const lesson = findNode(mockCoursesWithStructure[courseId], lessonId);
  if (!lesson) return Promise.reject(new Error("Lesson not found"));
  const topic = lesson.topics.find((t) => t.id === topicId);
  if (!topic) return Promise.reject(new Error("Topic not found"));
  Object.assign(topic, data);
  return topic;
};

export const mockDeleteTopic = async (courseId, lessonId, topicId) => {
  await new Promise((r) => setTimeout(r, 300));
  const lesson = findNode(mockCoursesWithStructure[courseId], lessonId);
  if (!lesson) return Promise.reject(new Error("Lesson not found"));
  lesson.topics = lesson.topics.filter((t) => t.id !== topicId);
  return true;
};

// ==================== REORDER ====================

export const mockReorderNodes = async (courseId, parentId, nodeType, orderedIds) => {
  await new Promise((r) => setTimeout(r, 200));
  const course = mockCoursesWithStructure[courseId];
  if (!course) return Promise.reject(new Error("Course not found"));

  let list;
  if (nodeType === "section") {
    list = course.sections;
  } else {
    const parent = findNode(course, parentId);
    if (!parent) return Promise.reject(new Error("Parent not found"));
    list = parent[nodeType === "module" ? "modules" : "lessons"];
  }

  // Reorder based on orderedIds
  const reordered = orderedIds.map((id) => list.find((n) => n.id === id)).filter(Boolean);
  list.length = 0;
  list.push(...reordered);
  list.forEach((n, i) => (n.order = i));
  return true;
};

// ==================== HELPERS ====================

function findNode(root, id) {
  if (!root) return null;
  if (root.id === id || root.id === String(id)) return root;

  // Check sections
  if (root.sections) {
    for (const section of root.sections) {
      if (section.id === id || section.id === String(id)) return section;
      // Check modules
      if (section.modules) {
        for (const mod of section.modules) {
          if (mod.id === id || mod.id === String(id)) return mod;
          // Check lessons
          if (mod.lessons) {
            for (const lesson of mod.lessons) {
              if (lesson.id === id || lesson.id === String(id)) return lesson;
              // Check topics
              if (lesson.topics) {
                for (const topic of lesson.topics) {
                  if (topic.id === id || topic.id === String(id)) return topic;
                }
              }
            }
          }
        }
      }
    }
  }
  return null;
}

export const NODE_TYPES = {
  SECTION: "section",
  MODULE: "module",
  LESSON: "lesson",
  TOPIC: "topic",
};
