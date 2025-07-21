import { useEffect, useState } from "react";
import { getRooms, createRoom, getMessages, socket } from "../services/backendint";
import ChatRoom from "../components/ChatRoom"



export default function Home({ user }){
    const [ rooms, setRooms] = useState([]);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [message, setMessages] = useState([]);

    useEffect(() => {
        fetchRooms();
        socket.connect();
        return () => socket.disconnect();

    }, []);

    const fetchRooms = async () => {
        const res = await getRooms();
        setRooms(res.data);

    };

    const handleJoinRoom = async (room) => {
    console.log("Joining room:", room._id);
    socket.emit("joinRoom", { username: user.username, roomId: room._id });
    setCurrentRoom(room);
    
    console.log("Fetching messages for room:", room._id); // ✅ FIXED LOG
    const res = await getMessages(room._id);
    
    setMessages(res.data);
    };

    return(
         <div className="flex h-screen">
            <aside className="w-1/4 bg-gray-800 text-white p-4">
                <h2 className="text-lg mb-2">Rooms</h2>
                <ul>
                    {rooms.map((room) => {
                        return(
                        <li key={room._id} className="mb-2">
                            <button onClick={()=> handleJoinRoom(room)} 
                            className="w-full bg-gray-700 p2 rounded hover: bg-gray-600"
                            >
                                {room.name}
                            </button>
                        </li>
                        )
                    })}
                </ul>

            </aside>
            <main className="flex-1 p-4">
                {currentRoom ? (
                    <ChatRoom
                    room={currentRoom}
                    message={message}
                    user={user}
                    socket={socket}
                    />
                ): (
                    <p>Selcet a room to join</p>
                )}
            </main>
         </div>
    )
}