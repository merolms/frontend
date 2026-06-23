import { BookOpen, Clock, Plus, RefreshCw, Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

import { PermissionGuard } from "@/components/ProtectedRoute";
import { DeleteModal } from "@/containers/course/CourseActions/CourseActions";
import { useToast } from "@/context/ToastContext";
import { hasPermission } from "@/services/authService";
import EmptyState from "@/components/common/EmptyState";
import FormErrorBanner from "@/components/common/FormErrorBanner";
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
import {
  useArchiveCourse,
  useCourses,
  useDeleteCourse,
  usePublishCourse,
} from "@/hooks/queries/useCourses";
import { useCategories } from "@/hooks/queries/useEntities";

import CompactView from "./views/CompactView";
import GridView from "./views/GridView";
import ListView from "./views/ListView";
import TableView from "./views/TableView";
import ViewModeSwitcher from "./views/ViewModeSwitcher";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "published", label: "published" },
  { value: "draft", label: "draft" },
  { value: "archived", label: "archived" },
];

const sortOptions = [
  { value: "all", label: "Newest First" },
  { value: "title", label: "Title A-Z" },
  { value: "enrollment", label: "Most Enrolled" },
  { value: "updated", label: "Recently Updated" },
];

const durationOptions = [
  { value: "all", label: "All Durations" },
  { value: "short", label: "< 2 hours" },
  { value: "medium", label: "2-5 hours" },
  { value: "long", label: "> 5 hours" },
];

const CourseContainer = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useSelector((s) => s.auth.user);
  const { addToast } = useToast();
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState(false);

  const isAdmin = hasPermission(user, "courses.publish");

  // Non-admin users (learner, team lead) only see published courses by default
  const defaultStatus = isAdmin ? "" : "published";
  const page = parseInt(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || defaultStatus;
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";
  const duration = searchParams.get("duration") || "";
  const viewMode = searchParams.get("view") || "grid";

  const [searchInput, setSearchInput] = useState(search);

  // ─── TanStack Query: replaces manual useState + useEffect + fetch ───
  const limit = viewMode === "list" ? 10 : viewMode === "compact" ? 15 : 8;
  const {
    data: courses = [],
    total = 0,
    totalPages = 1,
    isLoading,
    error,
    isFetching,
    refetch,
  } = useCourses({
    search,
    status,
    category,
    sort,
    duration,
    page,
    limit,
  });

  const { data: categories = [] } = useCategories({ start: 0, limit: 100 });

  // Bulk operation mutations
  const publishMutation = usePublishCourse();
  const archiveMutation = useArchiveCourse();
  const deleteMutation = useDeleteCourse();

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...categories.map((cat) => ({ value: cat.name, label: cat.name })),
  ];

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value && value !== 0) newParams.delete(key);
      else newParams.set(key, value);
    });
    if (!updates.page && !updates.view) newParams.delete("page");
    setSearchParams(newParams);
  };

  // Debounced search — applies as the user types, no Enter required
  useEffect(() => {
    if (searchInput === search) return undefined;
    const timer = setTimeout(() => {
      updateParams({ search: searchInput, page: 1 });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ search: searchInput, page: 1 });
  };

  const handleClear = () => {
    setSearchInput("");
    setSearchParams(new URLSearchParams());
    setSelectedIds(new Set());
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(new Set(courses.map((c) => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id, checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleBulkPublish = async () => {
    try {
      const promises = Array.from(selectedIds).map((id) => publishMutation.mutateAsync(id));
      await Promise.all(promises);
      addToast(
        `${selectedIds.size} course${selectedIds.size === 1 ? "" : "s"} published successfully`,
        "success"
      );
      setSelectedIds(new Set());
      refetch();
    } catch {
      addToast("Failed to publish courses. Please try again.", "error");
    }
  };

  const handleBulkArchive = async () => {
    try {
      const promises = Array.from(selectedIds).map((id) => archiveMutation.mutateAsync(id));
      await Promise.all(promises);
      addToast(
        `${selectedIds.size} course${selectedIds.size === 1 ? "" : "s"} archived successfully`,
        "success"
      );
      setSelectedIds(new Set());
      refetch();
    } catch {
      addToast("Failed to archive courses. Please try again.", "error");
    }
  };

  const handleBulkDelete = async () => {
    try {
      const promises = Array.from(selectedIds).map((id) => deleteMutation.mutateAsync(id));
      await Promise.all(promises);
      addToast(
        `${selectedIds.size} course${selectedIds.size === 1 ? "" : "s"} deleted successfully`,
        "success"
      );
      setSelectedIds(new Set());
      setBulkDeleteTarget(false);
      refetch();
    } catch {
      addToast("Failed to delete courses. Please try again.", "error");
    }
  };

  // Calculate warnings for bulk delete
  const getBulkDeleteWarnings = () => {
    return {
      lessons: 0, // Not available in backend response
      enrolled: 0, // Not available in backend response
    };
  };

  const renderView = () => {
    const props = {
      courses,
      navigate,
      loading: isLoading,
      onRefresh: refetch,
      selectedIds,
      onSelectOne: handleSelectOne,
      onSelectAll: handleSelectAll,
      viewMode,
    };
    switch (viewMode) {
      case "table":
        return <TableView {...props} />;
      case "list":
        return <ListView {...props} />;
      case "compact":
        return <CompactView {...props} />;
      default:
        return <GridView {...props} />;
    }
  };

  return (
    <DashboardLayout
      title="Courses"
      subtitle={
        isLoading
          ? "Loading..."
          : `${total} course${total !== 1 ? "s" : ""}${
              totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ""
            }${isFetching ? " (refreshing...)" : ""}`
      }
    >
      {/* Analytics Summary */}
      {!isLoading && courses.length > 0 && (
        <div className="mb-4 grid grid-cols-4 gap-4">
          <Paper className="p-4">
            <div className="text-text-muted mb-1 flex items-center gap-2 text-xs">
              <BookOpen size={14} /> Total Courses
            </div>
            <div className="text-text-primary text-2xl font-semibold">{courses.length}</div>
          </Paper>
          <Paper className="p-4">
            <div className="text-text-muted mb-1 flex items-center gap-2 text-xs">
              <Users size={14} /> Published
            </div>
            <div className="text-text-primary text-2xl font-semibold">
              {courses.filter((c) => c.status === "published").length}
            </div>
          </Paper>
          <Paper className="p-4">
            <div className="text-text-muted mb-1 flex items-center gap-2 text-xs">
              <BookOpen size={14} /> Draft
            </div>
            <div className="text-text-primary text-2xl font-semibold">
              {courses.filter((c) => c.status === "draft").length}
            </div>
          </Paper>
          <Paper className="p-4">
            <div className="text-text-muted mb-1 flex items-center gap-2 text-xs">
              <Clock size={14} /> Total Enrollments
            </div>
            <div className="text-text-primary text-2xl font-semibold">
              0 {/* enrolledUsers not available in backend response */}
            </div>
          </Paper>
        </div>
      )}

      {/* Action bar */}
      <div className="mb-4 flex items-center justify-between">
        {selectedIds.size > 0 && viewMode === "table" && (
          <div className="flex items-center gap-2">
            <span className="text-text-muted text-xs">
              {selectedIds.size} course{selectedIds.size === 1 ? "" : "s"} selected
            </span>
            <Button size="sm" variant="primary" onClick={handleBulkPublish}>
              Publish
            </Button>
            <Button size="sm" variant="default" onClick={handleBulkArchive}>
              Archive
            </Button>
            <PermissionGuard permissions={["courses.delete"]}>
              <Button size="sm" variant="danger" onClick={() => setBulkDeleteTarget(true)}>
                Delete
              </Button>
            </PermissionGuard>
          </div>
        )}
        <PermissionGuard permissions={["courses.create"]}>
          <Button size="sm" onClick={() => navigate("/courses/create")}>
            <Plus size={14} /> New Course
          </Button>
        </PermissionGuard>
      </div>

      {/* Filters */}
      <div className="border-border mb-6 border-b p-1 pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <form className="flex flex-1 items-center gap-2" onSubmit={handleSearch}>
            <div className="relative flex-1">
              <Search
                size={14}
                className="text-text-muted absolute top-1/2 left-2.5 -translate-y-1/2"
              />
              <Input
                placeholder="Search courses..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-8"
              />
            </div>
          </form>
          <Select
            value={status || (isAdmin ? "all" : "published")}
            onValueChange={(v) => updateParams({ status: v === "all" ? "" : v, page: 1 })}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions
                .filter((o) => isAdmin || (o.value !== "draft" && o.value !== "archived"))
                .map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select
            value={category}
            onValueChange={(v) => updateParams({ category: v === "all" ? "" : v, page: 1 })}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={duration}
            onValueChange={(v) => updateParams({ duration: v === "all" ? "" : v, page: 1 })}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              {durationOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sort}
            onValueChange={(v) => updateParams({ sort: v === "all" ? "" : v, page: 1 })}
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
          <Button variant="outline" size="sm" onClick={handleClear}>
            Clear Filters
          </Button>
          <div className="ml-auto">
            <ViewModeSwitcher
              value={viewMode}
              onChange={(mode) => updateParams({ view: mode, page: 1 })}
            />
          </div>
        </div>

        {(status || category || search || duration) && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-text-muted text-xs">Filters:</span>
            {search && (
              <Badge
                variant="blue"
                onClose={() => {
                  setSearchInput("");
                  updateParams({ search: "", page: 1 });
                }}
              >
                Search: {search}
              </Badge>
            )}
            {status && (
              <Badge variant="green" onClose={() => updateParams({ status: "", page: 1 })}>
                {status}
              </Badge>
            )}
            {category && (
              <Badge variant="teal" onClose={() => updateParams({ category: "", page: 1 })}>
                {category}
              </Badge>
            )}
            {duration && (
              <Badge variant="orange" onClose={() => updateParams({ duration: "", page: 1 })}>
                {durationOptions.find((d) => d.value === duration)?.label || duration}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && !isLoading && (
        <div className="border-destructive/20 bg-destructive/5 mb-6 rounded-xl border p-6">
          <FormErrorBanner message={error?.message || "Failed to load courses"} />
          <Button
            size="xs"
            variant="default"
            leftSection={<RefreshCw size={12} />}
            onClick={() => refetch()}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Empty */}
      {!error && courses.length === 0 && !isLoading ? (
        <EmptyState
          icon={<BookOpen size={48} className="text-text-muted" />}
          title={
            search || status || category || duration
              ? "No courses match your filters"
              : isAdmin
                ? "No courses yet"
                : "No courses available"
          }
          description={
            search || status || category || duration
              ? "Try adjusting your filters or clear them to see all courses."
              : isAdmin
                ? "Create your first course to start building your learning platform."
                : "Explore the course catalog and enroll in courses that interest you."
          }
          action={
            search || status || category || duration ? (
              <Button size="sm" variant="outline" onClick={handleClear}>
                Clear Filters
              </Button>
            ) : (
              isAdmin && (
                <PermissionGuard permissions={["courses.create"]}>
                  <Button size="sm" onClick={() => navigate("/courses/create")}>
                    <Plus size={14} /> Create Course
                  </Button>
                </PermissionGuard>
              )
            )
          }
        />
      ) : (
        !error && (
          <>
            {renderView()}
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
        )
      )}

      {/* Bulk Delete Modal */}
      <DeleteModal
        open={!!bulkDeleteTarget}
        onConfirm={handleBulkDelete}
        onCancel={() => {
          setBulkDeleteTarget(false);
          setSelectedIds(new Set());
        }}
        itemName={`${selectedIds.size} course${selectedIds.size === 1 ? "" : "s"}`}
        itemType="courses"
        loading={deleteMutation.isPending}
        warnings={getBulkDeleteWarnings()}
      />
    </DashboardLayout>
  );
};

export default CourseContainer;
