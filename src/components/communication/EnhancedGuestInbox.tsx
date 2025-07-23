import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  MessageSquare,
  Send,
  Paperclip,
  Search,
  Star,
  Clock,
  FileText,
  Image as ImageIcon,
  Download,
  Trash2,
  Edit,
  Plus,
  Calendar,
  Filter,
  MessageCircle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Message, MessageThread, MessageTemplate, SendMessageRequest } from '@/types/messaging';
import messagingService from '@/services/messagingService';

interface EnhancedGuestInboxProps {
  ownerId: string;
}

export const EnhancedGuestInbox: React.FC<EnhancedGuestInboxProps> = ({ ownerId }) => {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    messagingService.initializeWebSocket(ownerId);
    
    // Load initial data
    loadThreads();
    loadTemplates();

    // Subscribe to new messages
    const unsubscribe = messagingService.onNewMessage((message) => {
      // Update messages if this message belongs to current thread
      if (selectedThread && message.bookingId === selectedThread.bookingId) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
      
      // Update threads
      loadThreads();
      
      // Show notification
      toast.success(`New message from ${message.senderType === 'guest' ? 'guest' : 'system'}`);
    });

    return () => {
      unsubscribe();
      messagingService.disconnect();
    };
  }, [ownerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadThreads = async () => {
    try {
      const threadData = await messagingService.getMessageThreads();
      setThreads(threadData);
    } catch (error) {
      console.error('Error loading threads:', error);
      toast.error('Failed to load message threads');
    }
  };

  const loadTemplates = async () => {
    try {
      const templateData = await messagingService.getTemplates();
      setTemplates(templateData);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const selectThread = async (thread: MessageThread) => {
    setSelectedThread(thread);
    try {
      const threadMessages = await messagingService.getBookingMessages(thread.bookingId);
      setMessages(threadMessages);
      
      // Mark messages as read
      const unreadMessageIds = threadMessages.filter(m => !m.isRead).map(m => m.id);
      if (unreadMessageIds.length > 0) {
        await messagingService.markAsRead(unreadMessageIds);
        loadThreads(); // Refresh threads to update unread counts
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!selectedThread || (!messageContent.trim() && !selectedTemplate)) return;

    setIsSending(true);
    try {
      const messageData: SendMessageRequest = {
        bookingId: selectedThread.bookingId,
        message: messageContent || '',
        messageType: selectedTemplate ? 'template' : 'text',
        templateId: selectedTemplate || undefined,
        attachments,
        isScheduled,
        scheduledFor: isScheduled && scheduledDate && scheduledTime 
          ? new Date(`${scheduledDate}T${scheduledTime}`) 
          : undefined,
      };

      const newMessage = await messagingService.sendMessage(messageData);
      
      if (!isScheduled) {
        setMessages(prev => [...prev, newMessage]);
      }
      
      setMessageContent('');
      setSelectedTemplate('');
      setAttachments([]);
      setIsScheduled(false);
      setScheduledDate('');
      setScheduledTime('');
      
      toast.success(isScheduled ? 'Message scheduled successfully' : 'Message sent successfully');
      
      if (!isScheduled) {
        scrollToBottom();
      }
      
      loadThreads(); // Refresh threads
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleFileAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setMessageContent(template.content);
    }
  };

  const filteredThreads = threads.filter(thread => {
    if (filter === 'unread' && thread.unreadCount === 0) return false;
    if (searchQuery && !thread.guestName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !thread.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const formatMessageTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    
    if (format(now, 'yyyy-MM-dd') === format(messageDate, 'yyyy-MM-dd')) {
      return format(messageDate, 'HH:mm');
    } else {
      return format(messageDate, 'MMM dd, HH:mm');
    }
  };

  const getMessageIcon = (messageType: string) => {
    switch (messageType) {
      case 'image': return <ImageIcon className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'template': return <Star className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex h-[800px] border rounded-lg overflow-hidden">
      {/* Sidebar - Thread List */}
      <div className="w-1/3 border-r bg-muted/30">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Messages</h2>
            <Badge variant="outline">
              {threads.reduce((sum, thread) => sum + thread.unreadCount, 0)} unread
            </Badge>
          </div>
          
          {/* Search and Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Messages</SelectItem>
                <SelectItem value="unread">Unread Only</SelectItem>
                <SelectItem value="starred">Starred</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Thread List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredThreads.map((thread) => (
              <div
                key={thread.bookingId}
                className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent/50 ${
                  selectedThread?.bookingId === thread.bookingId ? 'bg-accent' : ''
                }`}
                onClick={() => selectThread(thread)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {thread.guestName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{thread.guestName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {thread.propertyTitle}
                      </p>
                    </div>
                  </div>
                  {thread.unreadCount > 0 && (
                    <Badge variant="destructive" className="h-5 min-w-5 text-xs">
                      {thread.unreadCount}
                    </Badge>
                  )}
                </div>
                {thread.lastMessage && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground truncate flex-1">
                      {thread.lastMessage.message}
                    </p>
                    <span className="text-xs text-muted-foreground ml-2">
                      {formatDistanceToNow(new Date(thread.lastMessage.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedThread ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {selectedThread.guestName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedThread.guestName}</h3>
                    <p className="text-sm text-muted-foreground">{selectedThread.propertyTitle}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Message
                  </Button>
                  <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Templates
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>Message Templates</DialogTitle>
                      </DialogHeader>
                      <TemplateManager 
                        templates={templates} 
                        onTemplateCreated={loadTemplates}
                        onTemplateSelect={(template) => {
                          handleTemplateSelect(template.id);
                          setShowTemplateDialog(false);
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderType === 'owner' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.senderType === 'owner'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {getMessageIcon(message.messageType)}
                        <span className="text-xs opacity-70">
                          {formatMessageTime(message.createdAt)}
                        </span>
                        {message.isScheduled && (
                          <Clock className="h-3 w-3 opacity-70" />
                        )}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                      
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.attachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className="flex items-center space-x-2 p-2 bg-background/10 rounded text-xs"
                            >
                              <FileText className="h-3 w-3" />
                              <span className="flex-1 truncate">{attachment.originalName}</span>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-background">
              {/* Scheduled Message Options */}
              {isScheduled && (
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Switch
                      checked={isScheduled}
                      onCheckedChange={setIsScheduled}
                    />
                    <Label>Schedule this message</Label>
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              )}

              {/* Template Selection */}
              {templates.length > 0 && (
                <div className="mb-2">
                  <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a template (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Attachments Preview */}
              {attachments.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-muted p-2 rounded text-sm">
                      <FileText className="h-4 w-4" />
                      <span className="truncate max-w-32">{file.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 p-0"
                        onClick={() => removeAttachment(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Message Input */}
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Textarea
                    placeholder="Type your message..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    className="min-h-[60px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileAttachment}
                    multiple
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsScheduled(!isScheduled)}
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={sendMessage}
                    disabled={isSending || (!messageContent.trim() && !selectedTemplate)}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Template Manager Component
const TemplateManager: React.FC<{
  templates: MessageTemplate[];
  onTemplateCreated: () => void;
  onTemplateSelect: (template: MessageTemplate) => void;
}> = ({ templates, onTemplateCreated, onTemplateSelect }) => {
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    content: '',
    category: 'general' as MessageTemplate['category']
  });
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

  const createTemplate = async () => {
    try {
      await messagingService.createTemplate(newTemplate);
      toast.success('Template created successfully');
      onTemplateCreated();
      setNewTemplate({ name: '', subject: '', content: '', category: 'general' });
    } catch (error) {
      toast.error('Failed to create template');
    }
  };

  const updateTemplate = async () => {
    if (!editingTemplate) return;
    
    try {
      await messagingService.updateTemplate(editingTemplate.id, newTemplate);
      toast.success('Template updated successfully');
      onTemplateCreated();
      setEditingTemplate(null);
      setNewTemplate({ name: '', subject: '', content: '', category: 'general' });
    } catch (error) {
      toast.error('Failed to update template');
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      await messagingService.deleteTemplate(id);
      toast.success('Template deleted successfully');
      onTemplateCreated();
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  return (
    <Tabs defaultValue="templates" className="w-full">
      <TabsList>
        <TabsTrigger value="templates">My Templates</TabsTrigger>
        <TabsTrigger value="create">Create Template</TabsTrigger>
      </TabsList>
      
      <TabsContent value="templates" className="space-y-4">
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Category: {template.category}
                      </p>
                      <p className="text-sm mt-2 line-clamp-2">{template.content}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onTemplateSelect(template)}
                      >
                        Use
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingTemplate(template);
                          setNewTemplate({
                            name: template.name,
                            subject: template.subject || '',
                            content: template.content,
                            category: template.category
                          });
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </TabsContent>
      
      <TabsContent value="create" className="space-y-4">
        <div className="space-y-4">
          <div>
            <Label>Template Name</Label>
            <Input
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              placeholder="Welcome Message"
            />
          </div>
          
          <div>
            <Label>Category</Label>
            <Select 
              value={newTemplate.category} 
              onValueChange={(value: any) => setNewTemplate({ ...newTemplate, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="welcome">Welcome</SelectItem>
                <SelectItem value="checkin">Check-in</SelectItem>
                <SelectItem value="checkout">Check-out</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Subject (Optional)</Label>
            <Input
              value={newTemplate.subject}
              onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
              placeholder="Welcome to our property!"
            />
          </div>
          
          <div>
            <Label>Message Content</Label>
            <Textarea
              value={newTemplate.content}
              onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
              placeholder="Hi {{guestName}}, welcome to {{propertyName}}..."
              rows={6}
            />
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={editingTemplate ? updateTemplate : createTemplate}>
              {editingTemplate ? 'Update Template' : 'Create Template'}
            </Button>
            {editingTemplate && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingTemplate(null);
                  setNewTemplate({ name: '', subject: '', content: '', category: 'general' });
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default EnhancedGuestInbox;