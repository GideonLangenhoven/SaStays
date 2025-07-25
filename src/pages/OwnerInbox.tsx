import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { Loader2, Send, UserCircle, Inbox as InboxIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Define types for our data
interface Conversation {
    booking_id: number;
    property_title: string;
    guest_name: string;
    owner_id: string;
    guest_id: string;
    last_message: string;
    last_message_at: string;
}

interface Message {
    id: number;
    sender_id: string;
    content: string;
    sent_at: string;
}

const OwnerInbox: React.FC = () => {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const fetchConversations = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .rpc('get_conversations_for_user', { p_user_id: user.id });

            if (error) throw error;
            setConversations(data || []);
        } catch (error) {
            toast.error("Failed to fetch conversations.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [user]);
    
    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedConversation) return;
            setMessagesLoading(true);
            try {
                const { data, error } = await supabase
                    .from('messages')
                    .select('*')
                    .eq('booking_id', selectedConversation.booking_id)
                    .order('sent_at', { ascending: true });

                if (error) throw error;
                setMessages(data || []);
            } catch (error) {
                 toast.error("Failed to fetch messages.");
            } finally {
                 setMessagesLoading(false);
            }
        };
        fetchMessages();
    }, [selectedConversation]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation || !user) return;
        
        const recipient_id = user.id === selectedConversation.owner_id ? selectedConversation.guest_id : selectedConversation.owner_id;

        try {
            const { data: sentMessage, error } = await supabase
                .from('messages')
                .insert({
                    booking_id: selectedConversation.booking_id,
                    sender_id: user.id,
                    recipient_id: recipient_id,
                    content: newMessage,
                })
                .select()
                .single();
            
            if (error) throw error;

            setMessages(prev => [...prev, sentMessage]);
            setNewMessage('');
            // Optimistically update the last message in the conversation list
            setConversations(prev => prev.map(c => 
                c.booking_id === selectedConversation.booking_id 
                ? { ...c, last_message: newMessage, last_message_at: new Date().toISOString() } 
                : c
            ));
        } catch (error) {
            toast.error("Failed to send message.");
        }
    };

    if (isAuthLoading) {
        return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8" /></div>
    }

    return (
        <div className="h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 flex pt-16 overflow-hidden">
                <div className="w-full md:w-1/3 lg:w-1/4 border-r overflow-y-auto">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-bold">Inbox</h2>
                    </div>
                    {loading ? (
                        <div className="p-4 flex items-center justify-center"><Loader2 className="animate-spin" /></div>
                    ) : conversations.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">No conversations yet.</div>
                    ) : (
                        <div>
                            {conversations.map(convo => (
                                <div
                                    key={convo.booking_id}
                                    className={cn(
                                        "p-4 border-b cursor-pointer hover:bg-muted",
                                        selectedConversation?.booking_id === convo.booking_id && "bg-muted"
                                    )}
                                    onClick={() => setSelectedConversation(convo)}
                                >
                                    <p className="font-bold truncate">{user?.id === convo.owner_id ? convo.guest_name : convo.property_title}</p>
                                    <p className="text-sm text-muted-foreground truncate">{convo.last_message || "No messages yet."}</p>
                                    <p className="text-xs text-right text-muted-foreground mt-1">
                                        {convo.last_message_at ? formatDistanceToNow(parseISO(convo.last_message_at), { addSuffix: true }) : ''}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="hidden md:flex flex-1 flex-col">
                    {selectedConversation ? (
                        <>
                            <div className="p-4 border-b flex items-center">
                                <UserCircle className="h-8 w-8 mr-3 text-muted-foreground" />
                                <div>
                                    <h3 className="text-lg font-bold">{user?.id === selectedConversation.owner_id ? selectedConversation.guest_name : selectedConversation.owner_id}</h3>
                                    <p className="text-sm text-muted-foreground">{selectedConversation.property_title}</p>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messagesLoading ? <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" /></div> : (
                                    messages.map(msg => (
                                        <div key={msg.id} className={cn("flex", msg.sender_id === user?.id ? "justify-end" : "justify-start")}>
                                            <div className={cn("p-3 rounded-lg max-w-lg",  msg.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted")}>
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                                <p className="text-xs opacity-70 mt-1 text-right">{format(parseISO(msg.sent_at), 'p')}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                 <div ref={messagesEndRef} />
                            </div>
                            <form onSubmit={handleSendMessage} className="p-4 border-t bg-background flex items-center gap-2">
                                <Textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    rows={1}
                                    className="resize-none"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage(e);
                                        }
                                    }}
                                />
                                <Button type="submit" size="icon" disabled={!newMessage.trim()}><Send className="h-4 w-4"/></Button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                            <InboxIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
                            <h3 className="text-xl font-semibold">Select a conversation</h3>
                            <p className="text-muted-foreground">Choose a conversation from the left to start messaging.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default OwnerInbox;