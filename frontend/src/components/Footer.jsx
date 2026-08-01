import React from "react";
import { Link } from "react-router-dom";
import { Activity, Facebook, Instagram, Youtube, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link to="/" className="logo"><span className="logo-leaf"><Activity /></span><span>AroCare<small>Care for you, always.</small></span></Link>
          <p>A trusted healthcare companion for medicines, wellness, lab tests and convenient expert support.</p>
          <div className="socials"><Facebook /><Instagram /><Youtube /><Linkedin /></div>
        </div>
        <div><h4>Shop</h4><Link to="/shop">Medicines</Link><Link to="/shop?category=healthcare">Healthcare</Link><Link to="/shop?category=beauty">Beauty</Link><Link to="/shop?category=wellness">Wellness</Link><Link to="/shop?category=devices">Devices</Link><Link to="/labs">Lab Tests</Link></div>
        <div><h4>Customer Service</h4><Link to="/track">Track Order</Link><a href="#returns">Returns & Refunds</a><a href="#faq">FAQs</a><Link to="/account">Contact Us</Link><a href="#bulk">Bulk Orders</a><a href="#prescription">Prescription Policy</a></div>
        <div><h4>Company</h4><a href="#about">About Us</a><a href="#career">Career</a><a href="#press">Press & Media</a><a href="#blog">Blog</a><a href="#partner">Partner with Us</a></div>
        <div><h4>Policies</h4><a href="#terms">Terms & Conditions</a><a href="#privacy">Privacy Policy</a><a href="#shipping">Shipping Policy</a><a href="#return">Return Policy</a><a href="#payment">Payment Policy</a></div>
        <div className="app-links"><h4>Get the App</h4><p>Download the AroCare app for a faster experience.</p><span className="store-badge"><small>GET IT ON</small><b>Google Play</b></span><span className="store-badge"><small>Download on the</small><b>App Store</b></span></div>
      </div>
      <div className="footer-bottom container"><span>© 2026 AroCare. All rights reserved.</span><span className="payments"><b>VISA</b><b>Mastercard</b><b>bKash</b><b>Nagad</b><b>COD</b></span><span>Secure payment workflow</span></div>
    </footer>
  );
}
