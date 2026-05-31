import React from "react";

function CourseTable(props) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-border border-b">
          <th className="text-text-muted px-4 py-2.5 text-left text-xs font-medium">Course Name</th>
          <th className="text-text-muted px-4 py-2.5 text-left text-xs font-medium">Category</th>
          <th className="text-text-muted px-4 py-2.5 text-left text-xs font-medium">Lessons</th>
          <th className="text-text-muted px-4 py-2.5 text-left text-xs font-medium">Status</th>
          <th className="text-text-muted px-4 py-2.5 text-left text-xs font-medium">Author</th>
        </tr>
      </thead>
      <tbody className="divide-border divide-y">{props.rows}</tbody>
    </table>
  );
}

export default CourseTable;
