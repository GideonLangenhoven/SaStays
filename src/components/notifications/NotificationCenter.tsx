import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Bell,
  BellRing,
  CheckCircle,
  AlertTriangle,
  Info,
  DollarSign,
  MessageSquare,
  Calendar,
  Settings,
  Search,
  Filter,
  Trash2,
  MarkAsRead,
  Archive,
  Clock,
  Eye,
  EyeOff,
  X,
  RefreshCw,
  Download,
  Star,
  StarOff
} from 'lucide-react';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { toast } from 'sonner';
import { 
  Notification, 
  NotificationType, 
  NotificationPriority, 
  NotificationStatus,
  NotificationChannel 
} from '@/types/notifications';
import notificationService from '@/services/notificationService';

interface NotificationCenterProps {
  ownerId: string;
  isPopover?: boolean;
  onClose?: () => void;
}

const NOTIFICATION_ICONS = {
  booking_new: <Calendar className="h-4 w-4" />,
  booking_modified: <Settings className="h-4 w-4" />,
  booking_cancelled: <AlertTriangle className="h-4 w-4" />,
  payment_received: <DollarSign className="h-4 w-4" />,
  payment_failed: <AlertTriangle className="h-4 w-4" />,
  guest_message: <MessageSquare className="h-4 w-4" />,
  review_received: <Star className="h-4 w-4" />,
  maintenance_reminder: <Settings className="h-4 w-4" />,
  calendar_sync_failed: <Calendar className="h-4 w-4" />,
  property_inquiry: <Info className="h-4 w-4" />,
  check_in_reminder: <Clock className="h-4 w-4" />,
  check_out_reminder: <Clock className="h-4 w-4" />,
  payout_processed: <DollarSign className="h-4 w-4" />,
  account_alert: <AlertTriangle className="h-4 w-4" />
};

const PRIORITY_COLORS = {
  low: 'bg-blue-100 text-blue-800 border-blue-200',
  normal: 'bg-green-100 text-green-800 border-green-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200'
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  ownerId, 
  isPopover = false, 
  onClose 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'read' | 'unread'>('all');
  const [filterPriority, setFilterPriority] = useState<NotificationPriority | 'all'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Initialize real-time notifications
    notificationService.initializeWebSocket(ownerId);
    
    // Load initial notifications
    loadNotifications(true);

    // Subscribe to new notifications
    const unsubscribe = notificationService.onNotification((notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast for new notification
      if (notification.priority === 'urgent') {
        toast.error(notification.title, {
          description: notification.message,
          duration: 10000,
        });
      } else {
        toast.info(notification.title, {
          description: notification.message,
          duration: 5000,
        });
      }
    });

    return () => {
      unsubscribe();
      notificationService.disconnect();
    };
  }, [ownerId]);

  const loadNotifications = async (reset = false) => {
    try {
      setLoading(reset);
      
      const currentPage = reset ? 1 : page;
      const filters = {
        type: filterType !== 'all' ? filterType : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        priority: filterPriority !== 'all' ? filterPriority : undefined,
      };

      const response = await notificationService.getNotifications(currentPage, 20, filters);
      
      if (reset) {
        setNotifications(response.notifications);
        setPage(1);
      } else {
        setNotifications(prev => [...prev, ...response.notifications]);
      }
      
      setUnreadCount(response.unreadCount);
      setHasMore(response.notifications.length === 20);
      
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const refreshNotifications = async () => {
    setRefreshing(true);
    await loadNotifications(true);
    setRefreshing(false);
    toast.success('Notifications refreshed');
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, status: 'read' as NotificationStatus, readAt: new Date() }
            : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => n.status !== 'read');
      const unreadIds = unreadNotifications.map(n => n.id);
      
      await notificationService.markAllAsRead(unreadIds);
      
      setNotifications(prev => 
        prev.map(n => ({ 
          ...n, 
          status: 'read' as NotificationStatus, 
          readAt: n.readAt || new Date() 
        }))
      );
      
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update unread count if deleted notification was unread
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && deletedNotification.status !== 'read') {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const formatNotificationTime = (date: Date) => {
    const notificationDate = new Date(date);
    
    if (isToday(notificationDate)) {
      return `Today at ${format(notificationDate, 'HH:mm')}`;
    } else if (isYesterday(notificationDate)) {
      return `Yesterday at ${format(notificationDate, 'HH:mm')}`;
    } else {
      return format(notificationDate, 'MMM dd, HH:mm');
    }
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    return (
      <Badge 
        variant="outline" 
        className={`text-xs ${PRIORITY_COLORS[priority]}`}
      >
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const getNotificationIcon = (type: NotificationType, priority: NotificationPriority) => {
    const IconComponent = NOTIFICATION_ICONS[type] || Info;
    const colorClass = priority === 'urgent' ? 'text-red-500' :
                     priority === 'high' ? 'text-orange-500' :
                     priority === 'normal' ? 'text-green-500' : 'text-blue-500';
    
    return <div className={colorClass}>{IconComponent}</div>;
  };

  const filteredNotifications = notifications.filter(notification => {
    if (searchQuery && !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !notification.message.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Popover version for header notification bell
  if (isPopover) {
    return (
      <Card className="w-80 max-h-96 border-0 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={refreshNotifications}>
                <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-80">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <RefreshCw className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center p-6 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredNotifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 hover:bg-accent/50 cursor-pointer transition-colors ${
                      notification.status !== 'read' ? 'bg-blue-50/50' : ''
                    }`}
                    onClick={() => {
                      if (notification.status !== 'read') {
                        markAsRead(notification.id);
                      }
                      setSelectedNotification(notification);
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type, notification.priority)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium truncate">
                            {notification.title}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          {getPriorityBadge(notification.priority)}
                          {notification.status !== 'read' && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredNotifications.length > 5 && (
                  <div className="p-3 text-center border-t">
                    <p className="text-xs text-muted-foreground">
                      View all {filteredNotifications.length} notifications
                    </p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  // Full notification center
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated with your property activity
            </p>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-sm">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={refreshNotifications} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={(value: any) => setFilterPriority(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="booking_new">New Bookings</SelectItem>
                <SelectItem value="payment_received">Payments</SelectItem>
                <SelectItem value="guest_message">Messages</SelectItem>
                <SelectItem value="review_received">Reviews</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardContent className="p-0">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Loading notifications...</p>
              </div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center p-12">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No notifications found</h3>
              <p className="text-muted-foreground">
                {searchQuery || filterStatus !== 'all' || filterType !== 'all' || filterPriority !== 'all'
                  ? 'Try adjusting your filters'
                  : 'You\'re all caught up!'
                }
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="divide-y">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-accent/50 transition-colors ${
                      notification.status !== 'read' ? 'bg-blue-50/30 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between space-x-4">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type, notification.priority)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-2">
                              {getPriorityBadge(notification.priority)}
                              <span className="text-xs text-muted-foreground">
                                {formatNotificationTime(notification.createdAt)}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {notification.channels.map((channel) => (
                                <Badge key={channel} variant="outline" className="text-xs">
                                  {channel}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              {notification.status !== 'read' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="h-6 w-6 p-0"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedNotification(notification);
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <Info className="h-3 w-3" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {hasMore && (
                  <div className="p-4 text-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPage(prev => prev + 1);
                        loadNotifications();
                      }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Notification Detail Dialog */}
      <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedNotification && getNotificationIcon(selectedNotification.type, selectedNotification.priority)}
              <span>{selectedNotification?.title}</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedNotification && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getPriorityBadge(selectedNotification.priority)}
                  <Badge variant="outline">
                    {selectedNotification.status === 'read' ? 'Read' : 'Unread'}
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatNotificationTime(selectedNotification.createdAt)}
                </span>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Message</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedNotification.message}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Delivery Channels</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedNotification.channels.map((channel) => (
                    <Badge key={channel} variant="outline">
                      {channel}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {selectedNotification.data && Object.keys(selectedNotification.data).length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Additional Information</h4>
                  <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                    {JSON.stringify(selectedNotification.data, null, 2)}
                  </pre>
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                {selectedNotification.status !== 'read' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      markAsRead(selectedNotification.id);
                      setSelectedNotification(null);
                    }}
                  >
                    Mark as Read
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    deleteNotification(selectedNotification.id);
                    setSelectedNotification(null);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationCenter;