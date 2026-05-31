import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { AlertCircle, Plus, Search, Users } from "lucide-react";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Paper } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { t } from "@/styles/theme";
import TeamMemberAssignModal from "@/app/containers/team/TeamMemberAssignModal/TeamMemberAssignModal";
import { DeleteModal } from "@/app/containers/course/CourseActions/CourseActions";
import { fetchTeams, fetchTeamMembers, deleteTeam } from "@/app/services/teamService";

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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [assignTeam, setAssignTeam] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const page = parseInt(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";
  const sort = searchParams.get("sort") || "";
  const [searchInput, setSearchInput] = useState(search);

  const limit = 8;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { start: (page - 1) * limit, limit };
      if (sort) params.sort = sort;
      const result = await fetchTeams(params);
      const teamList = Array.isArray(result.teams) ? result.teams : [];
      let filtered = teamList;
      if (statusFilter) filtered = filtered.filter((t) => String(t.status) === statusFilter);
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            (t.name || "").toLowerCase().includes(q) ||
            (t.description || "").toLowerCase().includes(q)
        );
      }
      const teamsWithMembers = await Promise.all(
        filtered.map(async (team) => {
          try {
            const members = await fetchTeamMembers(team.id);
            return {
              ...team,
              memberCount: members.length,
              memberAvatars: members.slice(0, AVATAR_COUNT).map((m) => ({
                avatar: m.avatar || "https://i.pravatar.cc/150?img=1",
                userName: m.userName || "Unknown",
              })),
            };
          } catch {
            return { ...team, memberCount: 0, memberAvatars: [] };
          }
        })
      );
      setTeams(teamsWithMembers);
      setTotal(result.total);
      setTotalPages(Math.ceil(result.total / limit) || 1);
    } catch (err) {
      setError(err.message || "Failed to load teams");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sort, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      await deleteTeam(deleteTarget.id);
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClear = () => {
    setSearchInput("");
    setSearchParams(new URLSearchParams());
  };

  return (
    <>
      <DashboardLayout title="Teams" subtitle={`${total} team${total !== 1 ? "s" : ""} total`}>
        {/* Action bar */}
        <div className="mb-4 flex items-center justify-end">
          <Button size="sm" onClick={() => navigate("/teams/create")}>
            <Plus size={14} /> New Team
          </Button>
        </div>

        {/* Error */}
        {error && (
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
        {loading ? (
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
                    <Users size={18} className="text-white/80" />
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
          onUpdated={fetchData}
        />
      )}
      <DeleteModal
        open={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        itemName={deleteTarget?.name}
        itemType="team"
        loading={actionLoading}
      />
    </>
  );
};

export default TeamContainer;
