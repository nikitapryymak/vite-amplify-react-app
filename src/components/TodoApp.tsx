import { useMemo, useState, type FormEvent } from 'react';
import type { Todo } from '../types';

export function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [draft, setDraft] = useState('');

  const remaining = useMemo(() => todos.filter((t) => !t.done).length, [todos]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setTodos((prev) => [...prev, { id: crypto.randomUUID(), text, done: false }]);
    setDraft('');
  }

  function toggle(id: string) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function remove(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="mx-auto w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-2xl font-semibold text-slate-800">Todos</h1>

      <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="What needs doing?"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
        <button
          type="submit"
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          disabled={!draft.trim()}
        >
          Add
        </button>
      </form>

      {todos.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">Nothing here yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {todos.map((todo) => (
            <li key={todo.id} className="group flex items-center gap-3 py-2">
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggle(todo.id)}
                className="h-4 w-4 rounded border-slate-300"
              />
              <span
                className={
                  todo.done
                    ? 'flex-1 text-sm text-slate-400 line-through'
                    : 'flex-1 text-sm text-slate-700'
                }
              >
                {todo.text}
              </span>
              <button
                type="button"
                onClick={() => remove(todo.id)}
                className="text-slate-300 opacity-0 transition group-hover:opacity-100 hover:text-slate-700"
                aria-label="Delete"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {todos.length > 0 && (
        <p className="mt-4 text-xs text-slate-500">
          {remaining} item{remaining === 1 ? '' : 's'} left
        </p>
      )}
    </div>
  );
}
