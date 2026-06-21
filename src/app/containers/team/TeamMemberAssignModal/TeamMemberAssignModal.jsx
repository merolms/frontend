import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { useToast } from "@/app/context/ToastContext";
import { fetchTeamMembers, fetchUsers } from "@/app/services/teamService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddTeamMember, useRemoveTeamMember } from "@/hooks/queries/useEntities";
import { t } from "@/styles/theme";

const PAGE_SIZE = 12;

const TEAM_ROLES = [
  { value: "Team Lead", label: "Team Lead", color: "orange" },
  { value: "Instructor", label: "Instructor", color: "blue" },
  { value: "Student", label: "Student", color: "green" },
  { value: "Member", label: "Member", color: "gray" },
];

const TeamMemberAssignModal = ({ open, onClose, team, onUpdated }) => {
  const [members, setMembers] = useState([]);
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [busyIds, setBusyIds] = useState(new Set());
  const [error, setError] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [memberIds, setMemberIds] = useState(new Set());
  const [allLoaded, setAllLoaded] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedRole, setSelectedRole] = useState("Member");
  const { addToast } = useToast();
  const addMutation = useAddTeamMember();
  const removeMutation = useRemoveTeamMember();

  useEffect(() => {
    if (open && team) {
      loadAll();
    } else if (!open) {
      resetState();
    }
  }, [open, team]);

  const resetState = () => {
    setMembers([]);
    setAllLoaded([]);
    setDisplayedUsers([]);
    setCurrentPage(1);
    setTotalPages(1);
    setTotalCount(0);
    setBusyIds(new Set());
    setError(null);
    setUserSearch("");
    setIsSearchMode(false);
    setSearchResults([]);
    setMemberIds(new Set());
    setSelectedRole("Member");
  };

  const applyPagination = useCallback((users, page) => {
    const total = Math.ceil(users.length / PAGE_SIZE) || 1;
    const start = (page - 1) * PAGE_SIZE;
    setDisplayedUsers(users.slice(start, PAGE_SIZE * page));
    setCurrentPage(page);
    setTotalPages(total);
    setTotalCount(users.length);
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const membersData = await fetchTeamMembers(team.id);
      setMembers(membersData);
      const mIds = new Set((membersData || []).map((m) => m.userID || m.userId));
      setMemberIds(mIds);
      await loadInitialUsers(mIds);
    } catch (err) {
      setError("Failed to load team members.");
    } finally {
      setLoading(false);
    }
  };

  const loadInitialUsers = async (mIds) => {
    try {
      const result = await fetchUsers({ start: 0, limit: PAGE_SIZE });
      const batch = Array.isArray(result.users) ? result.users : [];
      const available = batch.filter((u) => !mIds.has(u.id));
      setAllLoaded(available);
      applyPagination(available, 1);
    } catch (err) {
      console.error(err);
      setAllLoaded([]);
      setDisplayedUsers([]);
    }
  };

  const loadMoreUsers = async () => {
    setLoadingMore(true);
    try {
      const start = allLoaded.length;
      const result = await fetchUsers({ start, limit: PAGE_SIZE });
      const batch = Array.isArray(result.users) ? result.users : [];
      if (batch.length === 0) return;
      const filtered = batch.filter((u) => !memberIds.has(u.id));
      const updated = [...allLoaded, ...filtered];
      setAllLoaded(updated);
      const newPage = Math.max(1, Math.ceil(updated.length / PAGE_SIZE));
      applyPagination(updated, newPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = userSearch.trim().toLowerCase();
    if (!q) {
      clearSearch();
      return;
    }

    setIsSearchMode(true);
    setSearchLoading(true);

    try {
      let results = allLoaded.filter(
        (u) =>
          (u.firstName || "").toLowerCase().includes(q) ||
          (u.lastName || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q)
      );

      if (results.length === 0) {
        let fetched = allLoaded.length;
        let keepFetching = true;

        while (keepFetching && fetched < 500) {
          const result = await fetchUsers({ start: fetched, limit: 50 });
          const batch = Array.isArray(result.users) ? result.users : [];
          if (batch.length === 0) {
            keepFetching = false;
            break;
          }

          const nonMembers = batch.filter((u) => !memberIds.has(u.id));
          setAllLoaded((prev) => [...prev, ...nonMembers]);
          fetched += 50;

          results = results.concat(
            nonMembers.filter(
              (u) =>
                (u.firstName || "").toLowerCase().includes(q) ||
                (u.lastName || "").toLowerCase().includes(q) ||
                (u.email || "").toLowerCase().includes(q)
            )
          );

          if (results.length > 0) {
            keepFetching = false;
          }
        }
      }

      setSearchResults(results);
      applyPagination(results, 1);
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setUserSearch("");
    setIsSearchMode(false);
    setSearchResults([]);
    applyPagination(allLoaded, 1);
  };

  const goToPage = (page) => {
    const source = isSearchMode ? searchResults : allLoaded;
    applyPagination(source, page);
  };

  const markBusy = (id, busy) => {
    setBusyIds((prev) => {
      const n = new Set(prev);
      if (busy) n.add(id);
      else n.delete(id);
      return n;
    });
  };

  const handleAddMember = async (user) => {
    const key = `add-${user.id}`;
    if (busyIds.has(key)) return;
    try {
      markBusy(key, true);
      setError(null);
      await addMutation.mutateAsync({
        teamId: team.id,
        userId: user.id,
        role: selectedRole,
      });
      const newMember = {
        userID: user.id,
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`.trim(),
        avatar: user.avatar || "",
        role: selectedRole,
        userEmail: user.email || "",
      };
      setMembers((prev) => [...prev, newMember]);
      const newMIds = new Set([...memberIds, user.id]);
      setMemberIds(newMIds);
      setAllLoaded((prev) => prev.filter((u) => u.id !== user.id));
      setSearchResults((prev) => prev.filter((u) => u.id !== user.id));
      const source = isSearchMode
        ? searchResults.filter((u) => u.id !== user.id)
        : allLoaded.filter((u) => u.id !== user.id);
      const maxPage = Math.ceil(source.length / PAGE_SIZE) || 1;
      const page = Math.min(currentPage, maxPage);
      applyPagination(source, page);
      addToast(`${user.firstName} ${user.lastName} added as ${selectedRole}`, "success");
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.message || "Failed to add member.");
    } finally {
      markBusy(key, false);
    }
  };

  const handleRemoveMember = async (member) => {
    const userId = member.userID || member.userId;
    const key = `remove-${userId}`;
    if (busyIds.has(key)) return;
    try {
      markBusy(key, true);
      setError(null);
      await removeMutation.mutateAsync({ teamId: team.id, userId });
      setMembers((prev) => prev.filter((m) => (m.userID || m.userId) !== userId));
      addToast(`${member.userName || "Member"} removed from team`, "error");
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.message || "Failed to remove member.");
    } finally {
      markBusy(key, false);
    }
  };

  const getRoleColor = (role) => {
    const r = TEAM_ROLES.find((r) => r.value === role);
    return r?.color || "gray";
  };

  if (!team) return null;

  const getRoleBadge = (role) => (
    <Badge variant={getRoleColor(role)} className="text-[10px]">
      {role || "N/A"}
    </Badge>
  );

  return (
    <Dialog open={open} onOpenChange={busyIds.size === 0 ? onClose : undefined}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Manage Members — {team.name}</DialogTitle>
            <Badge variant={team.status === 1 ? "green" : "gray"} className="text-xs">
              {team.status === 1 ? "Active" : "Inactive"}
            </Badge>
          </div>
        </DialogHeader>

        {error && (
          <div className="text-error flex items-center gap-2 text-sm">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {/* Current Members */}
        <div className="bg-secondary/50 border-border mb-4 rounded-lg border p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-primary" />
              <h3 className="text-text-primary text-sm font-semibold">
                Current Members ({members.length})
              </h3>
            </div>
          </div>
          {loading ? (
            <Loader size={16} className="text-text-muted animate-spin" />
          ) : members.length === 0 ? (
            <p className="text-text-muted text-xs">No members assigned yet.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {members.map((member) => {
                const userId = member.userID || member.userId;
                const userName = member.userName || "Unknown";
                const isBusy = busyIds.has(`remove-${userId}`);
                return (
                  <div
                    key={userId}
                    className="border-border bg-surface flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar || "https://i.pravatar.cc/150?img=1"} />
                        <AvatarFallback>{userName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-text-primary truncate text-xs font-semibold">
                          {userName}
                        </p>
                        <p className="text-text-muted truncate text-[11px]">{member.userEmail}</p>
                        {getRoleBadge(member.role)}
                      </div>
                    </div>
                    <button
                      className="border-border hover:bg-destructive/10 text-destructive flex h-7 w-7 items-center justify-center rounded-md border disabled:opacity-50"
                      onClick={() => handleRemoveMember(member)}
                      disabled={isBusy}
                      title="Remove member"
                    >
                      <Minus size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add New Members */}
        <div className="border-border border-t pt-4">
          <div className="mb-3 flex items-center gap-2">
            <UserPlus size={16} className="text-primary" />
            <h3 className="text-text-primary text-sm font-semibold">Add Members</h3>
          </div>

          {/* Role Selection */}
          <div className="mb-3">
            <label className="text-text-muted mb-1.5 block text-xs">Default Role</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEAM_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ background: t(role.color) }} />
                      {role.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="mb-3">
            <div className="relative">
              <Search
                size={14}
                className="text-text-muted absolute top-1/2 left-2.5 -translate-y-1/2"
              />
              <Input
                placeholder="Search users by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="mt-2 flex gap-2">
              <Button type="submit" variant="primary" size="sm" disabled={searchLoading}>
                {searchLoading ? (
                  <>
                    <Loader size={12} className="mr-1 animate-spin" />
                    Searching...
                  </>
                ) : (
                  "Search"
                )}
              </Button>
              {isSearchMode && (
                <Button type="button" variant="default" size="sm" onClick={clearSearch}>
                  <X size={12} className="mr-1" /> Clear
                </Button>
              )}
            </div>
          </form>

          {/* Available Users */}
          {loading ? (
            <div className="py-8 text-center">
              <Loader size={20} className="text-text-muted mx-auto animate-spin" />
            </div>
          ) : displayedUsers.length === 0 ? (
            <div className="border-border bg-surface rounded-lg border py-8 text-center">
              <ShieldCheck size={32} className="text-text-muted mx-auto mb-2" />
              <p className="text-text-muted text-sm">
                {searchLoading
                  ? "Searching..."
                  : isSearchMode
                    ? `No users found matching "${userSearch}"`
                    : "No available users found."}
              </p>
            </div>
          ) : (
            <>
              <div className="border-border bg-surface max-h-80 overflow-y-auto rounded-lg border">
                <div className="grid gap-2 p-3 sm:grid-cols-2">
                  {displayedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="border-border hover:bg-hover flex items-center justify-between rounded-lg border p-3 transition-colors"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar || "https://i.pravatar.cc/150?img=1"} />
                          <AvatarFallback>{(user.firstName || "U")[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-text-primary truncate text-xs font-semibold">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-text-muted truncate text-[11px]">{user.email}</p>
                          {user.role && (
                            <Badge variant={getRoleColor(user.role)} className="text-[10px]">
                              {user.role}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <button
                        className="border-success hover:bg-success/10 text-success flex h-8 w-8 items-center justify-center rounded-md border disabled:opacity-50"
                        onClick={() => handleAddMember(user)}
                        disabled={busyIds.has(`add-${user.id}`)}
                        title={`Add as ${selectedRole}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-text-muted text-xs">
                    Page {currentPage} of {totalPages} ({totalCount} users)
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => goToPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft size={14} /> Previous
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>
              )}

              {/* Load More */}
              {!isSearchMode &&
                totalPages > 0 &&
                currentPage === totalPages &&
                allLoaded.length > 0 && (
                  <div className="mt-3 flex justify-center">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={loadMoreUsers}
                      disabled={loadingMore}
                    >
                      {loadingMore ? (
                        <>
                          <Loader size={14} className="mr-1 animate-spin" />
                          Loading more...
                        </>
                      ) : (
                        "Load More Users"
                      )}
                    </Button>
                  </div>
                )}
            </>
          )}
        </div>

        <div className="border-border mt-4 flex justify-end border-t pt-4">
          <Button variant="default" onClick={onClose} disabled={busyIds.size > 0}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamMemberAssignModal;
