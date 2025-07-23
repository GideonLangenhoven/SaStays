import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Send, 
  Image, 
  Video, 
  Paperclip, 
  Clock, 
  Calendar,
  MessageSquare, 
  Save, 
  Edit, 
  Trash2,
  Plus,
  Search,
  Filter,
  Star,
  Reply,
  Forward,
  Archive,
  Flag,
  MoreHorizontal,
  Phone,
  Mail,
  User,
  MapPin,
  Camera,
  Mic,
  Smile
} from 'lucide-react';

interface Message {
  id: string;
  guestId: string;
  guestName: string;
  avatar?: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'video' | 'file';
  isOwner: boolean;
  read: boolean;
  attachments?: { type: string; url: string; name: string }[];
}

interface SavedReply {
  id: string;
  title: string;
  content: string;
  category: 'check-in' | 'check-out' | 'amenities' | 'local-info' | 'general';
  useCount: number;
  lastUsed: string;
}

interface ScheduledMessage {
  id: string;
  guestId: string;
  guestName: string;
  content: string;
  scheduledFor: string;
  type: 'text' | 'template';
  status: 'pending' | 'sent' | 'failed';
  trigger: 'date' | 'check-in' | 'check-out' | 'booking-confirmed';
}

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  checkIn: string;
  checkOut: string;
  status: 'upcoming' | 'current' | 'past';
  unreadCount: number;
  lastMessage: string;
  property: string;
}

const mockGuests: Guest[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@email.com',
    phone: '+27 82 123 4567',
    checkIn: '2025-01-25',
    checkOut: '2025-01-28',
    status: 'upcoming',
    unreadCount: 2,
    lastMessage: 'What time is check-in?',
    property: 'Sea View Apartment'
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike@email.com',
    phone: '+27 71 987 6543',
    checkIn: '2025-01-22',
    checkOut: '2025-01-25',
    status: 'current',
    unreadCount: 0,
    lastMessage: 'Thank you for the welcome message!',
    property: 'Sea View Apartment'
  }
];

const mockSavedReplies: SavedReply[] = [
  {
    id: '1',
    title: 'Check-in Instructions',
    content: 'Hi {guest_name}! Welcome to {property_name}. Check-in is from 3 PM. The key lockbox code is {lockbox_code}. Looking forward to hosting you!',
    category: 'check-in',
    useCount: 45,
    lastUsed: '2025-01-20T10:30:00Z'
  },
  {
    id: '2',
    title: 'WiFi Information',
    content: 'The WiFi network is "{wifi_name}" and the password is "{wifi_password}". Let me know if you need any assistance!',
    category: 'amenities',
    useCount: 32,
    lastUsed: '2025-01-19T15:20:00Z'
  },
  {
    id: '3',
    title: 'Local Recommendations',
    content: 'For great restaurants nearby, I recommend Ocean Basket (5 min walk) and The Lighthouse Café (10 min walk). The V&A Waterfront is 15 minutes by car.',
    category: 'local-info',
    useCount: 28,
    lastUsed: '2025-01-18T12:45:00Z'
  }
];

const mockScheduledMessages: ScheduledMessage[] = [
  {
    id: '1',
    guestId: '1',
    guestName: 'Sarah Johnson',
    content: 'Hi Sarah! Just a reminder that check-in is tomorrow at 3 PM. Looking forward to welcoming you!',
    scheduledFor: '2025-01-24T09:00:00Z',
    type: 'text',
    status: 'pending',
    trigger: 'date'
  },
  {
    id: '2',
    guestId: '2',
    guestName: 'Mike Chen',
    content: 'Thanks for staying with us! We hope you enjoyed your time. A review would be greatly appreciated!',
    scheduledFor: '2025-01-25T11:00:00Z',
    type: 'template',
    status: 'pending',
    trigger: 'check-out'
  }
];

export default function EnhancedCommunication() {
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(mockGuests[0]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      guestId: '1',
      guestName: 'Sarah Johnson',
      content: 'Hi! I have a booking for next week. What time is check-in?',
      timestamp: '2025-01-21T10:30:00Z',
      type: 'text',
      isOwner: false,
      read: true
    },
    {
      id: '2',
      guestId: '1',
      guestName: 'Sarah Johnson',
      content: 'Also, is parking available?',
      timestamp: '2025-01-21T10:32:00Z',
      type: 'text',
      isOwner: false,
      read: false
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [savedReplies, setSavedReplies] = useState<SavedReply[]>(mockSavedReplies);
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>(mockScheduledMessages);
  const [showSavedReplies, setShowSavedReplies] = useState(false);
  const [newReply, setNewReply] = useState({ title: '', content: '', category: 'general' as const });
  const [newScheduledMessage, setNewScheduledMessage] = useState({
    content: '',
    scheduledFor: '',
    trigger: 'date' as const
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedGuest) return;

    const message: Message = {
      id: Date.now().toString(),
      guestId: selectedGuest.id,
      guestName: selectedGuest.name,
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text',
      isOwner: true,
      read: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleUseSavedReply = (reply: SavedReply) => {
    let content = reply.content;
    
    // Replace placeholders
    if (selectedGuest) {
      content = content.replace('{guest_name}', selectedGuest.name);
      content = content.replace('{property_name}', selectedGuest.property);
      content = content.replace('{lockbox_code}', '1234');
      content = content.replace('{wifi_name}', 'SeaViewWiFi');
      content = content.replace('{wifi_password}', 'Ocean2025!');
    }
    
    setNewMessage(content);
    setShowSavedReplies(false);
    
    // Update usage count
    setSavedReplies(prev => prev.map(r => 
      r.id === reply.id 
        ? { ...r, useCount: r.useCount + 1, lastUsed: new Date().toISOString() }
        : r
    ));
  };

  const handleSaveSavedReply = () => {
    if (!newReply.title || !newReply.content) return;

    const savedReply: SavedReply = {
      id: Date.now().toString(),
      ...newReply,
      useCount: 0,
      lastUsed: new Date().toISOString()
    };

    setSavedReplies(prev => [...prev, savedReply]);
    setNewReply({ title: '', content: '', category: 'general' });
  };

  const handleScheduleMessage = () => {
    if (!newScheduledMessage.content || !selectedGuest) return;

    const scheduledMessage: ScheduledMessage = {
      id: Date.now().toString(),
      guestId: selectedGuest.id,
      guestName: selectedGuest.name,
      ...newScheduledMessage,
      type: 'text',
      status: 'pending'
    };

    setScheduledMessages(prev => [...prev, scheduledMessage]);
    setNewScheduledMessage({ content: '', scheduledFor: '', trigger: 'date' });
  };

  const handleFileUpload = (type: 'file' | 'image' | 'video') => {
    const input = type === 'image' ? imageInputRef : type === 'video' ? videoInputRef : fileInputRef;
    input.current?.click();
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-ZA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-ZA', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'check-in': 'bg-blue-100 text-blue-800',
      'check-out': 'bg-green-100 text-green-800',
      'amenities': 'bg-purple-100 text-purple-800',
      'local-info': 'bg-orange-100 text-orange-800',
      'general': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.general;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'sent': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="h-[600px] flex">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="*/*"
        onChange={(e) => console.log('File selected:', e.target.files?.[0])}
      />
      <input
        type="file"
        ref={imageInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => console.log('Image selected:', e.target.files?.[0])}
      />
      <input
        type="file"
        ref={videoInputRef}
        className="hidden"
        accept="video/*"
        onChange={(e) => console.log('Video selected:', e.target.files?.[0])}
      />

      {/* Guest List Sidebar */}
      <div className="w-80 border-r bg-gray-50">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Messages</h2>
            <Button variant="ghost" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input className="pl-10" placeholder="Search guests..." />
          </div>
        </div>
        
        <div className="overflow-y-auto h-full">
          {mockGuests.map((guest) => (
            <div
              key={guest.id}
              className={`p-4 border-b cursor-pointer hover:bg-white transition-colors ${
                selectedGuest?.id === guest.id ? 'bg-white border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => setSelectedGuest(guest)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm truncate">{guest.name}</h3>
                      <Badge variant="outline" className={`text-xs ${
                        guest.status === 'current' ? 'bg-green-100 text-green-800' :
                        guest.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {guest.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 truncate">{guest.lastMessage}</p>
                    <p className="text-xs text-gray-500">
                      {guest.checkIn} - {guest.checkOut}
                    </p>
                  </div>
                </div>
                {guest.unreadCount > 0 && (
                  <Badge className="bg-red-500 text-white text-xs">
                    {guest.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedGuest ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedGuest.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {selectedGuest.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {selectedGuest.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {selectedGuest.property}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages
                .filter(msg => msg.guestId === selectedGuest.id)
                .map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isOwner ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isOwner
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.isOwner ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            {/* Saved Replies Panel */}
            {showSavedReplies && (
              <div className="border-t bg-gray-50 p-4 max-h-48 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm">Saved Replies</h4>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowSavedReplies(false)}
                  >
                    ×
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {savedReplies.map((reply) => (
                    <div
                      key={reply.id}
                      className="p-3 bg-white rounded border cursor-pointer hover:border-blue-300 transition-colors"
                      onClick={() => handleUseSavedReply(reply)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-sm">{reply.title}</h5>
                        <Badge variant="outline" className={`text-xs ${getCategoryColor(reply.category)}`}>
                          {reply.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 truncate">{reply.content}</p>
                      <p className="text-xs text-gray-500 mt-1">Used {reply.useCount} times</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="border-t bg-white p-4">
              <div className="flex items-end gap-2">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFileUpload('file')}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFileUpload('image')}
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFileUpload('video')}
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSavedReplies(!showSavedReplies)}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="resize-none"
                  />
                </div>
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Select a guest to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Management Tools */}
      <div className="w-80 border-l bg-gray-50">
        <Tabs defaultValue="saved-replies" className="h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="saved-replies">Saved Replies</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          </TabsList>

          <TabsContent value="saved-replies" className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Saved Replies</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Saved Reply</DialogTitle>
                    <DialogDescription>
                      Create a template message that you can reuse with guests
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reply-title">Title</Label>
                      <Input
                        id="reply-title"
                        value={newReply.title}
                        onChange={(e) => setNewReply(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Check-in Instructions"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reply-category">Category</Label>
                      <Select
                        value={newReply.category}
                        onValueChange={(value) => setNewReply(prev => ({ ...prev, category: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="check-in">Check-in</SelectItem>
                          <SelectItem value="check-out">Check-out</SelectItem>
                          <SelectItem value="amenities">Amenities</SelectItem>
                          <SelectItem value="local-info">Local Info</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="reply-content">Message</Label>
                      <Textarea
                        id="reply-content"
                        value={newReply.content}
                        onChange={(e) => setNewReply(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Use {guest_name}, {property_name}, {lockbox_code}, etc. for dynamic content"
                        rows={4}
                      />
                    </div>
                    <Button onClick={handleSaveSavedReply} className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      Save Reply
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {savedReplies.map((reply) => (
                <Card key={reply.id} className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{reply.title}</h4>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-xs mb-2 ${getCategoryColor(reply.category)}`}>
                    {reply.category}
                  </Badge>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{reply.content}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Used {reply.useCount} times</span>
                    <span>{new Date(reply.lastUsed).toLocaleDateString()}</span>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="scheduled" className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Scheduled Messages</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule Message</DialogTitle>
                    <DialogDescription>
                      Schedule a message to be sent automatically
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="scheduled-message">Message</Label>
                      <Textarea
                        id="scheduled-message"
                        value={newScheduledMessage.content}
                        onChange={(e) => setNewScheduledMessage(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Enter your message..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="trigger-type">Trigger</Label>
                      <Select
                        value={newScheduledMessage.trigger}
                        onValueChange={(value) => setNewScheduledMessage(prev => ({ ...prev, trigger: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date">Specific Date/Time</SelectItem>
                          <SelectItem value="booking-confirmed">Booking Confirmed</SelectItem>
                          <SelectItem value="check-in">Day Before Check-in</SelectItem>
                          <SelectItem value="check-out">Day After Check-out</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newScheduledMessage.trigger === 'date' && (
                      <div>
                        <Label htmlFor="scheduled-date">Date & Time</Label>
                        <Input
                          id="scheduled-date"
                          type="datetime-local"
                          value={newScheduledMessage.scheduledFor}
                          onChange={(e) => setNewScheduledMessage(prev => ({ ...prev, scheduledFor: e.target.value }))}
                        />
                      </div>
                    )}
                    <Button onClick={handleScheduleMessage} className="w-full">
                      <Clock className="h-4 w-4 mr-2" />
                      Schedule Message
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {scheduledMessages.map((msg) => (
                <Card key={msg.id} className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{msg.guestName}</h4>
                    <Badge variant="outline" className={`text-xs ${getStatusColor(msg.status)}`}>
                      {msg.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{msg.content}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(msg.scheduledFor)}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}