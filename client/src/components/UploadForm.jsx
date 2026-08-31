import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Shell from "./ui/Shell";
import Card from "./ui/Card";
import Button from "./ui/Button";
import {
  ArrowLeftIcon,
  UploadCloudIcon,
  PdfIcon,
  CloseIcon,
} from "./ui/Icons";

const ROLES = [
  "Project Manager",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Designer",
  "QA Engineer",
  "DevOps Engineer",
  "Data Scientist",
  "Other",
];

// const initialTeamMember = { name: '', role: '', email: '' };
const initialTeamMember = [
  { name: "Ali", role: "Full Stack Developer", email: "aliishaq.ku@gmail.com" },
  { name: "Hadi", role: "Project Manager", email: "aliishaq3578@gmail.com" },
  { name: "Ayan", role: "Frontend Developer", email: "aliishaq3578@gmail.com" },
];

export default function UploadForm({ onSubmit, onBack }) {
  const [projectName, setProjectName] = useState("StudyBuddyAI");
  const [teamMembers, setTeamMembers] = useState(initialTeamMember);
  const [pdfFile, setPdfFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setErrors((prev) => ({ ...prev, pdf: null }));
    } else {
      setErrors((prev) => ({ ...prev, pdf: "Please select a PDF file" }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, initialTeamMember]);
  };

  const removeTeamMember = (index) => {
    if (teamMembers.length <= 1) return;
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index, field, value) => {
    setTeamMembers(
      teamMembers.map((member, i) =>
        i === index ? { ...member, [field]: value } : member,
      ),
    );
  };

  const validate = () => {
    const newErrors = {};
    if (!projectName.trim()) newErrors.projectName = "Project name is required";
    if (teamMembers.length === 0) {
      newErrors.teamMembers = "At least one team member is required";
    } else {
      const invalidMembers = teamMembers.some(
        (m) => !m.name.trim() || !m.role.trim() || !m.email.trim(),
      );
      if (invalidMembers) {
        newErrors.teamMembers =
          "All team members must have name, role, and email";
      }
      const invalidEmails = teamMembers.some(
        (m) =>
          m.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email.trim()),
      );
      if (invalidEmails) {
        newErrors.teamMembers = "All emails must be valid";
      }
    }
    if (!pdfFile) newErrors.pdf = "Project brief PDF is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("brief", pdfFile);
    formData.append("projectName", projectName);
    formData.append("teamMembers", JSON.stringify(teamMembers));
    onSubmit(formData);
  };

  const formatBytes = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Shell
      active="new-project"
      onNavigate={(id) => {
        if (id === "dashboard") onBack();
      }}
      onNewProject={onBack}
    >
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1.5 mb-4 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Dashboard
        </button>

        <h1 className="font-display text-2xl font-bold text-gray-900">New Project</h1>
        <p className="text-gray-500 mt-1 text-sm mb-6">
          Configure your new sprint initiative and upload the brief.
        </p>

        <Card className="overflow-hidden">
          <div className="px-6 pt-5 pb-4 border-b border-line">
            <h2 className="font-semibold text-gray-900">Project Details</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-900 mb-1.5">
                Project Name
              </label>
              <input
                id="projectName"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand/60 placeholder:text-gray-400 ${
                  errors.projectName ? "border-red-300" : "border-line"
                }`}
                placeholder="e.g. Q3 Marketing Campaign"
              />
              {errors.projectName && (
                <p className="mt-1 text-sm text-red-600">{errors.projectName}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-900">
                  Team Members
                </label>
                <button
                  type="button"
                  onClick={addTeamMember}
                  className="text-sm text-brand hover:text-brand-dark font-medium"
                >
                  + Add Member
                </button>
              </div>
              <div className="space-y-3">
                {teamMembers.map((member, index) => (
                  <div
                    key={index}
                    className="border border-line rounded-lg p-4 space-y-3 bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Member {index + 1}
                      </span>
                      {teamMembers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTeamMember(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) =>
                            updateTeamMember(index, "name", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/60 text-sm"
                          placeholder="Alice Chen"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Role
                        </label>
                        <select
                          value={member.role}
                          onChange={(e) =>
                            updateTeamMember(index, "role", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/60 text-sm"
                        >
                          <option value="">Select role</option>
                          {ROLES.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={member.email}
                          onChange={(e) =>
                            updateTeamMember(index, "email", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/60 text-sm"
                          placeholder="alice@example.com"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {errors.teamMembers && (
                <p className="mt-1 text-sm text-red-600">{errors.teamMembers}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Each member will be assigned tasks based on their role and receive
                emails
              </p>
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-900 mb-2">
                Project Brief (PDF)
              </span>

              {pdfFile ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-line rounded-lg">
                  <span className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <PdfIcon className="w-5 h-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">{pdfFile.name}</p>
                    <p className="text-sm text-gray-500">{formatBytes(pdfFile.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPdfFile(null)}
                    aria-label="Remove file"
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-brand bg-brand-light"
                      : errors.pdf
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-brand"
                  }`}
                >
                  <input {...getInputProps()} />
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-400 mb-3">
                    <UploadCloudIcon className="w-6 h-6" />
                  </span>
                  <p className="text-gray-600 text-sm">
                    Drag &amp; drop a PDF file, or <span className="text-brand font-medium">click to select</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Single PDF, up to 10 MB</p>
                </div>
              )}

              {errors.pdf && <p className="mt-1 text-sm text-red-600">{errors.pdf}</p>}
            </div>

            <div className="h-px bg-line" />

            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onBack}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Generate Sprint Plan"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Shell>
  );
}
