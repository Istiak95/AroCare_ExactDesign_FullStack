import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  Upload,
  FlaskConical,
  Stethoscope,
  RefreshCw,
  ClipboardList,
  LockKeyhole,
  BadgeCheck,
  Star,
  Microscope,
  FileCheck2,
  Headphones,
} from "lucide-react";
import ProductCard from "../components/ProductCard";

const quickActions = [
  { label: "Upload Prescription", note: "Get medicines delivered", icon: Upload, action: "prescription" },
  { label: "Track Order", note: "Track your current order", icon: Truck, to: "/track" },
  { label: "Lab Test Booking", note: "Book tests & home collection", icon: FlaskConical, to: "/labs" },
  { label: "Doctor Consultation", note: "Consult doctors online", icon: Stethoscope, to: "/doctors" },
  { label: "Refill Medicine", note: "Quickly reorder medicines", icon: RefreshCw, to: "/account" },
];

const trustItems = [
  { icon: ShieldCheck, title: "100% Genuine Medicines", text: "Sourced from licensed suppliers" },
  { icon: Truck, title: "Fast & Reliable Delivery", text: "Clear, on-time order updates" },
  { icon: Headphones, title: "Licensed Pharmacist Support", text: "Expert help when you need it" },
  { icon: LockKeyhole, title: "Secure Payments", text: "bKash, Nagad, cards and COD" },
];

const reviews = [
  ["Anika Rahman", "Very fast delivery and genuine medicines. AroCare is now my go-to pharmacy!"],
  ["Rahul Hasan", "Booked a full-body checkup. Home collection was convenient and simple."],
  ["Priya Sen", "Doctor booking was smooth, and Bangla support made everything easy."],
  ["Sandeep Roy", "Clear prices, original products and a very helpful support experience."],
];
const categoryImages = {
  medicine: "/products/p1.png",
  healthcare: "/products/p13.png",
  beauty: "/products/p5.png",
  wellness: "/products/p14.png",
  devices: "/products/p8.png",
  "mother-baby": "/products/p10.png",
};
export default function Home({ products, categories, addToCart, wishlist, toggleWishlist, onPrescription }) {
  return (
    <>
      <section className="home-hero container">
        <div className="hero-copy">
          <span className="eyebrow">Your Health, Our Priority</span>
          <h1>
            Medicines delivered.
            <br />
            Care delivered.
          </h1>
          <p>
            Genuine medicines, expert care and doorstep delivery — everything your family needs for a healthier life.
          </p>
          <div className="hero-actions">
            <Link to="/shop" className="primary">
              Shop Medicines <ArrowRight />
            </Link>
            <button className="secondary" onClick={onPrescription}>
              Upload Prescription <Upload />
            </button>
          </div>
          <div className="hero-trust">
            <span><ShieldCheck /><b>100% Genuine</b><small>Medicines</small></span>
            <span><Truck /><b>On-time</b><small>Delivery</small></span>
            <span><RefreshCw /><b>Easy Returns</b><small>On eligible items</small></span>
          </div>
        </div>
        <div className="hero-art">
          <img src="/assets/hero-pharmacy.png" alt="AroCare medicine delivery" />
        </div>
      </section>

      <section className="quick-actions container" aria-label="Quick services">
        {quickActions.map(({ label, note, icon: Icon, to, action }) => {
          const inner = <><span className="quick-icon"><Icon /></span><span><b>{label}</b><small>{note}</small></span></>;
          return action === "prescription" ? (
            <button key={label} onClick={onPrescription}>{inner}</button>
          ) : (
            <Link key={label} to={to}>{inner}</Link>
          );
        })}
      </section>

      <section className="section container category-section">
        <div className="section-head compact-head">
          <h2>Featured Categories</h2>
          <Link to="/shop">View all categories <ArrowRight /></Link>
        </div>
        <div className="category-grid">
          {categories.slice(0, 6).map((category, index) => (
            <Link to={`/shop?category=${category.id}`} className={`category-card ${category.accent}`} key={category.id}>
              <div>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </div>
              <img
  className="category-product-image"
  src={
    categoryImages[category.id] ||
    "/products/placeholder.png"
  }
  alt={`${category.name} category product`}
  onError={(event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src =
      "/products/placeholder.png";
  }}
/>
            </Link>
          ))}
        </div>
      </section>

      <section className="section container popular-section">
        <div className="section-head compact-head">
          <h2>Popular Products</h2>
          <Link to="/shop">View all products <ArrowRight /></Link>
        </div>
        <div className="product-grid home-product-grid">
          {products.slice(0, 6).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
            />
          ))}
        </div>
      </section>

      <section className="why-section container">
        <h2>Why choose AroCare?</h2>
        <div>
          {trustItems.map(({ icon: Icon, title, text }) => (
            <article key={title}><Icon /><span><b>{title}</b><small>{text}</small></span></article>
          ))}
        </div>
      </section>

      <section className="lab-banner container">
        <div className="lab-copy">
          <span className="eyebrow">Your health, in safe hands</span>
          <h2>Lab Tests & Health Checkups</h2>
          <p>Book tests with home collection and receive clear digital booking updates.</p>
          <Link to="/labs" className="primary">Book Lab Tests <ArrowRight /></Link>
        </div>
        <div className="lab-points">
          <span><Microscope /><b>2000+ Tests</b><small>Available</small></span>
          <span><Stethoscope /><b>Home Sample</b><small>Collection</small></span>
          <span><FileCheck2 /><b>Accurate Reports</b><small>On Time</small></span>
        </div>
        <div className="lab-person">
          <img src="/assets/lab-doctor.png" alt="Healthcare professional" />
        </div>
        <div className="lab-offer"><small>Up to</small><b>30% OFF</b><span>on Health Checkups</span></div>
      </section>

      <section className="testimonials container">
        <div className="section-head center-head"><h2>What our customers say</h2></div>
        <div className="testimonial-grid">
          {reviews.map(([name, text], index) => (
            <article key={name}>
              <div className="review-user"><span>{name.charAt(0)}</span><div><b>{name}</b><small>{[0,1,2,3,4].map(i => <Star key={i} />)}</small></div></div>
              <p>{text}</p>
              {index === 0 && <BadgeCheck className="review-badge" />}
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
