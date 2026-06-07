import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-react";
import FeaturedPost from "../components/FeaturedPost";
import ArticleCard, { SidePost } from "../components/ArticleCard";
import { fetchPosts, fetchMyPosts, fetchSavedPosts } from "../lib/api";

const PER_PAGE = 10;

const CATEGORIES = [
  { label: "All Posts",      value: null },
  { label: "Web Design",     value: "web-design" },
  { label: "Development",    value: "development" },
  { label: "Databases",      value: "databases" },
  { label: "Search Engines", value: "search-engines" },
  { label: "Marketing",      value: "marketing" },
];

/* ── Helpers ── */

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);

const Spinner = () => (
  <div className="flex justify-center py-6">
    <div className="w-7 h-7 border-[3px] border-[#126ef5] border-t-transparent rounded-full animate-spin" />
  </div>
);

const SkeletonCard = () => (
  <div className="flex gap-5 animate-pulse">
    <div className="rounded-2xl bg-gray-200 shrink-0 w-48 h-36" />
    <div className="flex-1 space-y-3 py-1">
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-5 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
    </div>
  </div>
);

/* ── Empty states ── */

const NoPostsEmpty = () => (
  <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
    <div className="relative">
      <div className="w-24 h-24 rounded-2xl bg-blue-50 flex items-center justify-center">
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <rect x="6" y="4" width="28" height="36" rx="3" fill="#dbeafe" stroke="#126ef5" strokeWidth="1.5"/>
          <path d="M12 14h20M12 20h20M12 26h12" stroke="#126ef5" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="35" cy="35" r="7" fill="#126ef5"/>
          <path d="M35 32v6M32 35h6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M5 1v8M1 5h8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
    <div className="space-y-2">
      <h3 className="text-xl font-bold text-gray-900">Your writing starts here</h3>
      <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
        You haven't published any posts yet. Write your first article and share your knowledge with the community.
      </p>
    </div>
    <Link to="/write">
      <button className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-[#126ef5] text-white text-sm font-semibold hover:bg-[#0f5fd4] transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Write your first post
      </button>
    </Link>
    <div className="flex items-center gap-6 pt-2">
      {["Share ideas", "Get comments", "Build a following"].map((tip) => (
        <div key={tip} className="flex items-center gap-1.5 text-xs text-gray-400">
          <div className="w-1.5 h-1.5 rounded-full bg-[#126ef5]" />
          {tip}
        </div>
      ))}
    </div>
  </div>
);

const NoSavedEmpty = ({ onMyPosts }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
    <div className="relative">
      <div className="w-24 h-24 rounded-2xl bg-amber-50 flex items-center justify-center">
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <path d="M10 6h24a2 2 0 012 2v30l-13-7-13 7V8a2 2 0 012-2z" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M16 16h12M16 22h8" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
        <span className="text-xs font-bold text-gray-500">0</span>
      </div>
    </div>
    <div className="space-y-2">
      <h3 className="text-xl font-bold text-gray-900">No saved posts yet</h3>
      <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
        Open any post and bookmark it to save it here for later.
      </p>
    </div>
    <button
      onClick={onMyPosts}
      className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-amber-400 text-white text-sm font-semibold hover:bg-amber-500 transition-colors"
    >
      Browse posts
    </button>
  </div>
);

/* ── My Posts tab ── */
const MyPostsTab = ({ token, username }) => {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["my-posts", username],
    queryFn: () => fetchMyPosts({ token, username }),
    enabled: !!token,
    retry: false,
  });

  if (isLoading) return (
    <div className="space-y-8 mt-8">
      {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );

  if (posts.length === 0) return <NoPostsEmpty />;

  return (
    <div className="mt-8 flex flex-col gap-8">
      {posts.map((post) => (
        <ArticleCard key={post.id} post={{
          slug: post.slug,
          title: post.title,
          category: post.category,
          timeAgo: new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          author: username,
          excerpt: post.desc?.replace(/<[^>]*>/g, "").slice(0, 160),
          img: post.img,
        }} />
      ))}
    </div>
  );
};

/* ── Saved tab ── */
const SavedTab = ({ token, onMyPosts }) => {
  const { data: savedIds = [], isLoading } = useQuery({
    queryKey: ["saved-posts"],
    queryFn: () => fetchSavedPosts({ token }),
    enabled: !!token,
    retry: false,
  });

  if (isLoading) return (
    <div className="space-y-8 mt-8">
      {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );

  if (savedIds.length === 0) return <NoSavedEmpty onMyPosts={onMyPosts} />;

  return (
    <div className="mt-8">
      <p className="text-sm text-gray-500 mb-6">
        {savedIds.length} saved {savedIds.length === 1 ? "post" : "posts"}
      </p>
      <div className="flex flex-col gap-4">
        {savedIds.map((id) => (
          <div key={id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-[#126ef5] transition-colors">
            <Link to={`/post/${id}`} className="text-sm font-medium text-gray-800 hover:text-[#126ef5] transition-colors">
              Post #{id}
            </Link>
            <Link to={`/post/${id}`} className="text-xs text-[#126ef5] font-semibold hover:underline">
              Read →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Public feed (infinite scroll) ── */
const PublicFeed = () => {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [search, setSearch]                 = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const sentinelRef = useRef(null);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(window._searchTimer);
    window._searchTimer = setTimeout(() => setDebouncedSearch(val), 500);
  };

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts", activeCategory.value, debouncedSearch],
    queryFn: ({ pageParam = 1 }) =>
      fetchPosts({
        category: activeCategory.value,
        search:   debouncedSearch || undefined,
        page:     pageParam,
        limit:    PER_PAGE,
      }).then((res) => res.posts ?? []),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PER_PAGE ? allPages.length + 1 : undefined,
    staleTime: 1000 * 60 * 2,
  });

  const articles = data?.pages.flat() ?? [];
  const featured  = articles[0];
  const sidePosts = articles.slice(1, 6);
  const recent    = articles.slice(6);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isError) return (
    <p className="text-center text-sm text-red-400 py-12">
      Could not load posts. Make sure the backend is running.
    </p>
  );

  if (isLoading) return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:flex-1 rounded-sm bg-gray-200 animate-pulse h-[520px]" />
        <div className="md:w-80 lg:w-100 space-y-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="rounded-sm bg-gray-200 w-28 h-22 shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-8">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
    </div>
  );

  if (articles.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <p className="text-gray-400 text-sm">No posts yet. Be the first to write one.</p>
      <SignedIn>
        <Link to="/write">
          <button className="px-5 py-2 rounded-md bg-[#126ef5] text-white text-sm font-semibold hover:bg-[#0f5fd4] transition-colors">
            Write a Post
          </button>
        </Link>
      </SignedIn>
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:flex-1"><FeaturedPost post={featured} /></div>
        <div className="md:w-80 lg:w-100 flex flex-col gap-5 justify-between">
          {sidePosts.map((post, idx) => (
            <SidePost key={post.slug} post={post} number={idx + 2} />
          ))}
        </div>
      </div>

      {recent.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Posts</h2>
          <div className="flex flex-col gap-8">
            {recent.map((post) => <ArticleCard key={post.slug} post={post} />)}
          </div>
        </div>
      )}

      {isFetchingNextPage && <Spinner />}

      {!hasNextPage && articles.length > 0 && (
        <p className="text-center text-sm text-gray-400 py-6">You've reached the end.</p>
      )}

      <div ref={sentinelRef} className="h-1" />
    </div>
  );
};

/* ══════════════════════════════════════════
   Main HomePage
══════════════════════════════════════════ */
const TABS = ["Feed", "My Posts", "Saved"];

const HomePage = () => {
  const { getToken } = useAuth();
  const { user }     = useUser();
  const [token, setToken]     = useState(null);
  const [activeTab, setActiveTab] = useState("Feed");
  const [search, setSearch]   = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory]   = useState(CATEGORIES[0]);

  useEffect(() => {
    getToken().then(setToken).catch(() => setToken(null));
  }, [getToken]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(window._searchTimer);
    window._searchTimer = setTimeout(() => setDebouncedSearch(val), 500);
  };

  const username = user?.username ?? user?.firstName ?? "";

  return (
    <div className="pt-10 pb-6 space-y-8">

      {/* BREADCRUMB + WRITE BUTTON */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-[#126ef5]">Home</Link>
          <span>›</span>
          <span className="text-gray-900 font-medium">Blogs and Articles</span>
        </div>
        <SignedIn>
          <Link to="/write">
            <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#126ef5] text-white text-sm font-semibold hover:bg-[#0f5fd4] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Write a Post
            </button>
          </Link>
        </SignedIn>
      </div>

      {/* HERO */}
      <div className="text-center">
        <h1 className="text-5xl font-medium md:text-6xl text-gray-900 leading-tight mb-4">
          Your Destination for Creativity, Knowledge, and Growth
        </h1>
        <p className="text-base text-gray-500 leading-relaxed">
          Discover insights, tips, and trends to fuel your creativity and success.
        </p>
      </div>

      {/* SEARCH + CATEGORIES — only on Feed tab */}
      <SignedOut>
        <FeedFilters
          search={search}
          onSearch={handleSearch}
          activeCategory={activeCategory}
          onCategory={(cat) => { setActiveCategory(cat); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        />
      </SignedOut>
      <SignedIn>
        {activeTab === "Feed" && (
          <FeedFilters
            search={search}
            onSearch={handleSearch}
            activeCategory={activeCategory}
            onCategory={(cat) => { setActiveCategory(cat); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          />
        )}

        {/* TAB BAR */}
        <div className="flex gap-1 border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-[#126ef5] text-[#126ef5]"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </SignedIn>

      {/* CONTENT */}
      <SignedOut>
        <PublicFeed search={debouncedSearch} category={activeCategory.value} />
      </SignedOut>
      <SignedIn>
        {activeTab === "Feed"     && <PublicFeed search={debouncedSearch} category={activeCategory.value} />}
        {activeTab === "My Posts" && <MyPostsTab token={token} username={username} />}
        {activeTab === "Saved"    && <SavedTab token={token} onMyPosts={() => setActiveTab("My Posts")} />}
      </SignedIn>

    </div>
  );
};

/* ── Feed filters (search + categories) ── */
const FeedFilters = ({ search, onSearch, activeCategory, onCategory }) => (
  <div className="flex flex-col items-center gap-6">
    <div className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-3 rounded-xs w-full max-w-2xl">
      <SearchIcon />
      <input
        type="text"
        placeholder="search a post..."
        value={search}
        onChange={onSearch}
        className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none flex-1"
      />
    </div>
    <div className="flex flex-wrap justify-center gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.label}
          onClick={() => onCategory(cat)}
          className={`px-4 py-2 rounded-xs text-sm font-semibold transition-all ${
            activeCategory.label === cat.label
              ? "bg-[#126ef5] text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  </div>
);

export default HomePage;
