import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Calendar, Clock, User, ArrowLeft } from "lucide-react";
import { fetchPostBySlug, incrementPostViews, type BlogPost } from "../lib/blog";

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetchPostBySlug(slug).then((p) => {
      setPost(p);
      setLoading(false);
      if (p) incrementPostViews(p.id);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="container-page py-24 text-center text-gray-500">Loading article...</div>
    );
  }

  if (!post) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">Article not found</h1>
        <Link to="/blog" className="btn-primary">Back to blog</Link>
      </div>
    );
  }

  const paragraphs = post.content.split("\n\n");

  return (
    <div className="fade-in">
      <section className={`bg-gradient-to-br ${post.color} text-white py-16 md:py-24`}>
        <div className="container-page max-w-3xl">
          <Link to="/blog" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 text-sm font-semibold">
            <ArrowLeft size={16} /> Back to blog
          </Link>
          <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">{post.category}</span>
          <h1 className="font-display text-3xl md:text-5xl font-bold mt-4 mb-4">{post.title}</h1>
          <p className="text-white/90 text-lg">{post.excerpt}</p>
          <div className="flex items-center gap-4 text-sm text-white/70 mt-6">
            <span className="flex items-center gap-1"><Calendar size={14} /> {post.date}</span>
            <span className="flex items-center gap-1"><Clock size={14} /> {post.readTime}</span>
            <span className="flex items-center gap-1"><User size={14} /> YKonline Team</span>
          </div>
        </div>
      </section>

      <article className="container-page max-w-3xl py-12 md:py-16">
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-5">
          {paragraphs.map((block, i) => {
            if (block.startsWith("## ")) {
              return <h2 key={i} className="font-display text-2xl font-bold text-gray-900 mt-8 mb-3">{block.replace("## ", "")}</h2>;
            }
            if (block.startsWith("- ")) {
              const items = block.split("\n").filter(l => l.startsWith("- "));
              return (
                <ul key={i} className="list-disc pl-6 space-y-2">
                  {items.map((item, j) => <li key={j}>{item.replace("- ", "").replace(/\*\*(.*?)\*\*/g, "$1")}</li>)}
                </ul>
              );
            }
            return <p key={i}>{block.replace(/\*\*(.*?)\*\*/g, "$1")}</p>;
          })}
        </div>
      </article>
    </div>
  );
}
