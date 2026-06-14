import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { createPost, updatePost, fetchPost } from "../lib/api";

const CATEGORIES = ["Web Design", "Development", "Databases", "Search Engines", "Marketing"];

const WritePostPage = () => {
  const navigate  = useNavigate();
  const { slug }  = useParams();
  const isEdit    = !!slug;
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: "", category: "", desc: "", img: "" });
  const [error, setError] = useState("");

  /* In edit mode, load the existing post and prefill the form */
  const { data: existing, isLoading: loadingPost } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => fetchPost(slug),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title ?? "",
        category: existing.category ?? "",
        desc: existing.desc ?? "",
        img: existing.img ?? "",
      });
    }
  }, [existing]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const { mutate: publish, isPending } = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (isEdit) {
        return updatePost({ id: existing.id, data: form, token });
      }
      return createPost({ data: form, token });
    },
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: ["post", post.slug] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
      navigate(`/post/${post.slug}`);
    },
    onError: (err) => setError(err.message || "Something went wrong. Try again."),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.desc || form.desc === "<p><br></p>") {
      setError("Content cannot be empty.");
      return;
    }
    publish();
  };

  if (isEdit && loadingPost) return (
    <div className="pt-16 flex justify-center">
      <div className="w-8 h-8 border-4 border-[#126ef5] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pt-10 pb-16 space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{isEdit ? "Edit Post" : "Write a Post"}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {isEdit ? "Update your article and save your changes." : "Share your knowledge with the community."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* TITLE */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Give your post a great title..."
            required
            className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#126ef5] focus:border-transparent transition"
          />
        </div>

        {/* CATEGORY */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#126ef5] focus:border-transparent transition bg-white"
          >
            <option value="" disabled>Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat.toLowerCase().replace(/ /g, "-")}>{cat}</option>
            ))}
          </select>
        </div>

        {/* COVER IMAGE URL */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Cover Image URL <span className="text-gray-400 font-normal">(optional)</span></label>
          <input
            type="url"
            name="img"
            value={form.img}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#126ef5] focus:border-transparent transition"
          />
          {form.img && (
            <img
              src={form.img}
              alt="cover preview"
              className="mt-2 rounded-md w-full h-48 object-cover border border-gray-100"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
        </div>

        {/* CONTENT */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Content</label>
          <div className="rounded-md overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-[#126ef5] focus-within:border-transparent transition">
            <ReactQuill
              theme="snow"
              value={form.desc}
              onChange={(value) => setForm((prev) => ({ ...prev, desc: value }))}
              placeholder="Write your post content here..."
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, false] }],
                  ["bold", "italic", "underline", "strike"],
                  [{ list: "ordered" }, { list: "bullet" }],
                  ["blockquote", "code-block"],
                  ["link", "image"],
                  ["clean"],
                ],
              }}
              className="[&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-200 [&_.ql-container]:border-0 [&_.ql-editor]:min-h-[320px] [&_.ql-editor]:text-sm [&_.ql-editor]:text-gray-800"
            />
          </div>
        </div>

        {/* ACTIONS */}
        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-md px-4 py-2.5">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-[#126ef5] text-white text-sm font-semibold hover:bg-[#0f5fd4] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isPending
              ? (isEdit ? "Saving…" : "Publishing…")
              : (isEdit ? "Save Changes" : "Publish Post")}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-md bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
};

export default WritePostPage;
