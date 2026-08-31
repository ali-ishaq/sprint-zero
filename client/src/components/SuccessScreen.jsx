import Shell from "./ui/Shell";
import Button from "./ui/Button";
import {
  CheckCircleIcon,
  ClipboardIcon,
  CalendarIcon,
  MailIcon,
  SheetIcon,
  WarningIcon,
} from "./ui/Icons";

export default function SuccessScreen({
  result,
  onNewProject,
  onViewDashboard,
}) {
  const {
    projectName,
    taskCount,
    meetingCount,
    sheetUrl,
    calendarLink,
    emailsSent,
    emailsFailed,
    failedRecipients,
  } = result;

  const handleLinkClick = (url) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const showWarning =
    emailsFailed > 0 || (failedRecipients && failedRecipients.length > 0);

  return (
    <Shell
      active="recent-tasks"
      onNavigate={(id) => {
        if (id === "dashboard") onViewDashboard();
      }}
      onNewProject={onNewProject}
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <span className="mx-auto inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-4">
            <CheckCircleIcon className="w-11 h-11" strokeWidth={1.8} />
          </span>
          <h1 className="font-display text-3xl font-bold text-gray-900">
            Sprint Zero Complete!
          </h1>
          <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
            {projectName
              ? `"${projectName}" has been successfully provisioned and all initial tasks have been dispatched.`
              : "Your project environment has been successfully provisioned and all initial tasks have been dispatched."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="bg-white border border-line rounded-card shadow-card p-6 flex flex-col items-center text-center">
            <ClipboardIcon className="w-7 h-7 text-brand mb-3" />
            <span className="text-3xl font-bold text-gray-900 font-display">
              {taskCount}
            </span>
            <span className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-500">
              Tasks Created
            </span>
          </div>
          <div className="bg-white border border-line rounded-card shadow-card p-6 flex flex-col items-center text-center">
            <CalendarIcon className="w-7 h-7 text-brand mb-3" />
            <span className="text-3xl font-bold text-gray-900 font-display">
              {meetingCount}
            </span>
            <span className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-500">
              Syncs Scheduled
            </span>
          </div>
          <div className="bg-white border border-line rounded-card shadow-card p-6 flex flex-col items-center text-center">
            <MailIcon className="w-7 h-7 text-brand mb-3" />
            <span className="text-3xl font-bold text-gray-900 font-display">
              {emailsSent}
            </span>
            <span className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-500">
              Emails Sent
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {sheetUrl && (
            <button
              type="button"
              onClick={() => handleLinkClick(sheetUrl)}
              className="flex items-center gap-4 p-5 bg-white border border-line rounded-card shadow-card text-left hover:border-gray-300 transition-colors"
            >
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-gray-100 text-brand shrink-0">
                <SheetIcon className="w-5 h-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-gray-900">
                  Open Google Sheet
                </span>
                <span className="block text-sm text-gray-500 mt-0.5">
                  View the generated raw data and task breakdown in your connected workspace.
                </span>
              </span>
            </button>
          )}
          {calendarLink && (
            <button
              type="button"
              onClick={() => handleLinkClick(calendarLink)}
              className="flex items-center gap-4 p-5 bg-white border border-line rounded-card shadow-card text-left hover:border-gray-300 transition-colors"
            >
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-gray-100 text-brand shrink-0">
                <CalendarIcon className="w-5 h-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-gray-900">
                  Open Google Calendar
                </span>
                <span className="block text-sm text-gray-500 mt-0.5">
                  Review the scheduled sync meetings and invitees added to your agenda.
                </span>
              </span>
            </button>
          )}
        </div>

        {showWarning && (
          <div className="flex items-center gap-4 rounded-card border border-amber-200 bg-amber-50 px-5 py-4 mb-6">
            <WarningIcon className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-amber-800">
                {emailsFailed} email{emailsFailed !== 1 ? "s" : ""} failed to send
              </p>
              <p className="text-sm text-amber-700 mt-0.5">
                {failedRecipients && failedRecipients.length > 0
                  ? `The invitation to ${failedRecipients.join(", ")} bounced. You can retry from the dashboard.`
                  : "Some invitations could not be delivered. You can retry from the dashboard."}
              </p>
            </div>
            <span className="shrink-0 text-sm font-bold uppercase tracking-wide text-amber-600">
              View Details
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onViewDashboard} className="px-7">
            Back to Dashboard
          </Button>
          <Button variant="secondary" onClick={onNewProject} className="px-7">
            Start Another Project
          </Button>
        </div>
      </div>
    </Shell>
  );
}
