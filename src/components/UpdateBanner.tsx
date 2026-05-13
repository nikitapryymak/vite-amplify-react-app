export function UpdateBanner() {
  return (
    <div
      role="status"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-md"
    >
      <span className="text-sm text-slate-700">A new version is available.</span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-md bg-slate-800 px-3 py-1 text-xs font-medium text-white hover:bg-slate-700"
      >
        Reload
      </button>
    </div>
  );
}
