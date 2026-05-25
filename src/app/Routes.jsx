import { Routes, Route } from 'react-router-dom';
import React from 'react';
import CourseContainer from './containers/course/Course';
import CourseDetail from './containers/course/CourseDetail/CourseDetail';
import Dashboard from './containers/Dashboard/Dashboard';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/courses" element={<CourseContainer />} />
      <Route path="/courses/:id" element={<CourseDetail />} />
    </Routes>
  );
};

export default AppRoutes;
