import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AnnouncementBar from './components/AnnouncementBar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Features from './pages/Features';
import Offers from './pages/Offers';
import BulkDiscounts from './pages/BulkDiscounts';
import About from './pages/About';
import Contact from './pages/Contact';
import Checkout from './pages/Checkout';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';

export default function CustomerApp() {
  return (
    <ToastProvider>
      <CartProvider>
        <div className="min-h-full flex flex-col bg-white">
          <AnnouncementBar />
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/features" element={<Features />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/bulk-discounts" element={<BulkDiscounts />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/checkout" element={<Checkout />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </ToastProvider>
  );
}
