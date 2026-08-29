import { useEffect, useState, useRef } from "react";
import { apiFetch } from "../lib/api";

function getStatusBadge(status) {
  const styles = {
    running: "bg-blue-100 text-blue-800",
    complete: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || "bg-gray-100 text-gray-800"}`}
    >
      {status}
    </span>
  );
}

const TABS = ["Tasks", "Meetings", "Team", "Timeline"];

function TasksTab({ tasks, onToggle }) {
  const toggle = (id, current) => onToggle(id, !current);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Done</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Task</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Assignee</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Start</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Due</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Depends On</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Description</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                No tasks for this project.
              </td>
            </tr>
          )}
          {tasks.map((t) => (
            <tr key={t.id} className={t.status ? "bg-green-50/50" : ""}>
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={Boolean(t.status)}
                  onChange={() => toggle(t.id, t.status)}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-4 py-3 font-medium text-gray-900">
                <span className={t.status ? "line-through text-gray-400" : ""}>{t.title}</span>
              </td>
              <td className="px-4 py-3 text-gray-700">{t.assignee}</td>
              <td className="px-4 py-3 text-gray-600">{t.start_date || "—"}</td>
              <td className="px-4 py-3 text-gray-600">{t.due_date || "—"}</td>
              <td className="px-4 py-3 text-gray-600">
                {t.depends_on?.length ? t.depends_on.join(", ") : "—"}
              </td>
              <td className="px-4 py-3 text-gray-500 max-w-sm">
                {t.description || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MeetingsTab({ meetings }) {
  return (
    <div className="space-y-4">
      {meetings.length === 0 && (
        <div className="text-center text-gray-500 py-8">No meetings for this project.</div>
      )}
      {meetings.map((m, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">{m.meeting_title}</h4>
            <span className="text-sm text-gray-500">
              {m.date} at {m.time}
            </span>
          </div>
          {m.agenda && <p className="text-sm text-gray-700 mb-3">{m.agenda}</p>}
          {m.meetLink && (
            <a
              href={m.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 mb-3 bg-green-100 text-green-800 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Join meeting
            </a>
          )}
          <p className="text-xs font-medium text-gray-500 mb-1">Attendees</p>
          <div className="flex flex-wrap gap-2">
            {(m.attendees || []).map((a, j) => (
              <span
                key={j}
                className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs"
              >
                {a.name}
                <span className="text-blue-400 ml-1">({a.email})</span>
              </span>
            ))}
          </div>
          {m.related_task_ids?.length > 0 && (
            <p className="mt-3 text-xs text-gray-500">
              Related tasks: {m.related_task_ids.join(", ")}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function TeamTab({ teamMembers, tasks }) {
  const members = teamMembers || [];
  const byAssignee = tasks.reduce((acc, t) => {
    const key = t.assignee || "Unassigned";
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  if (members.length === 0 && Object.keys(byAssignee).length === 0) {
    return <div className="text-center text-gray-500 py-8">No team members recorded.</div>;
  }

  const rows = members.length
    ? members
    : Object.keys(byAssignee).map((name) => ({ name, role: "Unknown", email: "" }));

  return (
    <div className="space-y-4">
      {rows.map((m, i) => {
        const userTasks = byAssignee[m.name] || [];
        const done = userTasks.filter((t) => t.status).length;
        const email = m.email || userTasks[0]?.email || "—";
        return (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-semibold text-gray-900">{m.name}</h4>
                <p className="text-sm text-gray-500">
                  {m.role || "Unknown"} · {email}
                </p>
              </div>
              <div className="text-right text-sm">
                <div className="font-bold text-gray-900">{userTasks.length} tasks</div>
                <div className="text-gray-500">{done} done</div>
              </div>
            </div>
            <ul className="space-y-1 mt-2">
              {userTasks.length === 0 && (
                <li className="text-sm text-gray-400">No tasks assigned.</li>
              )}
              {userTasks.map((t) => (
                <li key={t.id} className="text-sm text-gray-700 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${t.status ? "bg-green-500" : "bg-gray-300"}`} />
                  {t.title}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function TimelineTab({ tasks }) {
  const [width, setWidth] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) setWidth(ref.current.offsetWidth);
    const onResize = () => ref.current && setWidth(ref.current.offsetWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const parsed = tasks
    .filter((t) => t.start_date && t.due_date)
    .map((t) => ({
      ...t,
      start: new Date(`${t.start_date}T00:00:00Z`).getTime(),
      due: new Date(`${t.due_date}T00:00:00Z`).getTime(),
    }))
    .filter((t) => !isNaN(t.start) && !isNaN(t.due) && t.start <= t.due);

  if (parsed.length === 0) {
    return <div className="text-center text-gray-500 py-8">No dateable tasks for a timeline.</div>;
  }

  const minTime = Math.min(...parsed.map((t) => t.start));
  const maxTime = Math.max(...parsed.map((t) => t.due));
  const dayMs = 86400000;
  const totalDays = Math.max(1, Math.round((maxTime - minTime) / dayMs) + 1);
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-red-500",
  ];

  const formatDate = (ts) => new Date(ts).toISOString().slice(0, 10);

  return (
    <div>
      <div ref={ref} className="overflow-x-auto">
        <div className="relative min-w-[600px]">
          {/* Header dates */}
          <div className="flex border-b border-gray-200 mb-2" style={{ marginLeft: "200px" }}>
            {Array.from({ length: totalDays }).map((_, i) => {
              const d = new Date(minTime + i * dayMs).toISOString().slice(0, 10);
              return (
                <div key={i} className="flex-1 text-center text-xs text-gray-500 py-1">
                  {Number(d.slice(8, 10))}
                </div>
              );
            })}
          </div>
          {parsed.map((t, i) => {
            const leftOffset = Math.round((t.start - minTime) / dayMs);
            const span = Math.max(1, Math.round((t.due - t.start) / dayMs) + 1);
            const bar = Math.max(span, (300 / totalDays));
            return (
              <div key={t.id} className="flex items-center gap-2 py-1.5">
                <div className="w-[190px] shrink-0 text-right pr-2 text-xs text-gray-700 truncate">
                  {t.title}
                </div>
                <div className="flex-1 relative">
                  <div
                    className="absolute rounded h-5 flex items-center px-2 text-[10px] text-white overflow-hidden cursor-pointer"
                    style={{
                      left: `${(leftOffset / totalDays) * 100}%`,
                      width: `${(bar / totalDays) * 100}%`,
                    }}
                  >
                    <div className={`w-full rounded ${colors[i % colors.length]} p-0.5`}>
                      {formatDate(t.start)} → {formatDate(t.due)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-400">
        Showing {parsed.length} of {tasks.length} tasks with valid dates.
      </p>
    </div>
  );
}

function TodayUpcomingWidget({ tasks }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();
  const dayMs = 86400000;

  const parse = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(`${dateStr}T00:00:00Z`).getTime();
    return isNaN(d) ? null : d;
  };

  const todays = tasks.filter((t) => {
    const start = parse(t.start_date);
    const due = parse(t.due_date);
    if (start && due) return start <= todayMs && due >= todayMs;
    if (due) return due === todayMs;
    if (start) return start === todayMs;
    return false;
  });

  const upcoming = tasks.filter((t) => {
    const due = parse(t.due_date);
    if (!due) return false;
    return due > todayMs && due <= todayMs + 7 * dayMs;
  });

  const renderList = (list, emptyText) =>
    list.length === 0 ? (
      <p className="text-sm text-gray-400">{emptyText}</p>
    ) : (
      <ul className="space-y-1.5">
        {list.map((t) => (
          <li key={t.id} className="text-sm text-gray-700 flex items-center gap-2">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${t.status ? "bg-green-500" : t.due_date && parse(t.due_date) === todayMs ? "bg-amber-500" : "bg-blue-500"}`}
            />
            <span className={t.status ? "line-through text-gray-400" : ""}>
              {t.title}
            </span>
            <span className="ml-auto text-xs text-gray-400">
              {t.assignee || ""}
            </span>
            {t.due_date && (
              <span className="text-xs text-gray-400">{t.due_date}</span>
            )}
          </li>
        ))}
      </ul>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div className="bg-white border border-amber-200 rounded-xl p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Today&apos;s Tasks
        </h3>
        {renderList(todays, "No tasks due or active today.")}
      </div>
      <div className="bg-white border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Upcoming (next 7 days)
        </h3>
        {renderList(upcoming, "No tasks due in the next 7 days.")}
      </div>
    </div>
  );
}

export default function ProjectDetail({ runId, onBack }) {
  const [run, setRun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Tasks");

  const fetchRun = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/runs/${runId}`);
      if (!res.ok) throw new Error("Failed to load project");
      setRun(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRun();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);

  const handleToggleStatus = async (taskId, status) => {
    // Optimistically update the UI immediately
    setRun((prev) => ({
      ...prev,
      tasks: (prev.tasks || []).map((t) =>
        t.id === taskId ? { ...t, status } : t,
      ),
    }));

    try {
      const res = await apiFetch(`/runs/${runId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const data = await res.json();
      setRun((prev) => ({ ...prev, tasks: data.tasks }));
    } catch (err) {
      console.error("Status update failed:", err);
      // Roll back the optimistic change since the server rejected it
      setRun((prev) => ({
        ...prev,
        tasks: (prev.tasks || []).map((t) =>
          t.id === taskId ? { ...t, status: !status } : t,
        ),
      }));
      alert("Could not update task status. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Loading project...
      </div>
    );
  }

  if (error || !run) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-red-600 mb-4">{error || "Project not found"}</p>
          <button onClick={onBack} className="text-blue-600 hover:underline">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const tasks = run.tasks || [];
  const meetings = run.sync_meetings || [];
  const doneCount = tasks.filter((t) => t.status).length;
  const teamSize = (run.teamMembers || []).length || 0;
  const progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Dashboard
              </button>
            </div>
            <span className="text-sm text-gray-600">{run.projectName}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{run.projectName}</h1>
              {getStatusBadge(run.status)}
            </div>
            <p className="text-gray-500 mt-1">
              {run.createdAt ? new Date(run.createdAt._seconds * 1000).toLocaleDateString() : "—"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {run.sheetUrl && (
              <a
                href={run.sheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100"
              >
                Google Sheet
              </a>
            )}
            {run.calendarLink && (
              <a
                href={run.calendarLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100"
              >
                Google Calendar
              </a>
            )}
            {run.emailsSent > 0 && (
              <span className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                {run.emailsSent} emails sent
              </span>
            )}
          </div>
        </div>

        <TodayUpcomingWidget tasks={tasks} />

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="rounded-xl bg-white border border-gray-200 p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">{tasks.length}</div>
            <div className="text-sm text-gray-500">Tasks</div>
          </div>
          <div className="rounded-xl bg-white border border-gray-200 p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{doneCount}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="rounded-xl bg-white border border-gray-200 p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{progress}%</div>
            <div className="text-sm text-gray-500">Progress</div>
          </div>
          <div className="rounded-xl bg-white border border-gray-200 p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">{meetings.length}</div>
            <div className="text-sm text-gray-500">Meetings</div>
          </div>
          <div className="rounded-xl bg-white border border-gray-200 p-4 text-center">
            <div className="text-3xl font-bold text-orange-600">{teamSize || "—"}</div>
            <div className="text-sm text-gray-500">Team Size</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Task Completion</span>
            <span>{doneCount}/{tasks.length || 0}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex border-b border-gray-200">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="p-4">
            {activeTab === "Tasks" && (
              <TasksTab tasks={tasks} onToggle={handleToggleStatus} />
            )}
            {activeTab === "Meetings" && <MeetingsTab meetings={meetings} />}
            {activeTab === "Team" && <TeamTab teamMembers={run.teamMembers} tasks={tasks} />}
            {activeTab === "Timeline" && <TimelineTab tasks={tasks} />}
          </div>
        </div>
      </main>
    </div>
  );
}