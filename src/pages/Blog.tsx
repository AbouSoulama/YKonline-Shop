import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight, User, Clock } from "lucide-react";
import SubscribeForm from "../components/SubscribeForm";
import { fetchPublishedPosts, type BlogPost } from "../lib/blog";

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublishedPosts().then((p) => {
      setPosts(p);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="container-page py-24 text-center text-gray-500">Loading articles...</div>;
  }

  if (posts.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">Tips & Blog</h1>
        <p className="text-gray-600">No articles published yet. Check back soon!</p>
      </div>
    );
  }

  const featured = posts[0];

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
        <div className="rounded-[2.5rem] overflow-hidden bg-white card-shadow border border-cream grid md:grid-cols-2 mb-12">
          <div className={`bg-gradient-to-br ${featured.color} p-12 md:p-16 text-white min-h-[300px] flex items-center`}>
            <div>
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">{featured.category}</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold mt-4 mb-4">{featured.title}</h2>
              <p className="text-white/90 mb-6">{featured.excerpt}</p>
              <Link to={`/blog/${featured.slug}`} className="inline-flex items-center gap-2 bg-white text-green font-semibold px-6 py-3 rounded-full hover:bg-cream transition-colors">
                Read article <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className="p-10 md:p-14 flex flex-col justify-center">
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1"><Calendar size={14} /> {featured.date}</span>
              <span className="flex items-center gap-1"><Clock size={14} /> {featured.readTime}</span>
              <span className="flex items-center gap-1"><User size={14} /> YKonline Team</span>
            </div>
            <p className="text-gray-600 leading-relaxed line-clamp-6">{featured.excerpt}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.slice(1).map((p) => (
            <article key={p.id} className="bg-white rounded-3xl overflow-hidden card-shadow card-shadow-hover border border-cream">
              <div className={`bg-gradient-to-br ${p.color} aspect-[16/10] flex items-center justify-center p-8 text-white`}>
                <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">{p.category}</span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {p.date}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {p.readTime}</span>
                </div>
                <Link to={`/blog/${p.slug}`}>
                  <h3 className="font-display font-semibold text-lg text-gray-900 mb-2 hover:text-green transition-colors">{p.title}</h3>
                </Link>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{p.excerpt}</p>
                <Link to={`/blog/${p.slug}`} className="text-green font-semibold text-sm flex items-center gap-1 hover:text-orange transition-colors">
                  Read more <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="rounded-[2.5rem] bg-cream p-10 md:p-14 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-3">Never miss an article</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">Subscribe to our newsletter to receive our latest natural beauty tips directly in your inbox.</p>
          <SubscribeForm tone="light" layout="row" className="max-w-xl mx-auto" inputClassName="flex-1 px-5 py-3 rounded-full border border-cream bg-white focus:outline-none focus:border-green" buttonClassName="btn-primary" />
        </div>
      </section>
    </div>
  );
}
