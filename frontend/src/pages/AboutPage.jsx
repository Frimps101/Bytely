import { Link } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

const CAPABILITIES = [
  {
    title: "Read what's worth reading",
    body: "A clean, distraction-free feed of posts from developers and creators sharing what they're learning.",
    icon: (
      <path d="M4 5h16M4 12h16M4 19h10" />
    ),
  },
  {
    title: "Write and publish",
    body: "A full rich-text editor so you can turn an idea into a polished post and share it in minutes.",
    icon: (
      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    ),
  },
  {
    title: "Save for later",
    body: "Bookmark anything that catches your eye and come back to it whenever you're ready.",
    icon: (
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    ),
  },
  {
    title: "Browse by topic",
    body: "Filter the feed by the categories you care about, from development to design to marketing.",
    icon: (
      <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
    ),
  },
];

const STEPS = [
  { n: "1", title: "Sign in", body: "Create an account in seconds to unlock writing and saving." },
  { n: "2", title: "Read & save", body: "Explore the feed, follow topics, and bookmark posts for later." },
  { n: "3", title: "Write & publish", body: "Share what you know. Your posts appear in the feed for everyone." },
];

const TOPICS = ["Web Design", "Development", "Databases", "Search Engines", "Marketing"];

const Icon = ({ children }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const AboutPage = () => (
  <div className="pt-12 pb-20 space-y-20">

    {/* HERO / MISSION */}
    <section className="text-center max-w-3xl mx-auto space-y-5">
      <span className="inline-block text-xs font-semibold tracking-wide uppercase px-3 py-1 rounded-full bg-blue-50 text-[#126ef5]">
        About Bytely
      </span>
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
        Where curious people publish what they learn
      </h1>
      <p className="text-lg text-gray-500 leading-relaxed">
        Bytely is a place for developers and creators to write about what they're
        figuring out, and to read what others learned the hard way. No noise, no
        gatekeeping, just useful writing.
      </p>
    </section>

    {/* WHAT YOU CAN DO */}
    <section className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">What you can do here</h2>
        <p className="text-sm text-gray-500">Everything you need to read, write, and keep what matters.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        {CAPABILITIES.map((c) => (
          <div
            key={c.title}
            className="flex gap-4 p-6 rounded-xl border border-gray-100 hover:border-[#126ef5] transition-colors"
          >
            <div className="w-11 h-11 shrink-0 rounded-lg bg-blue-50 text-[#126ef5] flex items-center justify-center">
              <Icon>{c.icon}</Icon>
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-900">{c.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{c.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* HOW IT WORKS */}
    <section className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">How it works</h2>
        <p className="text-sm text-gray-500">Three steps from visitor to published writer.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {STEPS.map((s) => (
          <div key={s.n} className="text-center space-y-3 px-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#126ef5] text-white text-lg font-bold flex items-center justify-center">
              {s.n}
            </div>
            <h3 className="font-semibold text-gray-900">{s.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </section>

    {/* THE WHY */}
    <section className="max-w-3xl mx-auto space-y-4 text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Why we built it</h2>
      <p className="text-base text-gray-500 leading-relaxed">
        The best things we learn usually come from someone who took the time to
        write them down. Bytely exists to make that easier, a calm, focused space
        where sharing a hard-won lesson is as simple as writing it and hitting
        publish. No algorithms chasing outrage, no walls in front of good writing.
        Just people teaching each other, one post at a time.
      </p>
    </section>

    {/* TOPICS */}
    <section className="text-center space-y-5">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Topics we cover</h2>
      <div className="flex flex-wrap justify-center gap-2.5">
        {TOPICS.map((t) => (
          <span
            key={t}
            className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium"
          >
            {t}
          </span>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="rounded-2xl bg-[#126ef5] px-8 py-12 text-center space-y-5">
      <h2 className="text-2xl md:text-3xl font-bold text-white">Ready to dive in?</h2>
      <p className="text-blue-100 max-w-xl mx-auto">
        Start reading what the community is publishing, or share something you've
        learned.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
        <Link to="/">
          <button className="px-6 py-2.5 rounded-md bg-white text-[#126ef5] text-sm font-semibold hover:bg-blue-50 transition-colors">
            Start reading
          </button>
        </Link>
        <SignedIn>
          <Link to="/write">
            <button className="px-6 py-2.5 rounded-md bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition-colors">
              Write a post
            </button>
          </Link>
        </SignedIn>
        <SignedOut>
          <Link to="/login">
            <button className="px-6 py-2.5 rounded-md bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition-colors">
              Sign in to write
            </button>
          </Link>
        </SignedOut>
      </div>
    </section>

  </div>
);

export default AboutPage;
