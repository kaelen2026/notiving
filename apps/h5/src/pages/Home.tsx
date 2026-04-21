import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Home</h1>
      <p className="text-gray-600">
        Welcome to Notiving. Edit{" "}
        <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm">
          src/pages/Home.tsx
        </code>{" "}
        to get started.
      </p>
      <Link
        to="/about"
        className="inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
      >
        Learn more
      </Link>
    </div>
  );
}
