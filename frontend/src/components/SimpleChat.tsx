import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, MessageSquare, X, RefreshCw } from 'lucide-react';
import { useSimpleChat } from '@/hooks/useSimpleChat';

interface SimpleChatProps {
  roomId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SimpleChat({ roomId, isOpen, onClose }: SimpleChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, sendMessage, isConnected, error, refreshMessages } = useSimpleChat(roomId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const success = await sendMessage(newMessage);
    
    if (success) {
      setNewMessage('');
    }
    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-xl flex flex-col z-50 border-l">
      {/* Header */}
      <div className="bg-primary text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <div>
            <h3 className="font-semibold">Chat</h3>
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              {error && (
                <span className="text-red-200" title={error}>⚠️</span>
              )}
            </div>
            <div className="text-xs text-gray-300">
              Room: {roomId || 'Loading...'}
              <Button
                onClick={refreshMessages}
                variant="ghost"
                size="sm"
                className="ml-2 h-4 w-4 p-0 text-white hover:bg-primary-dark"
                title="Refresh messages"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-primary-dark"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
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
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs opacity-70">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </p>
                    {!isMyMessage && (
                      <p className="text-xs opacity-70">
                        {msg.sender_name || msg.sender_email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        {error && (
          <div className="mb-2 p-2 bg-red-100 text-red-700 text-sm rounded">
            {error}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
            disabled={isSending || !isConnected}
          />
          <Button 
            onClick={handleSendMessage} 
            size="icon"
            disabled={isSending || !newMessage.trim() || !isConnected}
          >
            {isSending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {isSending ? 'Sending...' : 'Press Enter to send'}
        </div>
      </div>
    </div>
  );
}