import { ArrowLeft, Paperclip, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
  getAssignmentById,
  submitAssignment,
  submitTeamAssignment,
} from "@/app/services/assignmentService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Paper } from "@/components/ui/card";
import DashboardLayout from "@/components/ui/dashboard-layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const AssignmentSubmit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useSelector((s) => s.auth.user);

  const [assignment, setAssignment] = useState(null);
  const [formData, setFormData] = useState({
    content: "",
    attachmentURLs: "",
    teamId: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isTeamAssignment, setIsTeamAssignment] = useState(false);

  useEffect(() => {
    loadAssignment();
  }, [id]);

  const loadAssignment = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAssignmentById(id);
      setAssignment(data);
      setIsTeamAssignment(data.audienceType === "SELECTED_TEAMS");
    } catch (err) {
      setError(err.message || "Failed to load assignment");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      if (isTeamAssignment && formData.teamId) {
        await submitTeamAssignment(id, formData.teamId, formData);
      } else {
        await submitAssignment(id, formData);
      }
      navigate(`/assignments/${id}`);
    } catch (err) {
      setError(err.message || "Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/assignments/${id}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !assignment) {
    return (
      <DashboardLayout>
        <div className="text-red-500">{error || "Assignment not found"}</div>
      </DashboardLayout>
    );
  }

  const ispublished = assignment.status === "published";
  if (!ispublished) {
    return (
      <DashboardLayout>
        <div className="text-gray-500">This assignment is not yet published.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Submit Assignment</h1>
            <p className="text-sm text-gray-500">{assignment.title}</p>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* Assignment Info */}
        <Paper className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Assignment Details</h2>
          <div className="space-y-2 text-sm">
            <p className="text-gray-700">{assignment.description}</p>
            {assignment.instructions && (
              <div className="mt-4 rounded bg-gray-50 p-4">
                <div className="mb-2 font-medium">Instructions:</div>
                <p className="whitespace-pre-wrap text-gray-700">{assignment.instructions}</p>
              </div>
            )}
            <div className="mt-4 flex gap-4 text-gray-500">
              <span>Max Points: {assignment.maxPoints}</span>
              <span>Passing: {assignment.passingPoints}</span>
              {assignment.dueDate && (
                <span>Due: {new Date(assignment.dueDate).toLocaleString()}</span>
              )}
            </div>
          </div>
        </Paper>

        {/* Submission Form */}
        <Paper className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Team Selection for team assignments */}
            {isTeamAssignment && (
              <div>
                <Label htmlFor="teamId">Select Team *</Label>
                <Select
                  value={formData.teamId}
                  onValueChange={(value) => handleChange("teamId", value)}
                >
                  <SelectTrigger id="teamId">
                    <SelectValue placeholder="Select your team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Team 1</SelectItem>
                    <SelectItem value="2">Team 2</SelectItem>
                    <SelectItem value="3">Team 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Content */}
            <div>
              <Label htmlFor="content">Submission Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleChange("content", e.target.value)}
                placeholder="Enter your submission content"
                rows={8}
                required
              />
            </div>

            {/* Attachments */}
            <div>
              <Label htmlFor="attachmentURLs">Attachment URLs</Label>
              <Input
                id="attachmentURLs"
                value={formData.attachmentURLs}
                onChange={(e) => handleChange("attachmentURLs", e.target.value)}
                placeholder="Enter comma-separated file URLs"
              />
              <p className="mt-1 text-xs text-gray-500">
                <Paperclip className="mr-1 inline h-3 w-3" />
                Separate multiple URLs with commas
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={submitting}>
                <Send className="mr-2 h-4 w-4" />
                {submitting ? "Submitting..." : "Submit Assignment"}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={submitting}>
                Cancel
              </Button>
            </div>
          </form>
        </Paper>
      </div>
    </DashboardLayout>
  );
};

export default AssignmentSubmit;
