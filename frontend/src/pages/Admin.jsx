import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  DollarSign,
  ShoppingBag,
  Users,
  FileText,
  Headphones,
  FlaskConical,
  Stethoscope,
  PackageSearch,
  Download,
  RefreshCw,
} from "lucide-react";
import { api } from "../api";

const menu = ["Overview", "Orders", "Products", "Prescriptions", "Bookings", "Support"];

export default function Admin() {
  const [tab, setTab] = useState("Overview");
  const [metrics, setMetrics] = useState(null);
  const [data, setData] = useState({ orders: [], products: [], prescriptions: [], labBookings: [], doctorBookings: [], supportTickets: [] });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [m, orders, products, prescriptions, labBookings, doctorBookings, supportTickets] = await Promise.all([
        api("/admin/metrics"),
        api("/admin/orders"),
        api("/admin/products"),
        api("/admin/prescriptions"),
        api("/admin/lab-bookings"),
        api("/admin/doctor-bookings"),
        api("/admin/support-tickets"),
      ]);
      setMetrics(m);
      setData({ orders, products, prescriptions, labBookings, doctorBookings, supportTickets });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const cards = useMemo(() => metrics ? [
    [DollarSign, "Revenue", `৳${metrics.revenue.toLocaleString()}`],
    [ShoppingBag, "Orders", metrics.orders],
    [Users, "Customers", metrics.customers],
    [FileText, "Prescriptions", metrics.prescriptions],
    [Headphones, "Open support", metrics.pendingSupport],
    [PackageSearch, "Low stock", metrics.lowStock],
    [FlaskConical, "Lab bookings", metrics.labBookings],
    [Stethoscope, "Doctor bookings", metrics.doctorBookings],
  ] : [], [metrics]);

  const exportReport = () => {
    const rows = [
      ["Metric", "Value"],
      ...cards.map(([, label, value]) => [label, value]),
      [],
      ["Recent Order", "Customer", "Total", "Status"],
      ...data.orders.slice(0, 50).map((order) => [order.id, order.address?.name || "Customer", order.total, order.status]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `arocare-admin-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const changeOrderStatus = async (id, status) => {
    const updated = await api(`/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setData((current) => ({ ...current, orders: current.orders.map((order) => order.id === id ? updated : order) }));
  };

  if (loading && !metrics) return <div className="admin-loading">Loading dashboard...</div>;

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="logo"><span className="logo-leaf"><Activity /></span><span>AroCare Admin</span></div>
        {menu.map((item) => <button className={tab === item ? "active" : ""} key={item} onClick={() => setTab(item)}>{item}</button>)}
        <button onClick={load}><RefreshCw />Refresh data</button>
      </aside>

      <main className="admin-main">
        <div className="admin-head"><div><span>Operations overview</span><h1>{tab}</h1></div><button onClick={exportReport}><Download />Export report</button></div>

        {tab === "Overview" && <>
          <div className="metric-grid">{cards.map(([Icon, label, value]) => <article className="metric" key={label}><Icon /><span>{label}</span><strong>{value}</strong><small>Live demo data</small></article>)}</div>
          <div className="admin-panels">
            <section className="panel"><h3>Recent orders</h3>{data.orders.length ? data.orders.slice(0, 5).map((order) => <div className="order-row" key={order.id}><b>{order.id}</b><span>{order.address?.name || "Demo customer"}</span><strong>৳{order.total}</strong><em>{order.status}</em></div>) : <p>No new orders.</p>}</section>
            <section className="panel"><h3>Support queue</h3>{data.supportTickets.length ? data.supportTickets.slice(0, 5).map((ticket) => <div className="support-row" key={ticket.id}><span>{ticket.name?.[0] || "?"}</span><div><b>{ticket.name}</b><small>{ticket.issue}</small></div><button>{ticket.status}</button></div>) : <p>No open tickets.</p>}</section>
          </div>
        </>}

        {tab === "Orders" && <section className="panel admin-table-panel"><h3>Orders</h3><div className="admin-table"><div className="admin-table-head"><b>ID</b><b>Customer</b><b>Total</b><b>Payment</b><b>Status</b></div>{data.orders.map((order) => <div className="admin-table-row" key={order.id}><span>{order.id}</span><span>{order.address?.name || "Demo customer"}</span><span>৳{order.total}</span><span>{order.payment || "COD"}</span><select value={order.status} onChange={(event) => changeOrderStatus(order.id, event.target.value)}><option>Order confirmed</option><option>Pharmacist reviewed</option><option>Packed</option><option>Out for delivery</option><option>Delivered</option><option>Cancelled</option></select></div>)}</div></section>}

        {tab === "Products" && <section className="panel admin-table-panel"><h3>Inventory</h3><div className="admin-product-grid">{data.products.map((product) => <article key={product.id}><img src={product.image} alt="" /><div><b>{product.name}</b><small>{product.brand} • {product.unit}</small><span>৳{product.price} • Stock {product.stock}</span></div><em className={product.stock < 20 ? "low" : ""}>{product.stock < 20 ? "Low stock" : "Available"}</em></article>)}</div></section>}

        {tab === "Prescriptions" && <section className="panel admin-table-panel"><h3>Prescription review queue</h3>{data.prescriptions.length ? data.prescriptions.map((item) => <div className="booking-row" key={item.id}><FileText /><div><b>{item.originalName}</b><small>{item.patientName || "Patient not provided"} • {item.phone || "No phone"}</small></div><span>{item.status}</span><em>{item.id}</em></div>) : <p>No prescriptions uploaded.</p>}</section>}

        {tab === "Bookings" && <div className="admin-panels"><section className="panel"><h3>Lab bookings</h3>{data.labBookings.length ? data.labBookings.map((item) => <div className="booking-row" key={item.id}><FlaskConical /><div><b>{item.testName}</b><small>{item.name} • {item.date} • {item.time}</small></div><span>{item.status}</span></div>) : <p>No lab bookings.</p>}</section><section className="panel"><h3>Doctor bookings</h3>{data.doctorBookings.length ? data.doctorBookings.map((item) => <div className="booking-row" key={item.id}><Stethoscope /><div><b>{item.doctorName}</b><small>{item.patientName} • {item.slot}</small></div><span>{item.status}</span></div>) : <p>No doctor bookings.</p>}</section></div>}

        {tab === "Support" && <section className="panel admin-table-panel"><h3>Human-agent tickets</h3>{data.supportTickets.length ? data.supportTickets.map((ticket) => <div className="booking-row" key={ticket.id}><Headphones /><div><b>{ticket.name} • {ticket.phone}</b><small>{ticket.issue}</small></div><span>{ticket.status}</span><em>{ticket.id}</em></div>) : <p>No support tickets.</p>}</section>}
      </main>
    </div>
  );
}
