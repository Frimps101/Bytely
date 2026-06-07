const API = "http://localhost:3000";

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
  if (!res.ok) throw new Error("Failed to create post");
  return res.json();
};

export const deletePost = async ({ id, token }) => {
  const res = await fetch(`${API}/posts/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete post");
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

export const toggleSavePost = async ({ postId, token }) => {
  const res = await fetch(`${API}/users/save`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ postId }),
  });
  if (!res.ok) throw new Error("Failed to save post");
  return res.json();
};
