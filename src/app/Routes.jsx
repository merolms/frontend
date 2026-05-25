import React from 'react';
import Dashboard from './containers/Dashboard/Dashboard';
import CourseContainer from './containers/course/Course';
import CourseDetail from './containers/course/CourseDetail/CourseDetail';
import CourseCreate from './containers/course/CourseCreate/CourseCreate';
import CourseEdit from './containers/course/CourseEdit/CourseEdit';
import CourseLessons from './containers/course/CourseLessons/CourseLessons';
import UserContainer from './containers/user/User';
import UserCreate from './containers/user/UserCreate/UserCreate';
import UserEdit from './containers/user/UserEdit/UserEdit';
import UserDetail from './containers/user/UserDetail/UserDetail';
import TeamContainer from './containers/team/Team';
import TeamCreate from './containers/team/TeamCreate/TeamCreate';
import TeamEdit from './containers/team/TeamEdit/TeamEdit';
import TeamDetail from './containers/team/TeamDetail/TeamDetail';
import Login from './containers/auth/Login/Login';
import ForgotPassword from './containers/auth/ForgotPassword/ForgotPassword';
import ResetPassword from './containers/auth/ResetPassword/ResetPassword';
import Unauthorized from './containers/auth/Unauthorized/Unauthorized';
import RoleManagement from './containers/role/RoleManagement/RoleManagement';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

// Public routes — no auth needed
const publicRoutes = [
  { path: '/login', element: <Login /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/unauthorized', element: <Unauthorized /> },
];

// Protected routes — require authentication (some require specific permissions)
const protectedRoutes = [
  { path: '/', element: <ProtectedRoute><Dashboard /></ProtectedRoute>, permissions: ['dashboard.view'] },
  { path: '/courses', element: <ProtectedRoute permissions={['courses.view']}><CourseContainer /></ProtectedRoute> },
  { path: '/courses/create', element: <ProtectedRoute permissions={['courses.create']}><CourseCreate /></ProtectedRoute> },
  { path: '/courses/:id', element: <ProtectedRoute permissions={['courses.view']}><CourseDetail /></ProtectedRoute> },
  { path: '/courses/:id/edit', element: <ProtectedRoute permissions={['courses.edit']}><CourseEdit /></ProtectedRoute> },
  { path: '/courses/:id/lessons', element: <ProtectedRoute permissions={['courses.lessons.manage']}><CourseLessons /></ProtectedRoute> },
  { path: '/users', element: <ProtectedRoute permissions={['users.view']}><UserContainer /></ProtectedRoute> },
  { path: '/users/create', element: <ProtectedRoute permissions={['users.create']}><UserCreate /></ProtectedRoute> },
  { path: '/users/:id', element: <ProtectedRoute permissions={['users.view']}><UserDetail /></ProtectedRoute> },
  { path: '/users/:id/edit', element: <ProtectedRoute permissions={['users.edit']}><UserEdit /></ProtectedRoute> },
  { path: '/teams', element: <ProtectedRoute permissions={['teams.view']}><TeamContainer /></ProtectedRoute> },
  { path: '/teams/create', element: <ProtectedRoute permissions={['teams.create']}><TeamCreate /></ProtectedRoute> },
  { path: '/teams/:id', element: <ProtectedRoute permissions={['teams.view']}><TeamDetail /></ProtectedRoute> },
  { path: '/teams/:id/edit', element: <ProtectedRoute permissions={['teams.edit']}><TeamEdit /></ProtectedRoute> },
  { path: '/roles', element: <ProtectedRoute permissions={['roles.view']}><RoleManagement /></ProtectedRoute> },
];

const AppRoutes = [...publicRoutes, ...protectedRoutes];

export default AppRoutes;
