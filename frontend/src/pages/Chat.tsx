import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserService from '../services/user.service';
import { ConversationResponse, ChatMessage, User, UserProfile, GroupChatRequest } from '../types';
import {
  Search, Send, LogOut, MessageSquare, Smile, Paperclip,
  Phone, Video, Info, X, Settings, Plus,
  Heart, ThumbsUp, Laugh, Angry, Frown,
  Image, File, Camera, Edit, User as UserIcon,
  Bell, Lock, Palette, HelpCircle, Users, Check,
  CheckCheck, Clock, UserPlus, Crown, Shield,
  Reply, Copy, Forward, Pin, Star, Trash2, ChevronDown,
  CheckSquare, Menu, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import coffeeAnimation from '../../public/Hot Smiling Coffee _ Good Morning.json';
import CloudinaryService from '../services/cloudinary.service';

const Chat: React.FC = () => {
  const context = useContext(AuthContext);
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationResponse | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showGroupChat, setShowGroupChat] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfile | null>(null);
  const [showNewChatMenu, setShowNewChatMenu] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    bio: '',
    phone: ''
  });
  const [editingMessage, setEditingMessage] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [forwardingMessage, setForwardingMessage] = useState<ChatMessage | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<Set<number>>(new Set());

  // New state for enhanced features
  const [typingUsers, setTypingUsers] = useState<Map<number, string>>(new Map());
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [groupChats, setGroupChats] = useState<ConversationResponse[]>([]);
  const [showGroupSection, setShowGroupSection] = useState(true);

  // Smart positioning for dropdown to avoid overflow
  const getDropdownPosition = () => {
    // Check if there's enough space above the button
    const buttonElement = document.querySelector('.new-chat-button');
    if (buttonElement) {
      const rect = buttonElement.getBoundingClientRect();
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceLeft = rect.left;
      const spaceRight = window.innerWidth - rect.right;

      // Prefer showing above if there's space, otherwise below
      if (spaceAbove > 200) {
        return 'top';
      } else if (spaceBelow > 200) {
        return 'bottom';
      } else if (spaceRight > 200) {
        return 'right';
      } else if (spaceLeft > 200) {
        return 'left';
      }
    }
    return 'top'; // default
  };

  const [dropdownPosition, setDropdownPosition] = useState('top');
  const [contextMenu, setContextMenu] = useState<{ show: boolean, x: number, y: number, messageId?: number, showReactions?: boolean }>({ show: false, x: 0, y: 0, showReactions: false });
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<User[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = context?.user;

  // Initialize profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  // Enhanced Message Status Component with proper tick states
  const MessageStatus = ({ status, timestamp }: { status?: 'sent' | 'delivered' | 'read', timestamp: string }) => {
    const getStatusIcon = () => {
      switch (status) {
        case 'sent':
          return <Check className="w-4 h-4 text-gray-400" />; // Single gray tick
        case 'delivered':
          return <CheckCheck className="w-4 h-4 text-gray-400" />; // Double gray ticks
        case 'read':
          return <CheckCheck className="w-4 h-4 text-blue-500" style={{ strokeWidth: '2.5px' }} />; // Double blue ticks (bold)
        default:
          return <Clock className="w-4 h-4 text-gray-400" />; // Clock for pending
      }
    };

    return (
      <div className="flex items-center gap-1 mt-1">
        <span className="text-[10px] opacity-60">
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        {getStatusIcon()}
      </div>
    );
  };

  // Group Avatar Component
  const GroupAvatar = ({ members, size = 'md' }: { members?: User[], size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-12 h-12',
      lg: 'w-20 h-20'
    };

    if (!members || members.length === 0) {
      return (
        <div className={`${sizeClasses[size]} bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center`}>
          <Users className="w-1/2 h-1/2 text-white" />
        </div>
      );
    }

    if (members.length === 1) {
      return (
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-white/10`}>
          <img
            src={members[0].avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${members[0].username}`}
            alt={members[0].username}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    // For multiple members, show a grid of avatars
    return (
      <div className={`${sizeClasses[size]} relative`}>
        <div className="grid grid-cols-2 gap-0.5 w-full h-full">
          {members.slice(0, 4).map((member, index) => (
            <div key={member.id} className="rounded-full overflow-hidden border border-white/20">
              <img
                src={member.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${member.username}`}
                alt={member.username}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        {members.length > 4 && (
          <div className="absolute -bottom-1 -right-1 bg-gray-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            +{members.length - 4}
          </div>
        )}
      </div>
    );
  };

  // Skeleton components - Responsive
  const ConversationSkeleton = () => (
    <div className="flex items-center gap-2 md:gap-3 p-2 md:p-4 mx-1 md:mx-2 mb-1 rounded-xl animate-pulse">
      <div className="w-8 h-8 md:w-12 md:h-12 bg-gray-300 rounded-full"></div>
      <div className="flex-1">
        <div className="h-3 md:h-4 bg-gray-300 rounded mb-1 md:mb-2 w-3/4"></div>
        <div className="h-2 md:h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );

  const MessageSkeleton = () => (
    <div className="flex justify-start mb-4 animate-pulse">
      <div className="max-w-[70%]">
        <div className="bg-gray-200 rounded-2xl p-3">
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  );

  // Emoji reactions
  const reactions = [
    { emoji: '❤️', icon: Heart, name: 'love' },
    { emoji: '👍', icon: ThumbsUp, name: 'like' },
    { emoji: '😂', icon: Laugh, name: 'laugh' },
    { emoji: '😢', icon: Frown, name: 'sad' },
    { emoji: '😡', icon: Angry, name: 'angry' }
  ];

  const emojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🔥', '💯', '🎉', '😢', '😡'];

  const handleReaction = (messageId: number, reaction: string) => {
    // TODO: Implement reaction functionality
    console.log('Add reaction:', reaction, 'to message:', messageId);
    setContextMenu({ show: false, x: 0, y: 0, showReactions: false });
  };

  // Enhanced typing indicator functionality
  const handleTyping = () => {
    if (!selectedConversation) return;

    if (!isTyping) {
      setIsTyping(true);
      UserService.sendTypingIndicator(selectedConversation.conversationId, true);
    }

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout to stop typing after 3 seconds
    const timeout = setTimeout(() => {
      setIsTyping(false);
      UserService.sendTypingIndicator(selectedConversation.conversationId, false);
    }, 3000);

    setTypingTimeout(timeout);
  };

  // Typing indicator component
  const TypingIndicator = () => {
    if (typingUsers.size === 0) return null;

    const typingUserNames = Array.from(typingUsers.values());
    const displayText = typingUserNames.length === 1
      ? `${typingUserNames[0]} is typing...`
      : `${typingUserNames.slice(0, 2).join(', ')} ${typingUserNames.length > 2 ? `and ${typingUserNames.length - 2} others` : ''} are typing...`;

    return (
      <div className="px-4 py-2 text-xs text-gray-500 italic">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span>{displayText}</span>
        </div>
      </div>
    );
  };

  const handleEditMessage = (messageId: number, currentText: string) => {
    setEditingMessage(messageId);
    setEditText(currentText);
    setContextMenu({ show: false, x: 0, y: 0, showReactions: false });
  };

  const saveEditedMessage = async (messageId: number) => {
    if (!editText.trim()) return;

    try {
      const response = await UserService.editMessage(messageId, editText.trim());

      // Update local state with edited message
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, payload: editText.trim(), editedAt: new Date().toISOString() } : msg
      ));

      setEditingMessage(null);
      setEditText('');
    } catch (error) {
      console.error('Failed to edit message:', error);
      // You can add a toast notification here
    }
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
  };

  const handleForwardMessage = (message: ChatMessage) => {
    setForwardingMessage(message);
    setContextMenu({ show: false, x: 0, y: 0, showReactions: false });
    // TODO: Show forward modal with conversation list
  };

  const handleSelectMessage = (messageId: number) => {
    setSelectedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
    setContextMenu({ show: false, x: 0, y: 0, showReactions: false });
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {
      await UserService.deleteMessage(messageId);

      // Update local state to mark message as deleted
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, isDeleted: true, payload: 'This message was deleted' } : msg
      ));

      setContextMenu({ show: false, x: 0, y: 0, showReactions: false });
    } catch (error) {
      console.error('Failed to delete message:', error);
      // You can add a toast notification here
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedConversation || !user) return;

    // Check if Cloudinary is configured
    if (!CloudinaryService.isConfigured()) {
      console.error('Cloudinary not configured. Please set up your credentials.');
      alert('File upload not configured. Please contact administrator.');
      return;
    }

    setUploading(true);
    setShowFileUpload(false);

    try {
      // Upload to Cloudinary
      const imageUrl = await CloudinaryService.uploadFile(file);

      // Determine message content based on file type
      let messageContent = '';
      if (file.type.startsWith('image/')) {
        messageContent = `📷 Image: ${imageUrl}`;
      } else {
        messageContent = `📎 File: ${file.name} - ${imageUrl}`;
      }

      // Send message with file URL
      const messageRequest = {
        receiverId: selectedConversation.isGroup
          ? selectedConversation.conversationId
          : (selectedConversation.userId || selectedConversation.conversationId),
        content: messageContent
      };

      const response = await UserService.sendMessage(messageRequest);
      setMessages(prev => [...prev, response.data]);

      // Update conversation list
      setConversations(prev => prev.map(conv =>
        conv.conversationId === selectedConversation.conversationId
          ? {
            ...conv,
            lastMessage: file.type.startsWith('image/') ? '📷 Image' : `📎 ${file.name}`,
            lastMessageTime: new Date().toISOString(),
            lastSenderId: user.id
          }
          : conv
      ));
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedGroupMembers.length === 0) {
      alert('Please enter a group name and select at least one member.');
      return;
    }

    try {
      const groupRequest: GroupChatRequest = {
        name: groupName.trim(),
        description: groupDescription.trim(),
        memberIds: selectedGroupMembers.map(member => member.id)
      };

      const response = await UserService.createGroup(groupRequest);

      // Add new group to conversations list
      setConversations(prev => [response.data, ...prev]);

      // Reset form
      setGroupName('');
      setGroupDescription('');
      setSelectedGroupMembers([]);
      setShowGroupChat(false);

      // Optionally select the new group
      setSelectedConversation(response.data);
    } catch (error) {
      console.error('Failed to create group:', error);
      alert('Failed to create group. Please try again.');
    }
  };

  const handleViewUserProfile = async (userId: number) => {
    try {
      // TODO: Implement user profile API
      const mockProfile: UserProfile = {
        id: userId,
        username: availableUsers.find(u => u.id === userId)?.username || 'Unknown',
        email: availableUsers.find(u => u.id === userId)?.email || '',
        bio: availableUsers.find(u => u.id === userId)?.bio,
        phone: availableUsers.find(u => u.id === userId)?.phone,
        avatarUrl: availableUsers.find(u => u.id === userId)?.avatarUrl,
        isOnline: availableUsers.find(u => u.id === userId)?.isOnline,
        lastSeen: availableUsers.find(u => u.id === userId)?.lastSeen,
        joinedDate: '2024-01-15',
        mutualGroups: [],
        sharedMedia: []
      };

      setSelectedUserProfile(mockProfile);
      setShowUserProfile(true);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const getLastMessagePreview = (conv: ConversationResponse) => {
    if (!conv.lastMessage) return 'No messages yet';
    if (conv.lastSenderId === user?.id) {
      return `You: ${conv.lastMessage}`;
    }
    return conv.lastMessage;
  };

  useEffect(() => {
    if (!user) return;

    setConversationsLoading(true);
    console.log('Fetching conversations and users for user:', user.id);
    Promise.all([
      UserService.getConversations(),
      UserService.getAvailableUsers()
    ])
      .then(([conversationsRes, usersRes]) => {
        console.log('Conversations received:', conversationsRes.data);
        console.log('Available users received:', usersRes.data);
        setConversations(conversationsRes.data);
        setAvailableUsers(usersRes.data);
        setConversationsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch data:', err);
        setConversationsLoading(false);
      });
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      setMessagesLoading(true);
      console.log('Fetching messages for conversation:', selectedConversation.conversationId);
      UserService.getConversationMessages(selectedConversation.conversationId)
        .then(res => {
          console.log('Messages received:', res.data);
          const messages = res.data.reverse();
          setMessages(messages);
          setMessagesLoading(false);

          // Mark messages as read and update conversation unread count
          if (messages.length > 0) {
            // Mark the last message as read if it's not from current user
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.senderId !== user?.id) {
              UserService.markMessageAsRead(lastMessage.id!).catch(err =>
                console.error('Failed to mark message as read:', err)
              );
            }

            // Update conversation unread count to 0
            setConversations(prev => prev.map(conv =>
              conv.conversationId === selectedConversation.conversationId
                ? { ...conv, unreadCount: 0 }
                : conv
            ));
          }
        })
        .catch(err => {
          console.error('Failed to fetch messages:', err);
          setMessagesLoading(false);
        });
    }
  }, [selectedConversation, user]);

  // Close dropdown when clicking outside or pressing ESC
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showNewChatMenu) {
        setShowNewChatMenu(false);
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Close all modals and dropdowns
        setShowNewChatMenu(false);
        setShowFileUpload(false);
        setShowEmojiPicker(false);
        setContextMenu({ show: false, x: 0, y: 0, showReactions: false });
        setShowNewChat(false);
        setShowGroupChat(false);
        setShowUserSettings(false);
        setShowUserProfile(false);
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showNewChatMenu]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!context || !user) {
    return (
      <div className="flex h-screen bg-[#2a2a2a] items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#2a2a2a] text-white overflow-hidden font-chat relative">
      {/* Coffee Watermark */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
        <div className="w-[700px] h-[700px] opacity-[0.02]">
          <Lottie animationData={coffeeAnimation} loop={true} />
        </div>
      </div>
      {/* Left Sidebar - Dark theme with IVLOGE branding - Responsive */}
      <div className={`
        w-full md:w-[320px] lg:w-[360px] flex flex-col bg-[#121212] border-r border-white/10 relative z-10
        ${selectedConversation ? 'hidden md:flex' : 'flex'}
        transition-all duration-300 ease-in-out
      `}>
        {/* Header with IVLOGE Logo - Responsive */}
        <div className="p-3 md:p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="flex items-center gap-0">
              <div className="h-[1.25rem] w-[1.25rem] md:h-[1.5rem] md:w-[1.5rem]">
                <Lottie animationData={coffeeAnimation} loop={true} />
              </div>
              <span className="text-chat-orange text-xl md:text-2xl font-bold tracking-wider leading-none">
                VLOGE
              </span>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <button
                onClick={() => setShowUserSettings(true)}
                className="p-1.5 md:p-2 hover:bg-white/5 rounded-xl transition-all text-gray-400 hover:text-chat-orange"
                title="Settings"
              >
                <Settings className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={() => {
                  if (context) {
                    context.logout();
                    navigate('/login');
                  }
                }}
                className="p-1.5 md:p-2 hover:bg-white/5 rounded-xl transition-all text-gray-400 hover:text-red-400"
                title="Logout"
              >
                <LogOut className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>

          {/* Current User Info - Responsive */}
          {user && (
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4 p-2 md:p-3 bg-white/5 rounded-xl">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-chat-orange/30">
                <img
                  src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${user.username}`}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-xs md:text-sm text-white truncate">{user.username}</h3>
                <p className="text-[10px] md:text-xs text-gray-400 truncate">{user.email}</p>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          )}

          <h2 className="text-xs md:text-sm text-gray-400">Chats</h2>
        </div>

        {/* Search with inline + button */}
        <div className="px-3 md:px-4 py-2 md:py-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-3 h-3 md:w-4 md:h-4" />
              <input
                type="text"
                placeholder="Search in All"
                className="w-full bg-[#1e1e1e] border border-white/5 focus:border-chat-orange/50 rounded-xl py-2 md:py-2.5 pl-8 md:pl-10 pr-3 md:pr-4 outline-none transition-all text-xs md:text-sm placeholder:text-gray-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Circular + button inline with search */}
            <div className="relative">
              <button
                onClick={() => {
                  setDropdownPosition(getDropdownPosition());
                  setShowNewChatMenu(!showNewChatMenu);
                }}
                className="new-chat-button w-10 h-10 md:w-11 md:h-11 bg-chat-orange hover:bg-chat-orange/90 rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </button>

              {/* Smart Tooltip Dropdown - Absolute positioning within sidebar */}
              <AnimatePresence>
                {showNewChatMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute z-50 bg-[#1e1e1e] border border-white/10 rounded-xl shadow-xl min-w-[160px] top-12 right-0"
                  >
                    {/* Tooltip Arrow pointing to button */}
                    <div className="absolute -top-2 right-6 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-[#1e1e1e]"></div>

                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowNewChat(true);
                          setShowNewChatMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all text-white text-sm"
                      >
                        <MessageSquare className="w-4 h-4 text-chat-orange" />
                        New Chat
                      </button>
                      <button
                        onClick={() => {
                          setShowGroupChat(true);
                          setShowNewChatMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all text-white text-sm"
                      >
                        <Users className="w-4 h-4 text-green-500" />
                        New Group
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {conversationsLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <ConversationSkeleton key={i} />
              ))}
            </div>
          ) : conversations.length > 0 ? (
            <div className="space-y-4">
              {/* Group Chats Section */}
              {conversations.filter(conv => conv.isGroup && conv.username.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-2 md:px-4 mb-2">
                    <h3 className="text-xs text-gray-400 uppercase tracking-wider font-medium">Groups</h3>
                    <button
                      onClick={() => setShowGroupSection(!showGroupSection)}
                      className="p-1 hover:bg-white/5 rounded transition-all"
                    >
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${showGroupSection ? 'rotate-90' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  <AnimatePresence>
                    {showGroupSection && conversations.filter(conv =>
                      conv.isGroup && conv.username.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((conv) => (
                      <motion.div
                        key={conv.conversationId}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onClick={() => setSelectedConversation(conv)}
                        className={`flex items-center gap-2 md:gap-3 p-2 md:p-4 mx-1 md:mx-2 mb-1 rounded-xl cursor-pointer transition-all relative ${selectedConversation?.conversationId === conv.conversationId
                          ? 'bg-chat-orange/10 border-l-4 border-chat-orange'
                          : 'hover:bg-white/5'
                          }`}
                      >
                        <div className="relative flex-shrink-0">
                          <GroupAvatar members={conv.groupMembers} size="sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-semibold truncate text-xs md:text-sm flex items-center gap-1 md:gap-2">
                              <Users className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                              <span className="hidden sm:inline">{conv.groupName || 'Group Chat'}</span>
                              <span className="sm:hidden">{(conv.groupName || 'Group').substring(0, 10)}...</span>
                            </h3>
                            <span className="text-[10px] md:text-xs text-gray-500">
                              {conv.lastMessageTime ? new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                          <p className="text-[10px] md:text-xs text-gray-500 truncate">
                            {getLastMessagePreview(conv)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {conv.lastSenderId !== user.id && conv.lastMessage && (
                            <div className="w-2 h-2 bg-chat-orange rounded-full flex-shrink-0"></div>
                          )}
                          {conv.unreadCount && conv.unreadCount > 0 && (
                            <div className="bg-chat-orange text-white text-[10px] md:text-xs rounded-full px-1.5 md:px-2 py-0.5 md:py-1 min-w-[16px] md:min-w-[20px] text-center">
                              {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Direct Chats Section */}
              {conversations.filter(conv => !conv.isGroup && conv.username.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
                <div>
                  <div className="px-2 md:px-4 mb-2">
                    <h3 className="text-xs text-gray-400 uppercase tracking-wider font-medium">Direct Messages</h3>
                  </div>
                  <AnimatePresence>
                    {conversations.filter(conv =>
                      !conv.isGroup && conv.username.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((conv) => (
                      <motion.div
                        key={conv.conversationId}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onClick={() => setSelectedConversation(conv)}
                        className={`flex items-center gap-2 md:gap-3 p-2 md:p-4 mx-1 md:mx-2 mb-1 rounded-xl cursor-pointer transition-all relative ${selectedConversation?.conversationId === conv.conversationId
                          ? 'bg-chat-orange/10 border-l-4 border-chat-orange'
                          : 'hover:bg-white/5'
                          }`}
                      >
                        <div className="relative flex-shrink-0">
                          <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full overflow-hidden border-2 border-white/10">
                            <img
                              src={conv.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${conv.username}`}
                              alt={conv.username}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {conv.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 md:w-3.5 md:h-3.5 bg-green-500 border-2 border-[#121212] rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-semibold truncate text-xs md:text-sm">
                              <span className="hidden sm:inline">{conv.username}</span>
                              <span className="sm:hidden">{conv.username.substring(0, 8)}...</span>
                            </h3>
                            <span className="text-[10px] md:text-xs text-gray-500">
                              {conv.lastMessageTime ? new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                          <p className="text-[10px] md:text-xs text-gray-500 truncate">
                            {getLastMessagePreview(conv)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {conv.lastSenderId !== user.id && conv.lastMessage && (
                            <div className="w-2 h-2 bg-chat-orange rounded-full flex-shrink-0"></div>
                          )}
                          {conv.unreadCount && conv.unreadCount > 0 && (
                            <div className="bg-chat-orange text-white text-[10px] md:text-xs rounded-full px-1.5 md:px-2 py-0.5 md:py-1 min-w-[16px] md:min-w-[20px] text-center">
                              {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area - Dark theme matching other pages - Responsive */}
      <div className={`
        flex-1 flex flex-col bg-[#2a2a2a] relative z-10
        ${selectedConversation ? 'flex' : 'hidden md:flex'}
        transition-all duration-300 ease-in-out
      `}>
        {/* Coffee Watermark for main chat area */}
        <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
          <div className="w-[600px] h-[600px] opacity-[0.02]">
            <Lottie animationData={coffeeAnimation} loop={true} />
          </div>
        </div>
        {
          selectedConversation ? (
            <>
              {/* Chat Header - Responsive */}
              < div className="p-3 md:p-4 border-b border-white/10 bg-[#121212] flex items-center justify-between relative z-10" >
                <div className="flex items-center gap-2 md:gap-3">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden p-1.5 hover:bg-white/5 rounded-lg transition-all text-gray-400 hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div
                    className="cursor-pointer"
                    onClick={() => selectedConversation && !selectedConversation.isGroup && selectedConversation.userId && handleViewUserProfile(selectedConversation.userId)}
                  >
                    {selectedConversation?.isGroup ? (
                      <GroupAvatar members={selectedConversation.groupMembers} size="sm" />
                    ) : (
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden">
                        <img
                          src={selectedConversation?.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${selectedConversation?.username}`}
                          alt={selectedConversation?.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <div
                    className="cursor-pointer"
                    onClick={() => selectedConversation && !selectedConversation.isGroup && selectedConversation.userId && handleViewUserProfile(selectedConversation.userId)}
                  >
                    <h2 className="font-bold text-sm md:text-base text-white flex items-center gap-1 md:gap-2">
                      {selectedConversation?.isGroup ? (
                        <>
                          <Users className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                          <span className="hidden sm:inline">{selectedConversation.groupName || 'Group Chat'}</span>
                          <span className="sm:hidden">{(selectedConversation.groupName || 'Group').substring(0, 12)}...</span>
                        </>
                      ) : (
                        <>
                          <span className="hidden sm:inline">{selectedConversation?.username}</span>
                          <span className="sm:hidden">{selectedConversation?.username.substring(0, 12)}...</span>
                        </>
                      )}
                    </h2>
                    <span className="text-[10px] md:text-xs text-gray-400">
                      {selectedConversation?.isGroup ? (
                        `${selectedConversation.groupMembers?.length || 0} members`
                      ) : (
                        selectedConversation?.isOnline ? 'Online' : 'Last seen recently'
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <button className="p-1.5 md:p-2 hover:bg-white/5 rounded-lg transition-all text-gray-400 hover:text-white">
                    <Phone className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <button className="p-1.5 md:p-2 hover:bg-white/5 rounded-lg transition-all text-gray-400 hover:text-white">
                    <Video className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <button
                    onClick={() => setShowProfile(!showProfile)}
                    className="p-1.5 md:p-2 hover:bg-white/5 rounded-lg transition-all text-gray-400 hover:text-white"
                  >
                    <Info className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </div >

              {/* Messages Area - Responsive */}
              < div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 md:space-y-4 bg-[#2a2a2a] relative z-10" onClick={() => setContextMenu({ show: false, x: 0, y: 0, showReactions: false })}>
                {/* Coffee Watermark for messages area */}
                < div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none" >
                  <div className="w-[400px] h-[400px] md:w-[500px] md:h-[500px] opacity-[0.02]">
                    <Lottie animationData={coffeeAnimation} loop={true} />
                  </div>
                </div >
                {
                  messagesLoading ? (
                    <div className="space-y-2 md:space-y-4 relative z-10" >
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'} mb-2 md:mb-4 animate-pulse`}>
                          <div className={`max-w-[85%] md:max-w-[70%] ${i % 2 === 0 ? 'order-1' : 'order-2'}`}>
                            <div className={`p-2 md:p-3 rounded-2xl ${i % 2 === 0
                              ? 'bg-[#3a3a3a] rounded-bl-sm'
                              : 'bg-chat-orange/20 rounded-br-sm'
                              }`}>
                              <div className="h-3 md:h-4 bg-gray-600 rounded mb-1 md:mb-2 w-full"></div>
                              <div className="h-3 md:h-4 bg-gray-600 rounded w-3/4"></div>
                              <div className="flex items-center justify-between mt-1 md:mt-2">
                                <div className="h-2 md:h-3 bg-gray-700 rounded w-1/3"></div>
                                <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-700 rounded"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                      }
                    </div >
                  ) : messages.length > 0 ? (
                    messages.map((msg, idx) => (
                      <motion.div
                        key={msg.id || idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] md:max-w-[70%] ${msg.senderId === user.id ? 'order-2' : 'order-1'} relative group`}>
                          {/* Selection indicator */}
                          {selectedMessages.has(msg.id!) && (
                            <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 z-10">
                              <div className="w-6 h-6 bg-chat-orange rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          )}
                          {/* Message with WhatsApp-style dropdown */}
                          <div className="relative">
                            {/* Special message handling for links and files */}
                            {msg.payload.includes('http') ? (
                              <div className={`p-2 md:p-3 rounded-2xl relative ${msg.senderId === user.id
                                ? 'bg-chat-orange text-white rounded-br-sm'
                                : 'bg-[#3a3a3a] text-white rounded-bl-sm border border-white/10'
                                }`}>
                                {/* Show sender name in group chats */}
                                {selectedConversation?.isGroup && msg.senderId !== user?.id && (
                                  <div className="text-xs text-gray-300 mb-1 font-medium">
                                    {selectedConversation.groupMembers?.find(member => member.id === msg.senderId)?.username || 'Unknown User'}
                                  </div>
                                )}
                                <p className="leading-relaxed text-xs md:text-sm mb-1 md:mb-2">{msg.payload}</p>
                                <div className="bg-black/10 rounded-lg p-3 mt-2">
                                  <div className="w-full h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded mb-2 flex items-center justify-center">
                                    <span className="text-xs opacity-50">🔗 Link Preview</span>
                                  </div>
                                  <p className="text-xs font-medium">Check this out</p>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  {msg.senderId === user.id ? (
                                    <MessageStatus status={msg.status} timestamp={msg.timestamp} />
                                  ) : (
                                    <span className="text-[10px] opacity-60">
                                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  )}
                                  {/* WhatsApp-style dropdown chevron */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setContextMenu({
                                        show: true,
                                        x: e.clientX,
                                        y: e.clientY,
                                        messageId: msg.id,
                                        showReactions: true
                                      });
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1 hover:bg-black/10 rounded"
                                  >
                                    <ChevronDown className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ) : msg.payload.includes('.pdf') ? (
                              <div className={`p-3 rounded-2xl relative ${msg.senderId === user.id
                                ? 'bg-chat-orange text-white rounded-br-sm'
                                : 'bg-[#3a3a3a] text-white rounded-bl-sm border border-white/10'
                                }`}>
                                {/* Show sender name in group chats */}
                                {selectedConversation?.isGroup && msg.senderId !== user?.id && (
                                  <div className="text-xs text-gray-300 mb-2 font-medium">
                                    {selectedConversation.groupMembers?.find(member => member.id === msg.senderId)?.username || 'Unknown User'}
                                  </div>
                                )}
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <Paperclip className="w-5 h-5 text-gray-600" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">CryptoCoin-Release.pdf</p>
                                    <p className="text-xs opacity-60">12 mb</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  {msg.senderId === user.id ? (
                                    <MessageStatus status={msg.status} timestamp={msg.timestamp} />
                                  ) : (
                                    <span className="text-[10px] opacity-60">
                                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  )}
                                  {/* WhatsApp-style dropdown chevron */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setContextMenu({
                                        show: true,
                                        x: e.clientX,
                                        y: e.clientY,
                                        messageId: msg.id,
                                        showReactions: true
                                      });
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1 hover:bg-black/10 rounded"
                                  >
                                    <ChevronDown className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className={`p-3 rounded-2xl relative ${msg.senderId === user.id
                                ? 'bg-chat-orange text-white rounded-br-sm'
                                : 'bg-[#3a3a3a] text-white rounded-bl-sm border border-white/10'
                                }`}>
                                {/* Show sender name in group chats */}
                                {selectedConversation?.isGroup && msg.senderId !== user?.id && (
                                  <div className="text-xs text-gray-300 mb-2 font-medium">
                                    {selectedConversation.groupMembers?.find(member => member.id === msg.senderId)?.username || 'Unknown User'}
                                  </div>
                                )}
                                {editingMessage === msg.id ? (
                                  <div className="space-y-2">
                                    <textarea
                                      value={editText}
                                      onChange={(e) => setEditText(e.target.value)}
                                      className="w-full bg-transparent border border-white/20 rounded p-2 text-sm text-white resize-none"
                                      rows={2}
                                      autoFocus
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => saveEditedMessage(msg.id!)}
                                        className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-all"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={cancelEdit}
                                        className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-all"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="leading-relaxed text-xs md:text-sm">{msg.payload}</p>
                                )}
                                <div className="flex items-center justify-between mt-1">
                                  {msg.senderId === user.id ? (
                                    <MessageStatus status={msg.status} timestamp={msg.timestamp} />
                                  ) : (
                                    <span className="text-[10px] opacity-60">
                                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  )}
                                  {/* WhatsApp-style dropdown chevron */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setContextMenu({
                                        show: true,
                                        x: e.clientX,
                                        y: e.clientY,
                                        messageId: msg.id,
                                        showReactions: true
                                      });
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1 hover:bg-black/10 rounded"
                                  >
                                    <ChevronDown className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 relative z-10">
                      <div className="text-center">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">No messages yet. Start the conversation!</p>
                      </div>
                    </div>
                  )}

                {/* Typing Indicator */}
                <TypingIndicator />

                <div ref={messagesEndRef} />
              </div >

              {/* Input Area - Responsive */}
              < div className="p-2 md:p-4 bg-[#121212] border-t border-white/10 relative z-10" >
                {/* Upload Progress */}
                {
                  uploading && (
                    <div className="absolute bottom-20 left-4 right-4 bg-[#1e1e1e] border border-white/10 rounded-xl p-4 z-20">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-chat-orange"></div>
                        <span className="text-white text-sm">Uploading image...</span>
                      </div>
                    </div>
                  )
                }

                {/* File Upload Options */}
                <AnimatePresence>
                  {showFileUpload && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-20 left-4 bg-white border border-gray-200 rounded-xl shadow-lg p-3 z-20"
                    >
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-all"
                        >
                          <File className="w-6 h-6 text-blue-500" />
                          <span className="text-xs text-gray-600">Document</span>
                        </button>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-all"
                        >
                          <Image className="w-6 h-6 text-green-500" />
                          <span className="text-xs text-gray-600">Photo</span>
                        </button>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-all"
                        >
                          <Camera className="w-6 h-6 text-purple-500" />
                          <span className="text-xs text-gray-600">Camera</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Emoji Picker */}
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-20 right-4 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-20"
                    >
                      <div className="grid grid-cols-6 gap-2 max-w-xs">
                        {emojis.map((emoji, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setInputText(prev => prev + emoji);
                              setShowEmojiPicker(false);
                            }}
                            className="text-2xl hover:bg-gray-100 rounded-lg p-2 transition-all"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!inputText.trim() || !selectedConversation || !user || sending) return;

                  setSending(true);
                  const messageContent = inputText.trim();
                  setInputText(''); // Clear input immediately for better UX

                  // Optimistic UI update - add message immediately
                  const optimisticMessage: ChatMessage = {
                    id: Date.now(), // Temporary ID
                    conversationId: selectedConversation.conversationId,
                    senderId: user.id,
                    payload: messageContent,
                    type: 'TEXT',
                    timestamp: new Date().toISOString(),
                    status: 'sent'
                  };

                  setMessages(prev => [...prev, optimisticMessage]);
                  setConversations(prev => prev.map(conv =>
                    conv.conversationId === selectedConversation.conversationId
                      ? { ...conv, lastMessage: messageContent, lastMessageTime: new Date().toISOString(), lastSenderId: user.id }
                      : conv
                  ));

                  try {
                    const messageRequest = {
                      receiverId: selectedConversation.isGroup
                        ? selectedConversation.conversationId
                        : (selectedConversation.userId || selectedConversation.conversationId),
                      content: messageContent
                    };

                    const response = await UserService.sendMessage(messageRequest);

                    // Replace optimistic message with real message from server
                    setMessages(prev => prev.map(msg =>
                      msg.id === optimisticMessage.id ? response.data : msg
                    ));
                  } catch (err) {
                    console.error('Failed to send message:', err);

                    // Remove optimistic message on error
                    setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
                    setInputText(messageContent); // Restore input on error
                    alert('Failed to send message. Please try again.');
                  } finally {
                    setSending(false);
                  }
                }} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowFileUpload(!showFileUpload)}
                    className="p-2 md:p-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white"
                  >
                    <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <input
                    type="text"
                    placeholder="Write a message..."
                    className="flex-1 bg-white/5 border-0 focus:bg-white/10 focus:ring-2 focus:ring-chat-orange/20 rounded-xl py-2 md:py-3 px-3 md:px-4 outline-none transition-all text-xs md:text-sm placeholder:text-gray-500 text-white"
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      handleTyping();
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 md:p-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white"
                  >
                    <Smile className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <button
                    type="submit"
                    disabled={!inputText.trim() || sending}
                    className="p-2 md:p-2.5 bg-chat-orange hover:bg-chat-orange/90 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-all"
                  >
                    {sending ? (
                      <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Send className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    )}
                  </button>
                </form>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                />
              </div >
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-[#2a2a2a] relative z-10">
              {/* Coffee Watermark for empty state */}
              <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
                <div className="w-[600px] h-[600px] opacity-[0.02]">
                  <Lottie animationData={coffeeAnimation} loop={true} />
                </div>
              </div>
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 relative z-10">
                <MessageSquare className="w-9 h-9 opacity-30 text-gray-400" />
              </div>
              <p className="text-base font-medium text-gray-400 relative z-10">Select a conversation to start chatting</p>
              <p className="text-sm text-gray-500 mt-1 relative z-10">Choose from your conversations on the left</p>
            </div>
          )}
      </div >
      {/* Profile Sidebar - Light theme matching template - Hidden on mobile */}
      <AnimatePresence>
        {
          showProfile && selectedConversation && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="hidden md:block w-80 bg-white border-l border-gray-200 relative z-20"
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Profile</h3>
                <button
                  onClick={() => setShowProfile(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-all text-gray-600 hover:text-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 text-center">
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-gray-100">
                  <img
                    src={selectedConversation.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${selectedConversation.username}`}
                    alt={selectedConversation.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-xl font-bold mb-1 text-gray-800">{selectedConversation.username}</h2>
                <p className="text-sm text-gray-500 mb-6">Last seen recently</p>

                <div className="space-y-6 text-left">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">Bio</label>
                    <p className="text-sm mt-1 text-gray-700">{selectedConversation.bio || 'Life is mirror, smile at it 😊'}</p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">Mobile</label>
                    <p className="text-sm mt-1 text-gray-700">{selectedConversation.phone || '6482662535'}</p>
                  </div>

                  {/* Mute Chat Toggle */}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-700 font-medium">Mute Chat</span>
                    <div className="w-10 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform shadow-sm border border-gray-300"></div>
                    </div>
                  </div>

                  {/* Disappearing Messages Toggle */}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-700 font-medium">Disappearing Messages</span>
                    <div className="w-10 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform shadow-sm border border-gray-300"></div>
                    </div>
                  </div>

                  {/* Groups in Common */}
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider mb-3 block font-medium">Groups in Common</label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">🔥</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">Girl on Fire</p>
                          <p className="text-xs text-gray-500">You: I'm on the way!</p>
                        </div>
                        <span className="text-xs text-gray-500">Friday</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">👑</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">Queen Bees</p>
                          <p className="text-xs text-gray-500">Christina: Who made this decision? This...</p>
                        </div>
                        <span className="text-xs text-gray-500">3 May 2021</span>
                      </div>
                    </div>
                  </div>

                  {/* Media and Links */}
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider mb-3 block font-medium">Media and Links</label>

                    {/* Tabs */}
                    <div className="flex gap-4 mb-4 border-b border-gray-200">
                      <button className="text-sm pb-2 border-b-2 border-chat-orange text-chat-orange font-medium">Images</button>
                      <button className="text-sm pb-2 text-gray-500 hover:text-gray-700">Videos</button>
                      <button className="text-sm pb-2 text-gray-500 hover:text-gray-700">Audio</button>
                      <button className="text-sm pb-2 text-gray-500 hover:text-gray-700">Files</button>
                    </div>

                    {/* Media Grid */}
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="aspect-square bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 cursor-pointer">
                          <span className="text-xs opacity-50">📷</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        }
      </AnimatePresence >

      {/* New Chat Modal */}
      <AnimatePresence>
        {
          showNewChat && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setShowNewChat(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 w-full max-w-4xl mx-4 shadow-xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg md:text-xl font-bold text-gray-800">New Chat</h2>
                  <button
                    onClick={() => setShowNewChat(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-all text-gray-600 hover:text-gray-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 min-h-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 h-full overflow-y-auto modal-scrollbar pr-2">
                    {availableUsers.length > 0 ? (
                      availableUsers.map((availableUser) => (
                        <motion.div
                          key={availableUser.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={async () => {
                            if (!user) return;

                            const existingConv = conversations.find(conv => conv.userId === availableUser.id);
                            if (existingConv) {
                              setSelectedConversation(existingConv);
                              setShowNewChat(false);
                              return;
                            }

                            try {
                              const messageRequest = {
                                receiverId: availableUser.id,
                                content: "👋 Hello!"
                              };

                              const response = await UserService.sendMessage(messageRequest);
                              const newConversation: ConversationResponse = {
                                conversationId: response.data.conversationId,
                                userId: availableUser.id,
                                username: availableUser.username,
                                email: availableUser.email,
                                bio: availableUser.bio,
                                phone: availableUser.phone,
                                avatarUrl: availableUser.avatarUrl,
                                isOnline: availableUser.isOnline,
                                lastSeen: availableUser.lastSeen,
                                lastMessage: "👋 Hello!",
                                lastMessageTime: new Date().toISOString(),
                                lastSenderId: user.id
                              };

                              setConversations(prev => [newConversation, ...prev]);
                              setSelectedConversation(newConversation);
                              setMessages([response.data]);
                              setShowNewChat(false);
                            } catch (err) {
                              console.error('Failed to start conversation:', err);
                            }
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-all"
                        >
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-100">
                              <img
                                src={availableUser.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${availableUser.username}`}
                                alt={availableUser.username}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {availableUser.isOnline && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-gray-800">{availableUser.username}</h3>
                            <p className="text-xs text-gray-500 truncate">{availableUser.email}</p>
                            {availableUser.bio && (
                              <p className="text-xs text-gray-600 truncate mt-1">{availableUser.bio}</p>
                            )}
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-8 text-gray-500">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No users available</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )
        }
      </AnimatePresence >

      {/* WhatsApp-style Message Context Menu */}
      <AnimatePresence>
        {
          contextMenu.show && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-3 z-50 min-w-[280px]"
              style={{
                left: Math.min(contextMenu.x, window.innerWidth - 300),
                top: Math.max(contextMenu.y - 100, 20)
              }}
            >
              {/* Reactions Row */}
              {contextMenu.showReactions && (
                <div className="flex items-center justify-between mb-4 bg-gray-800 rounded-full p-2">
                  {reactions.map((reaction) => (
                    <button
                      key={reaction.name}
                      onClick={() => handleReaction(contextMenu.messageId!, reaction.emoji)}
                      className="text-2xl hover:scale-110 transition-transform p-2 rounded-full hover:bg-gray-700"
                      title={reaction.name}
                    >
                      {reaction.emoji}
                    </button>
                  ))}
                  <button
                    className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700"
                    title="More reactions"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Menu Options */}
              <div className="space-y-1">
                <button
                  onClick={() => {
                    console.log('Message info for:', contextMenu.messageId);
                    setContextMenu({ show: false, x: 0, y: 0, showReactions: false });
                  }}
                  className="w-full flex items-center gap-3 p-3 text-white hover:bg-gray-800 rounded-lg transition-all text-left"
                >
                  <Info className="w-5 h-5 text-gray-400" />
                  <span>Message info</span>
                </button>

                <button
                  onClick={() => {
                    console.log('Reply to:', contextMenu.messageId);
                    setContextMenu({ show: false, x: 0, y: 0, showReactions: false });
                  }}
                  className="w-full flex items-center gap-3 p-3 text-white hover:bg-gray-800 rounded-lg transition-all text-left"
                >
                  <Reply className="w-5 h-5 text-gray-400" />
                  <span>Reply</span>
                </button>

                <button
                  onClick={() => {
                    const message = messages.find(m => m.id === contextMenu.messageId);
                    if (message) {
                      navigator.clipboard.writeText(message.payload);
                    }
                    setContextMenu({ show: false, x: 0, y: 0, showReactions: false });
                  }}
                  className="w-full flex items-center gap-3 p-3 text-white hover:bg-gray-800 rounded-lg transition-all text-left"
                >
                  <Copy className="w-5 h-5 text-gray-400" />
                  <span>Copy</span>
                </button>

                <button
                  onClick={() => {
                    const message = messages.find(m => m.id === contextMenu.messageId);
                    if (message) {
                      handleForwardMessage(message);
                    }
                  }}
                  className="w-full flex items-center gap-3 p-3 text-white hover:bg-gray-800 rounded-lg transition-all text-left"
                >
                  <Forward className="w-5 h-5 text-gray-400" />
                  <span>Forward</span>
                </button>

                <button
                  onClick={() => {
                    console.log('Pin:', contextMenu.messageId);
                    setContextMenu({ show: false, x: 0, y: 0, showReactions: false });
                  }}
                  className="w-full flex items-center gap-3 p-3 text-white hover:bg-gray-800 rounded-lg transition-all text-left"
                >
                  <Pin className="w-5 h-5 text-gray-400" />
                  <span>Pin</span>
                </button>

                <button
                  onClick={() => {
                    console.log('Star:', contextMenu.messageId);
                    setContextMenu({ show: false, x: 0, y: 0, showReactions: false });
                  }}
                  className="w-full flex items-center gap-3 p-3 text-white hover:bg-gray-800 rounded-lg transition-all text-left"
                >
                  <Star className="w-5 h-5 text-gray-400" />
                  <span>Star</span>
                </button>

                <button
                  onClick={() => {
                    const message = messages.find(m => m.id === contextMenu.messageId);
                    if (message && message.senderId === user?.id) {
                      handleEditMessage(message.id!, message.payload);
                    }
                  }}
                  className="w-full flex items-center gap-3 p-3 text-white hover:bg-gray-800 rounded-lg transition-all text-left"
                >
                  <Edit className="w-5 h-5 text-gray-400" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => {
                    if (contextMenu.messageId) {
                      handleSelectMessage(contextMenu.messageId);
                    }
                  }}
                  className="w-full flex items-center gap-3 p-3 text-white hover:bg-gray-800 rounded-lg transition-all text-left"
                >
                  <CheckSquare className="w-5 h-5 text-gray-400" />
                  <span>Select</span>
                </button>

                <div className="border-t border-gray-700 my-2"></div>

                <button
                  onClick={() => {
                    if (contextMenu.messageId) {
                      handleDeleteMessage(contextMenu.messageId);
                    }
                  }}
                  className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-900/20 rounded-lg transition-all text-left"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          )
        }
      </AnimatePresence >

      {/* User Settings Modal */}
      <AnimatePresence>
        {
          showUserSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setShowUserSettings(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Settings</h2>
                  <button
                    onClick={() => setShowUserSettings(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-all text-gray-600 hover:text-gray-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* User Profile Section */}
                {user && (
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-4 border-gray-100">
                      <img
                        src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${user.username}`}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {editingProfile ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={profileData.username}
                          onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                          className="w-full text-center text-lg font-bold text-gray-800 bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 focus:bg-white focus:ring-2 focus:ring-chat-orange/20 focus:border-chat-orange outline-none"
                          placeholder="Username"
                        />
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full text-center text-sm text-gray-800 bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 focus:bg-white focus:ring-2 focus:ring-chat-orange/20 focus:border-chat-orange outline-none"
                          placeholder="Email"
                        />
                        <textarea
                          value={profileData.bio}
                          onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                          className="w-full text-center text-sm text-gray-800 bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 resize-none focus:bg-white focus:ring-2 focus:ring-chat-orange/20 focus:border-chat-orange outline-none"
                          placeholder="Bio"
                          rows={2}
                        />
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full text-center text-sm text-gray-800 bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 focus:bg-white focus:ring-2 focus:ring-chat-orange/20 focus:border-chat-orange outline-none"
                          placeholder="Phone"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              // TODO: Implement profile update API
                              console.log('Update profile:', profileData);
                              setEditingProfile(false);
                            }}
                            className="flex-1 bg-chat-orange text-white px-4 py-2 rounded-lg hover:bg-chat-orange/90 transition-all"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingProfile(false);
                              // Reset to original data
                              if (user) {
                                setProfileData({
                                  username: user.username || '',
                                  email: user.email || '',
                                  bio: user.bio || '',
                                  phone: user.phone || ''
                                });
                              }
                            }}
                            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-bold text-gray-800">{user.username}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-sm text-gray-600 mt-1">{user.bio || 'No bio set'}</p>
                      </>
                    )}
                  </div>
                )}

                {/* Settings Options */}
                <div className="space-y-2">
                  <button
                    onClick={() => setEditingProfile(!editingProfile)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-all text-left"
                  >
                    <Edit className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">{editingProfile ? 'Cancel Edit' : 'Edit Profile'}</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-all text-left">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">Notifications</span>
                    <div className="ml-auto">
                      <div className="w-10 h-6 bg-chat-orange rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-transform shadow-sm"></div>
                      </div>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-all text-left">
                    <Lock className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">Privacy & Security</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-all text-left">
                    <Palette className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">Appearance</span>
                    <span className="ml-auto text-xs text-gray-500">Dark</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-all text-left">
                    <HelpCircle className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">Help & Support</span>
                  </button>
                </div>

                <div className="border-t border-gray-200 mt-6 pt-4">
                  <button
                    onClick={() => {
                      if (context) {
                        context.logout();
                        navigate('/login');
                      }
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg transition-all text-left text-red-600"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )
        }
      </AnimatePresence >

      {/* Group Chat Creation Modal */}
      <AnimatePresence>
        {
          showGroupChat && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setShowGroupChat(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Create Group Chat</h2>
                  <button
                    onClick={() => setShowGroupChat(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-all text-gray-600 hover:text-gray-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Group Info */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Enter group name..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-chat-orange/20 focus:border-chat-orange outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                    <textarea
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      placeholder="Enter group description..."
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-chat-orange/20 focus:border-chat-orange outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Selected Members */}
                {selectedGroupMembers.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selected Members ({selectedGroupMembers.length})
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedGroupMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-2 bg-chat-orange/10 rounded-full px-3 py-1">
                          <img
                            src={member.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${member.username}`}
                            alt={member.username}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm text-gray-700">{member.username}</span>
                          <button
                            onClick={() => setSelectedGroupMembers(prev => prev.filter(m => m.id !== member.id))}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Users */}
                <div className="flex-1 min-h-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Add Members</label>
                  <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                    {availableUsers.map((availableUser) => (
                      <div
                        key={availableUser.id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => {
                          if (!selectedGroupMembers.find(m => m.id === availableUser.id)) {
                            setSelectedGroupMembers(prev => [...prev, availableUser]);
                          }
                        }}
                      >
                        <img
                          src={availableUser.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${availableUser.username}`}
                          alt={availableUser.username}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">{availableUser.username}</h3>
                          <p className="text-sm text-gray-500">{availableUser.email}</p>
                        </div>
                        {selectedGroupMembers.find(m => m.id === availableUser.id) && (
                          <Check className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Create Button */}
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setShowGroupChat(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateGroup}
                    disabled={!groupName.trim() || selectedGroupMembers.length === 0}
                    className="flex-1 px-4 py-2 bg-chat-orange text-white rounded-lg hover:bg-chat-orange/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                  >
                    Create Group
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )
        }
      </AnimatePresence >

      {/* User Profile Modal */}
      <AnimatePresence>
        {
          showUserProfile && selectedUserProfile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setShowUserProfile(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl max-h-[90vh] overflow-y-auto modal-scrollbar"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Profile</h2>
                  <button
                    onClick={() => setShowUserProfile(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-all text-gray-600 hover:text-gray-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Profile Header */}
                <div className="text-center mb-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-gray-100">
                    <img
                      src={selectedUserProfile.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${selectedUserProfile.username}`}
                      alt={selectedUserProfile.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedUserProfile.username}</h3>
                  <p className="text-sm text-gray-500">{selectedUserProfile.email}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className={`w-2 h-2 rounded-full ${selectedUserProfile.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-xs text-gray-500">
                      {selectedUserProfile.isOnline ? 'Online' : `Last seen ${selectedUserProfile.lastSeen ? new Date(selectedUserProfile.lastSeen).toLocaleDateString() : 'recently'}`}
                    </span>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="space-y-6">
                  {selectedUserProfile.bio && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">About</label>
                      <p className="text-sm mt-1 text-gray-700">{selectedUserProfile.bio}</p>
                    </div>
                  )}

                  {selectedUserProfile.phone && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">Phone</label>
                      <p className="text-sm mt-1 text-gray-700">{selectedUserProfile.phone}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider font-medium">Joined</label>
                    <p className="text-sm mt-1 text-gray-700">
                      {selectedUserProfile.joinedDate ? new Date(selectedUserProfile.joinedDate).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <button className="flex items-center justify-center gap-2 p-3 bg-chat-orange/10 text-chat-orange rounded-lg hover:bg-chat-orange/20 transition-all">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm font-medium">Message</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 p-3 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-all">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm font-medium">Call</span>
                    </button>
                  </div>

                  {/* Mutual Groups */}
                  {selectedUserProfile.mutualGroups && selectedUserProfile.mutualGroups.length > 0 && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider mb-3 block font-medium">
                        Groups in Common ({selectedUserProfile.mutualGroups.length})
                      </label>
                      <div className="space-y-2">
                        {selectedUserProfile.mutualGroups.map((group) => (
                          <div key={group.conversationId} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                            <GroupAvatar members={group.groupMembers} size="sm" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">{group.groupName}</p>
                              <p className="text-xs text-gray-500">{group.groupMembers?.length} members</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Shared Media */}
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider mb-3 block font-medium">Media and Links</label>
                    <div className="flex gap-4 mb-4 border-b border-gray-200">
                      <button className="text-sm pb-2 border-b-2 border-chat-orange text-chat-orange font-medium">Images</button>
                      <button className="text-sm pb-2 text-gray-500 hover:text-gray-700">Videos</button>
                      <button className="text-sm pb-2 text-gray-500 hover:text-gray-700">Files</button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="aspect-square bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 cursor-pointer">
                          <span className="text-xs opacity-50">📷</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )
        }
      </AnimatePresence>
    </div>
  );
};

export default Chat;