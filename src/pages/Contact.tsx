import { Mail, MapPin, MessageCircle, Clock, Send } from "lucide-react";
import { useState } from "react";

export default function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <div className="fade-in">
      <section className="bg-gradient-to-br from-cream to-orange-light py-16">
        <div className="container-page text-center max-w-3xl">
          <p className="text-orange font-bold uppercase tracking-wider text-sm">Contact</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-5">We're here to help</h1>
          <p className="text-lg text-gray-600">A question, a suggestion, a special request? Our team responds within 24 hours.</p>
        </div>
      </section>

      <section className="container-page py-16 grid md:grid-cols-3 gap-6">
        {[
          { icon: Mail, title: "Email", value: "hello@ykonlineshop.com", desc: "Response within 24 hours" },
          { icon: MessageCircle, title: "WhatsApp", value: "Chat with us", desc: "Fast and friendly support", link: "https://wa.me/13012669830" },
          { icon: Clock, title: "Hours", value: "Mon - Sat, 9am - 6pm", desc: "Closed on Sundays" },
        ].map((c) => (
          <div key={c.title} className="bg-white rounded-3xl p-8 card-shadow border border-cream text-center">
            <div className="w-14 h-14 rounded-2xl bg-green-light flex items-center justify-center mx-auto mb-4">
              <c.icon className="text-green" size={24} />
            </div>
            <h3 className="font-display font-semibold text-lg mb-1">{c.title}</h3>
            {c.link ? (
              <a href={c.link} target="_blank" rel="noreferrer" className="text-green font-semibold hover:text-orange">{c.value}</a>
            ) : (
              <p className="text-green font-semibold">{c.value}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">{c.desc}</p>
          </div>
        ))}
      </section>

      <section className="container-page pb-16 grid md:grid-cols-2 gap-10">
        <div className="bg-cream/40 rounded-3xl p-8 md:p-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-3">Send us a message</h2>
          <p className="text-gray-600 mb-6">Fill out the form below and we'll get back to you as soon as possible.</p>
          {sent ? (
            <div className="bg-green text-white rounded-2xl p-6 text-center">
              <h3 className="font-display font-semibold text-xl mb-2">Thank you for your message!</h3>
              <p>Our team will respond within 24 hours.</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); setSent(true); }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">First name</label>
                  <input required type="text" className="w-full px-4 py-3 rounded-2xl border border-cream bg-white focus:outline-none focus:border-green" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Last name</label>
                  <input required type="text" className="w-full px-4 py-3 rounded-2xl border border-cream bg-white focus:outline-none focus:border-green" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Email</label>
                <input required type="email" className="w-full px-4 py-3 rounded-2xl border border-cream bg-white focus:outline-none focus:border-green" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Subject</label>
                <select className="w-full px-4 py-3 rounded-2xl border border-cream bg-white focus:outline-none focus:border-green">
                  <option>Question about a product</option>
                  <option>Order tracking</option>
                  <option>Return or exchange</option>
                  <option>Wholesale / partnership</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Your message</label>
                <textarea required rows={5} className="w-full px-4 py-3 rounded-2xl border border-cream bg-white focus:outline-none focus:border-green resize-none" />
              </div>
              <button type="submit" className="btn-primary w-full"><Send size={18} /> Send my message</button>
            </form>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-green text-white rounded-3xl p-8">
            <MessageCircle size={36} className="mb-4 text-orange" />
            <h3 className="font-display text-2xl font-bold mb-3">Chat with us on WhatsApp</h3>
            <p className="text-white/90 mb-6">For a quick answer, write to us directly on WhatsApp. Our team responds in just a few minutes during business hours.</p>
            <a href="https://wa.me/13012669830?text=Hello%20YKonline%20Shop" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-orange hover:bg-orange-dark text-white font-semibold px-6 py-3 rounded-full transition-colors">
              Open WhatsApp chat
            </a>
          </div>
          <div className="bg-cream/40 rounded-3xl p-8">
            <MapPin size={30} className="text-green mb-3" />
            <h3 className="font-display font-semibold text-xl mb-2">Our location</h3>
            <p className="text-gray-600">YKonline Shop is an online store that delivers worldwide. Our shea butter is carefully selected and packaged with love for you.</p>
          </div>
          <div className="bg-white rounded-3xl p-8 border border-cream card-shadow">
            <h3 className="font-display font-semibold text-xl mb-3">Follow us</h3>
            <p className="text-gray-600 text-sm mb-4">Join our community on social media for tips, inspirations and exclusive offers.</p>
            <div className="flex gap-3">
              {["Facebook", "Instagram", "Pinterest", "YouTube"].map((s) => (
                <a key={s} href="#" className="w-11 h-11 rounded-full bg-green-light text-green hover:bg-green hover:text-white transition-colors flex items-center justify-center text-xs font-bold" aria-label={s}>{s[0]}</a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
