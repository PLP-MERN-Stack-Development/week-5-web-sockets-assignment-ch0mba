import { useEffect, useRef, useState } from "react";

export default function ChatRoom({ room, user, socket, initialMessages }){ // Renamed 'message' prop to 'initialMessages' for clarity
    const [chat, setChat] = useState("");
    const [typingUser, setTypingUser] = useState("");
    const [messages, setMessages] = useState(initialMessages || []); // Local state for all messages
    const msgEndRef = useRef(null); // Ref to scroll to bottom

    // Update local messages state when initialMessages prop changes (e.g., room changes)
    useEffect(() => {
        setMessages(initialMessages || []);
    }, [initialMessages]);

    useEffect(() => {
        socket.on("newMessage", (msg) => {
            // Add new message to the state
            setMessages((prevMessages) => [...prevMessages, msg]);
        });

        socket.on("typing", (username) => {
            setTypingUser(username)
        });
        socket.on("stopTyping", () => {
            setTypingUser("")
        });

        return() => {
            socket.off("newMessage");
            socket.off("typing");
            socket.off("stopTyping")       
        };
    }, []); // Empty dependency array means this runs once on mount

    // Effect to scroll to the bottom when messages change
    useEffect(() => {
        if (msgEndRef.current) {
            msgEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]); // Scroll when messages array updates

    const handleTyping = () => {
        socket.emit("typing");
        setTimeout(() => socket.emit("stopTyping"), 1000);
    };

    const handleSend = () => {
        if (chat.trim()) { // Prevent sending empty messages
            socket.emit("sendMessage", chat);
            setChat("");
        }
    };

    return(
        <div>
            <h2 className="text-2xl mb-2">{room.name}</h2>
            <div className="h-64 overflow-y-auto border mb-2 bg-gray-50">
                {messages.map((msg) => ( // Render from local state
                    <p key={msg._id}>
                        <strong>{msg.sender?.username || 'Unknown'}:</strong> {msg.content} {/* Added optional chaining for sender.username */}
                    </p>
                ))}
                <div ref={msgEndRef} /> {/* Element to scroll into view */}
            </div>

            <div className="mb-2 text-sm text-gray-600">
                {typingUser && `${typingUser} is typing ..`}
            </div>
            <div className="flex gap-2">
                <input
                    className="flex-1 p-2 border rounded"
                    value={chat}
                    onChange={(e) => setChat(e.target.value)}
                    onKeyDown={handleTyping} // Consider only triggering typing on actual key presses that modify text
                    placeholder="Type a message.."
                />
                <button
                    className="bg-blue-500 text-white px-4 rounded"
                    onClick={handleSend}
                    disabled={!chat.trim()} // Disable send button if chat is empty
                >
                    Send
                </button>
            </div>
        </div>
    )
}