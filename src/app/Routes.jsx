import React from 'react';
import Dashboard from '@/app/containers/Dashboard/Dashboard';
import CourseContainer from '@/app/containers/course/Course';
import CourseDetail from '@/app/containers/course/CourseDetail/CourseDetail';
import CourseCreate from '@/app/containers/course/CourseCreate/CourseCreate';
import CourseEdit from '@/app/containers/course/CourseEdit/CourseEdit';
import CourseLessons from '@/app/containers/course/CourseLessons/CourseLessons';
import CourseBuilder from '@/app/containers/course/CourseBuilder/CourseBuilder';
import UserContainer from '@/app/containers/user/User';
import UserCreate from '@/app/containers/user/UserCreate/UserCreate';
import UserEdit from '@/app/containers/user/UserEdit/UserEdit';
import UserDetail from '@/app/containers/user/UserDetail/UserDetail';
import TeamContainer from '@/app/containers/team/Team';
import TeamCreate from '@/app/containers/team/TeamCreate/TeamCreate';
import TeamEdit from '@/app/containers/team/TeamEdit/TeamEdit';
import TeamDetail from '@/app/containers/team/TeamDetail/TeamDetail';
import Login from '@/app/containers/auth/Login/Login';
import ForgotPassword from '@/app/containers/auth/ForgotPassword/ForgotPassword';
import ResetPassword from '@/app/containers/auth/ResetPassword/ResetPassword';
import Unauthorized from '@/app/containers/auth/Unauthorized/Unauthorized';
import RoleManagement from '@/app/containers/role/RoleManagement/RoleManagement';
import RoleCreate from '@/app/containers/role/RoleCreate/RoleCreate';
import RoleEdit from '@/app/containers/role/RoleEdit/RoleEdit';
import ProtectedRoute from '@/app/components/ProtectedRoute/ProtectedRoute';

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
  { path: '/courses/:id/builder', element: <ProtectedRoute permissions={['courses.edit']}><CourseBuilder /></ProtectedRoute> },
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
  { path: '/roles/create', element: <ProtectedRoute permissions={['roles.create']}><RoleCreate /></ProtectedRoute> },
  { path: '/roles/:id/edit', element: <ProtectedRoute permissions={['roles.edit']}><RoleEdit /></ProtectedRoute> },
];

const AppRoutes = [...publicRoutes, ...protectedRoutes];

export default AppRoutes;
