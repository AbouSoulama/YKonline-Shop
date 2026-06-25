import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Calendar, Clock, User, ArrowLeft, ArrowRight, Tag, BookOpen } from "lucide-react";
import { fetchPostBySlug, fetchPublishedPosts, incrementPostViews, type BlogPost } from "../lib/blog";
import SubscribeForm from "../components/SubscribeForm";
import { usePageMeta } from "../lib/seo";
import { notifyPrerenderReady } from "../components/PrerenderNotifier";

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetchPostBySlug(slug).then((p) => {
      setPost(p);
      setLoading(false);
      if (p) {
        incrementPostViews(p.id);
        window.setTimeout(notifyPrerenderReady, 300);
      }
    });
    fetchPublishedPosts().then((posts) => setRelated(posts.filter((p) => p.slug !== slug).slice(0, 3)));
  }, [slug]);

  usePageMeta({
    title: post?.title ?? "Blog",
    description: post?.excerpt ?? "Natural beauty tips and shea butter guides from YKonline Shop.",
    path: post ? `/blog/${post.slug}` : undefined,
  });

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
    <div className="fade-in bg-cream/30">
      <section className={`bg-gradient-to-br ${post.color} text-white py-16 md:py-24`}>
        <div className="container-page max-w-4xl">
          <Link to="/blog" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 text-sm font-semibold">
            <ArrowLeft size={16} /> Back to blog
          </Link>
          <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">{post.category}</span>
          <h1 className="font-display text-3xl md:text-5xl font-bold mt-4 mb-4 leading-tight">{post.title}</h1>
          <p className="text-white/90 text-lg max-w-2xl">{post.excerpt}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/70 mt-6">
            <span className="flex items-center gap-1"><Calendar size={14} /> {post.date}</span>
            <span className="flex items-center gap-1"><Clock size={14} /> {post.readTime}</span>
            <span className="flex items-center gap-1"><User size={14} /> YKonline Team</span>
          </div>
        </div>
      </section>

      <section className="container-page max-w-4xl py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <article className="rounded-3xl bg-white border border-cream card-shadow p-8 md:p-12">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 pb-6 border-b border-cream">
              <BookOpen size={16} className="text-green" />
              <span>Article</span>
              <span className="text-gray-300">·</span>
              <Tag size={14} className="text-orange" />
              <span className="font-semibold text-green">{post.category}</span>
            </div>

            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
              {paragraphs.map((block, i) => {
                if (block.startsWith("## ")) {
                  return (
                    <h2 key={i} className="font-display text-2xl md:text-3xl font-bold text-gray-900 mt-10 mb-4 pt-4 border-t border-cream first:border-0 first:pt-0 first:mt-0">
                      {block.replace("## ", "")}
                    </h2>
                  );
                }
                if (block.startsWith("- ")) {
                  const items = block.split("\n").filter((l) => l.startsWith("- "));
                  return (
                    <ul key={i} className="space-y-3 my-6">
                      {items.map((item, j) => (
                        <li key={j} className="flex items-start gap-3 text-gray-700">
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange" />
                          <span>{item.replace("- ", "").replace(/\*\*(.*?)\*\*/g, "$1")}</span>
                        </li>
                      ))}
                    </ul>
                  );
                }
                if (block.trim()) {
                  return (
                    <p key={i} className="text-base md:text-lg leading-relaxed">
                      {block.split(/(\*\*.*?\*\*)/g).map((part, j) =>
                        part.startsWith("**") && part.endsWith("**")
                          ? <strong key={j} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
                          : part
                      )}
                    </p>
                  );
                }
                return null;
              })}
            </div>

            <div className="mt-12 pt-8 border-t border-cream flex flex-wrap gap-4">
              <Link to="/shop" className="btn-accent">Shop shea butter <ArrowRight size={18} /></Link>
              <Link to="/blog" className="btn-outline">More articles</Link>
            </div>
          </article>

          <aside className="space-y-6 lg:sticky lg:top-32 h-fit">
            <div className="rounded-3xl bg-white border border-cream card-shadow p-6">
              <h3 className="font-display font-bold text-gray-900 mb-4">About this article</h3>
              <dl className="space-y-3 text-sm">
                <div><dt className="text-gray-500">Category</dt><dd className="font-semibold text-green">{post.category}</dd></div>
                <div><dt className="text-gray-500">Published</dt><dd className="font-semibold">{post.date}</dd></div>
                <div><dt className="text-gray-500">Reading time</dt><dd className="font-semibold">{post.readTime}</dd></div>
              </dl>
            </div>

            {related.length > 0 && (
              <div className="rounded-3xl bg-green text-white p-6">
                <h3 className="font-display font-bold mb-4">Related articles</h3>
                <ul className="space-y-4">
                  {related.map((r) => (
                    <li key={r.id}>
                      <Link to={`/blog/${r.slug}`} className="block text-sm font-semibold text-white/90 hover:text-orange transition-colors line-clamp-2">
                        {r.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>

      <section className="container-page max-w-4xl pb-16">
        <SubscribeForm />
      </section>
    </div>
  );
}
