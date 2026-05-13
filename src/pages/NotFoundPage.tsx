import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10 text-center">
      <h1 className="mb-3 text-2xl font-semibold text-slate-800">Page not found</h1>
      <Link to="/" className="text-sm text-slate-600 underline hover:text-slate-900">
        Back to todos
      </Link>
    </div>
  );
}
