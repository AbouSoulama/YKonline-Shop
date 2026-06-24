import { supabase, isSupabaseConfigured } from "./supabase";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  color: string;
  status: "Published" | "Draft";
  views: number;
  date: string;
}

interface BlogRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string | null;
  read_time: string | null;
  color: string | null;
  status: string;
  views: number;
  created_at: string;
}

function mapBlog(row: BlogRow): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    content: row.content,
    category: row.category ?? "Guide",
    readTime: row.read_time ?? "5 min",
    color: row.color ?? "from-green to-green-dark",
    status: row.status as "Published" | "Draft",
    views: row.views,
    date: new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  };
}

export async function fetchPublishedPosts(): Promise<BlogPost[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "Published")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(row => mapBlog(row as BlogRow));
}

export async function fetchAllPosts(): Promise<BlogPost[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(row => mapBlog(row as BlogRow));
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "Published")
    .maybeSingle();

  if (error || !data) return null;
  return mapBlog(data as BlogRow);
}

export async function incrementPostViews(id: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabase.rpc("increment_blog_views", { post_id: id });
}

export async function createBlogPost(post: Omit<BlogPost, "id" | "views" | "date">): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: "Supabase not configured" };

  const { error } = await supabase.from("blog_posts").insert({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    read_time: post.readTime,
    color: post.color,
    status: post.status,
  });

  return error ? { success: false, error: error.message } : { success: true };
}

export async function updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: "Supabase not configured" };

  const payload: Record<string, unknown> = {};
  if (updates.title) payload.title = updates.title;
  if (updates.excerpt !== undefined) payload.excerpt = updates.excerpt;
  if (updates.content) payload.content = updates.content;
  if (updates.category) payload.category = updates.category;
  if (updates.status) payload.status = updates.status;
  if (updates.slug) payload.slug = updates.slug;

  const { error } = await supabase.from("blog_posts").update(payload).eq("id", id);
  return error ? { success: false, error: error.message } : { success: true };
}

export async function deleteBlogPost(id: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabase.from("blog_posts").delete().eq("id", id);
}

export async function toggleBlogPostStatus(id: string, current: "Published" | "Draft"): Promise<void> {
  const newStatus = current === "Published" ? "Draft" : "Published";
  await updateBlogPost(id, { status: newStatus as "Published" | "Draft" });
}
