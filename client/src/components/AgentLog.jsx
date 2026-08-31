import { useEffect, useRef, useState } from "react";
import Shell from "./ui/Shell";
import Card from "./ui/Card";
import StepperNode from "./ui/StepperNode";
import LogLine from "./ui/LogLine";
import Button from "./ui/Button";
import {
  ClipboardIcon,
  SheetIcon,
  MailIcon,
  FlagIcon,
  InfoIcon,
  TerminalIcon,
} from "./ui/Icons";

const STAGES = [
  { step: "planner", label: "Planner", Icon: ClipboardIcon, isParallel: false },
  {
    step: "sheets_and_calendar",
    label: "Sheets & Calendar",
    Icon: SheetIcon,
    isParallel: true,
  },
  { step: "email", label: "Email Notifications", Icon: MailIcon, isParallel: false },
  { step: "complete", label: "Finalize", Icon: FlagIcon, isParallel: false },
];

export default function AgentLog({ events, onComplete, onBack }) {
  const logEndRef = useRef(null);
  const [lastEvent, setLastEvent] = useState(null);

  const pipelineComplete = lastEvent?.step === "complete" && lastEvent?.status === "complete";
  const pipelineFailed = lastEvent?.step === "complete" && lastEvent?.status === "error";

  useEffect(() => {
    if (events.length > 0) {
      setLastEvent(events[events.length - 1]);
      logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [events]);

  const formatData = (data) => {
    if (!data) return null;
    if (typeof data === "string") return data;
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const hasStepDone = (eventStep) =>
    events.some((e) => e.step === eventStep && e.status === "done");

  const stageDone = (stageIndex) => {
    const step = STAGES[stageIndex].step;
    if (step === "sheets_and_calendar") {
      return hasStepDone("sheets") && hasStepDone("calendar");
    }
    if (step === "complete") {
      return events.some((e) => e.step === "complete");
    }
    return hasStepDone(step);
  };

  const stageStarted = (stageIndex) => {
    const step = STAGES[stageIndex].step;
    if (step === "sheets_and_calendar") {
      return events.some(
        (e) => ["sheets_and_calendar", "sheets", "calendar"].includes(e.step)
      );
    }
    if (step === "complete") {
      return events.some((e) => e.step === "complete");
    }
    return events.some((e) => e.step === step);
  };

  const getStageState = (stageIndex) => {
    if (stageDone(stageIndex)) return "completed";
    if (stageStarted(stageIndex)) return "active";
    return "pending";
  };

  const progressCount = STAGES.reduce(
    (acc, _, i) => acc + (getStageState(i) === "completed" ? 1 : 0),
    0
  );

  const logLines = [];
  events.forEach((ev, ei) => {
    const isLastEvent = ei === events.length - 1;
    const logs =
      ev.logs && ev.logs.length
        ? ev.logs
        : [
            {
              variant: ev.status === "error" ? "warning" : "info",
              tag: `[${String(ev.step).toUpperCase()}]`,
              message: typeof ev.data === "string" ? ev.data : formatData(ev.data) || "",
            },
          ];
    logs.forEach((l) => logLines.push({ ...l, dimmed: !isLastEvent }));
  });

  return (
    <Shell
      active="new-project"
      onNavigate={(id) => {
        if (id === "dashboard") onBack();
      }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Generating your Sprint Plan...
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Our agents are analyzing constraints and building your timeline.
          </p>
        </div>

        <Card className="p-8 mb-6">
          <div className="relative flex items-start justify-between">
            <div className="absolute top-5 left-[6%] right-[6%] h-0.5 bg-gray-200" />
            <div
              className="absolute top-5 left-[6%] h-0.5 bg-emerald-500 transition-all duration-500"
              style={{
                width: `calc(${(progressCount / (STAGES.length - 1)) * 88}% )`,
              }}
            />
            {STAGES.map(({ label, Icon, isParallel }, i) => {
              const state = getStageState(i);
              return (
                <div key={label} className="relative z-10">
                  <StepperNode
                    state={state}
                    label={label}
                    isParallel={isParallel && state === "active"}
                    icon={<Icon className="w-5 h-5" />}
                  />
                </div>
              );
            })}
          </div>
        </Card>

        <div className="rounded-card overflow-hidden border border-gray-800 bg-[#0B1020] text-gray-100 shadow-card mb-4">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-800">
            <TerminalIcon className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
              Agent Log
            </span>
          </div>
          <div
            className="px-5 py-4 space-y-1.5 max-h-80 overflow-y-auto scrollbar-thin"
            role="log"
            aria-live="polite"
          >
            {logLines.length === 0 && (
              <p className="text-gray-500 text-sm">
                Waiting for pipeline to start...
              </p>
            )}
            {logLines.map((line, i) => (
              <LogLine
                key={i}
                variant={line.variant}
                tag={line.tag}
                message={line.message}
                className={line.dimmed ? "opacity-50" : ""}
              />
            ))}
            <div ref={logEndRef} />
          </div>
        </div>

        {/* Bottom action area */}
        {pipelineComplete ? (
          <div className="flex items-center justify-between gap-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-emerald-800">
                Sprint plan generated successfully.
              </p>
              <p className="text-xs text-emerald-600 mt-0.5">
                View tasks, meetings, and team assignments.
              </p>
            </div>
            <Button
              onClick={() => onComplete(lastEvent)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              View Results
            </Button>
          </div>
        ) : pipelineFailed ? (
          <div className="flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">
              Processing failed. Please try again.
            </p>
            <Button variant="secondary" onClick={onBack}>
              Back to Dashboard
            </Button>
          </div>
        ) : (
          <p className="text-center text-gray-500 text-sm flex items-center justify-center gap-1.5">
            <InfoIcon className="w-4 h-4" />
            Do not close this tab. Process typically takes 1-2 minutes.
          </p>
        )}
      </div>
    </Shell>
  );
}
