import { AlertCircle, Folder, Pencil, Plus, Search, Trash2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { PermissionGuard } from "@/app/components/ProtectedRoute/ProtectedRoute";
import { DeleteModal } from "@/app/containers/course/CourseActions/CourseActions";
import { useToast } from "@/app/context/ToastContext";
import {
  createCategory,
  deleteCategory,
  fetchCategoriesWithPagination,
  toggleCategoryStatus,
  updateCategory,
} from "@/app/services/categoryService";
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
import { Skeleton } from "@/components/ui/skeleton";
import { t } from "@/styles/theme";

import CategoryForm from "../components/CategoryForm";

export { deleteCategory, fetchCategoriesWithPagination, toggleCategoryStatus };

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];
const sortOptions = [
  { value: "all", label: "Default" },
  { value: "name", label: "Name A-Z" },
  { value: "recent", label: "Recently Updated" },
];

const CategoryManagement = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const limit = 10;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const start = (page - 1) * limit;
      let { categories: data, total: totalCount } = await fetchCategoriesWithPagination({
        start,
        limit,
      });
      if (search) {
        const q = search.toLowerCase();
        data = data.filter(
          (c) =>
            (c.name || "").toLowerCase().includes(q) ||
            (c.description || "").toLowerCase().includes(q)
        );
      }
      if (statusFilter) {
        data = data.filter((c) => String(c.status) === statusFilter);
      }
      if (sort === "name") data.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      else if (sort === "recent") data.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      setCategories(data);
      setTotal(totalCount);
      setTotalPages(Math.ceil(totalCount / limit) || 1);
    } catch (err) {
      setError(err.message || "Failed to load categories");
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
    setEditingCat(null);
    setFormOpen(true);
  };
  const handleEdit = (cat) => {
    setEditingCat(cat);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setActionLoading(true);
    try {
      if (editingCat) {
        await updateCategory(editingCat.id, formData);
        addToast(`Category "${formData.name}" updated`, "success");
      } else {
        await createCategory(formData);
        addToast(`Category "${formData.name}" created`, "success");
      }
      setFormOpen(false);
      setEditingCat(null);
      await fetchData();
    } catch (err) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(true);
      await deleteCategory(deleteTarget.id);
      setDeleteTarget(null);
      addToast(`Category "${deleteTarget.name}" deleted`, "error");
      await fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (cat) => {
    try {
      await toggleCategoryStatus(cat.id);
      await fetchData();
    } catch (err) {
      alert(err.message);
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
        title="Categories"
        subtitle={`${total} categor${total === 1 ? "y" : "ies"} total`}
      >
        {/* Action bar */}
        <div className="mb-4 flex items-center justify-end">
          <PermissionGuard permissions={["courses.create"]}>
            <Button size="sm" onClick={handleCreate}>
              <Plus size={14} /> New Category
            </Button>
          </PermissionGuard>
        </div>

        {/* Error */}
        {error && (
          <div className="text-error mb-4 flex items-center gap-2 text-sm">
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
                  placeholder="Search categories..."
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
            <div className="space-y-2 p-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Folder size={48} className="text-text-muted mb-3" />
              <p className="text-text-primary text-sm font-medium">No categories found</p>
              <p className="text-text-muted mt-1 text-xs">
                Try adjusting your filters or create a new category.
              </p>
              <PermissionGuard permissions={["courses.create"]}>
                <Button size="sm" className="mt-4" onClick={handleCreate}>
                  <Plus size={14} /> Create First Category
                </Button>
              </PermissionGuard>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b">
                  <th className="text-text-muted px-4 py-2.5 text-left text-xs font-medium">
                    Category
                  </th>
                  <th className="text-text-muted px-4 py-2.5 text-left text-xs font-medium">
                    Description
                  </th>
                  <th className="text-text-muted px-4 py-2.5 text-center text-xs font-medium">
                    Courses
                  </th>
                  <th className="text-text-muted px-4 py-2.5 text-left text-xs font-medium">
                    Status
                  </th>
                  <th className="text-text-muted px-4 py-2.5 text-left text-xs font-medium">
                    Updated
                  </th>
                  <th className="text-text-muted px-4 py-2.5 text-center text-xs font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {categories.map((cat) => (
                  <tr
                    key={cat.id}
                    className={`hover:bg-bg-surface-hover transition-colors ${cat.status === 0 ? "opacity-60" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-2 w-2 rounded"
                          style={{ background: cat.color || t("accent") }}
                        />
                        <div>
                          <span className="text-text-primary text-xs font-semibold">
                            {cat.name}
                          </span>
                          {cat.slug && <p className="text-text-muted text-[11px]">{cat.slug}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="text-text-muted px-4 py-3 text-xs">{cat.description || "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={(cat.courseCount || 0) > 0 ? "blue" : "gray"}>
                        {cat.courseCount || 0}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={cat.status === 1 ? "green" : "gray"}>
                        {cat.status === 1 ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="text-text-muted px-4 py-3 text-[11px]">
                      {cat.updatedAt ? new Date(cat.updatedAt * 1000).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <PermissionGuard permissions={["courses.edit"]}>
                          <button
                            className="border-border hover:bg-bg-surface-active text-text-secondary flex h-7 w-7 items-center justify-center rounded-md border"
                            onClick={() => handleEdit(cat)}
                            title="Edit"
                          >
                            <Pencil size={12} />
                          </button>
                        </PermissionGuard>
                        <button
                          className="border-border hover:bg-bg-surface-active text-text-secondary flex h-7 w-7 items-center justify-center rounded-md border"
                          onClick={() => handleToggleStatus(cat)}
                          title={cat.status === 1 ? "Deactivate" : "Activate"}
                        >
                          <Trash2 size={12} />
                        </button>
                        <PermissionGuard permissions={["courses.delete"]}>
                          <button
                            className="border-border hover:bg-error/10 text-error flex h-7 w-7 items-center justify-center rounded-md border"
                            onClick={() => setDeleteTarget(cat)}
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

        {formOpen && (
          <CategoryForm
            category={editingCat}
            onSubmit={handleFormSubmit}
            onClose={() => {
              setFormOpen(false);
              setEditingCat(null);
            }}
            loading={actionLoading}
          />
        )}
        <DeleteModal
          open={!!deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          itemName={deleteTarget?.name}
          itemType="category"
          loading={actionLoading}
        />
      </DashboardLayout>
    </>
  );
};

export default CategoryManagement;
