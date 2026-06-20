import { AlertCircle, Plus, Search, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { DeleteModal } from "@/app/containers/course/CourseActions/CourseActions";
import TeamMemberAssignModal from "@/app/containers/team/TeamMemberAssignModal/TeamMemberAssignModal";
import { useToast } from "@/app/context/ToastContext";
import { useTeams, useTeamMembers, useDeleteTeam } from "@/hooks/queries/useEntities";
import { fetchTeamMembers } from "@/app/services/teamService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Paper } from "@/components/ui/card";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { t } from "@/styles/theme";
import { usePageTitle } from "@/hooks";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];
const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "name", label: "Name A-Z" },
];
const AVATAR_COUNT = 4;

const TeamContainer = () => {
  usePageTitle("Teams");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();
  const [assignTeam, setAssignTeam] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const page = parseInt(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";
  const sort = searchParams.get("sort") || "";
  const [searchInput, setSearchInput] = useState(search);
  const totalPages=1

  const deleteMutation = useDeleteTeam();
  // ─── TanStack Query: replaces manual useState + useEffect + fetch ───
  // Fetch all teams for client-side filtering
  const {
    data: teams = [],
    isLoading,
    error: queryError,
    refetch,
  } = useTeams({ start: 0, limit: 10 });

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) newParams.delete(key);
      else newParams.set(key, value);
    });
    if (!updates.page) newParams.delete("page");
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ search: searchInput, page: 1 });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(true);
      await deleteMutation.mutateAsync(deleteTarget.id);
      addToast(`Team "${deleteTarget.name}" deleted`, "error");
      setDeleteTarget(null);
      // The deleteMutation should handle cache invalidation automatically
      // But we still need to trigger the member data refresh
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const getDeleteWarnings = (team) => {
    if (!team) return null;
    const memberCount = team.memberCount || 0;
    if (memberCount === 0) return null;
    return {
      members: memberCount,
    };
  };

  const handleClear = () => {
    setSearchInput("");
    setSearchParams(new URLSearchParams());
  };
  console.log("teams", teams)
  return (
    <>
      <DashboardLayout title="Teams" >
        {/* Action bar */}
        <div className="mb-4 flex items-center justify-end">
          <Button size="sm" onClick={() => navigate("/teams/create")}>
            <Plus size={14} /> New Team
          </Button>
        </div>

        {/* Error */}
        {queryError && (
          <div className="border-error/30 bg-error/5 text-error mb-4 flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {/* Filters */}
        <Paper className="mb-4 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <form className="flex flex-1 items-center gap-2" onSubmit={handleSearch}>
              <div className="relative flex-1">
                <Search
                  size={14}
                  className="text-text-muted absolute top-1/2 left-2.5 -translate-y-1/2"
                />
                <Input
                  placeholder="Search teams..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-8"
                />
              </div>
            </form>
            <Select
              value={statusFilter}
              onValueChange={(v) => updateParams({ status: v === "all" ? "" : v, page: 1 })}
            >
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => updateParams({ sort: v, page: 1 })}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="default" size="sm" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </Paper>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users size={48} className="text-text-muted mb-3" />
            <p className="text-text-primary text-sm font-medium">No teams found</p>
            <p className="text-text-muted mt-1 text-xs">
              Try adjusting your filters or create a new team.
            </p>
            <Button size="sm" className="mt-4" onClick={() => navigate("/teams/create")}>
              <Plus size={14} /> Create Team
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="border-border bg-bg-surface cursor-pointer rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md"
                  onClick={() => navigate(`/teams/${team.id}`)}
                >
                  <div
                    className="-mx-4 -mt-4 mb-3 flex items-center justify-between rounded-t-lg p-3"
                    style={{ background: team.color || t("accent"), borderRadius: "8px 8px 0 0" }}
                  >
                    <Users size={18} className="text-secondary/80" />
                    <Badge variant={team.status === 1 ? "green" : "gray"}>
                      {team.status === 1 ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <h3 className="text-text-primary text-sm font-semibold">{team.name}</h3>
                  <p className="text-text-muted mt-0.5 line-clamp-2 text-xs">
                    {team.description || "No description"}
                  </p>
                  <div className="mt-3 flex items-center gap-1">
                    {team.memberAvatars?.map((m, idx) => (
                      <Avatar key={idx} className="h-6 w-6">
                        <AvatarImage src={m.avatar} />
                        <AvatarFallback className="text-[10px]">{m.userName?.[0]}</AvatarFallback>
                      </Avatar>
                    ))}
                    {team.memberCount > AVATAR_COUNT && (
                      <span className="text-text-muted ml-1 text-[11px]">
                        +{team.memberCount - AVATAR_COUNT}
                      </span>
                    )}
                    {team.memberCount === 0 && (
                      <span className="text-text-muted text-[11px]">No members</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination
                  total={totalPages}
                  value={page}
                  onChange={(p) => updateParams({ page: p })}
                />
              </div>
            )}
          </>
        )}
      </DashboardLayout>

      {assignTeam && (
        <TeamMemberAssignModal
          open={!!assignTeam}
          onClose={() => setAssignTeam(null)}
          team={assignTeam}
          onUpdated={refetch}
        />
      )}
      <DeleteModal
        open={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        itemName={deleteTarget?.name}
        itemType="team"
        loading={actionLoading}
        warnings={getDeleteWarnings(deleteTarget)}
      />
    </>
  );
};

export default TeamContainer;
