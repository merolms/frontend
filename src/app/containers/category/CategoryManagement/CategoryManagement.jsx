import { Folder, Pencil, Plus, Search, ToggleLeft, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { PermissionGuard } from "@/app/components/ProtectedRoute/ProtectedRoute";
import { DeleteModal } from "@/app/containers/course/CourseActions/CourseActions";
import { useToast } from "@/app/context/ToastContext";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/queries/useEntities";
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
import { t } from "@/styles/theme";

import CategoryForm from "../components/CategoryForm";

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
  const [filteredCategories, setFilteredCategories] = useState([]);
  const limit = 10;

  // Fetch all categories for client-side filtering
  const { data: allCategories = [], isLoading, error, refetch } = useCategories({ start: 0, limit: 500 });

  // Mutation hooks
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  // Client-side filtering, sorting, and pagination
  useEffect(() => {
    const hasFilters = Boolean(search || statusFilter || sort);
    let data = [...allCategories];

    if (hasFilters) {
      // Apply filters
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

      const filteredTotal = data.length;
      setFilteredCategories(data.slice((page - 1) * limit, page * limit));
      setTotal(filteredTotal);
      setTotalPages(Math.ceil(filteredTotal / limit) || 1);
    } else {
      // Server-side pagination for plain browsing
      const start = (page - 1) * limit;
      setFilteredCategories(data.slice(start, start + limit));
      setTotal(data.length);
      setTotalPages(Math.ceil(data.length / limit) || 1);
    }
  }, [allCategories, search, statusFilter, sort, page]);

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
    try {
      if (editingCat) {
        await updateMutation.mutateAsync({ id: editingCat.id, data: formData });
        addToast(`Category "${formData.name}" updated`, "success");
      } else {
        await createMutation.mutateAsync(formData);
        addToast(`Category "${formData.name}" created`, "success");
      }
      setFormOpen(false);
      setEditingCat(null);
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      addToast(`Category "${deleteTarget.name}" deleted`, "success");
    } catch (err) {
      addToast(err.message || "Failed to delete category.", "error");
    }
  };

  const handleToggleStatus = async (cat) => {
    try {
      const newStatus = cat.status === 1 ? 0 : 1;
      await updateMutation.mutateAsync({ id: cat.id, data: { status: newStatus } });
      addToast(
        `Category "${cat.name}" ${newStatus === 1 ? "activated" : "deactivated"}`,
        "success"
      );
    } catch (err) {
      addToast(err.message || "Failed to update category status.", "error");
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
          <PermissionGuard permissions={["category.create"]}>
            <Button size="sm" onClick={handleCreate} disabled={isLoading}>
              <Plus size={14} /> New Category
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
          {isLoading ? (
            <LoadingState count={5} height="h-12" className="p-4" />
          ) : filteredCategories.length === 0 ? (
            <EmptyState
              icon={<Folder size={48} className="text-text-muted" />}
              title="No categories found"
              description="Try adjusting your filters or create a new category."
              action={
                <PermissionGuard permissions={["category.create"]}>
                  <Button size="sm" onClick={handleCreate}>
                    <Plus size={14} /> Create First Category
                  </Button>
                </PermissionGuard>
              }
            />
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
                {filteredCategories.map((cat) => (
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
                        <PermissionGuard permissions={["category.edit"]}>
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
                          <ToggleLeft size={12} />
                        </button>
                        <PermissionGuard permissions={["category.delete"]}>
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
            loading={editingCat ? updateMutation.isPending : createMutation.isPending}
          />
        )}
        <DeleteModal
          open={!!deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          itemName={deleteTarget?.name}
          itemType="category"
          loading={deleteMutation.isPending}
        />
      </DashboardLayout>
    </>
  );
};

export default CategoryManagement;
