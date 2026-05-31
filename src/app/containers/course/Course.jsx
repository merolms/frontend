import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen, Plus, RefreshCw, Search } from "lucide-react";
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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Paper } from "@/components/ui/card";
import { fetchCourses, mockCategories } from "@/app/services/courseService";
import { PermissionGuard } from "@/app/components/ProtectedRoute/ProtectedRoute";
import ViewModeSwitcher from "./views/ViewModeSwitcher";
import GridView from "./views/GridView";
import TableView from "./views/TableView";
import ListView from "./views/ListView";
import CompactView from "./views/CompactView";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "Published", label: "Published" },
  { value: "DRAFT", label: "Draft" },
  { value: "Archived", label: "Archived" },
];

const categoryOptions = [
  { value: "all", label: "All Categories" },
  ...mockCategories.map((cat) => ({ value: cat, label: cat })),
];

const sortOptions = [
  { value: "all", label: "Newest First" },
  { value: "title", label: "Title A-Z" },
];

const CourseContainer = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const page = parseInt(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";
  const viewMode = searchParams.get("view") || "grid";

  const [searchInput, setSearchInput] = useState(search);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const limit = viewMode === "list" ? 10 : viewMode === "compact" ? 15 : 8;
      const data = await fetchCourses({ search, status, category, sort, page, limit });
      setCourses(data.courses);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      setError(err.message || "Failed to load courses");
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  }, [search, status, category, sort, page, viewMode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshList = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value && value !== 0) newParams.delete(key);
      else newParams.set(key, value);
    });
    if (!updates.page && !updates.view) newParams.delete("page");
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ search: searchInput, page: 1 });
  };

  const handleClear = () => {
    setSearchInput("");
    setSearchParams(new URLSearchParams());
  };

  const renderView = () => {
    const props = { courses, navigate, loading, onRefresh: refreshList };
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
        loading
          ? "Loading..."
          : `${total} course${total !== 1 ? "s" : ""} total${totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ""}`
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
            value={status}
            onValueChange={(v) => updateParams({ status: v === "all" ? "" : v, page: 1 })}
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
      {error && !loading && (
        <Paper p="md" className="mb-4">
          <div className="text-error flex items-center gap-2">
            <span>{error}</span>
            <Button
              size="xs"
              variant="default"
              leftSection={<RefreshCw size={12} />}
              onClick={fetchData}
            >
              Retry
            </Button>
          </div>
        </Paper>
      )}

      {/* Empty */}
      {!error && courses.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen size={48} className="text-text-muted mb-3" />
          <p className="text-text-secondary">
            No courses found. Try adjusting your filters or create a new course.
          </p>
          <PermissionGuard permissions={["courses.create"]}>
            <Button size="sm" className="mt-4" onClick={() => navigate("/courses/create")}>
              <Plus size={14} /> Create Course
            </Button>
          </PermissionGuard>
        </div>
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
