import { BookOpen, Plus, RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

import { PermissionGuard } from "@/app/components/ProtectedRoute/ProtectedRoute";
import { hasPermission } from "@/app/services/authService";
import { useCourses } from "@/hooks/queries/useCourses";
import { useCategories } from "@/hooks/queries/useEntities";
import EmptyState from "@/components/common/EmptyState";
import FormErrorBanner from "@/components/common/FormErrorBanner";
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

import CompactView from "./views/CompactView";
import GridView from "./views/GridView";
import ListView from "./views/ListView";
import TableView from "./views/TableView";
import ViewModeSwitcher from "./views/ViewModeSwitcher";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

const sortOptions = [
  { value: "all", label: "Newest First" },
  { value: "title", label: "Title A-Z" },
];

const CourseContainer = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useSelector((s) => s.auth.user);

  const isAdmin = hasPermission(user, "courses.publish");

  // Non-admin users (learner, team lead) only see published courses by default
  const defaultStatus = isAdmin ? "" : "published";
  const page = parseInt(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || defaultStatus;
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";
  const viewMode = searchParams.get("view") || "grid";

  const [searchInput, setSearchInput] = useState(search);

  // ─── TanStack Query: replaces manual useState + useEffect + fetch ───
  const limit = viewMode === "list" ? 10 : viewMode === "compact" ? 15 : 8;
  const { data, isLoading, error, isFetching, refetch } = useCourses({
    search,
    status,
    category,
    sort,
    page,
    limit,
  });

  const { data: categories = [] } = useCategories({ start: 0, limit: 100 });

  const courses = data?.courses ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

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
  };

  const renderView = () => {
    const props = { courses, navigate, loading: isLoading, onRefresh: refetch };
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
      {/* Action bar */}
      <div className="mb-4 flex items-center justify-end">
        <PermissionGuard permissions={["courses.create"]}>
          <Button size="sm" onClick={() => navigate("/courses/create")}>
            <Plus size={14} /> New Course
          </Button>
        </PermissionGuard>
      </div>

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
          <Button variant="default" size="sm" onClick={handleClear}>
            Clear
          </Button>
          <ViewModeSwitcher
            value={viewMode}
            onChange={(mode) => updateParams({ view: mode, page: 1 })}
          />
        </div>

        {(status || category || search) && (
          <div className="mt-2 flex items-center gap-2">
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
          </div>
        )}
      </Paper>

      {/* Error */}
      {error && !isLoading && (
        <Paper p="md" className="mb-4">
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
        </Paper>
      )}

      {/* Empty */}
      {!error && courses.length === 0 && !isLoading ? (
        <EmptyState
          icon={<BookOpen size={48} className="text-text-muted" />}
          title="No courses found"
          description="Try adjusting your filters or create a new course."
          action={
            <PermissionGuard permissions={["courses.create"]}>
              <Button size="sm" onClick={() => navigate("/courses/create")}>
                <Plus size={14} /> Create Course
              </Button>
            </PermissionGuard>
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
    </DashboardLayout>
  );
};

export default CourseContainer;
