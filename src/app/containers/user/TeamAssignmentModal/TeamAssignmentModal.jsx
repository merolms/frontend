import { Check, Loader, Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { fetchTeams } from "@/app/services/teamService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { t } from "@/styles/theme";

const TeamAssignmentModal = ({ open, onClose, user }) => {
  const [teams, setTeams] = useState([]);
  const [assignedTeams, setAssignedTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && user) {
      setAssignedTeams(user.teams ? [...user.teams] : []);
      loadTeams();
    }
  }, [open, user]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await fetchTeams();
      setTeams(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load teams.");
    } finally {
      setLoading(false);
    }
  };
  const isAssigned = (teamName) => assignedTeams.includes(teamName);

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            Assign Teams — {user.firstName} {user.lastName}
          </DialogTitle>
        </DialogHeader>
        {error && <p className="text-error mb-2 text-xs">{error}</p>}
        {loading ? (
          <Loader size={14} className="text-text-muted mt-2 animate-spin" />
        ) : teams.length === 0 ? (
          <p className="text-text-muted text-xs">No teams available.</p>
        ) : (
          <div className="space-y-2">
            {teams.map((team) => (
              <div
                key={team.id}
                className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2"
                style={{ border: `1px solid ${t("border-primary")}` }}
                onClick={() => setError("Team assignment is not yet supported by the backend.")}
              >
                <div className="flex items-center gap-2">
                  <Users
                    size={14}
                    className={isAssigned(team.name) ? "text-success" : "text-text-muted"}
                  />
                  <p className="text-text-primary text-xs font-medium">{team.name}</p>
                </div>
                {isAssigned(team.name) ? (
                  <Badge variant="green" className="text-[10px]">
                    <Check size={8} /> Assigned
                  </Badge>
                ) : (
                  <Badge variant="gray" className="text-[10px]">
                    <Plus size={8} /> Assign
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <Button variant="default" onClick={onClose} disabled={saving}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamAssignmentModal;
