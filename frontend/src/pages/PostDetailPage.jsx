import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth, SignedIn, SignedOut } from "@clerk/clerk-react";
import { fetchPost, fetchComments, postComment } from "../lib/api";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

const Avatar = ({ src, username, size = "w-10 h-10" }) => (
  <div className={`${size} rounded-full overflow-hidden bg-[#126ef5] flex items-center justify-center shrink-0`}>
    {src ? (
      <img src={src} alt={username} className="w-full h-full object-cover" />
    ) : (
      <span className="text-white font-bold text-sm">{username?.[0]?.toUpperCase()}</span>
    )}
  </div>
);

const PostDetailPage = () => {
  const { slug } = useParams();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => fetchPost(slug),
    enabled: !!slug,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", post?.id],
    queryFn: () => fetchComments(post.id),
    enabled: !!post?.id,
    retry: false,
  });

  const { mutate: addComment, isPending: submitting } = useMutation({
    mutationFn: async (desc) => {
      const token = await getToken();
      return postComment({ postId: post.id, desc, token });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", post.id] });
      setCommentText("");
    },
  });

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(commentText.trim());
  };

  /* ── Loading ── */
  if (isLoading) return (
    <div className="pt-10 pb-16 space-y-8 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      <div className="w-full h-72 md:h-[460px] bg-gray-200 rounded-xl" />
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-10 bg-gray-200 rounded w-3/4" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200" />
          <div className="space-y-1.5">
            <div className="h-3 bg-gray-200 rounded w-28" />
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: `${85 + (i % 3) * 5}%` }} />
        ))}
      </div>
    </div>
  );

  /* ── Error ── */
  if (isError || !post) return (
    <div className="pt-16 text-center">
      <p className="text-gray-500 text-lg">Post not found.</p>
      <Link to="/" className="mt-4 inline-block text-[#126ef5] hover:underline text-sm font-medium">
        ← Back to home
      </Link>
    </div>
  );

  return (
    <div className="pt-10 pb-16 space-y-10">

      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/" className="hover:text-[#126ef5]">Home</Link>
        <span>›</span>
        <span className="capitalize text-gray-700">{post.category}</span>
        <span>›</span>
        <span className="text-gray-900 font-medium line-clamp-1">{post.title}</span>
      </div>

      {/* HERO IMAGE */}
      {post.img && (
        <div className="rounded-xl overflow-hidden w-full h-72 md:h-[460px]">
          <img src={post.img} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* META + TITLE */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-[#126ef5] capitalize">
            {post.category}
          </span>
          <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
          <span className="text-xs text-gray-400">· {(post.visit ?? 0).toLocaleString()} views</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center gap-3 pt-1">
          <Avatar src={post.user?.img} username={post.user?.username} />
          <div>
            <p className="text-sm font-semibold text-gray-900">{post.user?.username}</p>
            <p className="text-xs text-gray-400">Author</p>
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* CONTENT */}
      <div
        className="prose prose-gray max-w-none prose-headings:font-bold prose-a:text-[#126ef5] prose-img:rounded-lg prose-code:text-sm"
        dangerouslySetInnerHTML={{ __html: post.desc }}
      />

      <hr className="border-gray-100" />

      {/* COMMENTS */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">
          Comments <span className="text-gray-400 font-normal text-base">({comments.length})</span>
        </h2>

        <SignedIn>
          <form onSubmit={handleCommentSubmit} className="space-y-3">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#126ef5] focus:border-transparent transition resize-none"
            />
            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="px-5 py-2 rounded-md bg-[#126ef5] text-white text-sm font-semibold hover:bg-[#0f5fd4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Posting…" : "Post Comment"}
            </button>
          </form>
        </SignedIn>

        <SignedOut>
          <div className="bg-gray-50 border border-gray-100 rounded-md px-5 py-4 text-sm text-gray-500">
            <Link to="/login" className="text-[#126ef5] font-semibold hover:underline">Sign in</Link>{" "}
            to leave a comment.
          </div>
        </SignedOut>

        {comments.length === 0 ? (
          <p className="text-sm text-gray-400">No comments yet. Be the first!</p>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-4">
                <Avatar src={comment.user?.img} username={comment.user?.username} size="w-9 h-9" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{comment.user?.username}</span>
                    <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{comment.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default PostDetailPage;
