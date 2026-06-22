import ProtectedRoute from "@/app/components/ProtectedRoute/ProtectedRoute";
import AdminDashboard from "@/app/containers/admin/Dashboard";
import AssignmentContainer from "@/app/containers/assignment/Assignment";
import AssignmentCreate from "@/app/containers/assignment/AssignmentCreate";
import AssignmentDetail from "@/app/containers/assignment/AssignmentDetail";
import AssignmentGrade from "@/app/containers/assignment/AssignmentGrade";
import AssignmentSubmit from "@/app/containers/assignment/AssignmentSubmit";
import ForgotPassword from "@/app/containers/auth/ForgotPassword/ForgotPassword";
import Login from "@/app/containers/auth/Login/Login";
import ResetPassword from "@/app/containers/auth/ResetPassword/ResetPassword";
import Unauthorized from "@/app/containers/auth/Unauthorized/Unauthorized";
import CategoryManagement from "@/app/containers/category/CategoryManagement/CategoryManagement";
import CourseContainer from "@/app/containers/course/Course";
import CourseBuilder from "@/app/containers/course/CourseBuilder/CourseBuilder";
import CourseCreate from "@/app/containers/course/CourseCreate/CourseCreate";
import CourseDetail from "@/app/containers/course/CourseDetail/CourseDetail";
import CourseEdit from "@/app/containers/course/CourseEdit/CourseEdit";
import CourseViewer from "@/app/containers/course/CourseViewer/CourseViewer";
import MyLearning from "@/app/containers/course/MyLearning/MyLearning";
import Dashboard from "@/app/containers/Dashboard/Dashboard";
import EventDetail from "@/app/containers/event/EventDetail";
import EventsPage from "@/app/containers/event/EventsPage";
import InstructorDashboard from "@/app/containers/instructor/Dashboard";
import LearningPathDetail from "@/app/containers/learningPath/LearningPathDetail";
import LearningPathForm from "@/app/containers/learningPath/LearningPathForm";
import LearningPathList from "@/app/containers/learningPath/LearningPathList";
import LearningPathProgress from "@/app/containers/learningPath/LearningPathProgress";
import AdminProgressTracking from "@/app/containers/progress/AdminProgressTracking";
import RoleCreate from "@/app/containers/role/RoleCreate/RoleCreate";
import RoleEdit from "@/app/containers/role/RoleEdit/RoleEdit";
import RoleManagement from "@/app/containers/role/RoleManagement/RoleManagement";
import TeamContainer from "@/app/containers/team/Team";
import TeamCreate from "@/app/containers/team/TeamCreate/TeamCreate";
import TeamDetail from "@/app/containers/team/TeamDetail/TeamDetail";
import TeamEdit from "@/app/containers/team/TeamEdit/TeamEdit";
import Profile from "@/app/containers/user/Profile/Profile";
import Settings from "@/app/containers/user/Settings/Settings";
import UserContainer from "@/app/containers/user/User";
import UserCreate from "@/app/containers/user/UserCreate/UserCreate";
import UserDetail from "@/app/containers/user/UserDetail/UserDetail";
import UserEdit from "@/app/containers/user/UserEdit/UserEdit";
import RoleGuard from "@/components/auth/RoleGuard";
import ErrorBoundary from "@/components/common/ErrorBoundary";

const adminOnly = (element, path) => ({
  path,
  element: (
    <ErrorBoundary>
      <ProtectedRoute permissions={["dashboard.view"]}>
        <RoleGuard roles={["Administrator"]}>{element}</RoleGuard>
      </ProtectedRoute>
    </ErrorBoundary>
  ),
});

const instructorPlus = (element, path, perms = ["courses.view"]) => ({
  path,
  element: (
    <ErrorBoundary>
      <ProtectedRoute permissions={perms}>
        <RoleGuard roles={["Administrator", "Instructor"]}>{element}</RoleGuard>
      </ProtectedRoute>
    </ErrorBoundary>
  ),
});

const teamLeadPlus = (element, path) => ({
  path,
  element: (
    <ErrorBoundary>
      <ProtectedRoute permissions={["teams.view"]}>
        <RoleGuard roles={["Administrator", "Team Lead"]}>{element}</RoleGuard>
      </ProtectedRoute>
    </ErrorBoundary>
  ),
});

const anyAuth = (element, path, perms = []) => ({
  path,
  element: (
    <ErrorBoundary>
      <ProtectedRoute permissions={perms}>{element}</ProtectedRoute>
    </ErrorBoundary>
  ),
});

// ─── Public Routes ────────────────────────────────────────────────

const publicRoutes = [
  { path: "/login", element: <Login /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/unauthorized", element: <Unauthorized /> },
];

// ─── Admin-Only Routes ────────────────────────────────────────────

const adminRoutes = [
  adminOnly(<AdminDashboard />, "/admin/dashboard"),
  adminOnly(<UserContainer />, "/admin/users"),
  adminOnly(<UserCreate />, "/admin/users/create"),
  adminOnly(<UserDetail />, "/admin/users/:id"),
  adminOnly(<UserEdit />, "/admin/users/:id/edit"),
  adminOnly(<TeamContainer />, "/admin/teams"),
  adminOnly(<TeamCreate />, "/admin/teams/create"),
  adminOnly(<TeamDetail />, "/admin/teams/:id"),
  adminOnly(<TeamEdit />, "/admin/teams/:id/edit"),
  adminOnly(<RoleManagement />, "/admin/roles"),
  adminOnly(<RoleCreate />, "/admin/roles/create"),
  adminOnly(<RoleEdit />, "/admin/roles/:id/edit"),
  adminOnly(<AdminProgressTracking />, "/admin/progress"),
  adminOnly(<CategoryManagement />, "/admin/categories"),
  adminOnly(<EventsPage />, "/admin/events"),
  adminOnly(<EventDetail />, "/admin/events/:id"),
];

// ─── Instructor+ Routes ───────────────────────────────────────────

const instructorRoutes = [
  instructorPlus(<InstructorDashboard />, "/instructor/dashboard"),
  instructorPlus(<CourseCreate />, "/courses/create", ["courses.create"]),
  instructorPlus(<CourseBuilder />, "/courses/:id/builder/:lessonId?", ["courses.lessons.manage"]),
  instructorPlus(<CourseEdit />, "/courses/:id/edit", ["courses.edit"]),
  instructorPlus(<LearningPathForm />, "/learning-paths/create"),
  instructorPlus(<LearningPathForm />, "/learning-paths/:id/edit"),
];

// ─── Team Lead+ Routes ────────────────────────────────────────────

const teamLeadRoutes = [
  teamLeadPlus(<TeamContainer />, "/teams"),
  teamLeadPlus(<TeamCreate />, "/teams/create"),
  teamLeadPlus(<TeamDetail />, "/teams/:id"),
  teamLeadPlus(<TeamEdit />, "/teams/:id/edit"),
];

// ─── Shared Routes ────────────────────────────────────────────────

const sharedRoutes = [
  anyAuth(<Dashboard />, "/"),
  anyAuth(<CourseContainer />, "/courses", ["courses.view"]),
  anyAuth(<CourseDetail />, "/courses/:id", ["courses.view"]),
  anyAuth(<CourseViewer />, "/courses/:id/learn", ["courses.view"]),
  anyAuth(<LearningPathList />, "/learning-paths", ["courses.view"]),
  anyAuth(<LearningPathDetail />, "/learning-paths/:id", ["courses.view"]),
  anyAuth(<AssignmentContainer />, "/assignments"),
  anyAuth(<AssignmentDetail />, "/assignments/:id"),
  anyAuth(<AssignmentCreate />, "/assignments/create"),
  anyAuth(<AssignmentSubmit />, "/assignments/:id/submit"),
  anyAuth(<AssignmentGrade />, "/assignments/:id/grade"),
  anyAuth(<MyLearning />, "/my-learning"),
  anyAuth(<LearningPathProgress />, "/my-learning/:learningPathId"),
  anyAuth(<Profile />, "/profile"),
  anyAuth(<Settings />, "/settings"),
];

const AppRoutes = [
  ...publicRoutes,
  ...adminRoutes,
  ...instructorRoutes,
  ...teamLeadRoutes,
  ...sharedRoutes,
];

export default AppRoutes;
