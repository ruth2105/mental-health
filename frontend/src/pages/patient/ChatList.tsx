import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface ChatRoom {
  id: number;
  therapist_name: string;
  last_message: {
    content: string;
    sender: string;
    created_at: string;
  } | null;
  unread_count: number;
  updated_at: string;
}

export default function PatientChatList() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const { get } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    loadChatRooms();
  }, []);

  const loadChatRooms = async () => {
    try {
      const data = await get('/chat/rooms/');
      setRooms(data);
    } catch (error) {
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rooms.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No conversations yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start chatting with your therapist after booking an appointment
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => navigate(`/chat/${room.id}`)}
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {room.therapist_name?.charAt(0) || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold truncate">
                          {room.therapist_name}
                        </h3>
                        {room.last_message && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(room.last_message.created_at), {
                              addSuffix: true
                            })}
                          </span>
                        )}
                      </div>
                      
                      {room.last_message && (
                        <p className="text-sm text-muted-foreground truncate">
                          {room.last_message.content}
                        </p>
                      )}
                    </div>
                    
                    {room.unread_count > 0 && (
                      <Badge variant="default" className="ml-2">
                        {room.unread_count}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
