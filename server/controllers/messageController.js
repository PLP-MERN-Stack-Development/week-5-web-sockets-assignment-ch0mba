const Message = require("../models/Message");

exports.getRoomMessages = async ( req, res)=> {
    console.log("Received request for room:", req.params.roomId);
    try {
        const messages = await Message.find({room: req.params.roomId})
            .populate('sender', 'username')
            .sort({ createdAt: 1 });
        console.log("Found messages:", messages.length);
        res.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};