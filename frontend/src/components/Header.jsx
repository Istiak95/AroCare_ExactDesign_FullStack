import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  MapPin,
  Menu,
  X,
  UserRound,
  Heart,
  Phone,
  ChevronDown,
  ShieldCheck,
  FlaskConical,
  Stethoscope,
  Sparkles,
  Activity,
  Pill,
  BriefcaseMedical,
  Baby,
} from "lucide-react";

export default function Header({ user, cartCount, wishlistCount, onCart, onSearch }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [menu, setMenu] = useState(false);
  const submit = (event) => {
    event.preventDefault();
    onSearch(q.trim(), category);
  };

  return (
    <>
      <div className="utility-bar">
        <div className="container utility-inner">
          <span><MapPin /> Delivering to: <b>Dhaka 1207</b> <ChevronDown /></span>
          <span><ShieldCheck /> <b>Free delivery</b> on orders above ৳999</span>
          <span><Phone /> 09610-016778 &nbsp; | &nbsp; 8 AM – 10 PM</span>
        </div>
      </div>
      <header className="site-header">
        <div className="header-main container">
          <Link to="/" className="logo">
            <span className="logo-leaf"><Activity /></span>
            <span>AroCare<small>Care for you, always.</small></span>
          </Link>

          <form className="global-search" onSubmit={submit}>
            <label className="category-select"><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All Categories</option><option value="medicine">Medicines</option><option value="healthcare">Healthcare</option><option value="beauty">Beauty</option><option value="wellness">Wellness</option><option value="devices">Devices</option><option value="mother-baby">Mother & Baby</option></select><ChevronDown /></label>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for medicines, healthcare products..." />
            <button className="search-submit" aria-label="Search"><Search /></button>
          </form>

          <div className="header-actions">
            <Link to="/account" className="header-action account-action"><UserRound /><span>{user?.name?.split(" ")[0] || "Account"}<small>{user ? "My account" : "Sign in / Register"}</small></span></Link>
            <Link to="/account#wishlist" className="header-action compact"><Heart /><i>{wishlistCount}</i><span>Wishlist</span></Link>
            <button className="header-action compact" onClick={onCart}><ShoppingCart /><i>{cartCount}</i><span>Cart</span></button>
            <button className="mobile-menu" onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button>
          </div>
        </div>

        <nav className={menu ? "main-nav open" : "main-nav"}>
          <div className="container nav-inner">
            <NavLink to="/shop" onClick={() => setMenu(false)}><Pill />Medicines</NavLink>
            <NavLink to="/shop?category=healthcare" onClick={() => setMenu(false)}><BriefcaseMedical />Healthcare</NavLink>
            <NavLink to="/shop?category=beauty" onClick={() => setMenu(false)}><Sparkles />Beauty</NavLink>
            <NavLink to="/shop?category=wellness" onClick={() => setMenu(false)}><Activity />Wellness</NavLink>
            <NavLink to="/shop?category=devices" onClick={() => setMenu(false)}><ShieldCheck />Devices</NavLink>
            <NavLink to="/labs" onClick={() => setMenu(false)}><FlaskConical />Lab Tests <em>New</em></NavLink>
            <NavLink to="/doctors" onClick={() => setMenu(false)}><Stethoscope />Doctor Consultation <em className="hot">Hot</em></NavLink>
            <NavLink to="/shop?category=mother-baby" onClick={() => setMenu(false)}><Baby />Baby Care</NavLink>
          </div>
        </nav>
      </header>
    </>
  );
}
