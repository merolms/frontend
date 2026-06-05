import { useSelector } from "react-redux";

import AdminDashboard from "@/app/containers/admin/Dashboard";
import InstructorDashboard from "@/app/containers/instructor/Dashboard";
import LearnerDashboard from "@/app/containers/learner/Dashboard";

/**
 * Dashboard — Role-based entry point.
 * Redirects to role-specific dashboard or renders inline.
 */
const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user?.role) {
    return (
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}
      >
        <div className="text-text-muted text-sm">Loading...</div>
      </div>
    );
  }

  switch (user.role) {
    case "Administrator":
      return <AdminDashboard />;
    case "Instructor":
      return <InstructorDashboard />;
    case "Team Lead":
    case "Student":
    default:
      return <LearnerDashboard />;
  }
};

export default Dashboard;
