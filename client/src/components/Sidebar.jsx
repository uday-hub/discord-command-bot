import {
  LayoutDashboard,
  Settings2,
  LogOut,
  Bot,
  ChevronRight,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
        : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
    }`;

  return (
    <aside className="hidden md:flex fixed top-0 left-0 z-40 w-72 h-screen bg-[#0b1120] border-r border-slate-800/80 flex-col overflow-hidden">
      {/* Logo */}
      <div className="shrink-0 px-6 py-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Bot size={22} className="text-white" />
          </div>

          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              CommandFlow
            </h1>

            <p className="text-[11px] text-slate-500">
              Discord Management
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <p className="px-3 mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Management
        </p>

        <nav className="space-y-1.5">
          <NavLink to="/admin" end className={linkClass}>
            <LayoutDashboard size={18} />

            <span className="flex-1">
              Dashboard
            </span>

            <ChevronRight
              size={15}
              className="opacity-0 group-hover:opacity-50"
            />
          </NavLink>

          <NavLink to="/admin/commands" className={linkClass}>
            <Settings2 size={18} />

            <span className="flex-1">
              Commands
            </span>

            <ChevronRight
              size={15}
              className="opacity-0 group-hover:opacity-50"
            />
          </NavLink>
        </nav>

        {/* System Status */}
        <div className="mt-8">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-50" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
              </span>

              <span className="text-sm font-medium text-slate-200">
                System Online
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Discord bot and API are operational.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom User Area */}
      <div className="shrink-0 p-4 border-t border-slate-800/80">
        <div className="flex items-center gap-3 px-3 py-3 mb-2">
          <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center">
            <span className="text-sm font-semibold text-white">
              A
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              Administrator
            </p>

            <p className="text-xs text-slate-500 truncate">
              System Admin
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}