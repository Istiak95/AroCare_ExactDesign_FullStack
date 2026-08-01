import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
import CartDrawer from "./components/CartDrawer";
import PrescriptionModal from "./components/PrescriptionModal";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Labs from "./pages/Labs";
import Doctors from "./pages/Doctors";
import TrackOrder from "./pages/TrackOrder";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import Admin from "./pages/Admin";
import { api } from "./api";
import useLocalStorage from "./hooks/useLocalStorage";

export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useLocalStorage("arocare-cart", []);
  const [wishlist, setWishlist] = useLocalStorage("arocare-wishlist", []);
  const [orders, setOrders] = useLocalStorage("arocare-orders", []);
  const [records, setRecords] = useLocalStorage("arocare-records", []);
  const [user, setUser] = useLocalStorage("arocare-user", null);
  const [cartOpen, setCartOpen] = useState(false);
  const [rxOpen, setRxOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api("/products"), api("/categories")])
      .then(([productData, categoryData]) => {
        setProducts(productData);
        setCategories(categoryData);
      })
      .catch(console.error);
  }, []);

  const cartCount = useMemo(() => cart.reduce((total, item) => total + item.qty, 0), [cart]);

  const addToCart = (product, qty = 1, openDrawer = true) => {
    setCart((items) => {
      const found = items.find((item) => item.id === product.id);
      return found
        ? items.map((item) => item.id === product.id ? { ...item, qty: item.qty + qty } : item)
        : [...items, { ...product, qty }];
    });
    if (openDrawer) setCartOpen(true);
  };

  const updateQty = (id, qty) => {
    setCart((items) => qty < 1
      ? items.filter((item) => item.id !== id)
      : items.map((item) => item.id === id ? { ...item, qty } : item));
  };

  const toggleWishlist = (product) => {
    setWishlist((items) => items.some((item) => item.id === product.id)
      ? items.filter((item) => item.id !== product.id)
      : [...items, product]);
  };

  const search = (query, category = "all") => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category && category !== "all") params.set("category", category);
    navigate(`/shop?${params.toString()}`);
  };

  const reorder = (items = []) => {
    setCart((current) => {
      const next = [...current];
      items.forEach((item) => {
        const product = products.find((candidate) => candidate.id === item.id) || item;
        const existingIndex = next.findIndex((candidate) => candidate.id === product.id);
        if (existingIndex >= 0) next[existingIndex] = { ...next[existingIndex], qty: next[existingIndex].qty + (item.qty || 1) };
        else next.push({ ...product, qty: item.qty || 1 });
      });
      return next;
    });
    navigate("/checkout");
  };

  return (
    <div className="app-shell">
      <Header
        user={user}
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        onCart={() => setCartOpen(true)}
        onSearch={search}
      />
      <main>
        <Routes>
          <Route path="/" element={<Home products={products} categories={categories} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} onPrescription={() => setRxOpen(true)} />} />
          <Route path="/shop" element={<Shop products={products} categories={categories} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
          <Route path="/product/:id" element={<ProductDetail products={products} addToCart={addToCart} buyNow={(product, qty) => { addToCart(product, qty, false); navigate("/checkout"); }} wishlist={wishlist} toggleWishlist={toggleWishlist} onPrescription={() => setRxOpen(true)} />} />
          <Route path="/labs" element={<Labs />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/track" element={<TrackOrder />} />
          <Route path="/checkout" element={<Checkout cart={cart} clearCart={() => setCart([])} setOrders={setOrders} onPrescription={() => setRxOpen(true)} />} />
          <Route path="/account" element={<Account user={user} setUser={setUser} orders={orders} wishlist={wishlist} records={records} setRecords={setRecords} reorder={reorder} addToCart={addToCart} toggleWishlist={toggleWishlist} onPrescription={() => setRxOpen(true)} />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer open={cartOpen} items={cart} updateQty={updateQty} close={() => setCartOpen(false)} checkout={() => { setCartOpen(false); navigate("/checkout"); }} />
      <PrescriptionModal open={rxOpen} close={() => setRxOpen(false)} onSaved={(item) => setRecords((current) => [{ id: item.id, name: item.originalName, type: "Prescription", date: new Date().toISOString() }, ...current])} />
      <Chatbot />
    </div>
  );
}
