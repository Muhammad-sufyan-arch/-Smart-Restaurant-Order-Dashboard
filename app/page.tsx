"use client";

import { useCallback, useEffect, useState } from "react";

interface Order {
  id: string;
  customerName: string;
  tableNumber: number;
  items: string;
  totalAmount: number;
  status: "Pending" | "Served";
}

const emptyForm = {
  customerName: "",
  tableNumber: "",
  items: "",
  totalAmount: "",
};

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<"all" | "Pending" | "Served">("all");

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const totalRevenue = orders
    .filter((o) => o.status === "Served")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const activeTables = new Set(
    orders.filter((o) => o.status === "Pending").map((o) => o.tableNumber),
  ).size;

  const pendingCount = orders.filter((o) => o.status === "Pending").length;

  const filteredOrders =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          tableNumber: Number(form.tableNumber),
          items: form.items,
          totalAmount: Number(form.totalAmount),
        }),
      });
      if (res.ok) {
        setForm(emptyForm);
        setShowForm(false);
        await fetchOrders();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function completeOrder(id: string) {
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "Served" }),
    });
    await fetchOrders();
  }

  async function deleteOrder(id: string) {
    await fetch(`/api/orders?id=${id}`, { method: "DELETE" });
    await fetchOrders();
  }

  return (
    <div className="min-h-full bg-[#0c0a09] text-stone-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-orange-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-700/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-amber-400/80">
                Smart Restaurant
              </span>
            </div>
            <h1 className="font-sans text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Order Dashboard
            </h1>
            <p className="mt-2 text-sm text-stone-400">
              Manage tables, track orders, and monitor revenue in real time.
            </p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 text-sm font-semibold text-stone-950 shadow-lg shadow-amber-500/20 transition hover:from-amber-400 hover:to-orange-500 hover:shadow-amber-500/30"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Order
          </button>
        </header>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
            sub="From completed orders"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="Active Tables"
            value={String(activeTables)}
            sub={`${pendingCount} pending order${pendingCount !== 1 ? "s" : ""}`}
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            }
          />
          <StatCard
            label="Total Orders"
            value={String(orders.length)}
            sub={`${orders.filter((o) => o.status === "Served").length} served today`}
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            }
          />
        </div>

        {showForm && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-stone-800/80 bg-stone-900/60 shadow-xl backdrop-blur-sm">
            <div className="border-b border-stone-800/80 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Place New Order</h2>
              <p className="text-sm text-stone-400">Enter customer details and menu items.</p>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
              <FormField label="Customer Name">
                <input
                  required
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  placeholder="e.g. John Doe"
                  className={inputClass}
                />
              </FormField>
              <FormField label="Table Number">
                <input
                  required
                  type="number"
                  min={1}
                  value={form.tableNumber}
                  onChange={(e) => setForm({ ...form, tableNumber: e.target.value })}
                  placeholder="e.g. 5"
                  className={inputClass}
                />
              </FormField>
              <FormField label="Items Ordered" className="sm:col-span-2">
                <textarea
                  required
                  rows={2}
                  value={form.items}
                  onChange={(e) => setForm({ ...form, items: e.target.value })}
                  placeholder="e.g. Ribeye Steak, Garlic Bread, Sparkling Water"
                  className={`${inputClass} resize-none`}
                />
              </FormField>
              <FormField label="Bill Amount ($)">
                <input
                  required
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.totalAmount}
                  onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                  placeholder="e.g. 54.99"
                  className={inputClass}
                />
              </FormField>
              <div className="flex items-end gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-400 disabled:opacity-50"
                >
                  {submitting ? "Saving…" : "Add Order"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setForm(emptyForm);
                  }}
                  className="rounded-xl px-4 py-2.5 text-sm text-stone-400 transition hover:text-stone-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mb-5 flex items-center gap-2">
          {(["all", "Pending", "Served"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                filter === f
                  ? "bg-stone-800 text-amber-400"
                  : "text-stone-500 hover:bg-stone-900 hover:text-stone-300"
              }`}
            >
              {f === "all" ? "All Orders" : f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-700 border-t-amber-400" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-800 py-20 text-center">
            <p className="text-stone-500">No orders found.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-sm font-medium text-amber-400 hover:text-amber-300"
            >
              Create your first order →
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onComplete={() => completeOrder(order.id)}
                onDelete={() => deleteOrder(order.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-stone-700/80 bg-stone-950/50 px-4 py-2.5 text-sm text-stone-100 placeholder:text-stone-600 outline-none transition focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20";

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-stone-800/80 bg-stone-900/50 p-5 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-stone-500">{label}</span>
        <span className="text-amber-500/70">{icon}</span>
      </div>
      <p className="text-2xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-xs text-stone-500">{sub}</p>
    </div>
  );
}

function FormField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-stone-400">{label}</span>
      {children}
    </label>
  );
}

function OrderCard({
  order,
  onComplete,
  onDelete,
}: {
  order: Order;
  onComplete: () => void;
  onDelete: () => void;
}) {
  const isPending = order.status === "Pending";

  return (
    <article className="group flex flex-col rounded-2xl border border-stone-800/80 bg-stone-900/40 p-5 backdrop-blur-sm transition hover:border-stone-700/80 hover:bg-stone-900/60">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-800 text-xs font-bold text-amber-400">
              {order.tableNumber}
            </span>
            <span className="text-xs text-stone-500">Table</span>
          </div>
          <h3 className="font-semibold text-white">{order.customerName}</h3>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <p className="mb-4 flex-1 text-sm leading-relaxed text-stone-400">{order.items}</p>

      <div className="mb-4 flex items-center justify-between border-t border-stone-800/80 pt-4">
        <span className="text-xs text-stone-500">Bill Total</span>
        <span className="text-lg font-semibold text-amber-400">${order.totalAmount.toFixed(2)}</span>
      </div>

      <div className="flex gap-2">
        {isPending && (
          <button
            onClick={onComplete}
            className="flex-1 rounded-xl bg-emerald-600/90 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
          >
            Mark Served
          </button>
        )}
        <button
          onClick={onDelete}
          className={`rounded-xl border border-stone-700/80 py-2 text-xs font-medium text-stone-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 ${isPending ? "px-4" : "flex-1"}`}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const isPending = status === "Pending";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        isPending
          ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25"
          : "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isPending ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`}
      />
      {status}
    </span>
  );
}
