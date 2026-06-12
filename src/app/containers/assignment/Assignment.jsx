import { BookOpen, Plus, RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

import { PermissionGuard } from "@/app/components/ProtectedRoute/ProtectedRoute";
import { hasPermission } from "@/app/services/authService";
import { fetchAssignmentsByLesson } from "@/redux/slices/assignmentSlice";
import EmptyState from "@/components/common/EmptyState";
import FormErrorBanner from "@/components/common/FormErrorBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Paper } from "@/components/ui/card";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Draft" },
  { value: "CLOSED", label: "Closed" },
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "title", label: "Title A-Z" },
  { value: "dueDate", label: "Due Date" },
];

const AssignmentContainer = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useSelector((s) => s.auth.user);

  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [lessonId, setLessonId] = useState(null);

  useEffect(() => {
    const lessonIdParam = searchParams.get("lessonId");
    if (lessonIdParam) {
      setLessonId(lessonIdParam);
      loadAssignments(lessonIdParam);
    }
  }, [searchParams]);

  useEffect(() => {
    let filtered = [...assignments];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "dueDate":
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        case "newest":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredAssignments(filtered);
  }, [assignments, searchQuery, statusFilter, sortBy]);

  const loadAssignments = async (lessonId) => {
    try {
      setLoading(true);
      setError(null);
      // Dispatch the action - for now we'll use the service directly
      // In a real implementation, you'd use the Redux thunk
      const { getAssignmentsByLesson } = await import("@/app/services/assignmentService");
      const data = await getAssignmentsByLesson(lessonId);
      setAssignments(data);
    } catch (err) {
      setError(err.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (lessonId) loadAssignments(lessonId);
  };

  const handleCreate = () => {
    navigate(`/assignments/create?lessonId=${lessonId}`);
  };

  const canCreate = hasPermission(user, "assignment:create");

  return (
    <DashboardLayout
      title={"Assignments"}
      subtitle={"Manage course assignments"}
    >
      {/* Action bar */}
      <div className="mb-4 flex items-center justify-end">
        <PermissionGuard permissions={["courses.create"]}>
                      <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          <Button size="sm" onClick={handleCreate}>
            <Plus size={14} /> Create Assignment
          </Button>
        </PermissionGuard>
      </div>
      
      <div className="space-y-6">

        {/* Error Banner */}
        {error && <FormErrorBanner message={error} onClose={() => setError(null)} />}

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredAssignments.length === 0 && (
          <EmptyState
            icon={<BookOpen className="h-12 w-12 text-gray-400" />}
            title="No assignments found"
            description={
              searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first assignment to get started"
            }
            action={
              canCreate && !searchQuery && statusFilter === "all" ? (
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Assignment
                </Button>
              ) : null
            }
          />
        )}

        {/* Assignment List */}
        {!loading && filteredAssignments.length > 0 && (
          <div className="grid gap-4">
            {filteredAssignments.map((assignment) => (
              <Paper
                key={assignment.id}
                className="cursor-pointer p-6 transition-shadow hover:shadow-md"
                onClick={() => navigate(`/assignments/${assignment.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                      <Badge variant={assignment.status === "PUBLISHED" ? "default" : "secondary"}>
                        {assignment.status}
                      </Badge>
                      {assignment.audienceType !== "COURSE" && (
                        <Badge variant="outline">{assignment.audienceType}</Badge>
                      )}
                    </div>
                    <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                      {assignment.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Max Points: {assignment.maxPoints}</span>
                      <span>Passing: {assignment.passingPoints}</span>
                      {assignment.dueDate && (
                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      )}
                      <span>Submissions: {assignment.submissions?.length || 0}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(assignment.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </Paper>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AssignmentContainer;
