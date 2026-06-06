import { Loader, Search, UserPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { useToast } from "@/app/context/ToastContext";
import {
  adminEnrollTeamInCourse,
  adminEnrollUserInCourse,
  getCourseEnrollments,
} from "@/app/services/enrollmentService";
import { fetchTeams } from "@/app/services/teamService";
import { fetchUsers } from "@/app/services/userService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Paper } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { t } from "@/styles/theme";

const EnrollmentManagement = ({ courseId, enrollments: initialEnrollments }) => {
  const { addToast } = useToast();
  const [enrollments, setEnrollments] = useState(initialEnrollments || []);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [enrolling, setEnrolling] = useState({ user: false, team: false });
  const [enrollmentFilter, setEnrollmentFilter] = useState("all");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [teamSearchQuery, setTeamSearchQuery] = useState("");

  // Load initial users and teams on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [usersData, teamsData] = await Promise.all([
          fetchUsers({ start: 0, limit: 20 }).catch(() => ({ users: [], total: 0 })),
          fetchTeams({ start: 0, limit: 50 }).catch(() => ({ teams: [], total: 0 })),
        ]);
        setUsers(Array.isArray(usersData?.users) ? usersData.users : []);
        setTeams(Array.isArray(teamsData?.teams) ? teamsData.teams : []);
      } catch (err) {
        console.error(err);
      }
    };
    loadInitialData();
  }, []);

  const loadEnrollments = async () => {
    try {
      const data = await getCourseEnrollments(parseInt(courseId));
      setEnrollments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminEnrollUser = async (e) => {
    e.preventDefault();
    if (!selectedUser || enrolling.user) return;
    try {
      setEnrolling((s) => ({ ...s, user: true }));
      await adminEnrollUserInCourse(parseInt(courseId), parseInt(selectedUser));
      setSelectedUser("");
      setUserSearchQuery("");
      await loadEnrollments();
      addToast("User enrolled successfully", "success");
    } catch (err) {
      addToast(err.message || "Failed to enroll user", "error");
    } finally {
      setEnrolling((s) => ({ ...s, user: false }));
    }
  };

  const handleAdminEnrollTeam = async (e) => {
    e.preventDefault();
    if (!selectedTeam || enrolling.team) return;
    try {
      setEnrolling((s) => ({ ...s, team: true }));
      await adminEnrollTeamInCourse(parseInt(courseId), parseInt(selectedTeam));
      setSelectedTeam("");
      setTeamSearchQuery("");
      await loadEnrollments();
      addToast("Team enrolled successfully", "success");
    } catch (err) {
      addToast(err.message || "Failed to enroll team", "error");
    } finally {
      setEnrolling((s) => ({ ...s, team: false }));
    }
  };

  const handleSearchTeams = async () => {
    if (!teamSearchQuery.trim()) {
      setTeams([]);
      return;
    }
    try {
      const data = await fetchTeams({ search: teamSearchQuery, start: 0, limit: 50 });
      setTeams(Array.isArray(data?.teams) ? data.teams : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchUsers = async () => {
    if (!userSearchQuery.trim()) {
      setUsers([]);
      return;
    }
    try {
      const data = await fetchUsers({ search: userSearchQuery, start: 0, limit: 20 });
      setUsers(Array.isArray(data?.users) ? data.users : []);
    } catch (err) {
      console.error(err);
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

  return (
    <Paper className="mb-4 overflow-hidden p-0">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{
          background:
            "linear-gradient(180deg, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0) 100%)",
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

      {/* Enrolled List */}
      {enrollments.length > 0 && (
        <div className="border-border border-t px-5 py-3">
          <div className="mb-2 flex items-center justify-between">
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
          <div className="space-y-1.5">
            {enrollments
              .filter((e) => enrollmentFilter === "all" || e.status === enrollmentFilter)
              .map((enr) => (
                <div
                  key={enr.id}
                  className="border-border hover:border-primary/30 flex items-center justify-between rounded-lg border bg-white/40 px-3 py-2 transition-all hover:shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm"
                      style={{
                        background:
                          enr.status === "completed"
                            ? "#22C55E"
                            : enr.status === "dropped"
                              ? "#EF4444"
                              : "#6366F1",
                      }}
                    >
                      {(enr.userName || enr.teamName || "U")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-text-primary text-xs font-medium">
                        {enr.userName || enr.teamName || `#${enr.userId || enr.teamId}`}
                      </p>
                      <p className="text-text-muted text-[10px]">
                        {enr.userId ? "User" : "Team"} • Enrolled{" "}
                        {enr.enrolledAt || enr.enrolledOn || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-text-primary text-[11px] font-semibold">
                        {enr.progress ?? 0}%
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
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Enroll Actions */}
      <div className="border-border grid grid-cols-1 gap-4 border-t px-5 py-4 md:grid-cols-2">
        {/* Enroll User */}
        <div className="border-border bg-bg-surface/50 rounded-lg border border-dashed p-3">
          <div className="mb-2.5 flex items-center gap-2">
            <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-md">
              <UserPlus size={12} style={{ color: t("primary") }} />
            </div>
            <p className="text-text-primary text-xs font-semibold">Enroll Users</p>
          </div>
          <form onSubmit={handleAdminEnrollUser} className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  size={12}
                  className="text-text-muted absolute top-1/2 left-2 -translate-y-1/2"
                />
                <Input
                  placeholder="Search users..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="h-8 pl-7 text-[11px]"
                />
              </div>
              <Button
                type="button"
                size="sm"
                variant="default"
                className="h-8 px-3 text-[11px]"
                onClick={handleSearchUsers}
                disabled={!userSearchQuery.trim()}
              >
                Search
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={selectedUser}
                onValueChange={(v) => setSelectedUser(v)}
                disabled={enrolling.user}
              >
                <SelectTrigger className="h-8 flex-1 text-[11px]">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users
                    .filter((u) => !getEnrolledUserIds().has(u.id))
                    .slice(0, 20)
                    .map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>{`${u.firstName || ""} ${u.lastName || ""} (${u.email || `User ${u.id}`})`}</SelectItem>
                    ))}
                  {users.filter((u) => !getEnrolledUserIds().has(u.id)).length === 0 && (
                    <div className="text-text-muted px-2 py-1.5 text-[11px]">
                      No eligible users
                    </div>
                  )}
                </SelectContent>
              </Select>
              <Button
                type="submit"
                size="sm"
                variant="green"
                className="h-8 px-3 text-[11px]"
                disabled={!selectedUser || enrolling.user}
              >
                {enrolling.user ? (
                  <span className="flex items-center gap-1.5">
                    <Loader size={10} className="animate-spin" /> Enrolling...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <UserPlus size={10} /> Enroll
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Enroll Team */}
        <div className="border-border bg-bg-surface/50 rounded-lg border border-dashed p-3">
          <div className="mb-2.5 flex items-center gap-2">
            <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-md">
              <Users size={12} style={{ color: t("primary") }} />
            </div>
            <p className="text-text-primary text-xs font-semibold">Enroll Teams</p>
          </div>
          <form onSubmit={handleAdminEnrollTeam} className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  size={12}
                  className="text-text-muted absolute top-1/2 left-2 -translate-y-1/2"
                />
                <Input
                  placeholder="Search teams..."
                  value={teamSearchQuery}
                  onChange={(e) => setTeamSearchQuery(e.target.value)}
                  className="h-8 pl-7 text-[11px]"
                />
              </div>
              <Button
                type="button"
                size="sm"
                variant="default"
                className="h-8 px-3 text-[11px]"
                onClick={handleSearchTeams}
                disabled={!teamSearchQuery.trim()}
              >
                Search
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={selectedTeam}
                onValueChange={(v) => setSelectedTeam(v)}
                disabled={enrolling.team}
              >
                <SelectTrigger className="h-8 flex-1 text-[11px]">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {(teams || [])
                    .filter((t) => !getEnrolledTeamIds().has(t.id))
                    .slice(0, 50)
                    .map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.name || `Team ${t.id}`}
                      </SelectItem>
                    ))}
                  {teams.filter((t) => !getEnrolledTeamIds().has(t.id)).length === 0 && (
                    <div className="text-text-muted px-2 py-1.5 text-[11px]">
                      No eligible teams
                    </div>
                  )}
                </SelectContent>
              </Select>
              <Button
                type="submit"
                size="sm"
                variant="green"
                className="h-8 px-3 text-[11px]"
                disabled={!selectedTeam || enrolling.team}
              >
                {enrolling.team ? (
                  <span className="flex items-center gap-1.5">
                    <Loader size={10} className="animate-spin" /> Enrolling...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Users size={10} /> Enroll
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Paper>
  );
};

export default EnrollmentManagement;
