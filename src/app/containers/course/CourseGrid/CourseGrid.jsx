const CourseGrid = (props) => {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">{props.rows}</div>;
};

export default CourseGrid;
