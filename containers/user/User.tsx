// @ts-nocheck
import { AlertCircle, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteModal } from "@/containers/course/CourseActions/CourseActions";
import { useToast } from "@/context/ToastContext";
import { usePageTitle } from "@/hooks";
import { useDeleteUser, useUsers } from "@/hooks/queries/useEntities";
import { fetchRoles } from "@/services/authService";

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];
const sortOptions = [
  { value: "joined", label: "Newest First" },
  { value: "name", label: "Name A-Z" },
  { value: "email", label: "Email A-Z" },
];
const limit = 10;

const getRoleColor = (role) => {
  switch (role) {
    case "Administrator":
      return "red";
    case "Instructor":
      return "blue";
    case "Team Lead":
      return "orange";
    case "Student":
      return "green";
    default:
      return "gray";
  }
};

const UserContainer = () => {
  usePageTitle("Users");
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [roleOptions, setRoleOptions] = useState([{ value: "all", label: "All Roles" }]);

  const page = parseInt(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const roleFilter = searchParams.get("role") || "";
  const statusFilter = searchParams.get("status") || "";
  const sort = searchParams.get("sort") || "";
  const [searchInput, setSearchInput] = useState(search);

  // TanStack Query hooks
  const {
    data: usersResult,
    isLoading: usersLoading,
    error: usersError,
    refetch,
  } = useUsers({
    start: (page - 1) * limit,
    limit,
    sort,
  });
  const deleteMutation = useDeleteUser();

  // Process data with client-side filtering
  useEffect(() => {
    const processData = () => {
      if (!usersResult) return;

      try {
        const result = usersResult;
        let filtered = Array.isArray(result?.users)
          ? result.users
          : Array.isArray(result)
            ? result
            : [];
        if (roleFilter) filtered = filtered.filter((u) => u.role === roleFilter);
        if (statusFilter) filtered = filtered.filter((u) => String(u.status) === statusFilter);
        if (search) {
          const q = search.toLowerCase();
          filtered = filtered.filter(
            (u) =>
              (u.firstName || "").toLowerCase().includes(q) ||
              (u.lastName || "").toLowerCase().includes(q) ||
              (u.email || "").toLowerCase().includes(q)
          );
        }
        setUsers(filtered);
        setTotal(result?.total || result?.length || 0);
        setTotalPages(Math.ceil((result?.total || result?.length || 0) / limit) || 1);
      } catch (err) {
        setError(err.message || "Failed to load users");
      }
    };

    processData();
  }, [usersResult, roleFilter, statusFilter, search, limit, page, sort]);

  // Update error state from query
  useEffect(() => {
    if (usersError) {
      setError(usersError.message || "Failed to load users");
    }
  }, [usersError]);

  const loading = usersLoading;

  // Load roles
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const roles = await fetchRoles();
        setRoleOptions([
          { value: "all", label: "All Roles" },
          ...roles.map((r) => ({ value: r.name, label: r.name })),
        ]);
      } catch (err) {
        console.error(err);
      }
    };
    loadRoles();
  }, []);

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) newParams.delete(key);
      else newParams.set(key, value);
    });
    if (!updates.page) newParams.delete("page");
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(true);
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      addToast(`${deleteTarget.firstName} ${deleteTarget.lastName} deleted`, "error");
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <DashboardLayout title="Users" subtitle={`${total} user${total !== 1 ? "s" : ""} total`}>
        <div className="mb-4 flex items-center justify-end">
          <Button size="sm" onClick={() => navigate("/users/create")}>
            <Plus size={14} /> Add User
          </Button>
        </div>

        {error && (
          <div className="border-error/30 bg-error/5 text-error mb-4 flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <Paper className="mb-4 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <form className="flex flex-1 items-center gap-2" onSubmit={handleSearch}>
              <div className="relative flex-1">
                <Search
                  size={14}
                  className="text-text-muted absolute top-1/2 left-2.5 -translate-y-1/2"
                />
                <Input
                  placeholder="Search by name, email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-8"
                />
              </div>
            </form>
            <Select
              value={roleFilter}
              onValueChange={(v) => updateParams({ role: v === "all" ? "" : v, page: 1 })}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
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
            <Select value={sort} onValueChange={(v) => updateParams({ sort: v, page: 1 })}>
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

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-text-secondary text-sm">
              No users found. Try adjusting your filters or add a new user.
            </p>
            <Button size="sm" className="mt-4" onClick={() => navigate("/users/create")}>
              <Plus size={14} /> Add User
            </Button>
          </div>
        ) : (
          <>
            <Paper className="overflow-hidden">
              <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div
                            className="flex cursor-pointer items-center gap-2"
                            onClick={() => navigate(`/users/${user.id}`)}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar || "https://i.pravatar.cc/150?img=1"} />
                              <AvatarFallback>
                                {(user.firstName?.[0] || "U").toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-text-primary text-xs font-semibold">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-text-muted text-[11px]">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleColor(user.role)}>{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === 1 ? "green" : "gray"}>
                            {user.status === 1 ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-text-muted text-[11px]">
                          {user.created_at
                            ? new Date(user.created_at * 1000).toLocaleDateString()
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              className="border-border hover:bg-bg-surface-active text-text-secondary flex h-7 w-7 items-center justify-center rounded-md border"
                              onClick={() => navigate(`/users/${user.id}/edit`)}
                              title="Edit"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              className="border-border hover:bg-error/10 text-error flex h-7 w-7 items-center justify-center rounded-md border"
                              onClick={() => setDeleteTarget(user)}
                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Paper>

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
        )}
      </DashboardLayout>

      <DeleteModal
        open={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        itemName={deleteTarget ? `${deleteTarget.firstName} ${deleteTarget.lastName}` : ""}
        itemType="user"
        loading={actionLoading}
      />
    </>
  );
};

export default UserContainer;
