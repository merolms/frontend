import { ChevronRight, Clock, Download, Layers, Plus, Search, Sparkles, Star, Upload, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { fetchLearningPaths, getLearningPathCategories } from "@/app/services/learningPathService";
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
import { usePageTitle } from "@/hooks";

const difficultyColors = {
  Beginner: "green",
  Intermediate: "blue",
  Advanced: "orange",
  "Beginner to Advanced": "purple",
};

const LearningPathCard = ({ path, navigate, onExport }) => {
  const gradientStyle = {
    background: `linear-gradient(135deg, ${path.color}22 0%, ${path.color}44 100%)`,
    borderLeft: `4px solid ${path.color}`,
  };

  return (
    <div
      className="border-border bg-bg-surface group cursor-pointer overflow-hidden rounded-xl border shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      {/* Header with gradient */}
      <div className="relative p-5 pb-3" style={gradientStyle}>
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1 cursor-pointer" onClick={() => navigate(`/learning-paths/${path.id}`)}>
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExport(path);
            }}
            className="text-text-muted hover:text-primary transition-colors"
            title="Export learning path"
          >
            <Download size={16} />
          </button>
        </div>
        <p className="text-text-muted mt-2 line-clamp-2 text-xs">{path.description}</p>
      </div>

      {/* Course preview strip */}
      <div className="border-border bg-bg-surface-hover border-t px-5 py-3 transition-colors group-hover:bg-bg-surface">
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
      <div className="border-border flex items-center justify-between border-t px-5 py-3 transition-colors group-hover:bg-bg-surface">
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
  usePageTitle("Learning Paths");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState(["All Categories"]);

  const page = parseInt(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const [searchInput, setSearchInput] = useState(search);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [data, cats] = await Promise.all([
        fetchLearningPaths({ search, category, page, limit: 6 }),
        getLearningPathCategories(),
      ]);
      setPaths(data.paths);
      setTotalPages(data.totalPages);
      setTotal(data.total);
      setCategories(cats);
    } catch (err) {
      setError("Failed to load learning paths.");
    } finally {
      setLoading(false);
    }
  }, [search, category, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
  };

  const handleExportAll = () => {
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
        setError("Invalid file format. Please upload a valid JSON file.");
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
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportAll}
              >
                <Download size={14} /> Export All
              </Button>
            </>
          )}
          <Button size="sm" onClick={() => navigate("/learning-paths/create")}>
            <Plus size={14} /> Create Learning Path
          </Button>
        </div>
      </div>

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
            />
          </div>
          <Select
            value={category || "all"}
            onValueChange={(v) => updateParams({ category: v === "all" ? "" : v, page: 1 })}
          >
            <SelectTrigger className="w-40">
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
          {(search || category) && (
            <Button variant="default" size="sm" onClick={handleClear}>
              Clear
            </Button>
          )}
        </div>
      </Paper>

      {/* Grid */}
      {loading ? (
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
            {paths.map((path) => (
              <LearningPathCard key={path.id} path={path} navigate={navigate} onExport={handleExportPath} />
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
