import { Calendar, ArrowRight, User, Clock } from "lucide-react";

const posts = [
  {
    title: "The benefits of organic shea butter for the skin",
    excerpt: "Discover why organic shea butter is a true beauty ally for nourishing, protecting and softening your skin naturally.",
    date: "Jan 12, 2026",
    read: "5 min",
    category: "Benefits",
    color: "from-green to-green-dark",
  },
  {
    title: "Raw shea vs refined shea: what are the differences?",
    excerpt: "Raw or refined? We explain the differences between these two forms of shea butter and help you choose according to your needs.",
    date: "Jan 05, 2026",
    read: "4 min",
    category: "Guide",
    color: "from-orange to-orange-dark",
  },
  {
    title: "How to use shea butter on hair: our tips",
    excerpt: "Dry, curly, frizzy or coily hair? Discover our tips for using shea butter to nourish, protect and sublimate your lengths.",
    date: "Dec 28, 2025",
    read: "6 min",
    category: "Hair care",
    color: "from-brown to-green-dark",
  },
  {
    title: "The complete guide to choosing your shea butter",
    excerpt: "Size, texture, use: how to choose the shea butter that really meets your needs. Our complete guide to making the right choice.",
    date: "Dec 20, 2025",
    read: "7 min",
    category: "Guide",
    color: "from-green to-orange",
  },
  {
    title: "Shea butter and dry skin: a natural solution",
    excerpt: "Suffering from dry skin? Discover how organic shea butter can help you find soft, nourished and comfortable skin, naturally.",
    date: "Dec 12, 2025",
    read: "5 min",
    category: "Skin care",
    color: "from-orange-light to-orange",
  },
  {
    title: "Integrating shea butter into your beauty routine",
    excerpt: "A few simple gestures are all it takes to make shea butter an essential part of your daily routine. Our practical advice.",
    date: "Dec 05, 2025",
    read: "4 min",
    category: "Routine",
    color: "from-green-light to-green",
  },
];

export default function Blog() {
  return (
    <div className="fade-in">
      <section className="bg-gradient-to-br from-green-light to-cream py-16">
        <div className="container-page text-center max-w-3xl">
          <p className="text-orange font-bold uppercase tracking-wider text-sm">Tips & Blog</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-5">Natural beauty tips</h1>
          <p className="text-lg text-gray-600">Advice, guides and inspirations to help you take care of your skin and hair, naturally.</p>
        </div>
      </section>

      <section className="container-page py-16">
        {/* Featured */}
        <div className="rounded-[2.5rem] overflow-hidden bg-white card-shadow border border-cream grid md:grid-cols-2 mb-12">
          <div className={`bg-gradient-to-br ${posts[0].color} p-12 md:p-16 text-white min-h-[300px] flex items-center`}>
            <div>
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">{posts[0].category}</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold mt-4 mb-4">{posts[0].title}</h2>
              <p className="text-white/90 mb-6">{posts[0].excerpt}</p>
              <a href="#" className="inline-flex items-center gap-2 bg-white text-green font-semibold px-6 py-3 rounded-full hover:bg-cream transition-colors">Read article <ArrowRight size={16} /></a>
            </div>
          </div>
          <div className="p-10 md:p-14 flex flex-col justify-center">
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1"><Calendar size={14} /> {posts[0].date}</span>
              <span className="flex items-center gap-1"><Clock size={14} /> {posts[0].read}</span>
              <span className="flex items-center gap-1"><User size={14} /> YKonline Team</span>
            </div>
            <h3 className="font-display text-2xl font-bold text-gray-900 mb-4">Why you'll love this article</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">The main benefits of organic shea butter for the skin</li>
              <li className="flex items-start gap-2">How to integrate it into your daily routine</li>
              <li className="flex items-start gap-2">Practical tips for visible results quickly</li>
              <li className="flex items-start gap-2">Precautions and advice for safe use</li>
            </ul>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.slice(1).map((p) => (
            <article key={p.title} className="bg-white rounded-3xl overflow-hidden card-shadow card-shadow-hover border border-cream">
              <div className={`bg-gradient-to-br ${p.color} aspect-[16/10] flex items-center justify-center p-8 text-white`}>
                <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">{p.category}</span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {p.date}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {p.read}</span>
                </div>
                <h3 className="font-display font-semibold text-lg text-gray-900 mb-2 hover:text-green transition-colors cursor-pointer">{p.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{p.excerpt}</p>
                <a href="#" className="text-green font-semibold text-sm flex items-center gap-1 hover:text-orange transition-colors">Read more <ArrowRight size={14} /></a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="container-page pb-16">
        <div className="rounded-[2.5rem] bg-cream p-10 md:p-14 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-3">Never miss an article</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">Subscribe to our newsletter to receive our latest natural beauty tips directly in your inbox.</p>
          <form onSubmit={(e) => { e.preventDefault(); alert("Thank you!"); }} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <input type="email" required placeholder="Your email address" className="flex-1 px-5 py-3 rounded-full border border-cream bg-white focus:outline-none focus:border-green" />
            <button type="submit" className="btn-primary">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
}
