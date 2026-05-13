import { NavLink } from 'react-router-dom';

const linkBase = 'text-sm transition';
const linkInactive = 'text-slate-500 hover:text-slate-800';
const linkActive = 'text-slate-900 font-medium';

export function NavBar() {
  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-center gap-6 px-6 py-3">
        <span className="text-sm font-semibold text-slate-800">Todo App</span>
        <div className="flex gap-4">
          <NavLink to="/" end className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
            Todos
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
            About
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
            Contact
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
