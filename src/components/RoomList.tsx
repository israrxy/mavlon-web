import { useEffect, useState } from 'react';
import * as sdk from 'matrix-js-sdk';
import { useMatrix } from '../contexts/MatrixContext';

interface RoomListProps {
    onSelectRoom: (roomId: string) => void;
    selectedRoomId: string | null;
}

export function RoomList({ onSelectRoom, selectedRoomId }: RoomListProps) {
    const { client, logout } = useMatrix();
    const [rooms, setRooms] = useState<sdk.Room[]>([]);

    useEffect(() => {
        if (!client) return;

        const updateRooms = () => {
            const allRooms = client.getRooms() || [];
            // Sort by latest message
            allRooms.sort((a, b) => {
                const aLastMsg = a.timeline[a.timeline.length - 1];
                const bLastMsg = b.timeline[b.timeline.length - 1];
                const aTs = aLastMsg ? aLastMsg.getTs() : 0;
                const bTs = bLastMsg ? bLastMsg.getTs() : 0;
                return bTs - aTs;
            });
            setRooms(allRooms);
        };

        client.on(sdk.ClientEvent.Sync, updateRooms);
        client.on(sdk.RoomEvent.Timeline, updateRooms);

        updateRooms();

        return () => {
            client.removeListener(sdk.ClientEvent.Sync, updateRooms);
            client.removeListener(sdk.RoomEvent.Timeline, updateRooms);
        };
    }, [client]);

    return (
        <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-screen">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-100">
                <h2 className="text-lg font-semibold truncate text-gray-800">Rooms</h2>
                <button
                    onClick={logout}
                    className="text-sm text-red-600 hover:text-red-800"
                    title="Logout"
                >
                    Logout
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {rooms.map((room) => {
                    const isSelected = room.roomId === selectedRoomId;
                    return (
                        <div
                            key={room.roomId}
                            onClick={() => onSelectRoom(room.roomId)}
                            className={`p-3 cursor-pointer hover:bg-gray-200 border-b border-gray-100 truncate text-sm transition-colors ${
                                isSelected ? 'bg-blue-100 border-l-4 border-l-blue-500' : 'bg-white'
                            }`}
                        >
                            <div className="font-medium text-gray-900 truncate">
                                {room.name || 'Unnamed Room'}
                            </div>
                            <div className="text-xs text-gray-500 truncate mt-1">
                                {room.roomId}
                            </div>
                        </div>
                    );
                })}
                {rooms.length === 0 && (
                    <div className="p-4 text-center text-gray-500 text-sm">
                        No rooms found
                    </div>
                )}
            </div>
        </div>
    );
}
