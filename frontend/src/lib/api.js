const API = "http://localhost:3000";

/* ── Display helpers ── */

// Converts stored HTML (from the Quill editor) into clean plain text,
// decoding entities like &nbsp; and collapsing whitespace.
export const htmlToText = (html = "") => {
  if (typeof document === "undefined") {
    return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  }
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
};

// Normalizes a backend post into the shape the cards expect
// (author, timeAgo, plain-text excerpt).
export const toCardPost = (post) => ({
  ...post,
  slug: post.slug,
  title: post.title,
  category: post.category,
  img: post.img,
  author: post.user?.username ?? post.author ?? "Unknown",
  timeAgo: post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : post.timeAgo ?? "",
  excerpt: htmlToText(post.desc ?? post.excerpt ?? "").slice(0, 180),
});

/* ── Posts ── */

export const fetchPosts = async ({ page = 1, limit = 10, category, search, sort } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (category) params.set("category", category);
  if (search)   params.set("search", search);
  if (sort)     params.set("sort", sort);
  const res = await fetch(`${API}/posts?${params}`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json(); // { posts, hasMore }
};

export const fetchPost = async (slug) => {
  const res = await fetch(`${API}/posts/${slug}`);
  if (!res.ok) throw new Error("Post not found");
  return res.json();
};

export const createPost = async ({ data, token }) => {
  const res = await fetch(`${API}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = typeof body === "string" ? body : body?.message;
    throw new Error(message || `Failed to create post (${res.status})`);
  }
  return res.json();
};

export const updatePost = async ({ id, data, token }) => {
  const res = await fetch(`${API}/posts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = typeof body === "string" ? body : body?.message;
    throw new Error(message || `Failed to update post (${res.status})`);
  }
  return res.json();
};

export const deletePost = async ({ id, token }) => {
  const res = await fetch(`${API}/posts/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = typeof body === "string" ? body : body?.message;
    throw new Error(message || `Failed to delete post (${res.status})`);
  }
  return res.json();
};

/* ── Comments ── */

export const fetchComments = async (postId) => {
  const res = await fetch(`${API}/comments/${postId}`);
  if (!res.ok) throw new Error("Failed to load comments");
  return res.json();
};

export const postComment = async ({ postId, desc, token }) => {
  const res = await fetch(`${API}/comments/${postId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ desc }),
  });
  if (!res.ok) throw new Error("Failed to post comment");
  return res.json();
};

/* ── Users ── */

export const fetchMyPosts = async ({ token, username }) => {
  const params = new URLSearchParams({ limit: 50 });
  if (username) params.set("author", username);
  const res = await fetch(`${API}/posts?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch your posts");
  const data = await res.json();
  return data.posts ?? [];
};

export const fetchSavedPosts = async ({ token }) => {
  const res = await fetch(`${API}/users/saved`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch saved posts");
  return res.json();
};

export const fetchSavedPostsFull = async ({ token }) => {
  const res = await fetch(`${API}/users/saved-posts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch saved posts");
  return res.json();
};

export const toggleSavePost = async ({ postId, token }) => {
  const res = await fetch(`${API}/users/save`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ postId }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = typeof body === "string" ? body : body?.message;
    throw new Error(message || `Failed to save post (${res.status})`);
  }
  return res.json();
};
