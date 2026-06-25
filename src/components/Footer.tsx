import { Leaf, Truck, Shield, Award, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import SocialLinks from "./SocialLinks";
import SubscribeForm from "./SubscribeForm";

export default function Footer() {
  return (
    <footer className="bg-[#052d13] text-white mt-16">
      <div className="container-page py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-5">
            <img src="https://sori-mobile-tire.com/wp-content/uploads/2026/06/YKONLINE-SHOP-LOGO.jpeg" alt="YKonline Shop" className="h-20 w-20 rounded-2xl object-cover shadow-lg" />
            <div>
              <p className="font-display text-2xl font-extrabold tracking-[-0.04em]"><span className="text-white">YKonline</span> <span className="text-orange">Shop</span></p>
              <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.22em] text-white/65">Shop smart, live better</p>
            </div>
          </div>
          <p className="text-white/80 text-sm leading-relaxed">
            Premium organic shea butter, selected with care to offer your skin and hair the best of nature.
          </p>
          <SocialLinks size="sm" className="mt-4" variant="dark" />
        </div>

        <div>
          <h4 className="font-display font-semibold text-lg mb-4 text-orange">Shop</h4>
          <ul className="space-y-2 text-sm text-white/85">
            <li><Link to="/shop" className="hover:text-orange">All products</Link></li>
            <li><Link to="/shop?type=Raw" className="hover:text-orange">Raw shea butter</Link></li>
            <li><Link to="/shop?type=Whipped" className="hover:text-orange">Whipped shea butter</Link></li>
            <li><Link to="/shop?type=Set" className="hover:text-orange">Discovery sets</Link></li>
            <li><Link to="/routines" className="hover:text-orange">Beauty routines</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold text-lg mb-4 text-orange">Help</h4>
          <ul className="space-y-2 text-sm text-white/85">
            <li><Link to="/faq" className="hover:text-orange">FAQ</Link></li>
            <li><Link to="/contact" className="hover:text-orange">Contact us</Link></li>
            <li><Link to="/shipping" className="hover:text-orange">Shipping & Returns</Link></li>
            <li><Link to="/track-order" className="hover:text-orange">Track my order</Link></li>
            <li><Link to="/account" className="hover:text-orange">My account</Link></li>
            <li><a href="https://wa.me/13012669830" className="hover:text-orange">WhatsApp chat</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold text-lg mb-4 text-orange">Newsletter</h4>
          <p className="text-sm text-white/85 mb-3">
            Natural beauty tips, exclusive offers and new products, straight to your inbox.
          </p>
          <SubscribeForm />
          <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-white/80">
            <div className="flex items-center gap-2"><Leaf size={16} className="text-orange" /> 100% Natural</div>
            <div className="flex items-center gap-2"><Truck size={16} className="text-orange" /> Fast shipping</div>
            <div className="flex items-center gap-2"><Shield size={16} className="text-orange" /> Secure payment</div>
            <div className="flex items-center gap-2"><Award size={16} className="text-orange" /> Premium quality</div>
            <div className="flex items-center gap-2 col-span-2"><Heart size={16} className="text-orange" /> Satisfaction guaranteed</div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/70">
          <p>&copy; {new Date().getFullYear()} YKonline Shop. All rights reserved.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/legal" className="hover:text-orange">Legal Notice</Link>
            <Link to="/terms" className="hover:text-orange">Terms & Conditions</Link>
            <Link to="/privacy" className="hover:text-orange">Privacy Policy</Link>
            <Link to="/cookies" className="hover:text-orange">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
