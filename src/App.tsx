import { useState } from 'react';
import { MatrixProvider, useMatrix } from './contexts/MatrixContext';
import { Login } from './components/Login';
import { RoomList } from './components/RoomList';
import { RoomView } from './components/RoomView';

function ChatApp() {
    const { isLoggedIn } = useMatrix();
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

    if (!isLoggedIn) {
        return <Login />;
    }

    return (
        <div className="flex h-screen bg-white">
            <RoomList onSelectRoom={setSelectedRoomId} selectedRoomId={selectedRoomId} />
            <RoomView roomId={selectedRoomId} />
        </div>
    );
}

function App() {
    return (
        <MatrixProvider>
            <ChatApp />
        </MatrixProvider>
    );
}

export default App;
