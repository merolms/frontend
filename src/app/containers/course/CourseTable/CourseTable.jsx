import React from 'react';

function CourseTable(props) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border">
          <th className="px-4 py-2.5 text-left text-xs font-medium text-text-muted">Course Name</th>
          <th className="px-4 py-2.5 text-left text-xs font-medium text-text-muted">Category</th>
          <th className="px-4 py-2.5 text-left text-xs font-medium text-text-muted">Lessons</th>
          <th className="px-4 py-2.5 text-left text-xs font-medium text-text-muted">Status</th>
          <th className="px-4 py-2.5 text-left text-xs font-medium text-text-muted">Author</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {props.rows}
      </tbody>
    </table>
  );
}

export default CourseTable;
