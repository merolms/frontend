import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, Pencil, Plus, Trash2, Loader, ChevronRight } from "lucide-react";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Paper } from "@/components/ui/card";
import TeamMemberAssignModal from "@/app/containers/team/TeamMemberAssignModal/TeamMemberAssignModal";
import { DeleteModal } from "@/app/containers/course/CourseActions/CourseActions";
import { fetchTeamById, fetchTeamMembers, deleteTeam } from "@/app/services/teamService";
import { useToast } from "@/app/context/ToastContext";
import { t } from "@/styles/theme";

const TeamDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToast } = useToast();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tData, mData] = await Promise.all([fetchTeamById(id), fetchTeamMembers(id)]);
      setTeam(tData);
      setMembers(mData || []);
    } catch (err) {
      setError(err.message || "Failed to load team");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await deleteTeam(id);
      addToast(`Team "${team?.name}" deleted`, "error");
      navigate("/teams");
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

  if (error || !team) {
    return (
      <DashboardLayout>
        <div className="text-error flex items-center gap-2 py-4">
          <AlertCircle size={14} /> {error || "Team not found"}
        </div>
        <Button size="sm" onClick={() => navigate("/teams")}>
          Back to Teams
        </Button>
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardLayout title={team.name} subtitle={team.description}>
        <div className="text-text-muted mb-4 flex items-center gap-1 text-xs">
          <button onClick={() => navigate("/teams")} className="text-primary hover:underline">
            Teams
          </button>
          <ChevronRight size={12} />
          <span>{team.name}</span>
        </div>

        {/* Actions */}
        <div className="mb-4 flex items-center justify-end gap-2">
          <Button size="sm" onClick={() => setShowMemberModal(true)}>
            <Plus size={14} /> Add Member
          </Button>
          <Button variant="default" size="sm" onClick={() => navigate(`/teams/${id}/edit`)}>
            <Pencil size={14} /> Edit
          </Button>
          <Button variant="default" size="sm" onClick={() => setDeleteTarget(team)}>
            <Trash2 size={14} /> Delete
          </Button>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <Badge variant={team.status === 1 ? "green" : "gray"}>
            {team.status === 1 ? "Active" : "Inactive"}
          </Badge>
          <span className="text-text-muted text-xs">
            {members.length} member{members.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8">
            <Paper className="p-6">
              <h3 className="text-text-primary mb-3 text-sm font-semibold">
                Team Members ({members.length})
              </h3>
              {members.length === 0 ? (
                <p className="text-text-muted text-xs">No members yet.</p>
              ) : (
                <div className="space-y-2">
                  {members.map((m) => {
                    const userId = m.userID || m.userId;
                    return (
                      <div
                        key={userId}
                        className="flex items-center justify-between rounded-lg p-3"
                        style={{ background: t("bg-secondary") }}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={m.avatar} />
                            <AvatarFallback>
                              {(m.userName?.[0] || "U").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-text-primary text-xs font-semibold">
                              {m.userName || "Unknown"}
                            </div>
                            <div className="text-text-muted text-[11px]">{m.userEmail}</div>
                          </div>
                        </div>
                        <Badge>{m.role || "—"}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </Paper>
          </div>
          <div className="col-span-4">
            <Paper className="p-6">
              <h3 className="text-text-primary mb-3 text-sm font-semibold">Quick Info</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-text-primary text-xs font-semibold">Status</div>
                  <Badge variant={team.status === 1 ? "green" : "gray"}>
                    {team.status === 1 ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <div className="text-text-primary text-xs font-semibold">Members</div>
                  <div className="text-text-muted text-xs">{members.length}</div>
                </div>
              </div>
            </Paper>
          </div>
        </div>
      </DashboardLayout>

      {showMemberModal && (
        <TeamMemberAssignModal
          open={showMemberModal}
          onClose={() => setShowMemberModal(false)}
          team={team}
          onUpdated={loadData}
        />
      )}
      <DeleteModal
        open={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        itemName={deleteTarget?.name}
        itemType="team"
        loading={actionLoading}
      />
    </>
  );
};

export default TeamDetail;
