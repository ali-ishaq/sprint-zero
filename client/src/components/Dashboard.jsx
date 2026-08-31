import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { apiFetch } from "../lib/api";
import Shell from "./ui/Shell";
import Card from "./ui/Card";
import Button from "./ui/Button";
import StatusBadge from "./ui/StatusBadge";
import { SearchIcon, PlusIcon, DocumentIcon, CalendarIcon, CheckCircleIcon, VideoIcon, MailIcon, GridIcon, ArrowRightIcon } from "./ui/Icons";

export default function Dashboard({ user, onNewProject, onViewProject, onLogout }) {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchRuns();
  }, []);

  const fetchRuns = async () => {
    try {
      const res = await apiFetch("/runs");
      if (!res.ok) throw new Error("Failed to fetch runs");
      const data = await res.json();
      setRuns(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    try {
      let date;
      if (timestamp.toDate) {
        date = timestamp.toDate();
      } else if (timestamp._seconds) {
        date = new Date(timestamp._seconds * 1000);
      } else if (typeof timestamp === "number" && timestamp < 1e12) {
        date = new Date(timestamp * 1000);
      } else {
        date = new Date(timestamp);
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Unknown";
    }
  };

  const filteredRuns = runs.filter((run) =>
    (run.projectName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const search = (
    <div className="relative w-full max-w-sm">
      <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search projects..."
        aria-label="Search projects"
        className="w-full pl-9 pr-3 py-2 bg-white border border-line rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/60"
      />
    </div>
  );

  return (
    <Shell
      active="dashboard"
      user={user}
      search={search}
      onNavigate={(id) => {
        if (id === "new-project") onNewProject();
      }}
      onNewProject={onNewProject}
      onLogout={onLogout}
    >
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Your Projects</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {filteredRuns.length} project{filteredRuns.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button onClick={onNewProject} className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/20">
          <PlusIcon className="w-4 h-4" strokeWidth={2.2} />
          New Project
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-card border border-line p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredRuns.length === 0 ? (
        <div className="text-center py-20">
          <span className="mx-auto inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 text-gray-300">
            <GridIcon className="w-8 h-8" />
          </span>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {runs.length === 0 ? "No projects yet" : "No matching projects"}
          </h3>
          <p className="mt-2 text-gray-500 text-sm">
            {runs.length === 0
              ? "Create your first sprint plan by uploading a project brief"
              : `No projects match "${searchQuery}".`}
          </p>
          <Button onClick={onNewProject} size="lg" className="mt-6">
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRuns.map((run, i) => {
            const created = formatDate(run.createdAt);
            return (
              <Card
                key={run.id}
                className="p-6 hover:border-brand/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-card animate-fade-up cursor-pointer"
                style={{ animationDelay: `${Math.min(i, 8) * 70}ms` }}
                onClick={() => onViewProject(run.id)}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-gray-900 leading-snug">
                    {run.projectName}
                  </h3>
                  <StatusBadge status={run.status} className="shrink-0" />
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Created {created}
                </p>

                <div className="h-px bg-line mb-4" />

                <div className="flex items-center gap-5 mb-5">
                  <span className="inline-flex items-center gap-2 text-sm">
                    <CheckCircleIcon className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-900">{run.taskCount || 0}</span>
                    <span className="text-gray-500">Tasks</span>
                  </span>
                  <span className="inline-flex items-center gap-2 text-sm">
                    <VideoIcon className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-900">{run.meetingCount || 0}</span>
                    <span className="text-gray-500">Mtgs</span>
                  </span>
                  <span className="inline-flex items-center gap-2 text-sm">
                    <MailIcon className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-900">{run.emailsSent || 0}</span>
                    <span className="text-gray-500">Mails</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {run.sheetUrl && (
                    <button
                      type="button"
                      aria-label={`Open sheet for ${run.projectName}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(run.sheetUrl, "_blank", "noopener,noreferrer");
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 border border-line text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    >
                      <DocumentIcon className="w-4 h-4" />
                    </button>
                  )}
                  {run.calendarLink && (
                    <button
                      type="button"
                      aria-label={`Open calendar for ${run.projectName}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(run.calendarLink, "_blank", "noopener,noreferrer");
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 border border-line text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    >
                      <CalendarIcon className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewProject(run.id);
                    }}
                    className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-dark transition-colors"
                  >
                    Details
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Shell>
  );
}
