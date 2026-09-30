import { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Terminal,
  RefreshCw,
  Clock3,
  User,
  MessageSquare,
} from "lucide-react";

import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      }

      const response = await api.get("/admin/logs");

      if (response.data.success) {
        setLogs(response.data.logs);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    const interval = setInterval(() => {
      fetchLogs();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const completed = logs.filter(
    (log) => log.status === "completed"
  ).length;

  const failed = logs.filter(
    (log) => log.status !== "completed"
  ).length;

  const successRate =
    logs.length > 0
      ? Math.round((completed / logs.length) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex ">
      <Sidebar />

      <main className="flex-1 min-w-0 md:ml-72">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Admin Panel
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              Dashboard
            </h2>
          </div>

          <button
            onClick={() => fetchLogs(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </header>

        <div className="p-6 lg:p-10">
          {/* Page intro */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
              <Activity size={16} />
              <span>System Overview</span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
              Command Activity
            </h1>

            <p className="text-slate-500 mt-1">
              Monitor Discord commands, users and notification activity.
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
            {/* Total */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Commands
                  </p>

                  <p className="text-3xl font-bold text-slate-900 mt-3">
                    {logs.length}
                  </p>
                </div>

                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Terminal
                    size={20}
                    className="text-blue-600"
                  />
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-4">
                All recorded interactions
              </p>
            </div>

            {/* Completed */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Completed
                  </p>

                  <p className="text-3xl font-bold text-slate-900 mt-3">
                    {completed}
                  </p>
                </div>

                <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                  <CheckCircle2
                    size={20}
                    className="text-green-600"
                  />
                </div>
              </div>

              <p className="text-xs text-green-600 mt-4">
                Successfully processed
              </p>
            </div>

            {/* Failed */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Failed
                  </p>

                  <p className="text-3xl font-bold text-slate-900 mt-3">
                    {failed}
                  </p>
                </div>

                <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
                  <XCircle
                    size={20}
                    className="text-red-600"
                  />
                </div>
              </div>

              <p className="text-xs text-red-500 mt-4">
                Requires attention
              </p>
            </div>

            {/* Success rate */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Success Rate
                  </p>

                  <p className="text-3xl font-bold text-slate-900 mt-3">
                    {successRate}%
                  </p>
                </div>

                <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center">
                  <Activity
                    size={20}
                    className="text-violet-600"
                  />
                </div>
              </div>

              <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-600 rounded-full transition-all"
                  style={{
                    width: `${successRate}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Activity Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Recent Activity
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Latest Discord command interactions
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Live updates every 5 seconds
              </div>
            </div>

            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center">
                <RefreshCw
                  size={24}
                  className="text-slate-400 animate-spin"
                />

                <p className="text-sm text-slate-500 mt-3">
                  Loading activity...
                </p>
              </div>
            ) : logs.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <MessageSquare
                    size={24}
                    className="text-slate-400"
                  />
                </div>

                <h4 className="font-semibold text-slate-700 mt-4">
                  No activity yet
                </h4>

                <p className="text-sm text-slate-400 mt-1">
                  Run a Discord slash command to see it here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-6 py-4 font-semibold text-slate-500">
                        Command
                      </th>

                      <th className="text-left px-6 py-4 font-semibold text-slate-500">
                        User
                      </th>

                      <th className="text-left px-6 py-4 font-semibold text-slate-500">
                        Input
                      </th>

                      <th className="text-left px-6 py-4 font-semibold text-slate-500">
                        Status
                      </th>

                      <th className="text-left px-6 py-4 font-semibold text-slate-500">
                        Time
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {logs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition"
                      >
                        {/* Command */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                              <Terminal
                                size={16}
                                className="text-blue-600"
                              />
                            </div>

                            <div>
                              <p className="font-semibold text-slate-800">
                                {log.command_name}
                              </p>

                              <p className="text-xs text-slate-400">
                                Discord command
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* User */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                              <User
                                size={14}
                                className="text-slate-500"
                              />
                            </div>

                            <span className="font-medium text-slate-700">
                              {log.discord_username}
                            </span>
                          </div>
                        </td>

                        {/* Input */}
                        <td className="px-6 py-4 max-w-sm">
                          <p
                            className="text-slate-500 truncate max-w-xs"
                            title={log.input_text || ""}
                          >
                            {log.input_text || (
                              <span className="text-slate-300">
                                No input
                              </span>
                            )}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {log.status === "completed" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-semibold">
                              <CheckCircle2 size={13} />
                              Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-semibold">
                              <XCircle size={13} />
                              {log.status}
                            </span>
                          )}
                        </td>

                        {/* Time */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-slate-500">
                            <Clock3 size={14} />

                            <span>
                              {new Date(
                                log.created_at
                              ).toLocaleString()}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}