import { ArrowLeft, FileText, Save, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getAssignmentById,
  getSubmissions,
  gradeSubmission,
  gradeTeamSubmission,
} from "@/services/assignmentService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Paper } from "@/components/ui/card";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface AssignmentGradeProps {
  assignmentId: string;
}

const AssignmentGrade = ({ assignmentId }: AssignmentGradeProps) => {
  const router = useRouter();

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradingData, setGradingData] = useState({
    score: "",
    feedback: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadData();
  }, [assignmentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [assignmentData, submissionsData] = await Promise.all([
        getAssignmentById(assignmentId),
        getSubmissions(assignmentId),
      ]);
      setAssignment(assignmentData);
      setSubmissions(submissionsData);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSubmission = (submission) => {
    setSelectedSubmission(submission);
    setGradingData({
      score: submission.score !== null ? submission.score : "",
      feedback: submission.feedback || "",
    });
  };

  const handleGradingChange = (field, value) => {
    setGradingData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGrade = async () => {
    if (!selectedSubmission) return;
    try {
      setSubmitting(true);
      setError(null);
      const isTeam = selectedSubmission.submissionType === "TEAM";
      if (isTeam) {
        await gradeTeamSubmission(selectedSubmission.id, gradingData);
      } else {
        await gradeSubmission(selectedSubmission.id, gradingData);
      }
      loadData();
      setSelectedSubmission(null);
    } catch (err) {
      setError(err.message || "Failed to grade submission");
    } finally {
      setSubmitting(false);
    }
  };

  const getFilteredSubmissions = () => {
    switch (activeTab) {
      case "pending":
        return submissions.filter((s) => s.status === "SUBMITTED");
      case "graded":
        return submissions.filter((s) => s.status === "GRADED");
      case "returned":
        return submissions.filter((s) => s.status === "RETURNED");
      case "individual":
        return submissions.filter((s) => s.submissionType === "USER");
      case "team":
        return submissions.filter((s) => s.submissionType === "TEAM");
      default:
        return submissions;
    }
  };

  const filteredSubmissions = getFilteredSubmissions();
  const pendingCount = submissions.filter((s) => s.status === "SUBMITTED").length;
  const gradedCount = submissions.filter((s) => s.status === "GRADED").length;

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/assignments/${assignmentId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Grade Submissions</h1>
            <p className="text-sm text-gray-500">{assignment.title}</p>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Paper className="p-4">
            <div className="text-sm text-gray-500">Total Submissions</div>
            <div className="text-2xl font-bold">{submissions.length}</div>
          </Paper>
          <Paper className="p-4">
            <div className="text-sm text-gray-500">Pending Grading</div>
            <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
          </Paper>
          <Paper className="p-4">
            <div className="text-sm text-gray-500">Graded</div>
            <div className="text-2xl font-bold text-green-600">{gradedCount}</div>
          </Paper>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Submissions List */}
          <div className="lg:col-span-2">
            <Paper className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="graded">Graded</TabsTrigger>
                  <TabsTrigger value="individual">Individual</TabsTrigger>
                  <TabsTrigger value="team">Team</TabsTrigger>
                </TabsList>
                <TabsContent value={activeTab} className="mt-4">
                  {filteredSubmissions.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">No submissions found</div>
                  ) : (
                    <div className="space-y-3">
                      {filteredSubmissions.map((submission) => (
                        <div
                          key={submission.id}
                          className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                            selectedSubmission?.id === submission.id
                              ? "border-blue-500 bg-blue-50"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => handleSelectSubmission(submission)}
                        >
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
                          <p className="mb-2 line-clamp-2 text-sm text-gray-700">
                            {submission.content}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-500">
                              Attempt #{submission.attemptNumber}
                            </span>
                            {submission.late && <Badge variant="destructive">Late</Badge>}
                            {submission.score !== null && (
                              <span className="font-semibold">
                                Score: {submission.score}/{assignment.maxPoints}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </Paper>
          </div>

          {/* Grading Panel */}
          <div>
            <Paper className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Grade Submission</h2>
              {!selectedSubmission ? (
                <div className="py-8 text-center text-gray-500">
                  Select a submission from the list to grade
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Submission Info */}
                  <div className="rounded bg-gray-50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      {selectedSubmission.submissionType === "TEAM" ? (
                        <Users className="h-4 w-4 text-blue-500" />
                      ) : (
                        <FileText className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="font-medium">
                        {selectedSubmission.submissionType === "TEAM"
                          ? "Team Submission"
                          : "Individual Submission"}
                      </span>
                      <Badge variant="outline">{selectedSubmission.status}</Badge>
                    </div>
                    <p className="text-sm whitespace-pre-wrap text-gray-700">
                      {selectedSubmission.content}
                    </p>
                    {selectedSubmission.attachmentURLs && (
                      <div className="mt-2 text-sm text-gray-500">
                        <FileText className="mr-1 inline h-3 w-3" />
                        {selectedSubmission.attachmentURLs}
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        Submitted: {new Date(selectedSubmission.submittedAt).toLocaleString()}
                      </span>
                      <span>Attempt #{selectedSubmission.attemptNumber}</span>
                      {selectedSubmission.late && <Badge variant="destructive">Late</Badge>}
                    </div>
                  </div>

                  <Separator />

                  {/* Grading Form */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="score">Score (max: {assignment.maxPoints})</Label>
                      <Input
                        id="score"
                        type="number"
                        value={gradingData.score}
                        onChange={(e) => handleGradingChange("score", e.target.value)}
                        min="0"
                        max={assignment.maxPoints}
                        placeholder="Enter score"
                      />
                    </div>
                    <div>
                      <Label htmlFor="feedback">Feedback</Label>
                      <Textarea
                        id="feedback"
                        value={gradingData.feedback}
                        onChange={(e) => handleGradingChange("feedback", e.target.value)}
                        placeholder="Enter feedback for the student"
                        rows={6}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleGrade} disabled={submitting} className="flex-1">
                        <Save className="mr-2 h-4 w-4" />
                        {submitting ? "Saving..." : "Save Grade"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedSubmission(null)}
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>

                  {/* Previous Feedback */}
                  {selectedSubmission.feedback && (
                    <>
                      <Separator />
                      <div>
                        <Label>Previous Feedback</Label>
                        <div className="mt-1 rounded bg-gray-50 p-3 text-sm">
                          {selectedSubmission.feedback}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </Paper>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AssignmentGrade;
