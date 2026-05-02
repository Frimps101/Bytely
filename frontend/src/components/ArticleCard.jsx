import { Link } from "react-router-dom";

/* Small numbered side post (shown in the right column beside the big featured image) */
export const SidePost = ({ post, number }) => (
  <Link to={`/post/${post.slug}`} className="flex gap-4 group items-start">
    <div className="rounded-sm overflow-hidden shrink-0 w-28 h-22">
      <img
        src={post.img || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80"}
        alt={post.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-xs font-bold text-gray-400">{String(number).padStart(2, "0")}.</span>
        <span className="text-xs font-semibold text-[#126ef5]">{post.category}</span>
        <span className="text-xs text-gray-400">{post.timeAgo}</span>
      </div>
      <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#126ef5] transition-colors">
        {post.title}
      </h3>
    </div>
  </Link>
);

/* Recent post card (horizontal: image left, text right) */
const ArticleCard = ({ post }) => {
  if (!post) return null;

  return (
    <Link to={`/post/${post.slug}`} className="flex gap-5 group">
      {/* Image */}
      <div className="rounded-2xl overflow-hidden shrink-0 w-36 h-28 md:w-48 md:h-36">
        <img
          src={post.img || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80"}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Text */}
      <div className="flex flex-col justify-center gap-2 flex-1 min-w-0">
        <p className="text-xs text-gray-500">
          Written by{" "}
          <span className="font-semibold text-[#126ef5]">{post.author}</span>{" "}
          on <span className="font-medium">{post.category}</span>{" "}
          <span>{post.timeAgo}</span>
        </p>
        <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-[#126ef5] transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
          {post.excerpt}
        </p>
        <span className="text-sm font-semibold text-[#126ef5] hover:underline mt-1 w-fit">
          Read More
        </span>
      </div>
    </Link>
  );
};

export default ArticleCard;
