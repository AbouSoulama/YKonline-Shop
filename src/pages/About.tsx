import { Leaf, Heart, Sparkles, Eye, Users, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { products } from "../data/products";

const values = [
  { icon: Leaf, title: "Naturalness", desc: "Simple products inspired by nature, with the fewest possible ingredients." },
  { icon: Award, title: "Quality", desc: "Rigorous selection of each batch to offer you a reliable, premium experience." },
  { icon: Eye, title: "Transparency", desc: "Every customer knows what they buy. Clear compositions, honest descriptions." },
  { icon: Users, title: "Closeness", desc: "An available customer service to advise you before, during and after your purchase." },
];

const totalReviews = products.reduce((sum, p) => sum + p.reviews, 0);
const avgRating = (products.reduce((sum, p) => sum + p.rating * p.reviews, 0) / totalReviews).toFixed(1);
const productCount = products.length;

const stats = [
  { k: String(productCount), l: "Premium products" },
  { k: `${totalReviews.toLocaleString()}+`, l: "Customer reviews" },
  { k: `${avgRating}★`, l: "Average rating" },
];

export default function About() {
  return (
    <div className="fade-in">
      <section className="bg-gradient-to-br from-cream to-green-light py-16">
        <div className="container-page text-center max-w-3xl">
          <p className="text-orange font-bold uppercase tracking-wider text-sm">About YKonline Shop</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-5">Our mission: revealing natural beauty with simple, authentic care</h1>
          <p className="text-lg text-gray-600">A brand born from the love of nature and a simple conviction: the best care is often what nature already offers us.</p>
        </div>
      </section>

      <section className="container-page py-16 grid md:grid-cols-2 gap-12 items-center">
        <div className="relative">
          <div className="aspect-square rounded-[2.5rem] bg-gradient-to-br from-orange-light to-cream overflow-hidden shadow-xl">
            <div className="w-full h-full flex items-center justify-center p-10">
              <div className="text-center">
                <Leaf size={80} className="text-green mx-auto mb-4" />
                <p className="font-display text-2xl font-bold text-gray-900">Nature at the heart</p>
                <p className="text-gray-600 mt-2">of every product</p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 bg-white rounded-3xl shadow-xl p-5 max-w-[240px]">
            <Sparkles className="text-orange mb-2" size={24} />
            <p className="font-display font-bold text-gray-900">100% pure shea butter</p>
            <p className="text-sm text-gray-500">Selected with care</p>
          </div>
        </div>
        <div>
          <p className="text-orange font-bold uppercase tracking-wider text-sm">Our story</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-5">A human and natural adventure</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            YKonline Shop was born from a simple conviction: the best care is often what nature already offers us. We chose to highlight organic shea butter, a precious ingredient recognized for its richness and versatility.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            From the selection of raw materials to the delivery of your order, we do everything we can to offer you products that are as pure as they are effective, and a customer experience that lives up to your expectations.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            Whether you're looking for a natural solution for your dry skin, a nourishing care for your hair, or a versatile product for the whole family, our organic shea butter is designed to become an essential part of your beauty routine.
          </p>
          <Link to="/shop" className="btn-primary">Discover our products</Link>
        </div>
      </section>

      <section className="bg-cream/40 py-16">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-orange font-bold uppercase tracking-wider text-sm">Our values</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mt-2">What guides us every day</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-3xl p-6 card-shadow card-shadow-hover border border-cream">
                <div className="w-14 h-14 rounded-2xl bg-green-light flex items-center justify-center mb-4">
                  <v.icon className="text-green" size={24} />
                </div>
                <h3 className="font-display font-semibold text-lg text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16 grid md:grid-cols-3 gap-6">
        {stats.map((s) => (
          <div key={s.l} className="bg-green text-white rounded-3xl p-10 text-center">
            <p className="font-display text-5xl font-bold text-orange mb-2">{s.k}</p>
            <p className="text-white/90">{s.l}</p>
          </div>
        ))}
      </section>

      <section className="container-page pb-16">
        <div className="rounded-[2.5rem] bg-gradient-to-br from-orange to-orange-dark text-white p-10 md:p-16 text-center relative overflow-hidden">
          <Heart size={60} className="absolute top-6 right-6 opacity-20" />
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Ready to try natural beauty?</h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">Discover our premium organic shea butters and give your skin and hair the best of nature.</p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-white text-green font-semibold px-8 py-4 rounded-full hover:bg-cream transition-colors">Shop now</Link>
        </div>
      </section>
    </div>
  );
}
