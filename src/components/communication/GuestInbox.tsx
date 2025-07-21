// src/components/communication/GuestInbox.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  MessageCircle, 
  Send, 
  Search, 
  Clock, 
  CheckCheck, 
  Star,
  Image as ImageIcon,
  Calendar,
  User,
  Phone,
  Mail
} from 'lucide-react';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'owner' | 'guest';
  content: string;
  timestamp: Date;
  read: boolean;
  messageType: 'text' | 'image' | 'system';
  attachments?: string[];
}

interface Conversation {
  id: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  propertyTitle: string;
  bookingId?: string;
  checkIn?: Date;
  checkOut?: Date;
  lastMessage: Message;
  unreadCount: number;
  status: 'active' | 'archived';
  guestRating?: number;
}

interface SavedReply {
  id: string;
  title: string;
  content: string;
  category: 'check-in' | 'check-out' | 'general' | 'amenities';
}

export const GuestInbox: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [savedReplies, setSavedReplies] = useState<SavedReply[]>([]);
  const [showSavedReplies, setShowSavedReplies] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch('/api/conversations');
        const data = await response.json();
        setConversations(data.map((conv: any) => ({
          ...conv,
          checkIn: conv.checkIn ? new Date(conv.checkIn) : undefined,
          checkOut: conv.checkOut ? new Date(conv.checkOut) : undefined,
          lastMessage: {
            ...conv.lastMessage,
            timestamp: new Date(conv.lastMessage.timestamp)
          }
        })));
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load conversations",
          variant: "destructive"
        });
      }
    };

    fetchConversations();
    
    // Set up real-time updates
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [toast]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (selectedConversation) {
      const fetchMessages = async () => {
        try {
          const response = await fetch(`/api/conversations/${selectedConversation.id}/messages`);
          const data = await response.json();
          setMessages(data.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
          
          // Mark as read
          await fetch(`/api/conversations/${selectedConversation.id}/read`, {
            method: 'POST'
          });
        } catch (error) {
          console.error('Failed to fetch messages:', error);
        }
      };

      fetchMessages();
    }
  }, [selectedConversation]);

  // Fetch saved replies
  useEffect(() => {
    const fetchSavedReplies = async () => {
      try {
        const response = await fetch('/api/saved-replies');
        const data = await response.json();
        setSavedReplies(data);
      } catch (error) {
        console.error('Failed to fetch saved replies:', error);
      }
    };

    fetchSavedReplies();
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setLoading(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: newMessage.trim(),
          messageType: 'text'
        })
      });

      if (response.ok) {
        const message = await response.json();
        setMessages(prev => [...prev, {
          ...message,
          timestamp: new Date(message.timestamp)
        }]);
        setNewMessage('');
        
        toast({
          title: "Message sent",
          description: "Your message has been delivered to the guest"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const useSavedReply = (reply: SavedReply) => {
    setNewMessage(reply.content);
    setShowSavedReplies(false);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatMessageTime = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(timestamp, 'HH:mm');
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return format(timestamp, 'MMM d');
    }
  };

  return (
    <div className="flex h-[800px] border rounded-lg overflow-hidden">
      {/* Conversations List */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-4 border-b bg-white">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Messages
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="h-full">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 border-b cursor-pointer hover:bg-white transition-colors ${
                selectedConversation?.id === conversation.id ? 'bg-white border-l-4 border-l-primary' : ''
              }`}
              onClick={() => setSelectedConversation(conversation)}
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {conversation.guestName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-sm truncate">
                      {conversation.guestName}
                    </h3>
                    <div className="flex items-center gap-1">
                      {conversation.guestRating && (
                        <div className="flex items-center">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600 ml-1">
                            {conversation.guestRating}
                          </span>
                        </div>
                      )}
                      {conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-1 truncate">
                    {conversation.propertyTitle}
                  </p>
                  
                  {conversation.checkIn && conversation.checkOut && (
                    <p className="text-xs text-gray-500 mb-1">
                      {format(conversation.checkIn, 'MMM d')} - {format(conversation.checkOut, 'MMM d')}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-600 truncate flex-1 mr-2">
                      {conversation.lastMessage.content}
                    </p>
                    <span className="text-xs text-gray-400">
                      {formatMessageTime(conversation.lastMessage.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Message Thread */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {selectedConversation.guestName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{selectedConversation.guestName}</h3>
                    <p className="text-sm text-gray-600">{selectedConversation.propertyTitle}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {selectedConversation.guestEmail && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{selectedConversation.guestEmail}</span>
                    </div>
                  )}
                  {selectedConversation.guestPhone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <span>{selectedConversation.guestPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedConversation.checkIn && selectedConversation.checkOut && (
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Check-in: {format(selectedConversation.checkIn, 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Check-out: {format(selectedConversation.checkOut, 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderType === 'owner' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${
                      message.senderType === 'owner' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-gray-100'
                    } rounded-lg p-3`}>
                      {message.messageType === 'system' ? (
                        <div className="text-center text-sm text-gray-600 italic">
                          {message.content}
                        </div>
                      ) : (
                        <>
                          <p className="text-sm">{message.content}</p>
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.attachments.map((attachment, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <ImageIcon className="h-4 w-4" />
                                  <a 
                                    href={attachment} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm underline"
                                  >
                                    View Image
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-xs opacity-70">
                              {format(message.timestamp, 'HH:mm')}
                            </span>
                            {message.senderType === 'owner' && (
                              <CheckCheck className={`h-3 w-3 ${message.read ? 'text-blue-400' : 'opacity-50'}`} />
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t bg-white p-4">
              {showSavedReplies && (
                <div className="mb-4 p-3 border rounded-lg bg-gray-50">
                  <h4 className="font-medium text-sm mb-2">Saved Replies</h4>
                  <div className="space-y-2">
                    {savedReplies.map((reply) => (
                      <button
                        key={reply.id}
                        onClick={() => useSavedReply(reply)}
                        className="w-full text-left p-2 text-sm hover:bg-gray-100 rounded"
                      >
                        <div className="font-medium">{reply.title}</div>
                        <div className="text-gray-600 text-xs truncate">
                          {reply.content}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSavedReplies(!showSavedReplies)}
                >
                  Templates
                </Button>
                <div className="flex-1 flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    className="resize-none"
                    rows={2}
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={!newMessage.trim() || loading}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-600">
                Choose a conversation from the list to view messages
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestInbox;