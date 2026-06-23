import {
  CheckCircle,
  Clock,
  Download,
  Loader,
  Search,
  Trash2,
  TrendingUp,
  Upload,
  UserPlus,
  Users,
  Users as UsersIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useToast } from "@/context/ToastContext";
import {
  adminEnrollTeamInCourse,
  adminEnrollUserInCourse,
  getCourseEnrollments,
} from "@/services/enrollmentService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Paper } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminEnrollUser } from "@/hooks/queries/useEnrollments";
import { useTeams, useUsers } from "@/hooks/queries/useEntities";
import { t } from "@/styles/theme";

// Simple Tab component
const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-xs font-medium transition-colors ${
      active
        ? "text-primary border-primary border-b-2"
        : "text-text-muted hover:text-text-primary border-b-2 border-transparent"
    }`}
  >
    {children}
  </button>
);

const EnrollmentManagement = ({ courseId, enrollments: initialEnrollments }) => {
  const { addToast } = useToast();
  const [enrollments, setEnrollments] = useState(initialEnrollments || []);
  const [enrolling, setEnrolling] = useState({ user: false, team: false });
  const [enrollmentFilter, setEnrollmentFilter] = useState("all");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [teamSearchQuery, setTeamSearchQuery] = useState("");
  const [enrollmentPage, setEnrollmentPage] = useState(1);
  const [enrollmentPageSize] = useState(100);
  const [totalEnrollments, setTotalEnrollments] = useState(0);
  const [activeTab, setActiveTab] = useState("user");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [enrollmentSearchQuery, setEnrollmentSearchQuery] = useState("");
  const [enrollmentSortBy, setEnrollmentSortBy] = useState("date");

  // TanStack Query hooks
  const { data: usersData = [] } = useUsers({ start: 0, limit: 20 });
  const { data: teamsData = [] } = useTeams({ start: 0, limit: 50 });
  const enrollUserMutation = useAdminEnrollUser();

  // Handle different response formats
  const users = Array.isArray(usersData) ? usersData : usersData?.users || [];
  const teams = Array.isArray(teamsData) ? teamsData : teamsData?.teams || [];

  // Load enrollments when page changes
  useEffect(() => {
    if (courseId) {
      loadEnrollments();
    }
  }, [enrollmentPage, courseId]);

  // Calculate start index for pagination
  const getStartIndex = (page, pageSize) => (page - 1) * pageSize;

  const loadEnrollments = async () => {
    try {
      const startIndex = getStartIndex(enrollmentPage, enrollmentPageSize);
      const data = await getCourseEnrollments(parseInt(courseId), {
        start: startIndex,
        limit: enrollmentPageSize,
      });
      // Handle response structure - could be direct array or object with enrollments property
      const enrollmentsArray = Array.isArray(data)
        ? data
        : Array.isArray(data?.enrollments)
          ? data.enrollments
          : [];
      setEnrollments(enrollmentsArray);
      setTotalEnrollments(data?.total || data?.count || enrollmentsArray.length);
    } catch (err) {
      console.error("Error loading enrollments:", err);
      setEnrollments([]);
      setTotalEnrollments(0);
    }
  };

  const handleBulkEnrollUsers = async () => {
    if (selectedUsers.length === 0 || enrolling.user) return;

    const enrolledUserIds = getEnrolledUserIds();
    const validUsers = selectedUsers.filter((id) => !enrolledUserIds.has(id));

    if (validUsers.length === 0) {
      addToast("All selected users are already enrolled", "error");
      return;
    }

    try {
      setEnrolling((s) => ({ ...s, user: true }));
      const promises = validUsers.map((userId) =>
        enrollUserMutation.mutateAsync({ courseId: parseInt(courseId), userId })
      );
      await Promise.all(promises);
      setSelectedUsers([]);
      setUserSearchQuery("");
      await loadEnrollments();
      addToast(`${validUsers.length} users enrolled successfully`, "success");
    } catch (err) {
      addToast(err.message || "Failed to enroll some users", "error");
    } finally {
      setEnrolling((s) => ({ ...s, user: false }));
    }
  };

  const handleBulkEnrollTeams = async () => {
    if (selectedTeams.length === 0 || enrolling.team) return;

    const enrolledTeamIds = getEnrolledTeamIds();
    const validTeams = selectedTeams.filter((id) => !enrolledTeamIds.has(id));

    if (validTeams.length === 0) {
      addToast("All selected teams are already enrolled", "error");
      return;
    }

    try {
      setEnrolling((s) => ({ ...s, team: true }));
      const promises = validTeams.map((teamId) =>
        adminEnrollTeamInCourse(parseInt(courseId), teamId)
      );
      await Promise.all(promises);
      setSelectedTeams([]);
      setTeamSearchQuery("");
      await loadEnrollments();
      addToast(`${validTeams.length} teams enrolled successfully`, "success");
    } catch (err) {
      addToast(err.message || "Failed to enroll some teams", "error");
    } finally {
      setEnrolling((s) => ({ ...s, team: false }));
    }
  };

  const getEnrolledUserIds = () => {
    const ids = new Set();
    enrollments.forEach((e) => {
      if (e.userId) ids.add(e.userId);
    });
    return ids;
  };

  const getEnrolledTeamIds = () => {
    const ids = new Set();
    enrollments.forEach((e) => {
      if (e.teamId) ids.add(e.teamId);
    });
    return ids;
  };

  // Filter and sort enrollments
  const getFilteredAndSortedEnrollments = () => {
    let filtered = enrollments;

    // Apply status filter
    if (enrollmentFilter !== "all") {
      filtered = filtered.filter((e) => e.status === enrollmentFilter);
    }

    // Apply search filter
    if (enrollmentSearchQuery.trim()) {
      const query = enrollmentSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          (e.userName || "").toLowerCase().includes(query) ||
          `User ${e.userId}`.toLowerCase().includes(query)
      );
    }

    // Apply sort
    const sorted = [...filtered].sort((a, b) => {
      switch (enrollmentSortBy) {
        case "name":
          return (a.userName || "").localeCompare(b.userName || "");
        case "date":
          return new Date((b.enrolledAt || 0) * 1000) - new Date((a.enrolledAt || 0) * 1000);
        case "progress":
          return (b.progressPercent || 0) - (a.progressPercent || 0);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return sorted;
  };

  // Calculate statistics
  const getEnrollmentStats = () => {
    const total = enrollments.length;
    const active = enrollments.filter((e) => e.status === "active").length;
    const completed = enrollments.filter((e) => e.status === "completed").length;
    const dropped = enrollments.filter((e) => e.status === "dropped").length;
    const teamEnrollments = enrollments.filter((e) => e.teamId).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const avgProgress =
      total > 0
        ? Math.round(enrollments.reduce((sum, e) => sum + (e.progressPercent || 0), 0) / total)
        : 0;

    return { total, active, completed, dropped, teamEnrollments, completionRate, avgProgress };
  };

  // Export enrollments to CSV
  const handleExportEnrollments = () => {
    const stats = getEnrollmentStats();
    const csvContent = [
      ["User ID", "User Name", "Status", "Progress %", "Enrolled Date", "Team ID"],
      ...enrollments.map((e) => [
        e.userId || "",
        e.userName || "",
        e.status || "",
        e.progressPercent || 0,
        e.enrolledAt ? new Date(e.enrolledAt * 1000).toLocaleDateString() : "",
        e.teamId || "",
      ]),
      [],
      ["Statistics"],
      ["Total Enrolled", stats.total],
      ["Active", stats.active],
      ["Completed", stats.completed],
      ["Dropped", stats.dropped],
      ["Team Enrollments", stats.teamEnrollments],
      ["Completion Rate", `${stats.completionRate}%`],
      ["Average Progress", `${stats.avgProgress}%`],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `course_${courseId}_enrollments_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Enrollments exported successfully", "success");
  };

  // Import users from CSV
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split("\n").filter((line) => line.trim());
        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

        // Find user ID or email column
        const userIdIndex = headers.findIndex((h) => h.includes("user") && h.includes("id"));
        const emailIndex = headers.findIndex((h) => h.includes("email"));

        if (userIdIndex === -1 && emailIndex === -1) {
          addToast("CSV must contain 'User ID' or 'Email' column", "error");
          return;
        }

        const usersToEnroll = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim());
          if (userIdIndex !== -1 && values[userIdIndex]) {
            usersToEnroll.push(parseInt(values[userIdIndex]));
          } else if (emailIndex !== -1 && values[emailIndex]) {
            // Find user by email (would need API call)
            addToast("Email-based import not yet implemented", "info");
            return;
          }
        }

        if (usersToEnroll.length === 0) {
          addToast("No valid user IDs found in CSV", "error");
          return;
        }

        // Bulk enroll users
        const enrolledUserIds = getEnrolledUserIds();
        const validUsers = usersToEnroll.filter((id) => !enrolledUserIds.has(id));

        if (validUsers.length === 0) {
          addToast("All users in CSV are already enrolled", "error");
          return;
        }

        setEnrolling((s) => ({ ...s, user: true }));
        const promises = validUsers.map((userId) =>
          adminEnrollUserInCourse(parseInt(courseId), userId)
        );
        await Promise.all(promises);
        await loadEnrollments();
        addToast(`${validUsers.length} users enrolled from CSV`, "success");
      } catch {
        addToast("Failed to process CSV file", "error");
      } finally {
        setEnrolling((s) => ({ ...s, user: false }));
        e.target.value = ""; // Reset file input
      }
    };
    reader.readAsText(file);
  };

  return (
    <Paper className="overflow-hidden p-0">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{
          background: "linear-gradient(180deg, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0) 100%)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: "rgba(99,102,241,0.12)" }}
          >
            <Users size={15} style={{ color: "#6366F1" }} />
          </div>
          <div>
            <h3 className="text-text-primary text-sm leading-tight font-semibold">
              Enrollment Management
            </h3>
            <p className="text-text-muted mt-0.5 text-[11px]">
              {enrollments.length} enrolled • Manage learners and teams for this course
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {enrollments.length > 0 && (
            <span className="text-text-muted bg-bg-surface-active mr-1 rounded-full px-2 py-0.5 text-[10px]">
              {enrollments.filter((e) => e.status === "active").length} active
            </span>
          )}
        </div>
      </div>

      {/* Statistics Dashboard */}
      {enrollments.length > 0 && (
        <div className="border-border border-t px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} style={{ color: t("primary") }} />
              <p className="text-text-primary text-xs font-semibold">Enrollment Statistics</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="xs"
                variant="outline"
                className="h-7 px-2 text-[11px]"
                onClick={handleExportEnrollments}
              >
                <Download size={10} className="mr-1" /> Export CSV
              </Button>
              <label>
                <Button
                  size="xs"
                  variant="outline"
                  className="h-7 px-2 text-[11px]"
                  disabled={enrolling.user}
                  asChild
                >
                  <span>
                    <Upload size={10} className="mr-1" /> Import CSV
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  className="hidden"
                  disabled={enrolling.user}
                />
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="border-border bg-bg-surface/50 rounded-lg border p-3">
              <div className="mb-1 flex items-center gap-2">
                <UsersIcon size={12} className="text-primary" />
                <span className="text-text-muted text-[10px]">Total Enrolled</span>
              </div>
              <p className="text-text-primary text-lg font-bold">{getEnrollmentStats().total}</p>
            </div>
            <div className="border-border bg-bg-surface/50 rounded-lg border p-3">
              <div className="mb-1 flex items-center gap-2">
                <Clock size={12} className="text-blue-500" />
                <span className="text-text-muted text-[10px]">Active</span>
              </div>
              <p className="text-text-primary text-lg font-bold">{getEnrollmentStats().active}</p>
            </div>
            <div className="border-border bg-bg-surface/50 rounded-lg border p-3">
              <div className="mb-1 flex items-center gap-2">
                <CheckCircle size={12} className="text-green-500" />
                <span className="text-text-muted text-[10px]">Completed</span>
              </div>
              <p className="text-text-primary text-lg font-bold">
                {getEnrollmentStats().completed}
              </p>
            </div>
            <div className="border-border bg-bg-surface/50 rounded-lg border p-3">
              <div className="mb-1 flex items-center gap-2">
                <TrendingUp size={12} className="text-purple-500" />
                <span className="text-text-muted text-[10px]">Completion Rate</span>
              </div>
              <p className="text-text-primary text-lg font-bold">
                {getEnrollmentStats().completionRate}%
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="border-border bg-bg-surface/50 rounded-lg border p-3">
              <div className="mb-1 flex items-center gap-2">
                <Users size={12} className="text-orange-500" />
                <span className="text-text-muted text-[10px]">Team Enrollments</span>
              </div>
              <p className="text-text-primary text-lg font-bold">
                {getEnrollmentStats().teamEnrollments}
              </p>
            </div>
            <div className="border-border bg-bg-surface/50 rounded-lg border p-3">
              <div className="mb-1 flex items-center gap-2">
                <TrendingUp size={12} className="text-cyan-500" />
                <span className="text-text-muted text-[10px]">Avg Progress</span>
              </div>
              <p className="text-text-primary text-lg font-bold">
                {getEnrollmentStats().avgProgress}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enroll Actions - Moved to top with tabs */}
      <div className="border-border border-t px-5 py-4">
        {/* Tab Navigation */}
        <div className="mb-4 flex border-b">
          <TabButton active={activeTab === "user"} onClick={() => setActiveTab("user")}>
            <div className="flex items-center gap-2">
              <UserPlus size={14} />
              Enroll Users
            </div>
          </TabButton>
          <TabButton active={activeTab === "team"} onClick={() => setActiveTab("team")}>
            <div className="flex items-center gap-2">
              <Users size={14} />
              Enroll Teams
            </div>
          </TabButton>
        </div>

        {/* Enroll User Form */}
        {activeTab === "user" && (
          <div className="border-border bg-bg-surface/50 rounded-lg border border-dashed p-4">
            <div className="space-y-3">
              <div className="relative">
                <Search
                  size={14}
                  className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2"
                />
                <Input
                  placeholder="Search users..."
                  value={userSearchQuery}
                  onChange={(e) => {
                    setUserSearchQuery(e.target.value);
                  }}
                  className="h-9 pl-9 text-sm"
                />
              </div>

              {/* User Selection List with Checkboxes */}
              <div className="bg-secondary max-h-48 overflow-y-auto rounded-md border">
                {users
                  .filter((u) => !getEnrolledUserIds().has(u.id))
                  .map((u) => (
                    <div
                      key={u.id}
                      className="hover:bg-bg-surface-active flex items-center gap-3 border-b px-3 py-2 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(u.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, u.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter((id) => id !== u.id));
                          }
                        }}
                        className="border-border h-4 w-4 rounded"
                      />
                      <div className="flex-1">
                        <p className="text-text-primary text-sm font-medium">
                          {u.firstName || ""} {u.lastName || ""}
                        </p>
                        <p className="text-text-muted text-xs">{u.email || `User ${u.id}`}</p>
                      </div>
                    </div>
                  ))}
                {users.filter((u) => !getEnrolledUserIds().has(u.id)).length === 0 && (
                  <div className="text-text-muted px-3 py-4 text-center text-sm">
                    No eligible users
                  </div>
                )}
              </div>

              {/* Bulk Actions */}
              {selectedUsers.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-xs">{selectedUsers.length} selected</span>
                  <Button
                    size="sm"
                    variant="green"
                    className="h-8 px-3 text-xs"
                    onClick={handleBulkEnrollUsers}
                    disabled={enrolling.user}
                  >
                    {enrolling.user ? (
                      <span className="flex items-center gap-2">
                        <Loader size={10} className="animate-spin" /> Enrolling...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <UserPlus size={10} /> Enroll All
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enroll Team Form */}
        {activeTab === "team" && (
          <div className="border-border bg-bg-surface/50 rounded-lg border border-dashed p-4">
            <div className="space-y-3">
              <div className="relative">
                <Search
                  size={14}
                  className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2"
                />
                <Input
                  placeholder="Search teams..."
                  value={teamSearchQuery}
                  onChange={(e) => {
                    setTeamSearchQuery(e.target.value);
                  }}
                  className="h-9 pl-9 text-sm"
                />
              </div>

              {/* Team Selection List with Checkboxes */}
              <div className="bg-secondary max-h-48 overflow-y-auto rounded-md border">
                {(teams || [])
                  .filter((t) => !getEnrolledTeamIds().has(t.id))
                  .map((t) => (
                    <div
                      key={t.id}
                      className="hover:bg-bg-surface-active flex items-center gap-3 border-b px-3 py-2 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTeams.includes(t.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTeams([...selectedTeams, t.id]);
                          } else {
                            setSelectedTeams(selectedTeams.filter((id) => id !== t.id));
                          }
                        }}
                        className="border-border h-4 w-4 rounded"
                      />
                      <div className="flex-1">
                        <p className="text-text-primary text-sm font-medium">
                          {t.name || `Team ${t.id}`}
                        </p>
                      </div>
                    </div>
                  ))}
                {teams.filter((t) => !getEnrolledTeamIds().has(t.id)).length === 0 && (
                  <div className="text-text-muted px-3 py-4 text-center text-sm">
                    No eligible teams
                  </div>
                )}
              </div>

              {/* Bulk Actions */}
              {selectedTeams.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-xs">{selectedTeams.length} selected</span>
                  <Button
                    size="sm"
                    variant="green"
                    className="h-8 px-3 text-xs"
                    onClick={handleBulkEnrollTeams}
                    disabled={enrolling.team}
                  >
                    {enrolling.team ? (
                      <span className="flex items-center gap-2">
                        <Loader size={10} className="animate-spin" /> Enrolling...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Users size={10} /> Enroll All
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Enrolled List - Moved to bottom */}
      {enrollments.length > 0 && (
        <div className="border-border border-t px-5 py-3">
          <div className="mb-3 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-text-primary text-xs font-medium">Currently Enrolled</p>
              <div className="flex items-center gap-2">
                <Select value={enrollmentFilter} onValueChange={(v) => setEnrollmentFilter(v)}>
                  <SelectTrigger className="h-7 w-28 text-[11px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search and Sort */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search
                  size={12}
                  className="text-text-muted absolute top-1/2 left-2 -translate-y-1/2"
                />
                <Input
                  placeholder="Search enrolled users..."
                  value={enrollmentSearchQuery}
                  onChange={(e) => setEnrollmentSearchQuery(e.target.value)}
                  className="h-7 pl-7 text-[11px]"
                />
              </div>
              <Select value={enrollmentSortBy} onValueChange={(v) => setEnrollmentSortBy(v)}>
                <SelectTrigger className="h-7 w-24 text-[11px]">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            {getFilteredAndSortedEnrollments().map((enr) => (
              <div
                key={enr.id}
                className="border-border hover:border-primary/30 flex items-center justify-between rounded-lg border bg-white/40 px-3 py-2 transition-all hover:shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="text-secondary flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold shadow-sm"
                    style={{
                      background:
                        enr.status === "completed"
                          ? "#22C55E"
                          : enr.status === "dropped"
                            ? "#EF4444"
                            : "#6366F1",
                    }}
                  >
                    {(enr.userName || "U")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-text-primary text-xs font-medium">
                      {enr.userName || `User #${enr.userId}`}
                    </p>
                    <p className="text-text-muted text-[10px]">
                      Enrolled{" "}
                      {enr.enrolledAt ? new Date(enr.enrolledAt * 1000).toLocaleDateString() : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-text-primary text-[11px] font-semibold">
                      {enr.progressPercent ?? 0}%
                    </p>
                    <p className="text-text-muted text-[10px]">
                      {enr.status === "completed"
                        ? "Done"
                        : enr.status === "dropped"
                          ? "Dropped"
                          : "In progress"}
                    </p>
                  </div>
                  <Badge
                    variant={
                      enr.status === "completed"
                        ? "green"
                        : enr.status === "dropped"
                          ? "red"
                          : "blue"
                    }
                    className="text-[10px]"
                  >
                    {enr.status}
                  </Badge>
                  <Button
                    size="xs"
                    variant="ghost"
                    className="text-text-muted hover:text-error h-6 w-6 p-0"
                    onClick={() => {
                      // TODO: Implement remove enrollment functionality
                      addToast("Remove enrollment feature coming soon", "info");
                    }}
                  >
                    <Trash2 size={10} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {totalEnrollments > enrollmentPageSize && (
            <div className="mt-4 flex justify-center">
              <Pagination
                total={Math.ceil(totalEnrollments / enrollmentPageSize)}
                value={enrollmentPage}
                onChange={setEnrollmentPage}
              />
            </div>
          )}
        </div>
      )}
    </Paper>
  );
};

export default EnrollmentManagement;
