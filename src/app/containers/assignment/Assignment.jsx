import { BookOpen, Pencil, Plus, Search, ToggleLeft, Trash2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

import { PermissionGuard } from "@/app/components/ProtectedRoute/ProtectedRoute";
import { DeleteModal } from "@/app/containers/course/CourseActions/CourseActions";
import { hasPermission } from "@/app/services/authService";
import EmptyState from "@/components/common/EmptyState";
import FormErrorBanner from "@/components/common/FormErrorBanner";
import LoadingState from "@/components/common/LoadingState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/app/context/ToastContext";
import { t } from "@/styles/theme";

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "published", label: "published" },
  { value: "draft", label: "draft" },
  { value: "closed", label: "closed" },
];

const sortOptions = [
  { value: "all", label: "Default" },
  { value: "title", label: "Title A-Z" },
  { value: "recent", label: "Recently Updated" },
];

const AssignmentContainer = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useSelector((s) => s.auth.user);
  const { addToast } = useToast();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const limit = 10;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const hasFilters = Boolean(search || statusFilter || sort);

      if (!hasFilters) {
        // Plain browsing — server-side pagination
        const start = (page - 1) * limit;
        const { getAssignments } = await import("@/app/services/assignmentService");
        const result = await getAssignments({ start, limit });
        console.log("API result:", result);
        setAssignments(result.assignments || []);
        setTotal(result.total || 0);
        setTotalPages(Math.ceil((result.total || 0) / limit) || 1);
        return;
      }

      // The API only supports start/limit, so filters must operate on the
      // whole dataset: fetch a wide window, then filter/sort/paginate locally.
      const { getAssignments } = await import("@/app/services/assignmentService");
      let result = await getAssignments({ start: 0, limit: 500 });
      let data = result.assignments || [];
      if (search) {
        const q = search.toLowerCase();
        data = data.filter(
          (a) =>
            (a.title || "").toLowerCase().includes(q) ||
            (a.description || "").toLowerCase().includes(q)
        );
      }
      if (statusFilter) {
        data = data.filter((a) => a.status === statusFilter);
      }
      if (sort === "title") data.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      else if (sort === "recent") data.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

      const filteredTotal = data.length;
      setAssignments(data.slice((page - 1) * limit, page * limit));
      setTotal(filteredTotal);
      setTotalPages(Math.ceil(filteredTotal / limit) || 1);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError(err.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sort, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleCreate = () => {
    navigate("/assignments/create");
  };

  const handleEdit = (assignment) => {
    navigate(`/assignments/${assignment.id}/edit`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(true);
      const { deleteAssignment } = await import("@/app/services/assignmentService");
      await deleteAssignment(deleteTarget.id);
      setDeleteTarget(null);
      addToast(`Assignment "${deleteTarget.title}" deleted`, "success");
      await fetchData();
    } catch (err) {
      addToast(err.message || "Failed to delete assignment.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (assignment) => {
    try {
      const { updateAssignment } = await import("@/app/services/assignmentService");
      const newStatus = assignment.status === "published" ? "draft" : "published";
      await updateAssignment(assignment.id, { status: newStatus });
      addToast(
        `Assignment "${assignment.title}" ${newStatus === "published" ? "published" : "unpublished"}`,
        "success"
      );
      await fetchData();
    } catch (err) {
      addToast(err.message || "Failed to update assignment status.", "error");
    }
  };

  const handleClear = () => {
    setSearchInput("");
    setSearch("");
    setStatusFilter("");
    setSort("");
    setPage(1);
  };

  return (
    <>
      <DashboardLayout
        title="Assignments"
        subtitle={`${total} assignment${total === 1 ? "" : "s"} total`}
      >
        {/* Action bar */}
        <div className="mb-4 flex items-center justify-end">
          <PermissionGuard permissions={["assignment.create"]}>
            <Button size="sm" onClick={handleCreate}>
              <Plus size={14} /> New Assignment
            </Button>
          </PermissionGuard>
        </div>

        {/* Error */}
        {error && <FormErrorBanner message={error} />}

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
                  placeholder="Search assignments..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-8"
                />
              </div>
            </form>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v === "all" ? "" : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-32">
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
            <Select
              value={sort}
              onValueChange={(v) => {
                setSort(v === "all" ? "" : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-36">
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

        {/* Table */}
        <Paper className="overflow-hidden">
          {loading ? (
            <LoadingState count={5} height="h-12" className="p-4" />
          ) : assignments.length === 0 ? (
            <EmptyState
              icon={<BookOpen size={48} className="text-text-muted" />}
              title="No assignments found"
              description="Try adjusting your filters or create a new assignment."
              action={
                <PermissionGuard permissions={["assignment.create"]}>
                  <Button size="sm" onClick={handleCreate}>
                    <Plus size={14} /> Create First Assignment
                  </Button>
                </PermissionGuard>
              }
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b">
                  <th className="text-text-muted px-4 py-2.5 text-left text-xs font-medium">
                    Assignment
                  </th>
                  <th className="text-text-muted px-4 py-2.5 text-left text-xs font-medium">
                    Description
                  </th>
                  <th className="text-text-muted px-4 py-2.5 text-center text-xs font-medium">
                    Points
                  </th>
                  <th className="text-text-muted px-4 py-2.5 text-left text-xs font-medium">
                    Status
                  </th>
                  <th className="text-text-muted px-4 py-2.5 text-left text-xs font-medium">
                    Due Date
                  </th>
                  <th className="text-text-muted px-4 py-2.5 text-center text-xs font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {assignments.map((assignment) => (
                  <tr
                    key={assignment.id}
                    className={`hover:bg-bg-surface-hover cursor-pointer transition-colors ${
                      assignment.status === "draft" ? "opacity-60" : ""
                    }`}
                    onClick={() => navigate(`/assignments/${assignment.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-text-primary text-xs font-semibold">
                          {assignment.title}
                        </span>
                        {assignment.audienceType !== "COURSE" && (
                          <p className="text-text-muted text-[11px]">{assignment.audienceType}</p>
                        )}
                      </div>
                    </td>
                    <td className="text-text-muted line-clamp-2 px-4 py-3 text-xs">
                      {assignment.description || "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="blue">{assignment.maxPoints} pts</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          assignment.status === "published"
                            ? "green"
                            : assignment.status === "closed"
                              ? "red"
                              : "gray"
                        }
                      >
                        {assignment.status}
                      </Badge>
                    </td>
                    <td className="text-text-muted px-4 py-3 text-[11px]">
                      {assignment.dueDate
                        ? new Date(assignment.dueDate * 1000).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <PermissionGuard permissions={["assignment.edit"]}>
                          <button
                            className="border-border hover:bg-bg-surface-active text-text-secondary flex h-7 w-7 items-center justify-center rounded-md border"
                            onClick={() => handleEdit(assignment)}
                            title="Edit"
                          >
                            <Pencil size={12} />
                          </button>
                        </PermissionGuard>
                        <button
                          className="border-border hover:bg-bg-surface-active text-text-secondary flex h-7 w-7 items-center justify-center rounded-md border"
                          onClick={() => handleToggleStatus(assignment)}
                          title={assignment.status === "published" ? "Unpublish" : "Publish"}
                        >
                          <ToggleLeft size={12} />
                        </button>
                        <PermissionGuard permissions={["assignment.delete"]}>
                          <button
                            className="border-border hover:bg-error/10 text-error flex h-7 w-7 items-center justify-center rounded-md border"
                            onClick={() => setDeleteTarget(assignment)}
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </PermissionGuard>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Paper>

        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination total={totalPages} value={page} onChange={setPage} />
          </div>
        )}

        <DeleteModal
          open={!!deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          itemName={deleteTarget?.title}
          itemType="assignment"
          loading={actionLoading}
        />
      </DashboardLayout>
    </>
  );
};

export default AssignmentContainer;
