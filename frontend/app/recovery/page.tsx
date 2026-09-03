"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Target,
  Trash2,
  UserRound,
  X,
  Zap,
} from "lucide-react";

type ActionStatus =
  | "Pending"
  | "In Progress"
  | "Completed"
  | "Cancelled";

type Priority = "High" | "Medium" | "Low";

type ActionType =
  | "Email"
  | "Phone Call"
  | "Payment Follow-up"
  | "Account Review"
  | "Retention Offer";

type RecoveryAction = {
  id: string;
  customer: string;
  action_type: ActionType;
  description: string;
  priority: Priority;
  owner: string;
  status: ActionStatus;
  created_at: string;
  updated_at: string;
};

const API_URL = "http://127.0.0.1:8001";

export default function RecoveryPage() {
  const [actions, setActions] = useState<RecoveryAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [statusFilter, setStatusFilter] =
    useState<"All" | ActionStatus>("All");

  const [newAction, setNewAction] = useState({
    customer: "",
    action_type: "Payment Follow-up" as ActionType,
    description: "",
    priority: "High" as Priority,
    owner: "Revenue Team",
  });

  const loadActions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/v1/recovery-actions`
      );

      if (!response.ok) {
        throw new Error("Failed to load recovery actions");
      }

      const data = await response.json();

      setActions(data.actions ?? []);
    } catch {
      setError(
        "Unable to connect to RevenueOS API. Make sure FastAPI is running on port 8001."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActions();
  }, []);

  const createAction = async () => {
    if (
      !newAction.customer.trim() ||
      !newAction.description.trim()
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/v1/recovery-actions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newAction),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create action");
      }

      const data = await response.json();

      setActions((current) => [
        data.action,
        ...current,
      ]);

      setNewAction({
        customer: "",
        action_type: "Payment Follow-up",
        description: "",
        priority: "High",
        owner: "Revenue Team",
      });

      setShowModal(false);
    } catch {
      setError("Unable to create recovery action.");
    }
  };

  const updateStatus = async (
    id: string,
    status: ActionStatus
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/recovery-actions/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update action");
      }

      const data = await response.json();

      setActions((current) =>
        current.map((action) =>
          action.id === id ? data.action : action
        )
      );
    } catch {
      setError("Unable to update recovery action.");
    }
  };

  const deleteAction = async (id: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/recovery-actions/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete action");
      }

      setActions((current) =>
        current.filter((action) => action.id !== id)
      );
    } catch {
      setError("Unable to delete recovery action.");
    }
  };

  const filteredActions = useMemo(() => {
    if (statusFilter === "All") {
      return actions;
    }

    return actions.filter(
      (action) => action.status === statusFilter
    );
  }, [actions, statusFilter]);

  const pending = actions.filter(
    (a) => a.status === "Pending"
  ).length;

  const inProgress = actions.filter(
    (a) => a.status === "In Progress"
  ).length;

  const completed = actions.filter(
    (a) => a.status === "Completed"
  ).length;

  const highPriority = actions.filter(
    (a) => a.priority === "High"
  ).length;

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0f1c]/90 backdrop-blur-xl">
        <div className="flex min-h-20 items-center justify-between gap-4 px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-500/15 p-2.5">
              <Target className="h-6 w-6 text-orange-400" />
            </div>

            <div>
              <h1 className="text-xl font-semibold">
                Recovery Actions
              </h1>

              <p className="text-xs text-slate-400">
                Turn revenue risks into measurable recovery workflows
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadActions}
              className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              title="Refresh"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading ? "animate-spin" : ""
                }`}
              />
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400"
            >
              <Plus className="h-4 w-4" />
              New Action
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] p-6 lg:p-10">
        {/* Intro */}
        <section className="mb-8">
          <p className="mb-2 text-sm font-medium text-orange-400">
            REVENUE RECOVERY
          </p>

          <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
            Execute recovery workflows
          </h2>

          <p className="mt-2 max-w-2xl text-slate-400">
            Track every recovery action from initial outreach
            through successful resolution.
          </p>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertCircle className="h-5 w-5 shrink-0" />

            <div>
              <p className="font-medium">
                Something went wrong
              </p>

              <p className="mt-1 text-red-300/80">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* KPIs */}
        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Pending"
            value={pending}
            description="Waiting for action"
            icon={<Clock3 className="h-5 w-5" />}
          />

          <MetricCard
            title="In Progress"
            value={inProgress}
            description="Currently being handled"
            icon={<Activity className="h-5 w-5" />}
          />

          <MetricCard
            title="Completed"
            value={completed}
            description="Successfully resolved"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />

          <MetricCard
            title="High Priority"
            value={highPriority}
            description="Requires attention"
            icon={<Zap className="h-5 w-5" />}
          />
        </section>

        {/* Filter */}
        <section className="mb-5 rounded-2xl border border-white/10 bg-[#0d1423] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-xs text-slate-500">
              Status
            </span>

            {(
              [
                "All",
                "Pending",
                "In Progress",
                "Completed",
                "Cancelled",
              ] as const
            ).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                  statusFilter === status
                    ? "bg-orange-500 text-white"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </section>

        {/* Actions */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1423]">
          <div className="border-b border-white/10 p-5">
            <h3 className="font-semibold">
              Recovery Pipeline
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {filteredActions.length} recovery actions
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="text-center">
                <RefreshCw className="mx-auto h-6 w-6 animate-spin text-orange-400" />

                <p className="mt-3 text-sm text-slate-500">
                  Loading recovery actions...
                </p>
              </div>
            </div>
          ) : filteredActions.length === 0 ? (
            <EmptyActions onCreate={() => setShowModal(true)} />
          ) : (
            <div className="divide-y divide-white/5">
              {filteredActions.map((action) => (
                <ActionRow
                  key={action.id}
                  action={action}
                  onUpdate={updateStatus}
                  onDelete={deleteAction}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Create Modal */}
      {showModal && (
        <CreateActionModal
          action={newAction}
          setAction={setNewAction}
          onClose={() => setShowModal(false)}
          onCreate={createAction}
        />
      )}
    </main>
  );
}


/* ------------------------------------------------------- */
/* Metric Card */
/* ------------------------------------------------------- */

function MetricCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1423] p-5 transition hover:border-white/20">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-600">
            {description}
          </p>
        </div>

        <div className="rounded-xl bg-orange-500/10 p-2.5 text-orange-400">
          {icon}
        </div>
      </div>
    </div>
  );
}


/* ------------------------------------------------------- */
/* Action Row */
/* ------------------------------------------------------- */

function ActionRow({
  action,
  onUpdate,
  onDelete,
}: {
  action: RecoveryAction;
  onUpdate: (
    id: string,
    status: ActionStatus
  ) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="p-5 transition hover:bg-white/[0.02]">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
        {/* Icon */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
          {action.action_type === "Email" ? (
            <Mail className="h-5 w-5" />
          ) : action.action_type === "Phone Call" ? (
            <Phone className="h-5 w-5" />
          ) : (
            <Target className="h-5 w-5" />
          )}
        </div>

        {/* Main */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold">
              {action.customer}
            </h4>

            <PriorityBadge priority={action.priority} />

            <StatusBadge status={action.status} />
          </div>

          <p className="mt-1 text-sm text-slate-400">
            {action.action_type}
          </p>

          <p className="mt-2 max-w-3xl text-sm leading-5 text-slate-500">
            {action.description}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <UserRound className="h-3.5 w-3.5" />
              {action.owner}
            </span>

            <span>
              Created{" "}
              {formatDate(action.created_at)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          {action.status === "Pending" && (
            <button
              onClick={() =>
                onUpdate(action.id, "In Progress")
              }
              className="rounded-lg bg-orange-500/10 px-3 py-2 text-xs font-medium text-orange-400 transition hover:bg-orange-500/20"
            >
              Start
            </button>
          )}

          {action.status === "In Progress" && (
            <button
              onClick={() =>
                onUpdate(action.id, "Completed")
              }
              className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/20"
            >
              Complete
            </button>
          )}

          {action.status !== "Completed" &&
            action.status !== "Cancelled" && (
              <button
                onClick={() =>
                  onUpdate(action.id, "Cancelled")
                }
                className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-500 transition hover:bg-white/5 hover:text-white"
              >
                Cancel
              </button>
            )}

          <button
            onClick={() => onDelete(action.id)}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-red-500/10 hover:text-red-400"
            title="Delete action"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <ArrowRight className="hidden h-4 w-4 text-slate-700 xl:block" />
        </div>
      </div>
    </div>
  );
}


/* ------------------------------------------------------- */
/* Create Modal */
/* ------------------------------------------------------- */

function CreateActionModal({
  action,
  setAction,
  onClose,
  onCreate,
}: {
  action: {
    customer: string;
    action_type: ActionType;
    description: string;
    priority: Priority;
    owner: string;
  };
  setAction: React.Dispatch<
    React.SetStateAction<{
      customer: string;
      action_type: ActionType;
      description: string;
      priority: Priority;
      owner: string;
    }>
  >;
  onClose: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d1423] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <h3 className="font-semibold">
              Create Recovery Action
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Assign a concrete action to recover revenue.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4 p-5">
          <FormField label="Customer">
            <input
              value={action.customer}
              onChange={(e) =>
                setAction((current) => ({
                  ...current,
                  customer: e.target.value,
                }))
              }
              placeholder="e.g. Acme Corp"
              className="input"
            />
          </FormField>

          <FormField label="Action Type">
            <select
              value={action.action_type}
              onChange={(e) =>
                setAction((current) => ({
                  ...current,
                  action_type:
                    e.target.value as ActionType,
                }))
              }
              className="input"
            >
              <option>Email</option>
              <option>Phone Call</option>
              <option>Payment Follow-up</option>
              <option>Account Review</option>
              <option>Retention Offer</option>
            </select>
          </FormField>

          <FormField label="Priority">
            <select
              value={action.priority}
              onChange={(e) =>
                setAction((current) => ({
                  ...current,
                  priority:
                    e.target.value as Priority,
                }))
              }
              className="input"
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </FormField>

          <FormField label="Owner">
            <input
              value={action.owner}
              onChange={(e) =>
                setAction((current) => ({
                  ...current,
                  owner: e.target.value,
                }))
              }
              className="input"
            />
          </FormField>

          <FormField label="Description">
            <textarea
              value={action.description}
              onChange={(e) =>
                setAction((current) => ({
                  ...current,
                  description: e.target.value,
                }))
              }
              placeholder="Describe what needs to be done..."
              rows={4}
              className="input resize-none"
            />
          </FormField>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-white/10 p-5">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            Cancel
          </button>

          <button
            onClick={onCreate}
            disabled={
              !action.customer.trim() ||
              !action.description.trim()
            }
            className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Create Action
          </button>
        </div>
      </div>
    </div>
  );
}


/* ------------------------------------------------------- */
/* Form Field */
/* ------------------------------------------------------- */

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-slate-400">
        {label}
      </label>

      {children}
    </div>
  );
}


/* ------------------------------------------------------- */
/* Priority Badge */
/* ------------------------------------------------------- */

function PriorityBadge({
  priority,
}: {
  priority: Priority;
}) {
  const styles = {
    High: "bg-red-500/10 text-red-400 border-red-500/20",
    Medium:
      "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    Low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}


/* ------------------------------------------------------- */
/* Status Badge */
/* ------------------------------------------------------- */

function StatusBadge({
  status,
}: {
  status: ActionStatus;
}) {
  const styles = {
    Pending:
      "bg-orange-500/10 text-orange-400 border-orange-500/20",
    "In Progress":
      "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Completed:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Cancelled:
      "bg-slate-500/10 text-slate-500 border-slate-500/20",
  };

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}


/* ------------------------------------------------------- */
/* Empty State */
/* ------------------------------------------------------- */

function EmptyActions({
  onCreate,
}: {
  onCreate: () => void;
}) {
  return (
    <div className="flex min-h-[320px] items-center justify-center p-8">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10">
          <Target className="h-7 w-7 text-orange-400" />
        </div>

        <h3 className="mt-4 font-semibold">
          No recovery actions
        </h3>

        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
          Create your first recovery action to start
          converting revenue risk into measurable outcomes.
        </p>

        <button
          onClick={onCreate}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold transition hover:bg-orange-400"
        >
          <Plus className="h-4 w-4" />
          Create Action
        </button>
      </div>
    </div>
  );
}


/* ------------------------------------------------------- */
/* Helpers */
/* ------------------------------------------------------- */

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}