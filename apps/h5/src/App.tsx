import { Routes, Route, Link } from "react-router-dom";
import OpenInAppBanner from "./components/OpenInAppBanner";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import PostDetail from "./pages/PostDetail";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <OpenInAppBanner />
      <nav className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
          <Link to="/" className="text-lg font-semibold">
            Notiving
          </Link>
          <div className="flex gap-4 text-sm">
            <Link to="/" className="text-foreground-secondary hover:text-foreground">
              Home
            </Link>
            <Link to="/about" className="text-foreground-secondary hover:text-foreground">
              About
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}
