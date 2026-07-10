const RefreshSession = require("../models/RefreshSession");

// GET /sessions (protected)
const getSessions = async (req, res) => {
  try {
    const sessions = await RefreshSession.find({ userId: req.user._id })
      .select("deviceName createdAt revokedAt")
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    console.error("Get sessions error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /sessions/:id (protected)
const revokeSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await RefreshSession.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found or unauthorized" });
    }

    if (session.revokedAt) {
      return res.status(400).json({ error: "Session is already revoked" });
    }

    session.revokedAt = new Date();
    await session.save();

    res.json({ message: "Session revoked successfully" });
  } catch (error) {
    console.error("Revoke session error:", error.message);
    // Handle invalid ObjectId format error
    if (error.kind === "ObjectId") {
      return res.status(400).json({ error: "Invalid session ID format" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getSessions,
  revokeSession,
};
