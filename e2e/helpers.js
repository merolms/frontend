// Shared test helpers and mock data for E2E tests

export const DEMO_USERS = {
  admin: {
    email: 'admin@meroedu.com',
    password: 'admin123',
    firstName: 'John',
    lastName: 'Doe',
    role: 'Administrator',
    permissions: ['*'],
  },
  instructor: {
    email: 'instructor@meroedu.com',
    password: 'instructor123',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'Instructor',
    permissions: [
      'dashboard.view',
      'courses.view', 'courses.create', 'courses.edit',
      'users.view', 'teams.view', 'reports.view',
    ],
  },
  student: {
    email: 'student@meroedu.com',
    password: 'student123',
    firstName: 'Bob',
    lastName: 'Wilson',
    role: 'Student',
    permissions: ['dashboard.view', 'courses.view'],
  },
};

/**
 * Set up auth state by navigating to the app with localStorage already set.
 * Uses page.addInitScript to set localStorage BEFORE the page loads,
 * so the app picks up auth immediately without needing restoreSession.
 */
export async function mockLogin(page, user = DEMO_USERS.admin) {
  const fakeToken = 'mock-jwt-token-' + Date.now();

  // Use addInitScript to set localStorage before page loads
  await page.addInitScript(({ user: userData, token }) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify({
      id: 1,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      avatar: 'https://i.pravatar.cc/150?img=1',
      permissions: userData.permissions,
    }));
  }, { user, fakeToken });

  // Mock API endpoints
  await page.route('**/auth/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/auth/me') || url.includes('/auth/login')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'success',
          data: {
            id: 1,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            avatar: 'https://i.pravatar.cc/150?img=1',
            permissions: user.permissions,
          },
        }),
      });
    } else {
      await route.continue();
    }
  });

  // Mock data APIs
  await page.route('**/courses**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'success',
        data: {
          courses: [
            { id: 1, title: 'Introduction to React', description: 'Learn React', category: 'Programming', status: 'published', author: 'John Doe', totalLessons: 12, enrolledUsers: 45, duration: '8 hours', createdAt: '2025-01-15' },
            { id: 2, title: 'Advanced CSS Techniques', description: 'Master CSS', category: 'Design', status: 'published', author: 'Jane Smith', totalLessons: 8, enrolledUsers: 32, duration: '5 hours', createdAt: '2025-02-01' },
          ],
          total: 2,
          page: 1,
          limit: 8,
          totalPages: 1,
        },
      }),
    });
  });

  await page.route('**/users**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'success',
        data: {
          users: [
            { id: 1, email: 'admin@meroedu.com', firstName: 'John', lastName: 'Doe', role: 'Administrator', status: 'active' },
            { id: 2, email: 'instructor@meroedu.com', firstName: 'Jane', lastName: 'Smith', role: 'Instructor', status: 'active' },
          ],
          total: 2,
          page: 1,
          totalPages: 1,
        },
      }),
    });
  });

  await page.route('**/teams**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    // Single team by ID
    const singleMatch = url.match(/\/teams\/(\d+)(?:\?.*)?$/);

    if (singleMatch && method === 'GET') {
      const teamId = parseInt(singleMatch[1]);
      const teamsById = {
        1: { id: 1, name: 'Engineering Team', description: 'Core engineering team', color: '#33a163', status: 1, memberCount: 3, created_at: 1700000000 },
        2: { id: 2, name: 'Design Team', description: 'UI/UX design team', color: '#2185d0', status: 1, memberCount: 2, created_at: 1701000000 },
      };
      const team = teamsById[teamId] || { id: teamId, name: 'Team ' + teamId, description: 'A test team', color: '#2185d0', status: 1, memberCount: 0, created_at: 1700000000 };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'success', data: team }),
      });
      return;
    }

    if (method === 'GET') {
      // List — return some default teams so the list page works
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'success',
          data: [
            { id: 1, name: 'Engineering Team', description: 'Core engineering team', color: '#33a163', status: 1, memberCount: 3, created_at: 1700000000 },
            { id: 2, name: 'Design Team', description: 'UI/UX design team', color: '#2185d0', status: 1, memberCount: 2, created_at: 1701000000 },
          ],
        }),
      });
      return;
    }

    if (method === 'POST') {
      let body = {};
      try { body = await route.request().postDataJSON(); } catch {}
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'success', data: { id: Date.now(), name: body.name || 'New Team', description: body.description || '', color: body.color || '#2185d0', status: 1, memberCount: 0, created_at: Math.floor(Date.now() / 1000) } }),
      });
      return;
    }

    if (method === 'PUT') {
      let body = {};
      try { body = await route.request().postDataJSON(); } catch {}
      const idMatch = url.match(/\/teams\/(\d+)/);
      const teamId = idMatch ? parseInt(idMatch[1]) : 0;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'success', data: { id: teamId, name: body.name || 'Updated Team', description: body.description || '', color: body.color || '#2185d0', status: 1, memberCount: 0, created_at: Math.floor(Date.now() / 1000) } }),
      });
      return;
    }

    if (method === 'DELETE') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Team deleted successfully' }),
      });
      return;
    }

    await route.continue();
  });

  // Also mock team members
  await page.route('**/teams/**/members**', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'success', data: [
        { userID: 1, userName: 'John Doe', role: 'Administrator', avatar: 'https://i.pravatar.cc/150?img=1' },
        { userID: 2, userName: 'Jane Smith', role: 'Instructor', avatar: 'https://i.pravatar.cc/150?img=5' },
      ] }) });
    } else if (method === 'POST') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Member added successfully' }) });
    } else if (method === 'DELETE') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Member removed successfully' }) });
    } else {
      await route.continue();
    }
  });

  await page.route('**/teams/**/available-users**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'success', data: [
      { id: 1, firstName: 'John', lastName: 'Doe', email: 'admin@meroedu.com' },
      { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'instructor@meroedu.com' },
    ] }) });
  });

  await page.route('**/roles**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'success', data: [] }),
    });
  });

  await page.route('**/categories**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'success', data: ['Programming', 'Design', 'Data Science'] }),
    });
  });

  // Navigate to dashboard
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Clear auth and go to login page
 */
export async function mockLogout(page) {
  await page.addInitScript(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  });
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');
}
