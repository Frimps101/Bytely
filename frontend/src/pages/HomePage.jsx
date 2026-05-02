import { useState } from "react";
import { Link } from "react-router-dom";
import FeaturedPost from "../components/FeaturedPost";
import ArticleCard, { SidePost } from "../components/ArticleCard";

const CATEGORIES = ["All Posts", "Web Design", "Development", "Databases", "Search Engines", "Marketing"];

const MOCK_POSTS = [
  {
    slug: "mastering-react-scalable-apps",
    title: "Mastering React: Tips for Building Scalable Applications",
    category: "development",
    timeAgo: "3 hours ago",
    author: "Jane",
    excerpt: "Learn the best practices for structuring large React applications, managing state efficiently, and keeping your codebase maintainable as it grows.",
    img: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&q=80",
  },
  {
    slug: "optimize-database-performance",
    title: "How to Optimize Database Performance",
    category: "databases",
    timeAgo: "5 hours ago",
    author: "John",
    excerpt: "Discover proven techniques to speed up your database queries, reduce load times, and handle more concurrent users without breaking a sweat.",
    img: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&q=80",
  },
  {
    slug: "psychology-of-color-web-design",
    title: "Understanding the Psychology of Color in Web Design",
    category: "web-design",
    timeAgo: "5 hours ago",
    author: "Sara",
    excerpt: "Color choices profoundly affect how users feel about your product. This guide covers the science behind color theory and how to apply it.",
    img: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&q=80",
  },
  {
    slug: "power-of-personalization",
    title: "The Power of Personalization in Marketing",
    category: "marketing",
    timeAgo: "5 hours ago",
    author: "Mike",
    excerpt: "Personalization is no longer optional. See how leading brands use data-driven personalization to dramatically boost engagement and conversions.",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
  },
  {
    slug: "building-restful-apis-mongodb",
    title: "Building RESTful APIs with MongoDB",
    category: "databases",
    timeAgo: "3 hours ago",
    author: "Jane",
    excerpt: "MongoDB is a popular choice for building scalable RESTful APIs. Learn how to set up a MongoDB database and connect it to your application. Discover how to define schemas using Mongoose for data validation. Explore techniques for creating, reading, updating, and deleting (CRUD) operations. Learn about indexing and aggregations for efficient querying. Understand how to secure your API with authentication and authorization. This guide walks you through building robust APIs step-by-step.",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  },
  {
    slug: "seo-strategies-2025",
    title: "SEO Strategies That Actually Work in 2025",
    category: "marketing",
    timeAgo: "8 hours ago",
    author: "Lisa",
    excerpt: "Search engine algorithms keep evolving. Here are the up-to-date strategies for ranking higher, driving organic traffic, and staying ahead of the competition.",
    img: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=600&q=80",
  },
  {
    slug: "css-grid-layouts",
    title: "Building Complex Layouts with CSS Grid",
    category: "web-design",
    timeAgo: "10 hours ago",
    author: "Tom",
    excerpt: "CSS Grid unlocks powerful two-dimensional layouts that were once only possible with JavaScript. Master grid areas, auto-placement, and responsive patterns.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
  },
];

const FEATURED = MOCK_POSTS[0];
const SIDE_POSTS = MOCK_POSTS.slice(1, 6);
const RECENT_POSTS = MOCK_POSTS.slice(4);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);

const HomePage = () => {
  const [activeCategory, setActiveCategory] = useState("All Posts");
  const [search, setSearch] = useState("");

  return (
    <div className="pt-10 pb-6 space-y-10">

      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link to="/" className="hover:text-[#126ef5]">Home</Link>
        <span>›</span>
        <span className="text-gray-900 font-medium">Blogs and Articles</span>
      </div>

      {/* HERO */}
      <div className="text-center">
          <h1 className="text-5xl font-medium md:text-6xl font-sm text-gray-900 leading-tight mb-4">
            Your Destination for Creativity, Knowledge, and Growth
          </h1>
          <p className="text-base text-gray-500 leading-relaxed">
            Discover insights, tips, and trends to fuel your creativity and success.
          </p>
      </div>

      {/* SEARCH + CATEGORIES */}
      <div className="flex flex-col items-center gap-6 mb-24">

        {/* Search bar */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-3 rounded-xs w-full max-w-2xl">
          <SearchIcon />
          <input
            type="text"
            placeholder="search a post..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none flex-1"
          />
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xs text-sm font-semibold transition-all ${
                activeCategory === cat
                  ? "bg-[#126ef5] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* POSTS GRID — big featured left + numbered list right */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Big featured image */}
        <div className="md:flex-1">
          <FeaturedPost post={FEATURED} />
        </div>

        {/* Side numbered list */}
        <div className="md:w-80 lg:w-100 flex flex-col gap-5 justify-between">
          {SIDE_POSTS.map((post, idx) => (
            <SidePost key={post.slug} post={post} number={idx + 2} />
          ))}
        </div>
      </div>

      {/* RECENT POSTS */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Posts</h2>
        <div className="flex flex-col gap-8">
          {RECENT_POSTS.map(post => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
      </div>

    </div>
  );
};

export default HomePage;
