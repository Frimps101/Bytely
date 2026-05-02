import { Link } from "react-router-dom";

const FeaturedPost = ({ post }) => {
  if (!post) return null;
  return (
    <Link to={`/post/${post.slug}`} className="block group">
      <div className="relative rounded-sm overflow-hidden aspect-[4/3] md:aspect-auto md:h-[520px] w-full">
        <img
          src={post.img || "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&q=80"}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        {/* Label */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-white/70">01.</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#126ef5] text-white">{post.category}</span>
            <span className="text-xs text-white/60">{post.timeAgo}</span>
          </div>
          <h2 className="text-white font-bold text-xl leading-snug line-clamp-2">
            {post.title}
          </h2>
        </div>
      </div>
    </Link>
  );
};

export default FeaturedPost;
