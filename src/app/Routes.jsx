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

const AppRoutes = [
  { path: '/', element: <Dashboard /> },
  { path: '/courses', element: <CourseContainer /> },
  { path: '/courses/create', element: <CourseCreate /> },
  { path: '/courses/:id', element: <CourseDetail /> },
  { path: '/courses/:id/edit', element: <CourseEdit /> },
  { path: '/courses/:id/lessons', element: <CourseLessons /> },
  { path: '/users', element: <UserContainer /> },
  { path: '/users/create', element: <UserCreate /> },
  { path: '/users/:id', element: <UserDetail /> },
  { path: '/users/:id/edit', element: <UserEdit /> },
];

export default AppRoutes;
