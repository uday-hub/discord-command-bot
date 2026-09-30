import { useEffect, useState } from "react";
import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const response = await api.get("/admin/logs");

      if (response.data.success) {
        setLogs(response.data.logs);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    const interval = setInterval(
      fetchLogs,
      5000
    );

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Dashboard
          </h2>

          <p className="text-slate-500 mt-1">
            Monitor Discord command activity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Commands
            </p>

            <p className="text-3xl font-bold mt-2">
              {logs.length}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Completed
            </p>

            <p className="text-3xl font-bold mt-2 text-green-600">
              {
                logs.filter(
                  (log) =>
                    log.status === "completed"
                ).length
              }
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Failed
            </p>

            <p className="text-3xl font-bold mt-2 text-red-600">
              {
                logs.filter(
                  (log) =>
                    log.status !== "completed"
                ).length
              }
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">
              Live Command Logs
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Automatically refreshes every 5 seconds.
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">
              Loading logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No command logs yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-6 py-4">
                      Command
                    </th>
                    <th className="text-left px-6 py-4">
                      User
                    </th>
                    <th className="text-left px-6 py-4">
                      Input
                    </th>
                    <th className="text-left px-6 py-4">
                      Status
                    </th>
                    <th className="text-left px-6 py-4">
                      Time
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-t"
                    >
                      <td className="px-6 py-4 font-medium">
                        {log.command_name}
                      </td>

                      <td className="px-6 py-4">
                        {log.discord_username}
                      </td>

                      <td className="px-6 py-4 max-w-xs truncate">
                        {log.input_text || "-"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            log.status ===
                            "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {new Date(
                          log.created_at
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}