"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  RefreshCw,
  Search,
  ShieldAlert,
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

function riskClass(level?: string) {
  switch (level?.toLowerCase()) {
    case "high":
      return "border-red-100 bg-red-50 text-red-600";
    case "medium":
      return "border-amber-100 bg-amber-50 text-amber-600";
    case "low":
      return "border-emerald-100 bg-emerald-50 text-emerald-600";
    default:
      return "border-slate-100 bg-slate-50 text-slate-500";
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function CustomersPage() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCustomers = async () => {
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
      setError("Unable to load customer data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const customers = useMemo(() => {
    const map = new Map<string, Risk>();

    for (const risk of analysis?.risks ?? []) {
      if (!map.has(risk.entity)) {
        map.set(risk.entity, risk);
      }
    }

    return Array.from(map.values());
  }, [analysis]);

  const filteredCustomers = customers.filter((customer) =>
    customer.entity.toLowerCase().includes(search.toLowerCase())
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
            <Users size={20} />
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
            className="flex items-center gap-4 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-medium text-white"
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
            className="flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-medium text-slate-500 hover:bg-slate-50"
          >
            <AlertTriangle size={20} />
            AI Insights
          </Link>

        </nav>

      </aside>

      {/* Main */}

      <main className="lg:ml-[300px]">

        <header className="flex h-[96px] items-center justify-between border-b border-slate-200 bg-white px-6 lg:px-12">

          <div>
            <p className="text-sm uppercase tracking-wider text-slate-400">
              Customer Intelligence
            </p>

            <h1 className="text-2xl font-bold">
              Customer 360
            </h1>
          </div>

          <button
            onClick={loadCustomers}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

        </header>

        <div className="px-6 py-10 lg:px-12">

          {/* Hero */}

          <div className="mb-8">

            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 size={18} />
              <span className="text-sm font-medium">
                AI customer intelligence active
              </span>
            </div>

            <h2 className="mt-3 text-4xl font-bold tracking-tight">
              Understand every customer.
            </h2>

            <p className="mt-3 max-w-2xl text-slate-500">
              Review customer-level revenue exposure, risk signals and
              recommended recovery strategies.
            </p>

          </div>

          {/* Stats */}

          <div className="mb-8 grid gap-5 md:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Customers with Risk
              </p>

              <p className="mt-4 text-3xl font-bold">
                {loading ? "..." : customers.length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Revenue at Risk
              </p>

              <p className="mt-4 text-3xl font-bold">
                {loading
                  ? "..."
                  : formatCurrency(
                      analysis?.total_revenue_at_risk ?? 0
                    )}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                High Risk Accounts
              </p>

              <p className="mt-4 text-3xl font-bold">
                {loading
                  ? "..."
                  : customers.filter(
                      (c) =>
                        c.risk_level?.toLowerCase() === "high"
                    ).length}
              </p>
            </div>

          </div>

          {/* Search */}

          <div className="mb-6 flex items-center rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">

            <Search size={18} className="text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers..."
              className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />

          </div>

          {/* Error */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Customer list */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-7 py-6">

              <h3 className="text-lg font-bold">
                Customers
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                AI-ranked customer revenue exposure
              </p>

            </div>

            {loading ? (

              <div className="py-16 text-center">

                <RefreshCw
                  size={25}
                  className="mx-auto animate-spin text-slate-400"
                />

                <p className="mt-3 text-sm text-slate-400">
                  Loading customers...
                </p>

              </div>

            ) : filteredCustomers.length === 0 ? (

              <div className="py-16 text-center">

                <Users
                  size={30}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 font-medium">
                  No customers found
                </p>

              </div>

            ) : (

              <div className="divide-y divide-slate-100">

                {filteredCustomers.map((customer) => (

                  <Link
                    key={customer.entity}
                    href={`/customers/${encodeURIComponent(
                      customer.entity
                    )}`}
                    className="flex flex-col gap-4 px-7 py-6 transition hover:bg-slate-50 md:flex-row md:items-center"
                  >

                    <div className="flex-1">

                      <div className="font-semibold">
                        {customer.entity}
                      </div>

                      <div className="mt-1 text-sm text-slate-400">
                        {customer.problem_type ||
                          "No major issue detected"}
                      </div>

                    </div>

                    <div>
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${riskClass(
                          customer.risk_level
                        )}`}
                      >
                        {customer.risk_level === "High" && (
                          <ShieldAlert size={14} />
                        )}

                        {customer.risk_level ||
                          "Healthy"}
                      </span>
                    </div>

                    <div className="min-w-[170px]">

                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Exposure
                      </p>

                      <p className="mt-1 font-semibold">
                        {typeof customer.revenue_loss_risk ===
                        "number"
                          ? formatCurrency(
                              customer.revenue_loss_risk
                            )
                          : customer.revenue_loss_risk || "—"}
                      </p>

                    </div>

                    <ChevronRight
                      size={19}
                      className="text-slate-300"
                    />

                  </Link>

                ))}

              </div>

            )}

          </div>

          <div className="py-10 text-center text-xs text-slate-400">
            RevenueOS AI · Customer Intelligence
          </div>

        </div>

      </main>

    </div>
  );
}