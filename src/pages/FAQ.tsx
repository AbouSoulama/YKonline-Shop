import { useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const faqs = [
  {
    q: "Is shea butter suitable for all skin types?",
    a: "Shea butter is particularly appreciated for dry to very dry skin. For combination or oily skin, prefer a small amount and the whipped texture. Always test on a small area before first use.",
  },
  {
    q: "Can shea butter be used on the hair?",
    a: "Yes, absolutely. Shea butter is ideal for dry, curly, frizzy or coily hair. Apply to lengths and ends, or use as an oil treatment before shampooing. Avoid the roots to prevent greasiness.",
  },
  {
    q: "Is shea butter greasy?",
    a: "Shea butter has a naturally rich texture. Use a small amount and warm it well between your hands before applying. It melts on contact with the skin and penetrates comfortably.",
  },
  {
    q: "What is the difference between raw and refined shea butter?",
    a: "Raw shea butter is less processed and retains its natural appearance, scent and richness. Refined shea butter is processed to be more neutral. We prefer raw for its authenticity and natural richness.",
  },
  {
    q: "How should I store my shea butter?",
    a: "Store your shea butter in a dry place, away from heat and direct light. A cool cupboard is ideal. Shea butter naturally melts at high temperatures but retains its properties.",
  },
  {
    q: "Is your shea butter really organic?",
    a: "Yes. Our shea butter comes from carefully selected organic production. We favor unrefined, minimally processed products to preserve all their natural richness.",
  },
  {
    q: "Can I use shea butter on my baby?",
    a: "Shea butter is gentle enough for the whole family. For babies, use a very small amount on clean, dry skin. Always test on a small area first and consult a healthcare professional if in doubt.",
  },
  {
    q: "What are your shipping times and costs?",
    a: "Orders are generally shipped within 24-48 hours. Shipping costs are calculated according to your location. Shipping is free for orders above $50.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept credit cards, PayPal, Apple Pay, Google Pay, mobile money and bank transfer. All payments are secured by an SSL certificate.",
  },
  {
    q: "Can I return or exchange a product?",
    a: "Yes. You have 14 days from receipt to return a product that does not suit you, provided it is unopened and in its original condition. Contact our customer service to initiate the return.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="fade-in">
      <section className="bg-gradient-to-br from-cream to-green-light py-16">
        <div className="container-page text-center max-w-3xl">
          <p className="text-orange font-bold uppercase tracking-wider text-sm">FAQ</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-5">Frequently asked questions</h1>
          <p className="text-lg text-gray-600">Find answers to the most common questions about our organic shea butter and our online store.</p>
        </div>
      </section>

      <section className="container-page py-16 max-w-4xl">
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl border border-cream overflow-hidden card-shadow">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-4 p-5 text-left">
                <span className="font-display font-semibold text-gray-900">{f.q}</span>
                <ChevronDown size={20} className={`text-green shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && <div className="px-5 pb-5 text-gray-600 leading-relaxed">{f.a}</div>}
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-3xl bg-gradient-to-br from-orange to-orange-dark text-white p-10 text-center">
          <MessageCircle size={40} className="mx-auto mb-3" />
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">Still have a question?</h2>
          <p className="text-white/90 mb-6">Our team is here to answer you, by email or on WhatsApp.</p>
          <Link to="/contact" className="inline-flex items-center gap-2 bg-white text-green font-semibold px-8 py-3 rounded-full hover:bg-cream transition-colors">Contact us</Link>
        </div>
      </section>
    </div>
  );
}
