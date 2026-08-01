import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart, Star } from "lucide-react";

export default function ProductCard({ product, addToCart, wishlist = [], toggleWishlist }) {
  const discount = Math.max(0, Math.round((1 - product.price / product.oldPrice) * 100));
  const liked = wishlist.some((item) => item.id === product.id);

  return (
    <article className="product-card">
      <span className="discount">{discount}% OFF</span>
      <button className={liked ? "wish active" : "wish"} onClick={() => toggleWishlist?.(product)} aria-label="Wishlist"><Heart /></button>
      <Link to={`/product/${product.id}`} className="product-image"><img src={product.image} alt={product.name} loading="lazy" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/products/placeholder.png"; }} /></Link>
      <div className="product-body">
        <Link to={`/product/${product.id}`}><h3>{product.name}</h3></Link>
        <p>{product.unit}</p>
        <div className="rating"><Star /> {product.rating} <span>({product.reviews.toLocaleString()})</span></div>
        <div className="price"><strong>৳{product.price}</strong><s>৳{product.oldPrice}</s></div>
        <button className="add-btn" onClick={() => addToCart(product)}>Add to Cart <ShoppingCart /></button>
      </div>
    </article>
  );
}
