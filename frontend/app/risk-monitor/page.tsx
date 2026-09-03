"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Bot,
  ChevronRight,
  DollarSign,
  RefreshCw,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Users,
} from "lucide-react";

type RiskLevel = "High" | "Medium" | "Low";

type Risk = {
  entity: string;
  problem_type: string;
  risk_level: RiskLevel;
  revenue_loss_risk: string;
  recommended_action: string;
};

type Analysis = {
  summary: string;
  total_revenue_at_risk: number;
  risks: Risk[];
};

type SortKey = "risk" | "revenue" | "customer";

export default function RiskMonitorPage() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<"All" | RiskLevel>("All");
  const [sortKey, setSortKey] = useState<SortKey>("risk");
  const [sortAsc, setSortAsc] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRisks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8001/api/v1/demo"
      );

      if (!response.ok) {
        throw new Error("Failed to load risk data");
      }

      const data = await response.json();

      setAnalysis(data.analysis);
    } catch {
      setError(
        "Unable to connect to RevenueOS API. Make sure FastAPI is running on port 8001."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRisks();
  }, []);

  const risks = analysis?.risks ?? [];

  const filteredRisks = useMemo(() => {
    let result = [...risks];

    // Risk filter
    if (riskFilter !== "All") {
      result = result.filter(
        (risk) => risk.risk_level === riskFilter
      );
    }

    // Search
    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter(
        (risk) =>
          risk.entity.toLowerCase().includes(query) ||
          risk.problem_type.toLowerCase().includes(query)
      );
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;

      if (sortKey === "customer") {
        comparison = a.entity.localeCompare(b.entity);
      }

      if (sortKey === "risk") {
        const order = {
          High: 3,
          Medium: 2,
          Low: 1,
        };

        comparison =
          order[a.risk_level] - order[b.risk_level];
      }

      if (sortKey === "revenue") {
        comparison =
          extractAmount(a.revenue_loss_risk) -
          extractAmount(b.revenue_loss_risk);
      }

      return sortAsc ? comparison : -comparison;
    });

    return result;
  }, [
    risks,
    search,
    riskFilter,
    sortKey,
    sortAsc,
  ]);

  const highRiskCount = risks.filter(
    (risk) => risk.risk_level === "High"
  ).length;

  const mediumRiskCount = risks.filter(
    (risk) => risk.risk_level === "Medium"
  ).length;

  const lowRiskCount = risks.filter(
    (risk) => risk.risk_level === "Low"
  ).length;

  const customerCount = new Set(
    risks.map((risk) => risk.entity)
  ).size;

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0f1c]/90 backdrop-blur-xl">
        <div className="flex h-20 items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-500/15 p-2.5">
              <ShieldAlert className="h-6 w-6 text-orange-400" />
            </div>

            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Risk Monitor
              </h1>

              <p className="text-xs text-slate-400">
                Revenue intelligence & recovery signals
              </p>
            </div>
          </div>

          <button
            onClick={loadRisks}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />

            Refresh
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] p-6 lg:p-10">
        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-medium">
                API connection failed
              </p>

              <p className="mt-1 text-red-300/80">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Intro */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-orange-400">
            REVENUE PROTECTION
          </p>

          <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
            Monitor revenue risk
          </h2>

          <p className="mt-2 max-w-2xl text-slate-400">
            Identify customers and business signals that could put
            revenue at risk, then prioritize recovery actions.
          </p>
        </div>

        {/* KPI Cards */}
        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Revenue at Risk"
            value={formatCurrency(
              analysis?.total_revenue_at_risk ?? 0
            )}
            icon={<DollarSign className="h-5 w-5" />}
            description="Potential exposure"
          />

          <StatCard
            title="High Risk"
            value={highRiskCount.toString()}
            icon={<ShieldAlert className="h-5 w-5" />}
            description="Immediate attention"
            accent="red"
          />

          <StatCard
            title="Medium Risk"
            value={mediumRiskCount.toString()}
            icon={<AlertTriangle className="h-5 w-5" />}
            description="Needs monitoring"
            accent="yellow"
          />

          <StatCard
            title="Customers Affected"
            value={customerCount.toString()}
            icon={<Users className="h-5 w-5" />}
            description={`${lowRiskCount} low-risk signals`}
          />
        </section>

        {/* AI Summary */}
        <section className="mb-8 overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-[#0d1423] to-[#0a0f1c]">
          <div className="flex items-start gap-4 p-6">
            <div className="rounded-xl bg-orange-500/15 p-3">
              <Bot className="h-6 w-6 text-orange-400" />
            </div>

            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <h3 className="font-semibold">
                  AI Risk Intelligence
                </h3>

                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  Groq AI
                </span>
              </div>

              <p className="text-sm leading-6 text-slate-300">
                {loading
                  ? "Analyzing revenue signals..."
                  : analysis?.summary ||
                    "No AI summary available."}
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="mb-5 rounded-2xl border border-white/10 bg-[#0d1423] p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            {/* Search */}
            <div className="relative w-full xl:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search customer or risk..."
                className="w-full rounded-xl border border-white/10 bg-black/20 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-600 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="mr-2 flex items-center gap-2 text-xs text-slate-500">
                <SlidersHorizontal className="h-4 w-4" />

                Filter
              </div>

              {(
                ["All", "High", "Medium", "Low"] as const
              ).map((level) => (
                <button
                  key={level}
                  onClick={() =>
                    setRiskFilter(level)
                  }
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                    riskFilter === level
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                      : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Risk Table */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1423]">
          {/* Table Header */}
          <div className="flex flex-col gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold">
                Priority Revenue Risks
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Showing {filteredRisks.length} of{" "}
                {risks.length} risk signals
              </p>
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                Sort by
              </span>

              {(
                [
                  ["risk", "Risk"],
                  ["revenue", "Revenue"],
                  ["customer", "Customer"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    if (sortKey === key) {
                      setSortAsc((current) => !current);
                    } else {
                      setSortKey(key);
                      setSortAsc(false);
                    }
                  }}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs transition ${
                    sortKey === key
                      ? "bg-orange-500/10 text-orange-400"
                      : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {label}

                  {sortKey === key &&
                    (sortAsc ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    ))}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <LoadingState />
          ) : filteredRisks.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-4 font-medium">
                      Customer
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Risk Signal
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Severity
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Revenue Exposure
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Recommended Action
                    </th>

                    <th className="px-5 py-4 text-right">
                      View
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRisks.map(
                    (risk, index) => (
                      <RiskRow
                        key={`${risk.entity}-${index}`}
                        risk={risk}
                      />
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Bottom Status */}
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-[#0d1423] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />

            <span className="text-xs text-slate-400">
              RevenueOS intelligence engine operational
            </span>
          </div>

          <span className="hidden text-xs text-slate-600 sm:block">
            Deterministic risk scoring + Groq AI
          </span>
        </div>
      </div>
    </main>
  );
}

/* ---------------------------------- */
/* Stat Card */
/* ---------------------------------- */

function StatCard({
  title,
  value,
  icon,
  description,
  accent = "orange",
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  accent?: "orange" | "red" | "yellow";
}) {
  const accentClasses = {
    orange: "bg-orange-500/10 text-orange-400",
    red: "bg-red-500/10 text-red-400",
    yellow: "bg-yellow-500/10 text-yellow-400",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1423] p-5 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#101827]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-600">
            {description}
          </p>
        </div>

        <div
          className={`rounded-xl p-2.5 ${accentClasses[accent]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- */
/* Risk Row */
/* ---------------------------------- */

function RiskRow({ risk }: { risk: Risk }) {
  const customerUrl = `/customers/${encodeURIComponent(
    risk.entity
  )}`;

  return (
    <tr className="border-b border-white/5 transition hover:bg-white/[0.025]">
      {/* Customer */}
      <td className="px-5 py-5">
        <div>
          <Link
            href={customerUrl}
            className="font-medium text-white transition hover:text-orange-400"
          >
            {risk.entity}
          </Link>

          <p className="mt-1 text-xs text-slate-600">
            Customer account
          </p>
        </div>
      </td>

      {/* Risk */}
      <td className="max-w-xs px-5 py-5">
        <p className="text-sm text-slate-300">
          {risk.problem_type}
        </p>
      </td>

      {/* Severity */}
      <td className="px-5 py-5">
        <RiskBadge level={risk.risk_level} />
      </td>

      {/* Revenue */}
      <td className="px-5 py-5">
        <p className="font-semibold text-white">
          {risk.revenue_loss_risk}
        </p>
      </td>

      {/* Recommended Action */}
      <td className="max-w-md px-5 py-5">
        <p className="text-sm leading-5 text-slate-400">
          {risk.recommended_action}
        </p>
      </td>

      {/* Customer 360 */}
      <td className="px-5 py-5 text-right">
        <Link
          href={customerUrl}
          title={`View ${risk.entity}`}
          aria-label={`View ${risk.entity}`}
          className="inline-flex rounded-lg border border-white/5 bg-white/[0.02] p-2 text-slate-500 transition hover:border-orange-500/20 hover:bg-orange-500/10 hover:text-orange-400"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </td>
    </tr>
  );
}

/* ---------------------------------- */
/* Risk Badge */
/* ---------------------------------- */

function RiskBadge({
  level,
}: {
  level: RiskLevel;
}) {
  const styles = {
    High: "bg-red-500/10 text-red-400 border-red-500/20",
    Medium:
      "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    Low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  const dotStyles = {
    High: "bg-red-400",
    Medium: "bg-yellow-400",
    Low: "bg-emerald-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[level]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${dotStyles[level]}`}
      />

      {level}
    </span>
  );
}

/* ---------------------------------- */
/* Loading */
/* ---------------------------------- */

function LoadingState() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="text-center">
        <RefreshCw className="mx-auto h-6 w-6 animate-spin text-orange-400" />

        <p className="mt-3 text-sm text-slate-500">
          Loading risk intelligence...
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------- */
/* Empty State */
/* ---------------------------------- */

function EmptyState() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="text-center">
        <ShieldAlert className="mx-auto h-8 w-8 text-slate-600" />

        <p className="mt-3 font-medium text-slate-400">
          No risks found
        </p>

        <p className="mt-1 text-xs text-slate-600">
          Try changing your search or filters.
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------- */
/* Helpers */
/* ---------------------------------- */

function extractAmount(value: string) {
  const cleaned = value.replace(/,/g, "");

  const match = cleaned.match(/[\d.]+/);

  return match ? Number(match[0]) : 0;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}