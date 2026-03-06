import { useEffect, useState, useRef } from 'react';
import * as sdk from 'matrix-js-sdk';
import { useMatrix } from '../contexts/MatrixContext';

interface RoomViewProps {
    roomId: string | null;
}

export function RoomView({ roomId }: RoomViewProps) {
    const { client } = useMatrix();
    const [events, setEvents] = useState<sdk.MatrixEvent[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [roomName, setRoomName] = useState('Select a room');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (!client || !roomId) {
            setEvents([]);
            setRoomName('Select a room');
            return;
        }

        const room = client.getRoom(roomId);
        if (room) {
            setRoomName(room.name || room.roomId);
            setEvents(room.timeline.filter(e => e.getType() === 'm.room.message'));
            scrollToBottom();
        }

        const handleTimelineEvent = (event: sdk.MatrixEvent, roomObj: sdk.Room | undefined) => {
            if (roomObj && roomObj.roomId === roomId && event.getType() === 'm.room.message') {
                setEvents((prevEvents) => [...prevEvents, event]);
                scrollToBottom();
            }
        };

        client.on(sdk.RoomEvent.Timeline, handleTimelineEvent);

        return () => {
            client.removeListener(sdk.RoomEvent.Timeline, handleTimelineEvent);
        };
    }, [client, roomId]);

    useEffect(() => {
        scrollToBottom();
    }, [events]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!client || !roomId || !newMessage.trim()) return;

        try {
            const content = {
                body: newMessage,
                msgtype: 'm.text',
            };
            await client.sendMessage(roomId, content as any);
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    if (!roomId) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 h-screen">
                <p className="text-gray-500 text-lg">Select a room to start chatting</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-screen bg-white">
            <div className="p-4 border-b border-gray-200 bg-gray-100 flex items-center shadow-sm">
                <h2 className="text-lg font-bold text-gray-800">{roomName}</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {events.map((event) => {
                    const sender = event.getSender();
                    const isSelf = sender === client?.getUserId();
                    const content = event.getContent();
                    const time = new Date(event.getTs()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                        <div key={event.getId()} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                            <div className={`text-xs text-gray-500 mb-1 px-1`}>
                                {isSelf ? 'You' : sender} • {time}
                            </div>
                            <div className={`px-4 py-2 rounded-2xl max-w-[70%] break-words shadow-sm ${
                                isSelf ? 'bg-blue-500 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                            }`}>
                                {content.body}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}
