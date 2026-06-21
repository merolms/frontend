import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  FileText,
  Paperclip,
  Send,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { hasPermission } from "@/app/services/authService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Paper } from "@/components/ui/card";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { Separator } from "@/components/ui/separator";

const AssignmentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useSelector((s) => s.auth.user);

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAssignment();
  }, [id]);

  const loadAssignment = async () => {
    try {
      setLoading(true);
      setError(null);
      const { getAssignmentById, getSubmissions, getAttachments } =
        await import("@/app/services/assignmentService");
      const [assignmentData, submissionsData, attachmentsData] = await Promise.all([
        getAssignmentById(id),
        getSubmissions(id),
        getAttachments(id),
      ]);
      setAssignment(assignmentData);
      setSubmissions(submissionsData);
      setAttachments(attachmentsData);
    } catch (err) {
      setError(err.message || "Failed to load assignment");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      const { publishAssignment } = await import("@/app/services/assignmentService");
      await publishAssignment(id);
      loadAssignment();
    } catch (err) {
      setError(err.message || "Failed to publish assignment");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    try {
      const { deleteAssignment } = await import("@/app/services/assignmentService");
      await deleteAssignment(id);
      navigate("/assignments");
    } catch (err) {
      setError(err.message || "Failed to delete assignment");
    }
  };

  const canEdit = hasPermission(user, "assignment:edit");
  const canDelete = hasPermission(user, "assignment:delete");
  const canGrade = hasPermission(user, "assignment:grade");

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
  const isdraft = assignment.status === "draft";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/assignments")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={ispublished ? "default" : "secondary"}>{assignment.status}</Badge>
                {assignment.audienceType !== "COURSE" && (
                  <Badge variant="outline">{assignment.audienceType}</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {isdraft && canEdit && (
              <Button size="sm" onClick={handlePublish}>
                <Send className="mr-2 h-4 w-4" />
                Publish
              </Button>
            )}
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/assignments/${id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            {canDelete && (
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* Assignment Details */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Description */}
            <Paper className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Description</h2>
              <p className="whitespace-pre-wrap text-gray-700">{assignment.description}</p>
            </Paper>

            {/* Instructions */}
            {assignment.instructions && (
              <Paper className="p-6">
                <h2 className="mb-4 text-lg font-semibold">Instructions</h2>
                <p className="whitespace-pre-wrap text-gray-700">{assignment.instructions}</p>
              </Paper>
            )}

            {/* Attachments */}
            {attachments.length > 0 && (
              <Paper className="p-6">
                <h2 className="mb-4 text-lg font-semibold">Attachments</h2>
                <div className="space-y-2">
                  {attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center gap-2 text-sm">
                      <Paperclip className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">Attachment #{attachment.id}</span>
                    </div>
                  ))}
                </div>
              </Paper>
            )}

            {/* Submissions */}
            <Paper className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Submissions ({submissions.length})</h2>
              {submissions.length === 0 ? (
                <div className="text-sm text-gray-500">No submissions yet</div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {submission.submissionType === "TEAM" ? (
                            <Users className="h-4 w-4 text-blue-500" />
                          ) : (
                            <FileText className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="font-medium">
                            {submission.submissionType === "TEAM"
                              ? "Team Submission"
                              : "Individual Submission"}
                          </span>
                          <Badge variant="outline">{submission.status}</Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(submission.submittedAt).toLocaleString()}
                        </div>
                      </div>
                      <p className="mb-2 text-sm text-gray-700">{submission.content}</p>
                      {submission.attachmentURLs && (
                        <div className="mb-2 text-sm text-gray-500">
                          <Paperclip className="mr-1 inline h-3 w-3" />
                          {submission.attachmentURLs}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500">Attempt #{submission.attemptNumber}</span>
                        {submission.late && <Badge variant="destructive">Late</Badge>}
                        {submission.score !== null && (
                          <span className="font-semibold">
                            Score: {submission.score}/{assignment.maxPoints}
                          </span>
                        )}
                      </div>
                      {submission.feedback && (
                        <div className="mt-2 rounded bg-gray-50 p-3 text-sm">
                          <span className="font-medium">Feedback:</span> {submission.feedback}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Paper>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assignment Info */}
            <Paper className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Assignment Details</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Due Date</div>
                    <div className="font-medium">
                      {assignment.dueDate
                        ? new Date(assignment.dueDate).toLocaleString()
                        : "No due date"}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Max Points</div>
                    <div className="font-medium">{assignment.maxPoints}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Passing Score</div>
                    <div className="font-medium">{assignment.passingPoints}</div>
                  </div>
                </div>
                <Separator />
                <div className="text-sm">
                  <div className="mb-1 text-gray-500">Max Submissions</div>
                  <div className="font-medium">{assignment.maxSubmissions || "Unlimited"}</div>
                </div>
                {assignment.allowLate && (
                  <div className="text-sm">
                    <div className="mb-1 text-gray-500">Late Penalty</div>
                    <div className="font-medium">{assignment.latePenalty}% per day</div>
                  </div>
                )}
                <Separator />
                <div className="text-sm text-gray-500">
                  <div>Created: {new Date(assignment.createdAt).toLocaleString()}</div>
                  <div>Updated: {new Date(assignment.updatedAt).toLocaleString()}</div>
                </div>
              </div>
            </Paper>

            {/* Quick Actions */}
            {ispublished && (
              <Paper className="p-6">
                <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(`/assignments/${id}/submit`)}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Submit Assignment
                  </Button>
                  {canGrade && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/assignments/${id}/grade`)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Grade Submissions
                    </Button>
                  )}
                </div>
              </Paper>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AssignmentDetail;
