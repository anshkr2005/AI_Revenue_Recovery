"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  DollarSign,
  Lightbulb,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Users,
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
  data?: Analysis;
  analysis?: Analysis;
};

const API_URL = "http://127.0.0.1:8001";

export default function AIInsightsPage() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/v1/demo`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }

      const json: ApiResponse = await response.json();

      setAnalysis(json.data ?? json.analysis ?? null);
    } catch (err) {
      console.error(err);
      setError("Unable to load AI insights.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  const risks = analysis?.risks ?? [];

  const highRisk = risks.filter(
    (risk) => risk.risk_level?.toLowerCase() === "high"
  );

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-950">

      {/* Sidebar */}

      <aside className="fixed left-0 top-0 hidden h-screen w-[300px] border-r border-slate-200 bg-white lg:block">

        <div className="flex h-[96px] items-center border-b border-slate-200 px-7">

          <Link href="/" className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
              <DollarSign size={22} />
            </div>

            <div>
              <div className="text-lg font-bold">
                RevenueOS
              </div>

              <div className="text-sm text-slate-400">
                AI Revenue Intelligence
              </div>
            </div>

          </Link>

        </div>

        <nav className="space-y-2 px-4 py-7">

          <Link
            href="/"
            className="flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-medium text-slate-500 hover:bg-slate-50"
          >
            <TrendingUp size={20} />
            Overview
          </Link>

          <Link
            href="/risk-monitor"
            className="flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-medium text-slate-500 hover:bg-slate-50"
          >
            <ShieldAlert size={20} />
            Risk Monitor
          </Link>

          <Link
            href="/customers"
            className="flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-medium text-slate-500 hover:bg-slate-50"
          >
            <Users size={20} />
            Customers
          </Link>

          <Link
            href="/recovery"
            className="flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-medium text-slate-500 hover:bg-slate-50"
          >
            <DollarSign size={20} />
            Recovery
          </Link>

          <Link
            href="/ai-insights"
            className="flex items-center gap-4 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-medium text-white"
          >
            <Sparkles size={20} />
            AI Insights
          </Link>

        </nav>

      </aside>

      {/* Main */}

      <main className="lg:ml-[300px]">

        <header className="flex h-[96px] items-center justify-between border-b border-slate-200 bg-white px-6 lg:px-12">

          <div>

            <p className="text-sm uppercase tracking-wider text-slate-400">
              Artificial Intelligence
            </p>

            <h1 className="text-2xl font-bold">
              AI Insights
            </h1>

          </div>

          <button
            onClick={loadInsights}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />

            {loading ? "Analyzing..." : "Refresh Insights"}
          </button>

        </header>

        <div className="px-6 py-10 lg:px-12">

          {/* Hero */}

          <div className="mb-9">

            <div className="flex items-center gap-2 text-emerald-600">

              <CheckCircle2 size={18} />

              <span className="text-sm font-medium">
                Groq AI engine active
              </span>

            </div>

            <h2 className="mt-3 text-4xl font-bold tracking-tight">
              Intelligence behind your revenue.
            </h2>

            <p className="mt-3 max-w-3xl text-[17px] leading-7 text-slate-500">
              RevenueOS converts customer and transaction signals into
              actionable revenue recovery intelligence.
            </p>

          </div>

          {/* Error */}

          {error && (
            <div className="mb-8 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* AI summary */}

          <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

            <div className="flex items-start gap-5">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                <Bot size={25} />
              </div>

              <div>

                <div className="flex flex-wrap items-center gap-3">

                  <h3 className="text-xl font-bold">
                    Executive AI Assessment
                  </h3>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                    GROQ AI
                  </span>

                </div>

                <p className="mt-4 max-w-4xl text-[15px] leading-7 text-slate-500">

                  {loading
                    ? "AI is analyzing your revenue data..."
                    : analysis?.summary ||
                      "No AI summary available."}

                </p>

              </div>

            </div>

          </section>

          {/* Insight cards */}

          <section className="mt-7 grid gap-5 md:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <ShieldAlert size={21} />
              </div>

              <p className="mt-5 text-sm text-slate-400">
                High Priority Signals
              </p>

              <p className="mt-2 text-3xl font-bold">
                {loading ? "..." : highRisk.length}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Customers requiring immediate attention.
              </p>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Target size={21} />
              </div>

              <p className="mt-5 text-sm text-slate-400">
                Revenue Exposure
              </p>

              <p className="mt-2 text-3xl font-bold">
                ₹{(
                  analysis?.total_revenue_at_risk ?? 0
                ).toLocaleString("en-IN")}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Estimated revenue currently at risk.
              </p>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Lightbulb size={21} />
              </div>

              <p className="mt-5 text-sm text-slate-400">
                AI Recommendations
              </p>

              <p className="mt-2 text-3xl font-bold">
                {loading ? "..." : risks.length}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Revenue recovery opportunities identified.
              </p>

            </div>

          </section>

          {/* Recommendations */}

          <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-7 py-6">

              <div className="flex items-center gap-3">

                <Sparkles
                  size={20}
                  className="text-orange-500"
                />

                <div>

                  <h3 className="text-lg font-bold">
                    AI Recovery Recommendations
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Recommended actions based on detected revenue signals
                  </p>

                </div>

              </div>

            </div>

            {loading ? (

              <div className="py-16 text-center">

                <RefreshCw
                  size={25}
                  className="mx-auto animate-spin text-slate-400"
                />

                <p className="mt-3 text-sm text-slate-400">
                  Generating recommendations...
                </p>

              </div>

            ) : risks.length === 0 ? (

              <div className="py-16 text-center">

                <CheckCircle2
                  size={32}
                  className="mx-auto text-emerald-500"
                />

                <p className="mt-4 font-semibold">
                  No immediate recommendations
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Current customer signals look healthy.
                </p>

              </div>

            ) : (

              <div className="divide-y divide-slate-100">

                {risks.map((risk, index) => (

                  <div
                    key={`${risk.entity}-${index}`}
                    className="px-7 py-6"
                  >

                    <div className="flex flex-col gap-5 md:flex-row">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                        <Lightbulb size={20} />
                      </div>

                      <div className="flex-1">

                        <div className="flex flex-wrap items-center gap-3">

                          <h4 className="font-semibold">
                            {risk.entity}
                          </h4>

                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                            {risk.risk_level || "Risk"}
                          </span>

                        </div>

                        <p className="mt-2 text-sm text-slate-400">
                          {risk.problem_type ||
                            "Revenue risk signal detected"}
                        </p>

                        <div className="mt-4 rounded-xl bg-slate-50 p-4">

                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Recommended Action
                          </p>

                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {risk.recommended_action ||
                              "Review the customer account and initiate a recovery workflow."}
                          </p>

                        </div>

                      </div>

                      <Link
                        href={`/customers/${encodeURIComponent(
                          risk.entity
                        )}`}
                        className="inline-flex h-fit items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
                      >
                        Review
                        <ArrowUpRight size={15} />
                      </Link>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </section>

          {/* Footer */}

          <footer className="py-10 text-center text-xs text-slate-400">
            RevenueOS AI · AI-powered Revenue Intelligence
          </footer>

        </div>

      </main>

    </div>
  );
}