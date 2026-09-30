import { useEffect, useState } from "react";
import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";

export default function Commands() {
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState("");

  const fetchCommands = async () => {
    try {
      const response = await api.get("/admin/commands");

      if (response.data.success) {
        setCommands(response.data.commands);
      }
    } catch (error) {
      console.error("Failed to fetch commands:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommands();
  }, []);

  const updateField = (id, field, value) => {
    setCommands((current) =>
      current.map((command) =>
        command.id === id
          ? { ...command, [field]: value }
          : command
      )
    );
  };

  const saveCommand = async (command) => {
    try {
      setSavingId(command.id);
      setMessage("");

      const response = await api.put(
        `/admin/commands/${command.id}`,
        {
          enabled: command.enabled,
          mirror_enabled: command.mirror_enabled,
          response_text: command.response_text,
        }
      );

      if (response.data.success) {
        setMessage(
          `${command.name} updated successfully.`
        );

        await fetchCommands();

        setTimeout(() => {
          setMessage("");
        }, 3000);
      }
    } catch (error) {
      console.error("Failed to update command:", error);

      setMessage(
        error.response?.data?.message ||
          "Failed to update command."
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Commands
          </h2>

          <p className="text-slate-500 mt-1">
            Configure your Discord slash commands.
          </p>
        </div>

        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl p-8 text-center text-slate-500">
            Loading commands...
          </div>
        ) : commands.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-slate-500">
            No commands configured.
          </div>
        ) : (
          <div className="space-y-6">
            {commands.map((command) => (
              <div
                key={command.id}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {command.name}
                    </h3>

                    <p className="text-slate-500 text-sm mt-1">
                      {command.description}
                    </p>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Response Text
                      </label>

                      <textarea
                        value={command.response_text || ""}
                        onChange={(e) =>
                          updateField(
                            command.id,
                            "response_text",
                            e.target.value
                          )
                        }
                        rows={3}
                        className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                      />
                    </div>
                  </div>

                  <div className="lg:w-64 space-y-4">
                    <div className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">
                            Command
                          </p>

                          <p className="text-xs text-slate-500">
                            Allow users to run it
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            updateField(
                              command.id,
                              "enabled",
                              !command.enabled
                            )
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                            command.enabled
                              ? "bg-green-600"
                              : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                              command.enabled
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      <p className="text-xs mt-2 text-slate-500">
                        {command.enabled
                          ? "Enabled"
                          : "Disabled"}
                      </p>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">
                            Mirror
                          </p>

                          <p className="text-xs text-slate-500">
                            Send to notification channel
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            updateField(
                              command.id,
                              "mirror_enabled",
                              !command.mirror_enabled
                            )
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                            command.mirror_enabled
                              ? "bg-blue-600"
                              : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                              command.mirror_enabled
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      <p className="text-xs mt-2 text-slate-500">
                        {command.mirror_enabled
                          ? "Notifications enabled"
                          : "Notifications disabled"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        saveCommand(command)
                      }
                      disabled={
                        savingId === command.id
                      }
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
                    >
                      {savingId === command.id
                        ? "Saving..."
                        : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}