// Shared test helpers and mock data for E2E tests

export const DEMO_USERS = {
  admin: {
    email: "admin@meroedu.com",
    password: "admin123",
    firstName: "John",
    lastName: "Doe",
    role: "Administrator",
    permissions: ["*"],
  },
  instructor: {
    email: "instructor@meroedu.com",
    password: "instructor123",
    firstName: "Jane",
    lastName: "Smith",
    role: "Instructor",
    permissions: [
      "dashboard.view",
      "courses.view",
      "courses.create",
      "courses.edit",
      "courses.lessons.manage",
      "users.view",
      "teams.view",
      "reports.view",
    ],
  },
  student: {
    email: "student@meroedu.com",
    password: "student123",
    firstName: "Bob",
    lastName: "Wilson",
    role: "Student",
    permissions: ["dashboard.view", "courses.view"],
  },
};

export async function mockLogin(page, user = DEMO_USERS.admin) {
  const fakeToken = "mock-jwt-token-" + Date.now();

  await page.addInitScript(
    ({ user: userData, token }) => {
      localStorage.setItem("auth_token", token);
      localStorage.setItem(
        "auth_user",
        JSON.stringify({
          id: 1,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          avatar: "https://i.pravatar.cc/150?img=1",
          permissions: userData.permissions,
        })
      );
    },
    { user, fakeToken }
  );

  // Mock auth endpoints
  await page.route("**/auth/**", async (route) => {
    const url = route.request().url();
    if (url.includes("/auth/me") || url.includes("/auth/login")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "success",
          data: {
            id: 1,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            avatar: "https://i.pravatar.cc/150?img=1",
            permissions: user.permissions,
          },
        }),
      });
    } else {
      await route.continue();
    }
  });

  // Mock stats endpoint (dashboard)
  await page.route("**/stats", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        message: "success",
        data: {
          course_count: 24,
          user_count: 156,
          team_count: 8,
          category_count: 12,
          avg_completion: 73,
        },
      }),
    });
  });

  // Mock events endpoint
  await page.route("**/events**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        message: "success",
        data: [
          {
            id: 1,
            title: "React Workshop",
            startDate: "2025-07-15T10:00:00Z",
            endDate: "2025-07-15T12:00:00Z",
            color: "#6366F1",
          },
          {
            id: 2,
            title: "Design Review",
            startDate: "2025-07-16T14:00:00Z",
            endDate: "2025-07-16T15:00:00Z",
            color: "#EC4899",
          },
        ],
      }),
    });
  });

  // Mock courses list — only match /courses?... not /courses/:id
  await page.route(/\/courses(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        message: "success",
        data: {
          courses: [
            {
              id: 1,
              title: "Introduction to React",
              description: "Learn React",
              category: "Programming",
              status: "published",
              author: "John Doe",
              totalLessons: 12,
              enrolledUsers: 45,
              duration: "8 hours",
              createdAt: "2025-01-15",
            },
            {
              id: 2,
              title: "Advanced CSS Techniques",
              description: "Master CSS",
              category: "Design",
              status: "published",
              author: "Jane Smith",
              totalLessons: 8,
              enrolledUsers: 32,
              duration: "5 hours",
              createdAt: "2025-02-01",
            },
          ],
          total: 2,
          page: 1,
          limit: 8,
          totalPages: 1,
        },
      }),
    });
  });

  // Mock single course
  await page.route(/\/courses\/(\d+)$/, async (route) => {
    const match = route
      .request()
      .url()
      .match(/\/courses\/(\d+)/);
    const courseId = match ? parseInt(match[1]) : 1;
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "success",
          data: {
            id: courseId,
            title: courseId === 1 ? "Introduction to React" : "Advanced CSS Techniques",
            description: "Course description",
            category: "Programming",
            status: "published",
            author: "John Doe",
            totalLessons: 12,
            enrolledUsers: 45,
            duration: "8 hours",
            createdAt: "2025-01-15",
          },
        }),
      });
      return;
    }
    await route.continue();
  });

  // Mock lessons
  await page.route("**/courses/**/lessons**", async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    if (method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "success",
          data: [
            {
              id: 1,
              courseId: 1,
              title: "Getting Started",
              order_number: 1,
              type: "text",
              status: "published",
              sort_order: 1,
              createdAt: "2025-01-15",
              updatedAt: "2025-01-15",
            },
            {
              id: 2,
              courseId: 1,
              title: "Components and Props",
              order_number: 2,
              type: "text",
              status: "published",
              sort_order: 2,
              createdAt: "2025-01-16",
              updatedAt: "2025-01-16",
            },
            {
              id: 3,
              courseId: 1,
              title: "State and Lifecycle",
              order_number: 3,
              type: "text",
              status: "published",
              sort_order: 3,
              createdAt: "2025-01-17",
              updatedAt: "2025-01-17",
            },
          ],
        }),
      });
      return;
    }
    if (method === "POST") {
      let body = {};
      try {
        body = await route.request().postDataJSON();
      } catch {}
      const match = url.match(/courses\/(\d+)\/lessons/);
      const courseId = match ? parseInt(match[1]) : 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "success",
          data: {
            id: Date.now(),
            courseId,
            title: body.title || "New Lesson",
            order_number: 99,
            type: "text",
            status: "published",
            createdAt: "2025-01-15",
            updatedAt: "2025-01-15",
          },
        }),
      });
      return;
    }
    if (method === "PUT") {
      let body = {};
      try {
        body = await route.request().postDataJSON();
      } catch {}
      const idMatch = url.match(/lessons\/(\d+)/);
      const lessonId = idMatch ? parseInt(idMatch[1]) : 0;
      if (url.includes("/reorder")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ message: "success" }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "success",
          data: {
            id: lessonId,
            courseId: 1,
            title: body.title || "Updated Lesson",
            order_number: body.order_number || 1,
            type: body.type || "text",
            status: "published",
            createdAt: "2025-01-15",
            updatedAt: "2025-01-15",
            content: body.content || "",
          },
        }),
      });
      return;
    }
    if (method === "DELETE") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Lesson deleted successfully" }),
      });
      return;
    }
    await route.continue();
  });

  // Mock lesson blocks
  await page.route("**/lessons/**/blocks**", async (route) => {
    const url = route.request().url();
    if (route.request().method() === "GET") {
      const match = url.match(/lessons\/(\d+)\/blocks/);
      const lessonId = match ? parseInt(match[1]) : 0;
      const blocksByLesson = {
        1: [
          {
            id: 101,
            lessonId: 1,
            type: "paragraph",
            title: "Intro",
            content: '[{"type":"text","text":"Welcome to React!","styles":{}}]',
            order: 1,
            status: "active",
            createdAt: 1700000000,
            updatedAt: 1700000000,
          },
        ],
        2: [
          {
            id: 201,
            lessonId: 2,
            type: "paragraph",
            title: "Components",
            content: '[{"type":"text","text":"Components are the building blocks.","styles":{}}]',
            order: 1,
            status: "active",
            createdAt: 1700000000,
            updatedAt: 1700000000,
          },
        ],
        3: [],
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "success", data: blocksByLesson[lessonId] || [] }),
      });
      return;
    }
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "success",
          data: {
            id: Date.now(),
            lessonId: 0,
            type: "paragraph",
            content: "[]",
            order: 1,
            status: "active",
          },
        }),
      });
      return;
    }
    await route.continue();
  });

  // Mock autosave
  await page.route("**/lessons/**/blocks**", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "success", data: null }),
      });
      return;
    }
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "success", data: { id: Date.now() } }),
      });
      return;
    }
    await route.continue();
  });

  // Mock contents (deprecated but still referenced)
  await page.route("**/lessons/**/contents**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "success", data: [] }),
    });
  });

  // Mock single lesson
  await page.route(/\/lessons\/(\d+)$/, async (route) => {
    const match = route
      .request()
      .url()
      .match(/\/lessons\/(\d+)/);
    const lessonId = match ? parseInt(match[1]) : 0;
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "success",
          data: {
            id: lessonId,
            courseId: 1,
            title: "Lesson " + lessonId,
            order_number: 1,
            type: "text",
            status: "published",
            content: "",
            createdAt: "2025-01-15",
            updatedAt: "2025-01-15",
          },
        }),
      });
      return;
    }
    await route.continue();
  });

  // Mock users
  await page.route("**/users**", async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    if (method === "GET") {
      const singleMatch = url.match(/\/users\/(\d+)(?:\?.*)?$/);
      if (singleMatch) {
        const userId = parseInt(singleMatch[1]);
        const usersById = {
          1: {
            id: 1,
            email: "admin@meroedu.com",
            firstName: "John",
            lastName: "Doe",
            role: "Administrator",
            status: 1,
            avatar: "https://i.pravatar.cc/150?img=1",
            phone: "+1 555-0101",
            bio: "Platform administrator",
            permissions: ["*"],
            created_at: 1700000000,
          },
          2: {
            id: 2,
            email: "instructor@meroedu.com",
            firstName: "Jane",
            lastName: "Smith",
            role: "Instructor",
            status: 1,
            avatar: "https://i.pravatar.cc/150?img=5",
            phone: "+1 555-0102",
            bio: "Experienced instructor",
            permissions: ["dashboard.view", "courses.view"],
            created_at: 1701000000,
          },
        };
        const u = usersById[userId];
        if (u) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ message: "success", data: u }),
          });
        } else {
          await route.fulfill({
            status: 404,
            contentType: "application/json",
            body: JSON.stringify({ message: "User not found" }),
          });
        }
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "success",
          data: {
            users: [
              {
                id: 1,
                email: "admin@meroedu.com",
                firstName: "John",
                lastName: "Doe",
                role: "Administrator",
                status: 1,
              },
              {
                id: 2,
                email: "instructor@meroedu.com",
                firstName: "Jane",
                lastName: "Smith",
                role: "Instructor",
                status: 1,
              },
            ],
            total: 2,
            page: 1,
            totalPages: 1,
          },
        }),
      });
      return;
    }
    if (method === "PUT") {
      let body = {};
      try {
        body = await route.request().postDataJSON();
      } catch {}
      const idMatch = url.match(/\/users\/(\d+)/);
      const userId = idMatch ? parseInt(idMatch[1]) : 0;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "success",
          data: {
            id: userId,
            firstName: body.firstName || "John",
            lastName: body.lastName || "Doe",
            email: body.email || "admin@meroedu.com",
            role: body.role || "Student",
            phone: body.phone || "",
            bio: body.bio || "",
            avatar: body.avatar || "https://i.pravatar.cc/150?img=1",
            status: body.status !== undefined ? body.status : 1,
            permissions: ["*"],
            created_at: 1700000000,
          },
        }),
      });
      return;
    }
    if (method === "DELETE") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "User deleted successfully" }),
      });
      return;
    }
    await route.continue();
  });

  // Mock all team-related endpoints in a single handler to avoid route ordering issues
  await page.route("**/teams**", async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    // Handle /teams/stat
    if (url.includes("/teams/stat")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "success", data: { count: 2 } }),
      });
      return;
    }

    // Handle /teams/:id/members
    if (url.includes("/members")) {
      if (method === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            message: "success",
            data: [
              {
                userID: 1,
                userName: "John Doe",
                role: "Administrator",
                avatar: "https://i.pravatar.cc/150?img=1",
              },
              {
                userID: 2,
                userName: "Jane Smith",
                role: "Instructor",
                avatar: "https://i.pravatar.cc/150?img=5",
              },
            ],
          }),
        });
      } else if (method === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ message: "Member added successfully" }),
        });
      } else if (method === "DELETE") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ message: "Member removed successfully" }),
        });
      } else {
        await route.continue();
      }
      return;
    }

    // Handle /teams/:id/available-users
    if (url.includes("/available-users")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "success",
          data: [
            { id: 1, firstName: "John", lastName: "Doe", email: "admin@meroedu.com" },
            { id: 2, firstName: "Jane", lastName: "Smith", email: "instructor@meroedu.com" },
          ],
        }),
      });
      return;
    }

    // Handle /teams/:id (single team)
    const singleMatch = url.match(/\/teams\/(\d+)(?:\?.*)?$/);
    if (singleMatch && method === "GET") {
      const teamId = parseInt(singleMatch[1]);
      const teamsById = {
        1: {
          id: 1,
          name: "Engineering Team",
          description: "Core engineering team",
          color: "#33a163",
          status: 1,
          memberCount: 3,
          created_at: 1700000000,
        },
        2: {
          id: 2,
          name: "Design Team",
          description: "UI/UX design team",
          color: "#2185d0",
          status: 1,
          memberCount: 2,
          created_at: 1701000000,
        },
      };
      const team = teamsById[teamId] || {
        id: teamId,
        name: "Team " + teamId,
        description: "A test team",
        color: "#2185d0",
        status: 1,
        memberCount: 0,
        created_at: 170000000,
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "success", data: team }),
      });
      return;
    }

    // Handle /teams (list)
    if (method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "success",
          data: [
            {
              id: 1,
              name: "Engineering Team",
              description: "Core engineering team",
              color: "#33a163",
              status: 1,
              memberCount: 3,
              created_at: 1700000000,
            },
            {
              id: 2,
              name: "Design Team",
              description: "UI/UX design team",
              color: "#2185d0",
              status: 1,
              memberCount: 2,
              created_at: 1701000000,
            },
          ],
        }),
      });
      return;
    }

    // Handle /teams (POST create)
    if (method === "POST") {
      let body = {};
      try {
        body = await route.request().postDataJSON();
      } catch {}
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "success",
          data: {
            id: Date.now(),
            name: body.name || "New Team",
            description: body.description || "",
            color: body.color || "#2185d0",
            status: 1,
            memberCount: 0,
            created_at: Math.floor(Date.now() / 1000),
          },
        }),
      });
      return;
    }

    // Handle /teams/:id (PUT update)
    if (method === "PUT") {
      let body = {};
      try {
        body = await route.request().postDataJSON();
      } catch {}
      const idMatch = url.match(/\/teams\/(\d+)/);
      const teamId = idMatch ? parseInt(idMatch[1]) : 0;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "success",
          data: {
            id: teamId,
            name: body.name || "Updated Team",
            description: body.description || "",
            color: body.color || "#2185d0",
            status: 1,
            memberCount: 0,
            created_at: Math.floor(Date.now() / 1000),
          },
        }),
      });
      return;
    }

    // Handle /teams/:id (DELETE)
    if (method === "DELETE") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Team deleted successfully" }),
      });
      return;
    }

    await route.continue();
  });
  await page.route("**/roles**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "success", data: [] }),
    });
  });

  await page.route("http://192.168.1.67:9090/categories**", async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    // Parse existing categories from localStorage to maintain state across requests
    // Default seed data
    let categories = [
      { id: 1, name: "Programming", slug: "programming", description: "Software development courses", color: "#6366F1", icon: "code", status: 1, createdAt: 1700000000, updatedAt: 1700000000, courseCount: 5 },
      { id: 2, name: "Design", slug: "design", description: "UI/UX and graphic design", color: "#EC4899", icon: "paint brush", status: 1, createdAt: 1700000100, updatedAt: 1700000100, courseCount: 3 },
      { id: 3, name: "Data Science", slug: "data-science", description: "Data analysis and ML", color: "#10B981", icon: "database", status: 1, createdAt: 1700000200, updatedAt: 1700000200, courseCount: 2 },
    ];

    if (method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "success", data: categories }),
      });
      return;
    }

    if (method === "POST") {
      let body = {};
      try { body = await route.request().postDataJSON(); } catch {}
      const newCat = {
        id: Date.now(),
        name: body.name || "New Category",
        slug: body.slug || body.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "new-category",
        description: body.description || "",
        color: body.color || "#6366F1",
        icon: body.icon || "folder",
        status: 1,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
        courseCount: 0,
      };
      categories.push(newCat);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "success", data: newCat }),
      });
      return;
    }

    // PUT /categories/:id
    const putMatch = url.match(/\/categories\/(\d+)/);
    if (method === "PUT" && putMatch) {
      const catId = parseInt(putMatch[1]);
      let body = {};
      try { body = await route.request().postDataJSON(); } catch {}
      const idx = categories.findIndex(c => c.id === catId);
      if (idx !== -1) {
        categories[idx] = { ...categories[idx], ...body, updatedAt: Math.floor(Date.now() / 1000) };
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "success", data: idx !== -1 ? categories[idx] : body }),
      });
      return;
    }

    // DELETE /categories/:id
    const delMatch = url.match(/\/categories\/(\d+)/);
    if (method === "DELETE" && delMatch) {
      const catId = parseInt(delMatch[1]);
      categories = categories.filter(c => c.id !== catId);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Category deleted successfully" }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "success", data: categories }),
    });
  });

  // Mock learning-paths endpoints
  await page.route("**/learning-paths**", async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    // Handle /learning-paths/categories
    if (url.includes("/categories")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "success",
          data: ["Programming", "Data Science", "Design", "DevOps", "Business"],
        }),
      });
      return;
    }

    // Handle /learning-paths/stat
    if (url.includes("/stat")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "success", data: { count: 3 } }),
      });
      return;
    }

    // Handle /learning-paths/:id (single)
    const singleMatch = url.match(/\/learning-paths\/(\d+)(?:\?.*)?$/);
    if (singleMatch && method === "GET") {
      const id = parseInt(singleMatch[1]);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "success",
          data: {
            id,
            title: "Full-Stack Web Development",
            description: "Master modern web development from frontend to backend.",
            image: "https://picsum.photos/seed/fullstack/400/250",
            category: "Programming",
            difficulty: "Beginner to Advanced",
            estimatedDuration: "6 months",
            totalCourses: 3,
            enrolledCount: 342,
            rating: 4.8,
            status: "published",
            tags: ["react", "nodejs", "javascript", "fullstack"],
            color: "#6366F1",
            authorId: 1,
            authorName: "John Doe",
            courses: [
              {
                id: 1,
                courseId: 1,
                title: "HTML & CSS Fundamentals",
                description: "Build responsive websites",
                duration: "4 weeks",
                order: 1,
                lessons: 24,
                coverImage: "https://picsum.photos/seed/html/400/250",
              },
              {
                id: 2,
                courseId: 2,
                title: "JavaScript Essentials",
                description: "Master JavaScript",
                duration: "6 weeks",
                order: 2,
                lessons: 36,
                coverImage: "https://picsum.photos/seed/js/400/250",
              },
              {
                id: 3,
                courseId: 3,
                title: "React Mastery",
                description: "Build modern UIs with React",
                duration: "8 weeks",
                order: 3,
                lessons: 48,
                coverImage: "https://picsum.photos/seed/react/400/250",
              },
            ],
            createdAt: 1705276800,
            updatedAt: 1710432000,
          },
        }),
      });
      return;
    }

    // Handle /learning-paths (list)
    if (method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "success",
          data: {
            paths: [
              {
                id: 1,
                title: "Full-Stack Web Development",
                description: "Master modern web development from frontend to backend.",
                image: "https://picsum.photos/seed/fullstack/400/250",
                category: "Programming",
                difficulty: "Beginner to Advanced",
                estimatedDuration: "6 months",
                totalCourses: 3,
                enrolledCount: 342,
                rating: 4.8,
                status: "published",
                tags: ["react", "nodejs", "javascript", "fullstack"],
                color: "#6366F1",
                createdAt: 1705276800,
                updatedAt: 1710432000,
              },
              {
                id: 2,
                title: "Data Science Fundamentals",
                description: "Learn data analysis, machine learning, and statistical modeling.",
                image: "https://picsum.photos/seed/datascience/400/250",
                category: "Data Science",
                difficulty: "Intermediate",
                estimatedDuration: "4 months",
                totalCourses: 4,
                enrolledCount: 187,
                rating: 4.6,
                status: "published",
                tags: ["python", "machine-learning", "pandas"],
                color: "#10B981",
                createdAt: 1706745600,
                updatedAt: 1709251200,
              },
              {
                id: 3,
                title: "UI/UX Design Mastery",
                description: "Complete guide to user interface and user experience design.",
                image: "https://picsum.photos/seed/uiux/400/250",
                category: "Design",
                difficulty: "Beginner",
                estimatedDuration: "3 months",
                totalCourses: 3,
                enrolledCount: 0,
                rating: 0,
                status: "draft",
                tags: ["figma", "design", "ux", "ui"],
                color: "#EC4899",
                createdAt: 1707955200,
                updatedAt: 1707955200,
              },
            ],
            total: 3,
            page: 1,
            limit: 6,
            totalPages: 1,
          },
        }),
      });
      return;
    }

    // Handle POST (create)
    if (method === "POST") {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          message: "Learning path created successfully",
          data: {
            id: Date.now(),
            title: "New Learning Path",
            status: "draft",
            totalCourses: 0,
            enrolledCount: 0,
            rating: 0,
          },
        }),
      });
      return;
    }

    // Handle PUT (update)
    if (method === "PUT") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "Learning path updated successfully",
          data: {
            id: parseInt(url.match(/\/learning-paths\/(\d+)/)?.[1] || "1"),
            title: "Updated Path",
          },
        }),
      });
      return;
    }

    // Handle DELETE
    if (method === "DELETE") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Learning path deleted successfully" }),
      });
      return;
    }

    await route.continue();
  });

  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
}

export async function mockLogout(page) {
  await page.addInitScript(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  });
  await page.goto("/login");
  await page.waitForLoadState("domcontentloaded");
}
