import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { ReviewProvider } from "./context/ReviewContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import WhatsAppButton from "./components/WhatsAppButton";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import About from "./pages/About";
import Routines from "./pages/Routines";
import Blog from "./pages/Blog";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Account from "./pages/Account";
import Checkout from "./pages/Checkout";
import Legal from "./pages/Legal";
import Admin from "./pages/Admin";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-6xl font-bold text-green mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Oops! The page you're looking for doesn't exist.</p>
      <a href="/" className="btn-primary">Back to home</a>
    </div>
  );
}

function StorefrontLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/about" element={<About />} />
          <Route path="/routines" element={<Routines />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/account" element={<Account />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/legal" element={<Legal page="legal" />} />
          <Route path="/terms" element={<Legal page="terms" />} />
          <Route path="/privacy" element={<Legal page="privacy" />} />
          <Route path="/cookies" element={<Legal page="cookies" />} />
          <Route path="/shipping" element={<Legal page="shipping" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
      <ReviewProvider>
      <CartProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route path="/*" element={<StorefrontLayout />} />
        </Routes>
      </CartProvider>
      </ReviewProvider>
      </AuthProvider>
    </HashRouter>
  );
}
