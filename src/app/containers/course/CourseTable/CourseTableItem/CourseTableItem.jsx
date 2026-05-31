const CourseTableItem = (props) => {
  const course = props.course;
  return (
    <tr className="hover:bg-bg-surface-hover transition-colors">
      <td className="text-text-primary px-4 py-3 text-xs">
        <a href="courses/1">{course.Title}</a>
      </td>
      <td className="text-text-muted px-4 py-3 text-xs">{course.Category}</td>
      <td className="text-text-muted px-4 py-3 text-xs">{course.Lesson}</td>
      <td className="text-text-muted px-4 py-3 text-xs">{course.Status}</td>
      <td className="text-text-muted px-4 py-3 text-xs">{course.Author}</td>
    </tr>
  );
};

export default CourseTableItem;
