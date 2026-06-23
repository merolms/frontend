import {
  CheckSquare,
  Folder,
  Pencil,
  Plus,
  Search,
  Square,
  ToggleLeft,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

import { PermissionGuard } from "@/components/ProtectedRoute";
import { DeleteModal } from "@/containers/course/CourseActions/CourseActions";
import { useToast } from "@/context/ToastContext";
import { prepareCategoryData } from "@/utils/categoryUtils";
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
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/hooks/queries/useEntities";
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
  const { addToast } = useToast();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState(null);
  const limit = 10;

  // Fetch all categories for client-side filtering
  const {
    data: allCategories = [],
    isLoading,
    error: queryError,
    refetch,
  } = useCategories({ start: 0, limit: 100 });

  // Mutation hooks
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

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
    const preparedData = prepareCategoryData(formData);
    if (editingCat) {
      await updateMutation.mutateAsync({ id: editingCat.id, data: preparedData });
      addToast(`Category "${formData.name}" updated`, "success");
    } else {
      await createMutation.mutateAsync(preparedData);
      addToast(`Category "${formData.name}" created`, "success");
    }
    setFormOpen(false);
    setEditingCat(null);
    refetch();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      addToast(`Category "${deleteTarget.name}" deleted`, "success");
      refetch();
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
      refetch();
    } catch (err) {
      addToast(err.message || "Failed to update category status.", "error");
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(new Set(filteredData.map((c) => c.id)));
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

  const handleBulkActivate = async () => {
    try {
      const promises = Array.from(selectedIds).map((id) =>
        updateMutation.mutateAsync({ id, data: { status: 1 } })
      );
      await Promise.all(promises);
      addToast(
        `${selectedIds.size} categor${selectedIds.size === 1 ? "y" : "ies"} activated`,
        "success"
      );
      setSelectedIds(new Set());
      refetch();
    } catch (err) {
      addToast(err.message || "Failed to activate categories.", "error");
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      const promises = Array.from(selectedIds).map((id) =>
        updateMutation.mutateAsync({ id, data: { status: 0 } })
      );
      await Promise.all(promises);
      addToast(
        `${selectedIds.size} categor${selectedIds.size === 1 ? "y" : "ies"} deactivated`,
        "success"
      );
      setSelectedIds(new Set());
      refetch();
    } catch (err) {
      addToast(err.message || "Failed to deactivate categories.", "error");
    }
  };

  const handleBulkDelete = async () => {
    try {
      const promises = Array.from(selectedIds).map((id) => deleteMutation.mutateAsync(id));
      await Promise.all(promises);
      addToast(
        `${selectedIds.size} categor${selectedIds.size === 1 ? "y" : "ies"} deleted`,
        "success"
      );
      setSelectedIds(new Set());
      setBulkDeleteTarget(null);
      refetch();
    } catch (err) {
      addToast(err.message || "Failed to delete categories.", "error");
    }
  };

  const handleClear = () => {
    setSearchInput("");
    setSearch("");
    setStatusFilter("");
    setSort("");
    setPage(1);
  };

  // Client-side filtering, sorting, and pagination
  // Use allCategories.length instead of allCategories to prevent infinite loops
  const { filteredData, totalCount, totalPagesCount } = useMemo(() => {
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
      return {
        filteredData: data.slice((page - 1) * limit, page * limit),
        totalCount: filteredTotal,
        totalPagesCount: Math.ceil(filteredTotal / limit) || 1,
      };
    } else {
      // No filters - show paginated data
      return {
        filteredData: allCategories.slice((page - 1) * limit, page * limit),
        totalCount: allCategories.length,
        totalPagesCount: Math.ceil(allCategories.length / limit) || 1,
      };
    }
  }, [allCategories.length, search, statusFilter, sort, page, limit]);

  return (
    <>
      <DashboardLayout
        title="Categories"
        subtitle={`${totalCount} categor${totalCount === 1 ? "y" : "ies"} total`}
      >
        {/* Analytics Summary */}
        <div className="mb-4 grid grid-cols-3 gap-4">
          <Paper className="p-4">
            <div className="text-text-muted text-xs">Total Categories</div>
            <div className="text-text-primary text-2xl font-semibold">{allCategories.length}</div>
          </Paper>
          <Paper className="p-4">
            <div className="text-text-muted text-xs">Active Categories</div>
            <div className="text-text-primary text-2xl font-semibold">
              {allCategories.filter((c) => c.status === 1).length}
            </div>
          </Paper>
          <Paper className="p-4">
            <div className="text-text-muted text-xs">Inactive Categories</div>
            <div className="text-text-primary text-2xl font-semibold">
              {allCategories.filter((c) => c.status === 0).length}
            </div>
          </Paper>
        </div>

        {/* Action bar */}
        <div className="mb-4 flex items-center justify-between">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-text-muted text-xs">{selectedIds.size} selected</span>
              <Button size="sm" variant="default" onClick={handleBulkActivate}>
                Activate
              </Button>
              <Button size="sm" variant="default" onClick={handleBulkDeactivate}>
                Deactivate
              </Button>
              <PermissionGuard permissions={["category.delete"]}>
                <Button size="sm" variant="danger" onClick={() => setBulkDeleteTarget(true)}>
                  Delete
                </Button>
              </PermissionGuard>
            </div>
          )}
          <PermissionGuard permissions={["category.create"]}>
            <Button size="sm" onClick={handleCreate} disabled={isLoading}>
              <Plus size={14} /> New Category
            </Button>
          </PermissionGuard>
        </div>

        {/* Error */}
        {queryError && (
          <FormErrorBanner message={queryError?.message || "Failed to load categories"} />
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
          {isLoading ? (
            <div className="space-y-3 p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="bg-bg-surface h-8 w-8 animate-pulse rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="bg-bg-surface h-4 animate-pulse rounded" />
                    <div className="bg-bg-surface h-3 w-3/4 animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredData.length === 0 ? (
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
                  <th className="px-4 py-2.5 text-center">
                    <button
                      onClick={() => handleSelectAll(selectedIds.size !== filteredData.length)}
                      className="text-text-muted hover:text-text-primary"
                    >
                      {selectedIds.size === filteredData.length && filteredData.length > 0 ? (
                        <CheckSquare size={16} />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
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
                    Created
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
                {filteredData.map((cat) => (
                  <tr
                    key={cat.id}
                    className={`hover:bg-bg-surface-hover transition-colors ${cat.status === 0 ? "opacity-60" : ""}`}
                  >
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleSelectOne(cat.id, !selectedIds.has(cat.id))}
                        className="text-text-muted hover:text-text-primary"
                      >
                        {selectedIds.has(cat.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                    </td>
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
                      {cat.createdAt ? new Date(cat.createdAt * 1000).toLocaleDateString() : "—"}
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

        {totalPagesCount > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination total={totalPagesCount} value={page} onChange={setPage} />
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
        <DeleteModal
          open={!!bulkDeleteTarget}
          onConfirm={handleBulkDelete}
          onCancel={() => {
            setBulkDeleteTarget(false);
            setSelectedIds(new Set());
          }}
          itemName={`${selectedIds.size} categor${selectedIds.size === 1 ? "y" : "ies"}`}
          itemType="categories"
          loading={deleteMutation.isPending}
        />
      </DashboardLayout>
    </>
  );
};

export default CategoryManagement;
