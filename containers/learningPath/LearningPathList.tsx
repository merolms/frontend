import {
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Clock,
  Download,
  Layers,
  Plus,
  Search,
  Sparkles,
  Star,
  Upload,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useToast } from "@/context/ToastContext";
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
import { usePageTitle } from "@/hooks";
import { useLearningPathCategories, useLearningPaths } from "@/hooks/queries/useEntities";

const difficultyColors = {
  Beginner: "green",
  Intermediate: "blue",
  Advanced: "orange",
  "Beginner to Advanced": "purple",
};

const LearningPathCard = ({ path, navigate, onExport, onBookmark, isBookmarked, exporting }) => {
  const gradientStyle = {
    background: `linear-gradient(135deg, ${path.color}22 0%, ${path.color}44 100%)`,
    borderLeft: `4px solid ${path.color}`,
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(`/learning-paths/${path.id}`);
    }
  };

  return (
    <div
      className="border-border bg-bg-surface group focus-within:ring-primary/50 cursor-pointer overflow-hidden rounded-xl border shadow-sm transition-all duration-300 focus-within:ring-2 hover:-translate-y-1 hover:shadow-lg"
      tabIndex={0}
      role="button"
      onKeyDown={handleKeyDown}
      aria-label={`View learning path: ${path.title}`}
    >
      {/* Header with gradient */}
      <div className="relative p-5 pb-3" style={gradientStyle}>
        <div className="flex items-start justify-between">
          <div
            className="min-w-0 flex-1 cursor-pointer"
            onClick={() => navigate(`/learning-paths/${path.id}`)}
          >
            <div className="mb-2 flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
                style={{ background: `${path.color}30` }}
              >
                <Layers size={16} style={{ color: path.color }} />
              </div>
              <Badge variant="default" className="text-[10px]">
                {path.category}
              </Badge>
              <Badge variant={difficultyColors[path.difficulty] || "gray"} className="text-[10px]">
                {path.difficulty}
              </Badge>
            </div>
            <h3 className="text-text-primary group-hover:text-primary line-clamp-1 text-base font-bold transition-colors">
              {path.title}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmark(path.id);
              }}
              className="text-text-muted hover:text-primary transition-colors"
              title={isBookmarked ? "Remove bookmark" : "Bookmark learning path"}
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark learning path"}
              aria-pressed={isBookmarked}
            >
              {isBookmarked ? (
                <BookmarkCheck size={16} className="text-primary" />
              ) : (
                <Bookmark size={16} />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExport(path);
              }}
              className="text-text-muted hover:text-primary transition-colors disabled:opacity-50"
              title="Export learning path"
              aria-label="Export learning path"
              disabled={exporting}
            >
              {exporting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Download size={16} />
              )}
            </button>
          </div>
        </div>
        <p className="text-text-muted mt-2 line-clamp-2 text-xs">{path.description}</p>
      </div>

      {/* Course preview strip */}
      <div className="border-border bg-bg-surface-hover group-hover:bg-bg-surface border-t px-5 py-3 transition-colors">
        <div className="mb-2 flex items-center gap-1">
          <span className="text-text-secondary text-[11px] font-semibold">
            {path.totalCourses} Courses
          </span>
          <span className="text-text-muted text-[11px]">·</span>
          <span className="text-text-muted text-[11px]">{path.estimatedDuration}</span>
        </div>
        {/* Course strip */}
        <div className="flex items-center gap-1.5 overflow-hidden">
          {(path.courses ?? []).slice(0, 4).map((course, idx) => (
            <div key={course.id} className="flex flex-shrink-0 items-center gap-1.5">
              <div className="bg-bg-surface border-border flex h-7 w-7 items-center justify-center rounded-md border shadow-sm transition-transform group-hover:scale-110">
                <span className="text-text-secondary text-[10px] font-bold">{idx + 1}</span>
              </div>
              {idx < Math.min(path.courses?.length ?? 0, 4) - 1 && (
                <ChevronRight size={10} className="text-text-muted flex-shrink-0" />
              )}
            </div>
          ))}
          {(path.courses?.length ?? 0) > 4 && (
            <div className="bg-bg-surface-active border-border flex h-7 w-7 items-center justify-center rounded-md border">
              <span className="text-text-muted text-[10px] font-bold">
                +{(path.courses?.length ?? 0) - 4}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer stats */}
      <div className="border-border group-hover:bg-bg-surface flex items-center justify-between border-t px-5 py-3 transition-colors">
        <div className="text-text-muted flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1">
            <Users size={11} /> {path.enrolledCount}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} /> {path.estimatedDuration}
          </span>
          {path.rating > 0 && (
            <span className="flex items-center gap-1">
              <Star size={11} className="text-warning" /> {path.rating}
            </span>
          )}
        </div>
        <ChevronRight
          size={14}
          className="text-text-muted group-hover:text-primary transition-colors group-hover:translate-x-1"
        />
      </div>
    </div>
  );
};

const LearningPathList = () => {
  const { addToast } = useToast();
  usePageTitle("Learning Paths");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const showBookmarked = searchParams.get("bookmarked") === "true";
  const [searchInput, setSearchInput] = useState(search);

  const { data, isLoading } = useLearningPaths({ search, category, page, limit: 6 });
  const { data: catsData } = useLearningPathCategories();

  const paths = data?.paths ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;
  const categories = catsData ?? ["All Categories"];

  const [bookmarkedPaths, setBookmarkedPaths] = useState(new Set());
  const [exporting, setExporting] = useState(false);

  // Load bookmarks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("bookmarkedLearningPaths");
    if (saved) {
      setBookmarkedPaths(new Set(JSON.parse(saved)));
    }
  }, []);

  const toggleBookmark = (pathId) => {
    setBookmarkedPaths((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pathId)) {
        newSet.delete(pathId);
      } else {
        newSet.add(pathId);
      }
      localStorage.setItem("bookmarkedLearningPaths", JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateParams({ search: searchInput, page: 1 });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, search]);

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value && value !== 0) newParams.delete(key);
      else newParams.set(key, value);
    });
    if (!updates.page && !newParams.has("page")) newParams.delete("page");
    setSearchParams(newParams);
  };

  const handleClear = () => {
    setSearchInput("");
    setSearchParams(new URLSearchParams());
  };

  const handleExportPath = (path) => {
    setExporting(true);
    const exportData = {
      title: path.title,
      description: path.description,
      category: path.category,
      difficulty: path.difficulty,
      estimatedDuration: path.estimatedDuration,
      color: path.color,
      courses: path.courses,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${path.title.replace(/\s+/g, "-").toLowerCase()}-learning-path.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setTimeout(() => setExporting(false), 500);
  };

  const handleExportAll = () => {
    setExporting(true);
    const exportData = {
      paths: paths,
      exportedAt: new Date().toISOString(),
      total: paths.length,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `all-learning-paths-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setTimeout(() => setExporting(false), 500);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.title) {
          // Single learning path import
          navigate("/learning-paths/create", { state: { importedData: data } });
        } else if (data.paths) {
          // Bulk import - navigate to create with first path
          navigate("/learning-paths/create", { state: { importedData: data.paths[0] } });
        }
      } catch (err) {
        addToast("Invalid file format. Please upload a valid JSON file.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <DashboardLayout
      title="Learning Paths"
      subtitle={`${total} learning path${total !== 1 ? "s" : ""} to guide your journey`}
    >
      {/* Action bar */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-primary" />
          <span className="text-text-muted text-sm">Curated learning journeys</span>
        </div>
        <div className="flex items-center gap-2">
          {paths.length > 0 && (
            <>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="import-learning-path"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("import-learning-path").click()}
              >
                <Upload size={14} /> Import
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportAll} disabled={exporting}>
                {exporting ? (
                  <div className="mr-1 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Download size={14} className="mr-1" />
                )}
                Export All
              </Button>
            </>
          )}
          <Button size="sm" onClick={() => navigate("/learning-paths/create")}>
            <Plus size={14} /> Create Learning Path
          </Button>
        </div>
      </div>

      {/* Recommendations */}
      {!showBookmarked && !search && !category && paths.length > 0 && (
        <Paper className="mb-4 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles size={14} className="text-primary" />
            <h3 className="text-text-primary text-sm font-semibold">Recommended for You</h3>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {paths
              .filter((p) => !bookmarkedPaths.has(p.id))
              .slice(0, 3)
              .map((path) => (
                <button
                  key={path.id}
                  onClick={() => navigate(`/learning-paths/${path.id}`)}
                  className="border-border bg-bg-surface-hover hover:bg-bg-surface-active rounded-lg border p-3 text-left transition-colors"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-6 w-6 rounded" style={{ background: path.color }} />
                    <span className="text-text-primary line-clamp-1 text-xs font-semibold">
                      {path.title}
                    </span>
                  </div>
                  <p className="text-text-muted line-clamp-2 text-[10px]">{path.description}</p>
                  <div className="text-text-muted mt-2 flex items-center gap-2 text-[10px]">
                    <span>{path.category}</span>
                    <span>·</span>
                    <span>{path.difficulty}</span>
                  </div>
                </button>
              ))}
          </div>
        </Paper>
      )}

      {/* Filters */}
      <Paper className="mb-4 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1">
            <Search
              size={14}
              className="text-text-muted absolute top-1/2 left-2.5 -translate-y-1/2"
            />
            <Input
              placeholder="Search learning paths..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-8"
              aria-label="Search learning paths"
            />
          </div>
          <Select
            value={category || "all"}
            onValueChange={(v) => updateParams({ category: v === "all" ? "" : v, page: 1 })}
          >
            <SelectTrigger className="w-40" aria-label="Filter by category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c === "All Categories" ? "all" : c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={showBookmarked ? "default" : "outline"}
            size="sm"
            onClick={() => updateParams({ bookmarked: showBookmarked ? "" : "true", page: 1 })}
          >
            {showBookmarked ? (
              <BookmarkCheck size={14} className="mr-1" />
            ) : (
              <Bookmark size={14} className="mr-1" />
            )}
            {showBookmarked ? "Bookmarked" : "Bookmarks"}
          </Button>
          {(search || category) && (
            <Button variant="default" size="sm" onClick={handleClear}>
              Clear
            </Button>
          )}
        </div>
      </Paper>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="border-border bg-bg-surface h-56 animate-pulse rounded-xl border p-5"
            >
              <div className="bg-bg-surface-active mb-3 h-8 w-8 rounded-lg" />
              <div className="bg-bg-surface-active mb-2 h-4 w-3/4 rounded" />
              <div className="bg-bg-surface-active mb-2 h-3 w-full rounded" />
              <div className="bg-bg-surface-active mb-4 h-3 w-2/3 rounded" />
              <div className="bg-bg-surface-active mt-auto h-8 w-full rounded" />
            </div>
          ))}
        </div>
      ) : showBookmarked && paths.filter((p) => bookmarkedPaths.has(p.id)).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-bg-surface-hover border-border mb-4 flex h-20 w-20 items-center justify-center rounded-full border">
            <Bookmark size={40} className="text-text-muted" />
          </div>
          <p className="text-text-secondary text-base font-semibold">
            No bookmarked learning paths.
          </p>
          <p className="text-text-muted mt-2 text-sm">
            Bookmark learning paths to save them for later.
          </p>
        </div>
      ) : paths.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-bg-surface-hover border-border mb-4 flex h-20 w-20 items-center justify-center rounded-full border">
            <Layers size={40} className="text-text-muted" />
          </div>
          <p className="text-text-secondary text-base font-semibold">No learning paths found.</p>
          <p className="text-text-muted mt-2 text-sm">
            Try adjusting your filters or create a new learning path.
          </p>
          <Button size="sm" className="mt-4" onClick={() => navigate("/learning-paths/create")}>
            <Plus size={14} /> Create Learning Path
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paths
              .filter((p) => !showBookmarked || bookmarkedPaths.has(p.id))
              .map((path) => (
                <LearningPathCard
                  key={path.id}
                  path={path}
                  navigate={navigate}
                  onExport={handleExportPath}
                  onBookmark={toggleBookmark}
                  isBookmarked={bookmarkedPaths.has(path.id)}
                  exporting={exporting}
                />
              ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
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
  );
};

export default LearningPathList;
