import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-lg text-sm font-medium transition ${
      isActive
        ? "bg-slate-800 text-white"
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <aside className="w-64 bg-slate-950 min-h-screen p-5 flex flex-col">
      <div className="mb-10">
        <h1 className="text-xl font-bold text-white">
          CommandFlow
        </h1>

        <p className="text-xs text-slate-500 mt-1">
          Admin Panel
        </p>
      </div>

      <nav className="space-y-2">
        <NavLink
          to="/admin"
          end
          className={linkClass}
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/commands"
          className={linkClass}
        >
          Commands
        </NavLink>
      </nav>

      <button
        onClick={logout}
        className="mt-auto text-left px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-slate-900"
      >
        Logout
      </button>
    </aside>
  );
}