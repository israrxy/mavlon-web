import { useState } from 'react';
import * as sdk from 'matrix-js-sdk';
import { useMatrix } from '../contexts/MatrixContext';

export function Login() {
    const { setClient } = useMatrix();
    const [homeserver, setHomeserver] = useState('https://matrix.org');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const tempClient = sdk.createClient({ baseUrl: homeserver });
            const response = await tempClient.login('m.login.password', {
                user: username,
                password: password,
            });

            if (response.access_token && response.user_id && response.device_id) {
                localStorage.setItem('matrix_access_token', response.access_token);
                localStorage.setItem('matrix_user_id', response.user_id);
                localStorage.setItem('matrix_device_id', response.device_id);
                localStorage.setItem('matrix_homeserver_url', homeserver);

                const newClient = sdk.createClient({
                    baseUrl: homeserver,
                    accessToken: response.access_token,
                    userId: response.user_id,
                    deviceId: response.device_id,
                });

                await newClient.startClient({ initialSyncLimit: 10 });
                setClient(newClient);
            }
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white shadow-md rounded-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">Login to Matrix</h2>
                {error && <div className="mb-4 text-red-500 text-sm text-center">{error}</div>}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Homeserver</label>
                        <input
                            type="text"
                            value={homeserver}
                            onChange={(e) => setHomeserver(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}
