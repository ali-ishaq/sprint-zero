import { useEffect, useRef, useState } from "react";

const stepColors = {
  planner: "bg-purple-100 text-purple-800 border-purple-200",
  sheets: "bg-blue-100 text-blue-800 border-blue-200",
  calendar: "bg-green-100 text-green-800 border-green-200",
  email: "bg-orange-100 text-orange-800 border-orange-200",
  sheets_and_calendar: "bg-indigo-100 text-indigo-800 border-indigo-200",
  complete: "bg-gray-100 text-gray-800 border-gray-200",
  error: "bg-red-100 text-red-800 border-red-200",
};

const stepLabels = {
  planner: "Planner Agent",
  sheets: "Sheets Agent",
  calendar: "Calendar Agent",
  email: "Email Agent",
  sheets_and_calendar: "Parallel: Sheets + Calendar",
  complete: "Complete",
  error: "Error",
};

export default function AgentLog({ events, onComplete, onBack }) {
  const logEndRef = useRef(null);
  const [lastEvent, setLastEvent] = useState(null);
  const hasFailed = lastEvent?.status === "error";

  useEffect(() => {
    if (events.length > 0) {
      setLastEvent(events[events.length - 1]);
      logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [events]);

  useEffect(() => {
    if (lastEvent?.step === "complete" || lastEvent?.step === "error") {
      onComplete(lastEvent);
    }
  }, [lastEvent, onComplete]);

  const formatData = (data) => {
    if (!data) return null;
    if (typeof data === "string") return data;
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "done":
        return (
          <svg
            className="w-4 h-4 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            className="w-4 h-4 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-4 h-4 text-blue-500 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );
    }
  };

  return (
    <div className="flex-1 overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">Agent Log</h2>
        <p className="text-sm text-gray-500 mt-1">
          Live streaming from ADK pipeline
        </p>
      </div>

      <div
        className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3"
        role="log"
        aria-live="polite"
      >
        {events.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="mt-2">Waiting for pipeline to start...</p>
          </div>
        )}

        {events.map((event, index) => (
          <div key={`${event.step}-${index}`} className="animate-slide-in">
            <div
              className={`flex items-start gap-3 p-3 rounded-lg border ${stepColors[event.step] || "bg-gray-100 text-gray-800 border-gray-200"}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(event.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium capitalize">
                    {stepLabels[event.step] || event.step}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      event.status === "done"
                        ? "bg-green-100 text-green-700"
                        : event.status === "error"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
                {event.data && (
                  <pre className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-x-auto text-gray-700 max-h-40 overflow-y-auto">
                    {formatData(event.data)}
                  </pre>
                )}
              </div>
            </div>
          </div>
        ))}

        <div ref={logEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-4">
        <div
          className={`flex items-center gap-2 text-sm ${hasFailed ? "text-red-600" : "text-gray-500"}`}
        >
          <span
            className={`relative flex h-2 w-2 ${hasFailed ? "bg-red-500 rounded-full" : ""}`}
          >
            {!hasFailed && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${hasFailed ? "bg-red-500" : "bg-blue-500"}`}
            ></span>
          </span>
          {hasFailed
            ? "Processing failed"
            : "Streaming events from ADK runner..."}
        </div>
        {hasFailed && (
          <button
            type="button"
            onClick={onBack}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Back to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}
