import ProtectedRoute from "@/app/components/ProtectedRoute/ProtectedRoute";
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
import CoursePreview from "@/app/containers/course/CoursePreview/CoursePreview";
import MyLearning from "@/app/containers/course/MyLearning/MyLearning";
import Dashboard from "@/app/containers/Dashboard/Dashboard";
import EventDetail from "@/app/containers/event/EventDetail";
import EventsPage from "@/app/containers/event/EventsPage";
import LearningPathDetail from "@/app/containers/learningPath/LearningPathDetail";
import LearningPathForm from "@/app/containers/learningPath/LearningPathForm";
import LearningPathList from "@/app/containers/learningPath/LearningPathList";
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

// Public routes — no auth needed
const publicRoutes = [
  { path: "/login", element: <Login /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/unauthorized", element: <Unauthorized /> },
];

// Protected routes — require authentication (some require specific permissions)
const protectedRoutes = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    permissions: ["dashboard.view"],
  },
  {
    path: "/courses",
    element: (
      <ProtectedRoute permissions={["courses.view"]}>
        <CourseContainer />
      </ProtectedRoute>
    ),
  },
  {
    path: "/courses/create",
    element: (
      <ProtectedRoute permissions={["courses.create"]}>
        <CourseCreate />
      </ProtectedRoute>
    ),
  },
  {
    path: "/courses/:id/builder/:lessonId?",
    element: (
      <ProtectedRoute permissions={["courses.edit"]}>
        <CourseBuilder />
      </ProtectedRoute>
    ),
  },
  {
    path: "/courses/:id/preview/:lessonId?",
    element: (
      <ProtectedRoute permissions={["courses.edit"]}>
        <CoursePreview />
      </ProtectedRoute>
    ),
  },
  {
    path: "/courses/:id",
    element: (
      <ProtectedRoute permissions={["courses.view"]}>
        <CourseDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/courses/:id/edit",
    element: (
      <ProtectedRoute permissions={["courses.edit"]}>
        <CourseEdit />
      </ProtectedRoute>
    ),
  },
  {
    path: "/categories",
    element: (
      <ProtectedRoute permissions={["courses.view"]}>
        <CategoryManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-learning",
    element: (
      <ProtectedRoute>
        <MyLearning />
      </ProtectedRoute>
    ),
  },
  {
    path: "/users",
    element: (
      <ProtectedRoute permissions={["users.view"]}>
        <UserContainer />
      </ProtectedRoute>
    ),
  },
  {
    path: "/users/create",
    element: (
      <ProtectedRoute permissions={["users.create"]}>
        <UserCreate />
      </ProtectedRoute>
    ),
  },
  {
    path: "/users/:id",
    element: (
      <ProtectedRoute permissions={["users.view"]}>
        <UserDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/users/:id/edit",
    element: (
      <ProtectedRoute permissions={["users.edit"]}>
        <UserEdit />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/teams",
    element: (
      <ProtectedRoute permissions={["teams.view"]}>
        <TeamContainer />
      </ProtectedRoute>
    ),
  },
  {
    path: "/teams/create",
    element: (
      <ProtectedRoute permissions={["teams.create"]}>
        <TeamCreate />
      </ProtectedRoute>
    ),
  },
  {
    path: "/teams/:id",
    element: (
      <ProtectedRoute permissions={["teams.view"]}>
        <TeamDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/teams/:id/edit",
    element: (
      <ProtectedRoute permissions={["teams.edit"]}>
        <TeamEdit />
      </ProtectedRoute>
    ),
  },
  {
    path: "/roles",
    element: (
      <ProtectedRoute permissions={["roles.view"]}>
        <RoleManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "/roles/create",
    element: (
      <ProtectedRoute permissions={["roles.create"]}>
        <RoleCreate />
      </ProtectedRoute>
    ),
  },
  {
    path: "/roles/:id/edit",
    element: (
      <ProtectedRoute permissions={["roles.edit"]}>
        <RoleEdit />
      </ProtectedRoute>
    ),
  },
  {
    path: "/learning-paths",
    element: (
      <ProtectedRoute permissions={["courses.view"]}>
        <LearningPathList />
      </ProtectedRoute>
    ),
  },
  {
    path: "/learning-paths/create",
    element: (
      <ProtectedRoute permissions={["courses.create"]}>
        <LearningPathForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/learning-paths/:id",
    element: (
      <ProtectedRoute permissions={["courses.view"]}>
        <LearningPathDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/learning-paths/:id/edit",
    element: (
      <ProtectedRoute permissions={["courses.edit"]}>
        <LearningPathForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/events",
    element: (
      <ProtectedRoute permissions={["courses.view"]}>
        <EventsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/events/:id",
    element: (
      <ProtectedRoute permissions={["courses.view"]}>
        <EventDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/progress",
    element: (
      <ProtectedRoute permissions={["users.view"]}>
        <AdminProgressTracking />
      </ProtectedRoute>
    ),
  },
];

const AppRoutes = [...publicRoutes, ...protectedRoutes];

export default AppRoutes;
