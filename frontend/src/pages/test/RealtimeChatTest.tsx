import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Wifi, WifiOff } from 'lucide-react';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';

export default function RealtimeChatTest() {
  const { roomId } = useParams();
  const [newMessage, setNewMessage] = useState('');
  const [chatRoomId, setChatRoomId] = useState<number | null>(null);
  
  const { 
    messages, 
    sendMessage, 
    isConnected, 
    isTyping,
    setTyping,
    error 
  } = useRealtimeChat(chatRoomId);

  useEffect(() => {
    if (roomId) {
      setChatRoomId(parseInt(roomId));
    }
  }, [roomId]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    sendMessage(newMessage);
    setNewMessage('');
    setTyping(false);
  };

  const createTestRoom = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      // Create a test room with another user (assuming user ID 2 exists)
      const response = await fetch('http://localhost:8000/api/chat/rooms/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ other_user_id: 2 })
      });
      
      if (response.ok) {
        const room = await response.json();
        setChatRoomId(room.id);
        console.log('Created/found room:', room);
      } else {
        console.error('Failed to create room:', response.status);
      }
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Real-time Chat Test</h1>
          <p className="text-muted-foreground">
            Test the WebSocket-based real-time chat system
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chat Room Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <span>Room ID:</span>
              <Badge variant="outline">{chatRoomId || 'None'}</Badge>
              <Button onClick={createTestRoom} size="sm">
                Create Test Room
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
              {error && (
                <Badge variant="destructive">{error}</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {chatRoomId && (
          <Card>
            <CardHeader>
              <CardTitle>Chat Messages</CardTitle>
              {isTyping && (
                <p className="text-sm text-muted-foreground">Other person is typing...</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No messages yet. Start the conversation!
                  </p>
                ) : (
                  messages.map((msg) => {
                    const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;
                    const isMyMessage = msg.sender_id === currentUserId;
                    
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            isMyMessage
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                
                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    if (e.target.value.length > 0) {
                      setTyping(true);
                    }
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                  onBlur={() => setTyping(false)}
                  placeholder="Type a message..."
                  className="flex-1"
                  disabled={!isConnected}
                />
                <Button 
                  onClick={handleSendMessage} 
                  size="icon"
                  disabled={!isConnected || !newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Testing Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Click "Create Test Room" to set up a chat room</li>
                <li>Open this page in another browser window/tab</li>
                <li>Login as a different user in the other window</li>
                <li>Navigate to the same room ID: <code>/test/realtime-chat/{chatRoomId}</code></li>
                <li>Send messages from both windows</li>
                <li>Messages should appear instantly on both sides</li>
                <li>Typing indicators should show when someone is typing</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}