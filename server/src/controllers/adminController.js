const pool = require("../config/database");

async function getLogs(req, res) {
  try {
    const result = await pool.query(
      `SELECT
        id,
        interaction_id,
        command_name,
        discord_user_id,
        discord_username,
        input_text,
        status,
        action,
        error,
        created_at
       FROM interaction_logs
       ORDER BY created_at DESC
       LIMIT 100`
    );

    res.json({
      success: true,
      logs: result.rows,
    });
  } catch (error) {
    console.error("Get logs error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch logs",
    });
  }
}

async function getCommands(req, res) {
  try {
    const result = await pool.query(
      `SELECT
        id,
        name,
        description,
        enabled,
        mirror_enabled,
        response_text,
        created_at,
        updated_at
       FROM commands
       ORDER BY id ASC`
    );

    res.json({
      success: true,
      commands: result.rows,
    });
  } catch (error) {
    console.error("Get commands error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch commands",
    });
  }
}

async function updateCommand(req, res) {
  try {
    const { id } = req.params;

    const {
      enabled,
      mirror_enabled,
      response_text,
    } = req.body;

    const result = await pool.query(
      `UPDATE commands
       SET
         enabled = COALESCE($1, enabled),
         mirror_enabled = COALESCE($2, mirror_enabled),
         response_text = COALESCE($3, response_text),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [
        enabled,
        mirror_enabled,
        response_text,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Command not found",
      });
    }

    res.json({
      success: true,
      message: "Command updated successfully",
      command: result.rows[0],
    });
  } catch (error) {
    console.error("Update command error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update command",
    });
  }
}

module.exports = {
  getLogs,
  getCommands,
  updateCommand,
};