// Learning Path Mock Data Service

let mockLearningPaths = [
  {
    id: 1,
    title: "Full-Stack Web Development",
    description:
      "Master modern web development from frontend to backend. Start with HTML/CSS, progress through JavaScript frameworks, and build production-ready applications.",
    image: "https://picsum.photos/seed/fullstack/400/250",
    category: "Programming",
    difficulty: "Beginner to Advanced",
    estimatedDuration: "6 months",
    totalCourses: 5,
    enrolledCount: 342,
    rating: 4.8,
    status: "published",
    tags: ["react", "nodejs", "javascript", "fullstack"],
    color: "#6366F1",
    courses: [
      {
        id: 1,
        title: "HTML & CSS Fundamentals",
        description: "Build beautiful, responsive websites from scratch",
        duration: "4 weeks",
        order: 1,
        lessons: 24,
        coverImage: "https://picsum.photos/seed/html/400/250",
      },
      {
        id: 2,
        title: "JavaScript Essentials",
        description: "Master JavaScript for web development",
        duration: "6 weeks",
        order: 2,
        lessons: 36,
        coverImage: "https://picsum.photos/seed/js/400/250",
      },
      {
        id: 3,
        title: "React Mastery",
        description: "Build modern UIs with React and hooks",
        duration: "8 weeks",
        order: 3,
        lessons: 48,
        coverImage: "https://picsum.photos/seed/react/400/250",
      },
      {
        id: 4,
        title: "Node.js Backend Development",
        description: "Build scalable APIs and server-side applications",
        duration: "6 weeks",
        order: 4,
        lessons: 32,
        coverImage: "https://picsum.photos/seed/nodejs/400/250",
      },
      {
        id: 5,
        title: "Database Design & SQL",
        description: "Design and query relational databases",
        duration: "4 weeks",
        order: 5,
        lessons: 20,
        coverImage: "https://picsum.photos/seed/db/400/250",
      },
    ],
    createdAt: "2025-01-15",
    updatedAt: "2025-03-20",
  },
  {
    id: 2,
    title: "Data Science & Machine Learning",
    description:
      "From data analysis to machine learning models. Learn Python, statistics, and build AI-powered applications that extract insights from data.",
    image: "https://picsum.photos/seed/datascience/400/250",
    category: "Data Science",
    difficulty: "Intermediate",
    estimatedDuration: "8 months",
    totalCourses: 4,
    enrolledCount: 189,
    rating: 4.6,
    status: "published",
    tags: ["python", "machine-learning", "data-science", "ai"],
    color: "#8B5CF6",
    courses: [
      {
        id: 6,
        title: "Python for Data Science",
        description: "Python programming for data analysis",
        duration: "5 weeks",
        order: 1,
        lessons: 30,
        coverImage: "https://picsum.photos/seed/python/400/250",
      },
      {
        id: 7,
        title: "Statistics & Probability",
        description: "Mathematical foundations for data science",
        duration: "6 weeks",
        order: 2,
        lessons: 28,
        coverImage: "https://picsum.photos/seed/stats/400/250",
      },
      {
        id: 8,
        title: "Machine Learning Fundamentals",
        description: "Supervised and unsupervised learning algorithms",
        duration: "8 weeks",
        order: 3,
        lessons: 42,
        coverImage: "https://picsum.photos/seed/ml/400/250",
      },
      {
        id: 9,
        title: "Deep Learning with PyTorch",
        description: "Neural networks and deep learning frameworks",
        duration: "10 weeks",
        order: 4,
        lessons: 52,
        coverImage: "https://picsum.photos/seed/dl/400/250",
      },
    ],
    createdAt: "2025-02-01",
    updatedAt: "2025-03-15",
  },
  {
    id: 3,
    title: "UI/UX Design Mastery",
    description:
      "Create stunning user experiences from research to prototype. Learn design thinking, visual design, and interaction patterns.",
    image: "https://picsum.photos/seed/uiux/400/250",
    category: "Design",
    difficulty: "Beginner",
    estimatedDuration: "4 months",
    totalCourses: 4,
    enrolledCount: 256,
    rating: 4.9,
    status: "published",
    tags: ["ui", "ux", "design", "figma"],
    color: "#EC4899",
    courses: [
      {
        id: 10,
        title: "Design Thinking & Research",
        description: "User-centered design methodology",
        duration: "3 weeks",
        order: 1,
        lessons: 18,
        coverImage: "https://picsum.photos/seed/design/400/250",
      },
      {
        id: 11,
        title: "Visual Design Principles",
        description: "Typography, color theory, and layout design",
        duration: "4 weeks",
        order: 2,
        lessons: 22,
        coverImage: "https://picsum.photos/seed/visual/400/250",
      },
      {
        id: 12,
        title: "Figma & Prototyping",
        description: "Industry-standard design tools and workflows",
        duration: "5 weeks",
        order: 3,
        lessons: 28,
        coverImage: "https://picsum.photos/seed/figma/400/250",
      },
      {
        id: 13,
        title: "Interaction Design & Animation",
        description: "Micro-interactions and motion design",
        duration: "4 weeks",
        order: 4,
        lessons: 20,
        coverImage: "https://picsum.photos/seed/ixd/400/250",
      },
    ],
    createdAt: "2025-02-15",
    updatedAt: "2025-03-10",
  },
  {
    id: 4,
    title: "Cloud DevOps Engineering",
    description:
      "Master cloud infrastructure, CI/CD pipelines, and containerization. Build and deploy scalable systems on AWS and beyond.",
    image: "https://picsum.photos/seed/devops/400/250",
    category: "DevOps",
    difficulty: "Advanced",
    estimatedDuration: "5 months",
    totalCourses: 4,
    enrolledCount: 128,
    rating: 4.7,
    status: "published",
    tags: ["devops", "aws", "docker", "kubernetes"],
    color: "#F59E0B",
    courses: [
      {
        id: 14,
        title: "Linux & Shell Scripting",
        description: "Command line mastery for DevOps engineers",
        duration: "4 weeks",
        order: 1,
        lessons: 24,
        coverImage: "https://picsum.photos/seed/linux/400/250",
      },
      {
        id: 15,
        title: "Docker & Containerization",
        description: "Build and manage containerized applications",
        duration: "5 weeks",
        order: 2,
        lessons: 30,
        coverImage: "https://picsum.photos/seed/docker/400/250",
      },
      {
        id: 16,
        title: "Kubernetes Orchestration",
        description: "Deploy and scale containers with K8s",
        duration: "6 weeks",
        order: 3,
        lessons: 36,
        coverImage: "https://picsum.photos/seed/k8s/400/250",
      },
      {
        id: 17,
        title: "AWS Cloud Architecture",
        description: "Design cloud solutions on Amazon Web Services",
        duration: "6 weeks",
        order: 4,
        lessons: 34,
        coverImage: "https://picsum.photos/seed/aws/400/250",
      },
    ],
    createdAt: "2025-03-01",
    updatedAt: "2025-03-25",
  },
  {
    id: 5,
    title: "Mobile App Development",
    description:
      "Build cross-platform mobile apps with React Native. From UI components to app store deployment.",
    image: "https://picsum.photos/seed/mobile/400/250",
    category: "Programming",
    difficulty: "Intermediate",
    estimatedDuration: "5 months",
    totalCourses: 3,
    enrolledCount: 203,
    rating: 4.5,
    status: "published",
    tags: ["react-native", "mobile", "ios", "android"],
    color: "#10B981",
    courses: [
      {
        id: 18,
        title: "React Native Fundamentals",
        description: "Build your first cross-platform mobile app",
        duration: "6 weeks",
        order: 1,
        lessons: 32,
        coverImage: "https://picsum.photos/seed/rn/400/250",
      },
      {
        id: 19,
        title: "Mobile UI/UX Patterns",
        description: "Platform-specific design patterns and navigation",
        duration: "4 weeks",
        order: 2,
        lessons: 22,
        coverImage: "https://picsum.photos/seed/mobileui/400/250",
      },
      {
        id: 20,
        title: "App Store Deployment",
        description: "Publish to iOS App Store and Google Play",
        duration: "3 weeks",
        order: 3,
        lessons: 16,
        coverImage: "https://picsum.photos/seed/deploy/400/250",
      },
    ],
    createdAt: "2025-03-10",
    updatedAt: "2025-03-22",
  },
];

let nextId = 6;

export const fetchLearningPaths = async (params = {}) => {
  await new Promise((r) => setTimeout(r, 300));
  let results = [...mockLearningPaths];

  if (params.search) {
    const q = params.search.toLowerCase();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((tag) => tag.includes(q))
    );
  }
  if (params.category && params.category !== "all") {
    results = results.filter((p) => p.category === params.category);
  }
  if (params.status && params.status !== "all") {
    results = results.filter((p) => p.status === params.status);
  }

  const page = params.page || 1;
  const limit = params.limit || 6;
  const total = results.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paths = results.slice(start, start + limit);

  return { paths, total, page, limit, totalPages };
};

export const fetchLearningPathById = async (id) => {
  await new Promise((r) => setTimeout(r, 200));
  return mockLearningPaths.find((p) => p.id === parseInt(id)) || null;
};

export const createLearningPath = async (data) => {
  await new Promise((r) => setTimeout(r, 500));
  const newPath = {
    id: nextId++,
    title: data.title,
    description: data.description,
    image: data.image || `https://picsum.photos/seed/path${nextId}/400/250`,
    category: data.category || "Programming",
    difficulty: data.difficulty || "Beginner",
    estimatedDuration: data.estimatedDuration || "3 months",
    totalCourses: data.courses?.length || 0,
    enrolledCount: 0,
    rating: 0,
    status: "DRAFT",
    tags: data.tags || [],
    color: data.color || "#6366F1",
    courses: data.courses || [],
    createdAt: new Date().toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
  };
  mockLearningPaths.push(newPath);
  return newPath;
};

export const updateLearningPath = async (id, data) => {
  await new Promise((r) => setTimeout(r, 500));
  const index = mockLearningPaths.findIndex((p) => p.id === parseInt(id));
  if (index === -1) throw new Error("Learning path not found");
  mockLearningPaths[index] = {
    ...mockLearningPaths[index],
    ...data,
    totalCourses: data.courses?.length ?? mockLearningPaths[index].totalCourses,
    updatedAt: new Date().toISOString().split("T")[0],
  };
  return mockLearningPaths[index];
};

export const deleteLearningPath = async (id) => {
  await new Promise((r) => setTimeout(r, 300));
  mockLearningPaths = mockLearningPaths.filter((p) => p.id !== parseInt(id));
  return true;
};

export const getLearningPathCategories = () => {
  return ["All Categories", "Programming", "Data Science", "Design", "DevOps", "Business"];
};
