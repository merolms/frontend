import {
  AlertCircle,
  Calendar,
  ChevronRight,
  Loader,
  Mail,
  Pencil,
  Phone,
  Trash2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { DeleteModal } from "@/app/containers/course/CourseActions/CourseActions";
import { useToast } from "@/app/context/ToastContext";
import { deleteUser, fetchUserById } from "@/app/services/userService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Paper } from "@/components/ui/card";
import DashboardLayout from "@/components/ui/dashboard-layout";

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

const UserDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadUser = async () => {
    try {
      setLoading(true);
      const data = await fetchUserById(id);
      setUser(data);
    } catch (err) {
      setError(err.message || "Failed to load user.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadUser();
  }, [id]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(true);
      await deleteUser(deleteTarget.id);
      addToast(`${deleteTarget.firstName} ${deleteTarget.lastName} deleted`, "error");
      navigate("/users");
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader className="text-text-muted animate-spin" size={20} />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !user) {
    return (
      <DashboardLayout>
        <div className="text-error flex items-center gap-2 py-4">
          <AlertCircle size={14} /> {error || "User not found"}
        </div>
        <Button size="sm" onClick={() => navigate("/users")}>
          Back to Users
        </Button>
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardLayout title={`${user.firstName} ${user.lastName}`} subtitle="User details">
        <div className="text-text-muted mb-4 flex items-center gap-1 text-xs">
          <button onClick={() => navigate("/users")} className="text-primary hover:underline">
            Users
          </button>
          <ChevronRight size={12} />
          <span>
            {user.firstName} {user.lastName}
          </span>
        </div>

        <Paper className="max-w-2xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-base">
                  {(user.firstName?.[0] || "U").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-text-primary text-lg font-bold">
                  {user.firstName} {user.lastName}
                </h2>
                <Badge variant={getRoleColor(user.role)} className="mt-1">
                  {user.role}
                </Badge>
                <div className="text-text-muted mt-3 flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <Mail size={12} /> {user.email}
                  </span>
                  {user.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={12} /> {user.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />{" "}
                    {user.created_at ? new Date(user.created_at * 1000).toLocaleDateString() : "—"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="default" size="sm" onClick={() => navigate(`/users/${id}/edit`)}>
                <Pencil size={14} /> Edit
              </Button>
              <Button variant="default" size="sm" onClick={() => setDeleteTarget(user)}>
                <Trash2 size={14} /> Delete
              </Button>
            </div>
          </div>
        </Paper>
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

export default UserDetail;
