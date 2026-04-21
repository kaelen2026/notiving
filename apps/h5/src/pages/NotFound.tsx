import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="space-y-4 text-center">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <p className="text-gray-600">Page not found.</p>
      <Link to="/" className="text-gray-900 underline hover:no-underline">
        Go home
      </Link>
    </div>
  );
}
