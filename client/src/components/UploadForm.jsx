import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

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

  const teamMembersJson = JSON.stringify(teamMembers);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1 mb-4"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">New Project</h1>
          <p className="text-gray-600 mt-1">
            Upload a project brief and team list to generate a sprint plan
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.projectName ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="e.g., Q3 Mobile App Launch"
            />
            {errors.projectName && (
              <p className="mt-1 text-sm text-red-600">{errors.projectName}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Team Members
              </label>
              <button
                type="button"
                onClick={addTeamMember}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Member
              </button>
            </div>
            <div className="space-y-3">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Brief (PDF)
            </label>
            <div
              {...getRootProps()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : errors.pdf
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
              }`}
            >
              <input {...getInputProps()} />
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              {pdfFile ? (
                <div className="mt-4">
                  <p className="font-medium text-gray-900">{pdfFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(pdfFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-gray-600">
                  Drag & drop a PDF file, or click to select
                </p>
              )}
              {errors.pdf && (
                <p className="mt-2 text-sm text-red-600">{errors.pdf}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Processing..." : "Generate Sprint Plan"}
          </button>
        </form>
      </div>
    </div>
  );
}
