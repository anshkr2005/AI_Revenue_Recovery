"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  LayoutDashboard,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

type Risk = {
  entity: string;
  problem_type?: string;
  risk_level?: string;
  revenue_loss_risk?: string | number;
  recommended_action?: string;
};

type Analysis = {
  summary?: string;
  total_revenue_at_risk?: number;
  risks?: Risk[];
};

type ApiResponse = {
  success?: boolean;
  status?: string;
  generated_at?: string;
  data?: Analysis;
  analysis?: Analysis;
};

const API_URL = "http://127.0.0.1:8001";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function getRiskClass(level?: string) {
  switch (level?.toLowerCase()) {
    case "high":
      return "bg-red-50 text-red-600 border-red-100";

    case "medium":
      return "bg-amber-50 text-amber-600 border-amber-100";

    case "low":
      return "bg-emerald-50 text-emerald-600 border-emerald-100";

    default:
      return "bg-slate-50 text-slate-600 border-slate-100";
  }
}

function getRiskIcon(level?: string) {
  switch (level?.toLowerCase()) {
    case "high":
      return <ShieldAlert size={15} />;

    case "medium":
      return <AlertTriangle size={15} />;

    default:
      return <CheckCircle2 size={15} />;
  }
}

export default function Home() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/v1/demo`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const json: ApiResponse = await response.json();

      console.log("RevenueOS analysis:", json);

      const result = json.data ?? json.analysis;

      if (!result) {
        throw new Error("No analysis data received from API");
      }

      setAnalysis(result);
    } catch (err) {
      console.error("Analysis request failed:", err);

      setError(
        "Unable to connect to the RevenueOS AI engine. Make sure FastAPI is running on port 8001."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const risks = useMemo(() => {
    return analysis?.risks ?? [];
  }, [analysis]);

  const highRiskCount = useMemo(() => {
    return risks.filter(
      (risk) => risk.risk_level?.toLowerCase() === "high"
    ).length;
  }, [risks]);

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-950">

      {/* ================================================= */}
      {/* SIDEBAR */}
      {/* ================================================= */}

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[300px] border-r border-slate-200 bg-white lg:block">

        {/* Logo */}

        <div className="flex h-[96px] items-center border-b border-slate-200 px-7">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
              <DollarSign size={23} />
            </div>

            <div>
              <div className="text-[19px] font-bold tracking-tight">
                RevenueOS
              </div>

              <div className="text-sm text-slate-400">
                AI Revenue Intelligence
              </div>
            </div>

          </div>

        </div>

        {/* Navigation */}

        <nav className="space-y-2 px-4 py-7">

          <Link
            href="/"
            className="flex items-center gap-4 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-medium text-white shadow-sm"
          >
            <LayoutDashboard size={20} />
            Overview
          </Link>

          <Link
            href="/risk-monitor"
            className="flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
          >
            <ShieldAlert size={20} />
            Risk Monitor
          </Link>

          <Link
            href="/customers"
            className="flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
          >
            <Users size={20} />
            Customers
          </Link>

          <Link
            href="/recovery"
            className="flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
          >
            <DollarSign size={20} />
            Recovery
          </Link>

          <Link
            href="/ai-insights"
            className="flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
          >
            <Sparkles size={20} />
            AI Insights
          </Link>

        </nav>

        {/* System Status */}

        <div className="absolute bottom-5 left-5 right-5">

          <div className="rounded-2xl bg-slate-50 p-5">

            <div className="mb-3 flex items-center gap-2">

              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  error ? "bg-red-500" : "bg-emerald-500"
                }`}
              />

              <span className="text-sm font-medium text-slate-700">
                {error ? "AI Engine Offline" : "AI Engine Online"}
              </span>

            </div>

            <p className="text-xs leading-5 text-slate-400">
              {error
                ? "Unable to connect to Groq-powered analysis."
                : "Groq-powered revenue risk analysis is active."}
            </p>

          </div>

        </div>

      </aside>

      {/* ================================================= */}
      {/* MAIN */}
      {/* ================================================= */}

      <main className="lg:ml-[300px]">

        {/* Header */}

        <header className="sticky top-0 z-30 flex h-[96px] items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur lg:px-12">

          <div>

            <div className="text-sm font-medium uppercase tracking-[0.08em] text-slate-400">
              Revenue Intelligence
            </div>

            <h1 className="text-[25px] font-bold tracking-tight text-slate-950">
              Executive Overview
            </h1>

          </div>

          {/* WORKING REFRESH BUTTON */}

          <button
            type="button"
            onClick={fetchAnalysis}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />

            {loading ? "Analyzing..." : "Refresh Analysis"}
          </button>

        </header>

        {/* Content */}

        <div className="px-6 py-10 lg:px-12">

          {/* Hero */}

          <section className="mb-10">

            <div className="mb-4 flex items-center gap-2 text-emerald-600">

              <CheckCircle2 size={18} />

              <span className="text-sm font-medium">
                {error ? "System requires attention" : "System operational"}
              </span>

            </div>

            <h2 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 lg:text-[38px]">
              Protect your revenue before it leaks.
            </h2>

            <p className="mt-3 max-w-3xl text-[17px] leading-7 text-slate-500">
              AI continuously analyzes customer, invoice, CRM and transaction
              signals to identify revenue at risk and recommend recovery
              actions.
            </p>

          </section>

          {/* Error */}

          {error && (
            <div className="mb-8 rounded-2xl border border-red-100 bg-red-50 p-5">

              <div className="flex items-start gap-3">

                <AlertTriangle
                  size={20}
                  className="mt-0.5 shrink-0 text-red-500"
                />

                <div>

                  <p className="font-medium text-red-700">
                    Analysis unavailable
                  </p>

                  <p className="mt-1 text-sm text-red-600">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={fetchAnalysis}
                    className="mt-3 text-sm font-semibold text-red-700 underline underline-offset-4"
                  >
                    Try again
                  </button>

                </div>

              </div>

            </div>
          )}

          {/* ================================================= */}
          {/* KPI CARDS */}
          {/* ================================================= */}

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

            {/* Revenue */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-start justify-between">

                <div className="text-[15px] text-slate-500">
                  Revenue at Risk
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <DollarSign size={21} />
                </div>

              </div>

              <div className="mt-6 text-[29px] font-bold tracking-tight">
                {loading
                  ? "..."
                  : formatCurrency(
                      analysis?.total_revenue_at_risk ?? 0
                    )}
              </div>

              <div className="mt-1 text-sm text-slate-400">
                Identified exposure
              </div>

            </div>

            {/* High Risk */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-start justify-between">

                <div className="text-[15px] text-slate-500">
                  High Risk
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <ShieldAlert size={21} />
                </div>

              </div>

              <div className="mt-6 text-[29px] font-bold tracking-tight">
                {loading ? "..." : highRiskCount}
              </div>

              <div className="mt-1 text-sm text-slate-400">
                Require immediate action
              </div>

            </div>

            {/* Total Risks */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-start justify-between">

                <div className="text-[15px] text-slate-500">
                  Total Risks
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <AlertTriangle size={21} />
                </div>

              </div>

              <div className="mt-6 text-[29px] font-bold tracking-tight">
                {loading ? "..." : risks.length}
              </div>

              <div className="mt-1 text-sm text-slate-400">
                AI detected signals
              </div>

            </div>

            {/* AI Status */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-start justify-between">

                <div className="text-[15px] text-slate-500">
                  AI Status
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Bot size={21} />
                </div>

              </div>

              <div className="mt-6 text-[29px] font-bold tracking-tight">
                {error ? "Offline" : "Active"}
              </div>

              <div className="mt-1 text-sm text-slate-400">
                Groq analysis engine
              </div>

            </div>

          </section>

          {/* ================================================= */}
          {/* AI SUMMARY */}
          {/* ================================================= */}

          <section className="mt-9 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

            <div className="flex items-start gap-5">

              <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                <Bot size={23} />
              </div>

              <div className="min-w-0 flex-1">

                <div className="flex flex-wrap items-center gap-3">

                  <h3 className="text-lg font-bold">
                    AI Executive Summary
                  </h3>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                    GROQ AI
                  </span>

                </div>

                <p className="mt-3 max-w-4xl text-[15px] leading-7 text-slate-500">

                  {loading
                    ? "AI is analyzing your revenue signals..."
                    : analysis?.summary ||
                      "No summary available for the current dataset."}

                </p>

              </div>

            </div>

          </section>

          {/* ================================================= */}
          {/* PRIORITY RISKS */}
          {/* ================================================= */}

          <section className="mt-9 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* Header */}

            <div className="flex items-center justify-between border-b border-slate-100 px-7 py-6">

              <div>

                <h3 className="text-lg font-bold">
                  Priority Revenue Risks
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  AI-ranked issues requiring attention
                </p>

              </div>

              <Link
                href="/risk-monitor"
                className="hidden items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950 sm:flex"
              >
                View all
                <ArrowUpRight size={16} />
              </Link>

            </div>

            {/* Loading */}

            {loading && (
              <div className="px-7 py-14 text-center">

                <RefreshCw
                  size={25}
                  className="mx-auto animate-spin text-slate-400"
                />

                <p className="mt-3 text-sm text-slate-400">
                  Running AI risk analysis...
                </p>

              </div>
            )}

            {/* Empty */}

            {!loading && risks.length === 0 && !error && (
              <div className="px-7 py-14 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={23} />
                </div>

                <h4 className="mt-4 font-semibold">
                  No revenue risks detected
                </h4>

                <p className="mt-1 text-sm text-slate-400">
                  Your current dataset shows no identified revenue leakage.
                </p>

              </div>
            )}

            {/* Risk rows */}

            {!loading && risks.length > 0 && (

              <div className="divide-y divide-slate-100">

                {risks.slice(0, 5).map((risk, index) => (

                  <div
                    key={`${risk.entity}-${index}`}
                    className="flex flex-col gap-5 px-7 py-6 transition hover:bg-slate-50 lg:flex-row lg:items-center"
                  >

                    {/* Customer */}

                    <div className="min-w-0 flex-1">

                      <Link
                        href={`/customers/${encodeURIComponent(
                          risk.entity
                        )}`}
                        className="group inline-flex items-center gap-2"
                      >

                        <span className="truncate font-semibold text-slate-900 group-hover:text-orange-600">
                          {risk.entity}
                        </span>

                        <ChevronRight
                          size={15}
                          className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-orange-500"
                        />

                      </Link>

                      <p className="mt-1 truncate text-sm text-slate-400">
                        {risk.problem_type || "Revenue risk signal detected"}
                      </p>

                    </div>

                    {/* Risk */}

                    <div className="flex items-center gap-3">

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getRiskClass(
                          risk.risk_level
                        )}`}
                      >
                        {getRiskIcon(risk.risk_level)}
                        {risk.risk_level || "Unknown"}
                      </span>

                    </div>

                    {/* Revenue */}

                    <div className="min-w-[150px]">

                      <div className="text-xs uppercase tracking-wide text-slate-400">
                        Exposure
                      </div>

                      <div className="mt-1 font-semibold text-slate-900">
                        {typeof risk.revenue_loss_risk === "number"
                          ? formatCurrency(risk.revenue_loss_risk)
                          : risk.revenue_loss_risk || "—"}
                      </div>

                    </div>

                    {/* Action */}

                    <Link
                      href={`/customers/${encodeURIComponent(
                        risk.entity
                      )}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Review
                      <ArrowUpRight size={15} />
                    </Link>

                  </div>

                ))}

              </div>

            )}

            {/* Bottom link */}

            {!loading && risks.length > 5 && (

              <div className="border-t border-slate-100 px-7 py-4">

                <Link
                  href="/risk-monitor"
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
                >
                  View {risks.length - 5} more risks
                  <ChevronRight size={15} />
                </Link>

              </div>

            )}

          </section>

          {/* ================================================= */}
          {/* INSIGHT CARDS */}
          {/* ================================================= */}

          <section className="mt-9 grid gap-5 md:grid-cols-3">

            <Link
              href="/risk-monitor"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <ShieldAlert size={21} />
              </div>

              <h3 className="mt-5 font-semibold">
                Monitor Revenue Risk
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Explore every customer signal and prioritize your highest
                exposure accounts.
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-medium text-slate-700">
                Open Risk Monitor
                <ArrowUpRight
                  size={15}
                  className="transition group-hover:translate-x-0.5"
                />
              </div>

            </Link>

            <Link
              href="/customers"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Users size={21} />
              </div>

              <h3 className="mt-5 font-semibold">
                Customer 360
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Review customer-level risk signals, revenue exposure and
                recovery opportunities.
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-medium text-slate-700">
                View Customers
                <ArrowUpRight
                  size={15}
                  className="transition group-hover:translate-x-0.5"
                />
              </div>

            </Link>

            <Link
              href="/recovery"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Zap size={21} />
              </div>

              <h3 className="mt-5 font-semibold">
                Recovery Actions
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Turn AI risk signals into trackable revenue recovery actions
                for your team.
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-medium text-slate-700">
                Manage Recovery
                <ArrowUpRight
                  size={15}
                  className="transition group-hover:translate-x-0.5"
                />
              </div>

            </Link>

          </section>

          {/* Footer */}

          <footer className="py-10 text-center text-xs text-slate-400">
            RevenueOS AI · Revenue Intelligence Platform · Groq-powered
          </footer>

        </div>

      </main>

    </div>
  );
}