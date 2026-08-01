import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Heart,
  Package,
  RefreshCw,
  FileText,
  WalletCards,
  Users,
  Copy,
  Upload,
  Headphones,
  CheckCircle2,
  Trash2,
  LogOut,
  UserRound,
  LockKeyhole,
} from "lucide-react";
import ProductCard from "../components/ProductCard";

export default function Account({
  user,
  setUser,
  orders,
  wishlist,
  records,
  setRecords,
  reorder,
  addToCart,
  toggleWishlist,
  onPrescription,
}) {
  const location = useLocation();
  const [tab, setTab] = useState(window.location.hash === "#wishlist" ? "wishlist" : "orders");
  const [mode, setMode] = useState("login");
  const [copied, setCopied] = useState(false);
  const [authError, setAuthError] = useState("");
  const wallet = useMemo(() => 275 + orders.length * 10, [orders]);

  useEffect(() => {
    if (location.hash === "#wishlist") setTab("wishlist");
  }, [location]);

  const authenticate = (event) => {
    event.preventDefault();
    setAuthError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (!/^01\d{9}$/.test(values.phone || "")) {
      setAuthError("বাংলাদেশি ১১ সংখ্যার phone number দিন, যেমন 017XXXXXXXX।");
      return;
    }
    if ((values.password || "").length < 4) {
      setAuthError("Password কমপক্ষে ৪ অক্ষরের হতে হবে।");
      return;
    }
    const name = mode === "register" ? values.name?.trim() : (localStorage.getItem("arocare-last-name") || "AroCare Customer");
    if (mode === "register" && !name) {
      setAuthError("আপনার নাম লিখুন।");
      return;
    }
    localStorage.setItem("arocare-last-name", name);
    setUser({ name, phone: values.phone, email: values.email || "", signedInAt: new Date().toISOString() });
  };

  const saveRecord = (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    setRecords((current) => [{
      id: `REC-${Date.now()}`,
      name: values.name,
      type: values.type,
      date: values.date || new Date().toISOString(),
    }, ...current]);
    event.currentTarget.reset();
  };

  if (!user) {
    return (
      <div className="container auth-page">
        <section className="auth-card">
          <div className="auth-brand"><UserRound /><span><small>AroCare Account</small><h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1><p>Orders, wishlist, refill and medical records এক জায়গায় manage করুন।</p></span></div>
          <div className="auth-switch"><button className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setAuthError(""); }}>Sign in</button><button className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setAuthError(""); }}>Register</button></div>
          <form className="auth-form" onSubmit={authenticate}>
            {mode === "register" && <label>Full name<input name="name" placeholder="Your full name" required /></label>}
            <label>Phone number<input name="phone" placeholder="017XXXXXXXX" required /></label>
            {mode === "register" && <label>Email (optional)<input name="email" type="email" placeholder="you@example.com" /></label>}
            <label>Password<div className="password-field"><LockKeyhole /><input name="password" type="password" placeholder="Minimum 4 characters" required /></div></label>
            {authError && <p className="form-error">{authError}</p>}
            <button className="primary wide">{mode === "login" ? "Sign in" : "Create account"}</button>
            <small>এটি development demo login। Production launch-এর আগে secure backend authentication, password hashing ও OTP verification যোগ করতে হবে।</small>
          </form>
        </section>
      </div>
    );
  }

  return (
    <div className="account-page">
      <div className="account-hero">
        <div className="container">
          <div>
            <span>{user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span>
            <section><small>Welcome back</small><h1>{user.name}</h1><p>{user.phone} • Manage orders, prescriptions, records and rewards.</p></section>
          </div>
          <div className="account-hero-actions"><div className="wallet-card"><WalletCards /><span><small>AroCash balance</small><b>৳{wallet}</b></span></div><button className="logout-btn" onClick={() => setUser(null)}><LogOut />Logout</button></div>
        </div>
      </div>

      <div className="container account-layout">
        <aside className="account-nav">
          {[
            ["orders", Package, "My Orders"],
            ["wishlist", Heart, "Wishlist"],
            ["records", FileText, "Medical Records"],
            ["wallet", WalletCards, "AroCash & Referral"],
            ["support", Headphones, "Support"],
          ].map(([key, Icon, label]) => <button className={tab === key ? "active" : ""} onClick={() => setTab(key)} key={key}><Icon />{label}</button>)}
        </aside>

        <section className="account-content">
          {tab === "orders" && <>
            <div className="content-head"><div><h2>My orders</h2><p>Track, review or refill your past orders.</p></div></div>
            {orders.length ? orders.map((order) => <article className="order-card" key={order.id}>
              <div><span><b>{order.id}</b><small>{new Date(order.createdAt).toLocaleDateString()}</small></span><em>{order.status}</em></div>
              <div className="order-products">{order.items?.map((item) => <span key={item.id}><img src={item.image} alt="" /><small>{item.name} × {item.qty}</small></span>)}</div>
              <footer><b>৳{order.total}</b><button onClick={() => reorder(order.items)}><RefreshCw />Refill / Reorder</button></footer>
            </article>) : <div className="empty-state"><Package /><h3>No local orders yet</h3><p>Orders placed through checkout will appear here.</p></div>}
          </>}

          {tab === "wishlist" && <>
            <div className="content-head"><div><h2>Wishlist</h2><p>Products saved for later.</p></div></div>
            {wishlist.length ? <div className="product-grid account-products">{wishlist.map((product) => <ProductCard key={product.id} product={product} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />)}</div> : <div className="empty-state"><Heart /><h3>No saved products</h3></div>}
          </>}

          {tab === "records" && <>
            <div className="content-head"><div><h2>Medical records</h2><p>Save report and prescription metadata in this demo.</p></div><button className="secondary" onClick={onPrescription}><Upload />Upload prescription</button></div>
            <form className="record-form" onSubmit={saveRecord}><input name="name" required placeholder="Record name, e.g. CBC Report" /><select name="type"><option>Lab Report</option><option>Prescription</option><option>Vaccination Record</option><option>Other</option></select><input name="date" type="date" /><button>Add record</button></form>
            <div className="record-list">{records.map((record) => <article key={record.id}><FileText /><span><b>{record.name}</b><small>{record.type} • {new Date(record.date).toLocaleDateString()}</small></span><button onClick={() => setRecords((items) => items.filter((item) => item.id !== record.id))}><Trash2 /></button></article>)}{!records.length && <div className="empty-state"><FileText /><h3>No records saved</h3><p>Production use requires encrypted authenticated storage.</p></div>}</div>
          </>}

          {tab === "wallet" && <>
            <div className="content-head"><div><h2>AroCash & Referral</h2><p>Demo rewards and referral workflow.</p></div></div>
            <div className="wallet-panel"><WalletCards /><span><small>Available demo balance</small><strong>৳{wallet}</strong><p>Rewards rules and transaction history can be connected before launch.</p></span></div>
            <div className="referral-card"><Users /><div><h3>Invite friends</h3><p>Share the referral code and earn after an eligible first order.</p><button onClick={() => { navigator.clipboard?.writeText("AROCARE50"); setCopied(true); }}>{copied ? <CheckCircle2 /> : <Copy />}{copied ? "Copied" : "Copy AROCARE50"}</button></div></div>
          </>}

          {tab === "support" && <>
            <div className="content-head"><div><h2>Customer support</h2><p>Use AroCare Support for বাংলা, English or Banglish assistance.</p></div></div>
            <div className="support-panel"><Headphones /><div><h3>Need help with an order?</h3><p>Open the support chatbot, enter an order ID, or request a human-agent ticket.</p><small>Demo hours: 8 AM–10 PM</small></div></div>
          </>}
        </section>
      </div>
    </div>
  );
}
