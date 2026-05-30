import React from 'react';

const CourseTableItem = (props) => {
  const course = props.course;
  return (
    <tr className="hover:bg-bg-surface-hover transition-colors">
      <td className="px-4 py-3 text-xs text-text-primary">
        <a href="courses/1">{course.Title}</a>
      </td>
      <td className="px-4 py-3 text-xs text-text-muted">{course.Category}</td>
      <td className="px-4 py-3 text-xs text-text-muted">{course.Lesson}</td>
      <td className="px-4 py-3 text-xs text-text-muted">{course.Status}</td>
      <td className="px-4 py-3 text-xs text-text-muted">{course.Author}</td>
    </tr>
  );
};

export default CourseTableItem;
