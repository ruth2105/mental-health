import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Wifi, WifiOff, TestTube } from 'lucide-react';

export default function ChatWebSocketTest() {
  const [roomId, setRoomId] = useState('1');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const connectWebSocket = () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      if (!token) {
        addTestResult('❌ No authentication token found');
        return;
      }

      addTestResult('🔄 Attempting WebSocket connection...');
      setConnectionStatus('Connecting...');

      // Create WebSocket connection
      const wsUrl = `ws://localhost:8001/ws/chat/${roomId}/?token=${encodeURIComponent(token)}`;
      addTestResult(`📡 WebSocket URL: ${wsUrl}`);
      
      const websocket = new WebSocket(wsUrl);
      
      websocket.onopen = () => {
        addTestResult('✅ WebSocket connected successfully');
        setIsConnected(true);
        setConnectionStatus('Connected');
        setWs(websocket);
      };

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        addTestResult(`📨 Received: ${JSON.stringify(data)}`);
        
        if (data.type === 'chat_message') {
          setMessages(prev => [...prev, `${data.message.sender_name}: ${data.message.content}`]);
        }
      };

      websocket.onclose = (event) => {
        addTestResult(`🔌 WebSocket closed: Code ${event.code}, Reason: ${event.reason}`);
        setIsConnected(false);
        setConnectionStatus('Disconnected');
        setWs(null);
      };

      websocket.onerror = (error) => {
        addTestResult(`❌ WebSocket error: ${error}`);
        setIsConnected(false);
        setConnectionStatus('Error');
      };

    } catch (error) {
      addTestResult(`❌ Connection error: ${error}`);
      setConnectionStatus('Error');
    }
  };

  const sendMessage = () => {
    if (ws && message.trim()) {
      const messageData = {
        type: 'chat_message',
        message: message
      };
      
      ws.send(JSON.stringify(messageData));
      addTestResult(`📤 Sent: ${message}`);
      setMessage('');
    }
  };

  const disconnect = () => {
    if (ws) {
      ws.close();
      addTestResult('🔌 Manually disconnected');
    }
  };

  const createChatRoom = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      addTestResult('🏠 Creating/getting chat room...');
      
      const response = await fetch('http://localhost:8001/api/chat/rooms/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ other_user_id: 2 }) // Assuming user ID 2 exists
      });

      if (response.ok) {
        const room = await response.json();
        setRoomId(room.id.toString());
        addTestResult(`✅ Chat room ready: ID ${room.id}`);
      } else {
        const error = await response.text();
        addTestResult(`❌ Room creation failed: ${error}`);
      }
    } catch (error) {
      addTestResult(`❌ Room creation error: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <TestTube className="h-8 w-8" />
            Chat WebSocket Test
          </h1>
          <p className="text-muted-foreground">Test real-time chat WebSocket connection</p>
        </div>

        {/* Connection Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isConnected ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-red-500" />}
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Badge variant={isConnected ? "default" : "destructive"}>
                {connectionStatus}
              </Badge>
              <span className="text-sm text-muted-foreground">Room ID: {roomId}</span>
            </div>
            
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-32"
              />
              <Button onClick={createChatRoom} variant="outline">
                Create Room
              </Button>
              <Button onClick={connectWebSocket} disabled={isConnected}>
                Connect
              </Button>
              <Button onClick={disconnect} disabled={!isConnected} variant="outline">
                Disconnect
              </Button>
              <Button onClick={clearResults} variant="outline">
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Chat Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 overflow-y-auto border rounded p-3 mb-4 bg-gray-50">
                {messages.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No messages yet</p>
                ) : (
                  messages.map((msg, index) => (
                    <div key={index} className="mb-2 p-2 bg-white rounded text-sm">
                      {msg}
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={!isConnected}
                />
                <Button onClick={sendMessage} disabled={!isConnected || !message.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 overflow-y-auto border rounded p-3 bg-gray-50 font-mono text-xs">
                {testResults.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No test results yet</p>
                ) : (
                  testResults.map((result, index) => (
                    <div key={index} className="mb-1">
                      {result}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Make sure you're logged in (check localStorage for access_token)</li>
              <li>Click "Create Room" to create/get a chat room</li>
              <li>Click "Connect" to establish WebSocket connection</li>
              <li>Type a message and press Enter or click Send</li>
              <li>Open this page in another browser tab/window to test real-time chat</li>
              <li>Check the Test Results panel for connection details</li>
            </ol>
            
            <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> If connection fails, check:
                <br />• Django server is running with WebSocket support
                <br />• JWT token is valid in localStorage
                <br />• Chat room exists and you have access
                <br />• Browser console for additional error details
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}