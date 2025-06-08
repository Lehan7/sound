import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, getDocs, doc, updateDoc, where, orderBy, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Users, 
  Mail,
  Phone,
  MapPin, 
  Music, 
  CheckCircle, 
  XCircle,
  Clock,
  Calendar,
  User,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  AlertCircle,
  Shield,
  Star,
  Award,
  TrendingUp,
  BarChart2,
  Camera,
  Save,
  X,
  Loader,
  Check,
  Ban,
  UserCheck,
  UserX,
  UserCog,
  Mic,
  MessageSquare,
  Video,
  PhoneCall,
  Sparkles,
  Brain,
  Heart,
  Music2,
  Trophy,
  Lightbulb,
  Target,
  Zap,
  MessageCircle,
  Send,
  Smile,
  ThumbsUp,
  Star as StarIcon,
  Award as AwardIcon,
  Sparkles as SparklesIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface UserData {
  uid: string;
  fullName: string;
  email: string;
  contactNumber: string;
  country: string;
  instrumentType: string;
  singingType: string;
  musicCulture: string;
  bio: string;
  profileImagePath: string;
  isVerified: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'active';
  role: string;
  createdAt: any;
  lastUpdated: any;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: any;
  type: 'text' | 'system' | 'ai';
}

interface UserInsight {
  type: 'talent' | 'potential' | 'achievement' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  timestamp: any;
}

interface CommunicationSession {
  id: string;
  userId: string;
  type: 'chat' | 'call' | 'video';
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  startTime: any;
  endTime: any;
  notes: string;
}

const UsersPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserData>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [statusReason, setStatusReason] = useState('');
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userInsights, setUserInsights] = useState<UserInsight[]>([]);
  const [communicationSessions, setCommunicationSessions] = useState<CommunicationSession[]>([]);
  const [selectedSessionType, setSelectedSessionType] = useState<'chat' | 'call' | 'video'>('chat');
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const usersData = querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as UserData[];
      
      setUsers(usersData);
      } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user: UserData) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleEditClick = (user: UserData) => {
    setSelectedUser(user);
    setEditForm({
      fullName: user.fullName,
      contactNumber: user.contactNumber,
      country: user.country,
      instrumentType: user.instrumentType,
      singingType: user.singingType,
      musicCulture: user.musicCulture,
      bio: user.bio
    });
    setShowEditModal(true);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const userRef = doc(db, 'users', selectedUser.uid);
      
      const statusUpdate: Partial<UserData> = {
        verificationStatus: newStatus as UserData['verificationStatus'],
        isVerified: newStatus === 'verified',
        lastUpdated: new Date()
      };

      await updateDoc(userRef, statusUpdate);
      
      // Update local state
      setUsers(users.map(u => 
        u.uid === selectedUser.uid 
          ? { ...u, ...statusUpdate }
          : u
      ));

      toast.success(`User status updated to ${newStatus}`);
      setShowStatusModal(false);
      setShowUserModal(false);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setLoading(true);
      const userRef = doc(db, 'users', selectedUser.uid);
      
      await updateDoc(userRef, {
        ...editForm,
        lastUpdated: new Date()
      });
      
      // Update local state
      setUsers(users.map(u => 
        u.uid === selectedUser.uid 
          ? { ...u, ...editForm }
          : u
      ));

      toast.success('User details updated successfully');
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating user details:', error);
      toast.error('Failed to update user details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    const defaultStatus = 'pending';
    const currentStatus = status || defaultStatus;
    
    const statusConfig = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
      verified: { color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
      rejected: { color: 'bg-red-500/20 text-red-400', icon: XCircle },
      active: { color: 'bg-blue-500/20 text-blue-400', icon: UserCheck }
    };

    const config = statusConfig[currentStatus as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={14} className="mr-1" />
        {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
      </span>
    );
  };

  const formatDate = (date: any) => {
    if (!date) return 'Unknown';
    
    // If it's a Firestore timestamp
    if (date.toDate) {
      return date.toDate().toLocaleDateString();
    }
    
    // If it's a regular Date object
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    
    // If it's a string or number timestamp
    try {
      return new Date(date).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (user.fullName?.toLowerCase() || '').includes(searchLower) ||
      (user.email?.toLowerCase() || '').includes(searchLower) ||
      (user.country?.toLowerCase() || '').includes(searchLower);
    
    const matchesStatus = statusFilter === 'all' || user.verificationStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const messageData = {
        senderId: user?.uid,
        receiverId: selectedUser.uid,
        content: newMessage,
        timestamp: serverTimestamp(),
        type: 'text'
      };

      await addDoc(collection(db, 'messages'), messageData);
      setNewMessage('');
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const generateUserInsights = async () => {
    if (!selectedUser) return;

    setIsGeneratingInsights(true);
    try {
      // Simulate AI analysis with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newInsights: UserInsight[] = [
        {
          type: 'talent',
          title: 'Musical Versatility',
          description: 'Shows exceptional adaptability across multiple musical styles and instruments.',
          confidence: 0.92,
          timestamp: new Date()
        },
        {
          type: 'potential',
          title: 'Collaboration Potential',
          description: 'Demonstrates strong communication skills and openness to new ideas.',
          confidence: 0.88,
          timestamp: new Date()
        },
        {
          type: 'achievement',
          title: 'Performance Excellence',
          description: 'Consistently delivers high-quality performances with attention to detail.',
          confidence: 0.95,
          timestamp: new Date()
        },
        {
          type: 'recommendation',
          title: 'Growth Opportunities',
          description: 'Could benefit from exploring fusion genres and digital music production.',
          confidence: 0.85,
          timestamp: new Date()
        }
      ];

      setUserInsights(newInsights);
      toast.success('User insights generated successfully');
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate insights');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const scheduleCommunication = async (type: 'chat' | 'call' | 'video') => {
    if (!selectedUser) return;

    try {
      const sessionData = {
        userId: selectedUser.uid,
        type,
        status: 'scheduled',
        startTime: serverTimestamp(),
        notes: '',
        createdBy: user?.uid
      };

      await addDoc(collection(db, 'communicationSessions'), sessionData);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} session scheduled successfully`);
    } catch (error) {
      console.error('Error scheduling session:', error);
      toast.error('Failed to schedule session');
    }
  };

  const renderCommunicationSection = () => (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-gray-400 mb-4">Communication</h3>
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => {
            setShowUserModal(false);
            setShowCommunicationModal(true);
          }}
          className="flex flex-col items-center p-4 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
        >
          <MessageSquare size={24} className="text-primary-400 mb-2" />
          <span className="text-sm">Chat</span>
        </button>
        <button
          onClick={() => scheduleCommunication('call')}
          className="flex flex-col items-center p-4 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
        >
          <PhoneCall size={24} className="text-primary-400 mb-2" />
          <span className="text-sm">Call</span>
        </button>
        <button
          onClick={() => scheduleCommunication('video')}
          className="flex flex-col items-center p-4 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
        >
          <Video size={24} className="text-primary-400 mb-2" />
          <span className="text-sm">Video</span>
        </button>
      </div>
    </div>
  );

  const renderAIInsightsSection = () => (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-400">AI Insights</h3>
        <button
          onClick={generateUserInsights}
          className="flex items-center text-sm text-primary-400 hover:text-primary-300"
          disabled={isGeneratingInsights}
        >
          {isGeneratingInsights ? (
            <>
              <Loader size={16} className="animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={16} className="mr-2" />
              Generate Insights
            </>
          )}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {userInsights.map((insight, index) => (
          <div
            key={index}
            className="p-4 bg-dark-700 rounded-lg"
          >
            <div className="flex items-center mb-2">
              {insight.type === 'talent' && <Music2 size={16} className="text-yellow-400 mr-2" />}
              {insight.type === 'potential' && <TrendingUp size={16} className="text-green-400 mr-2" />}
              {insight.type === 'achievement' && <Trophy size={16} className="text-blue-400 mr-2" />}
              {insight.type === 'recommendation' && <Lightbulb size={16} className="text-purple-400 mr-2" />}
              <span className="text-sm font-medium">{insight.title}</span>
            </div>
            <p className="text-sm text-gray-400">{insight.description}</p>
            <div className="mt-2 flex items-center">
              <div className="flex-1 h-1 bg-dark-600 rounded-full">
                <div
                  className="h-1 bg-primary-500 rounded-full"
                  style={{ width: `${insight.confidence * 100}%` }}
                />
              </div>
              <span className="ml-2 text-xs text-gray-400">
                {Math.round(insight.confidence * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCommunicationModal = () => (
    <AnimatePresence>
      {showCommunicationModal && selectedUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowCommunicationModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-dark-800 rounded-lg w-full max-w-2xl h-[600px] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-dark-600 flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-dark-600 overflow-hidden">
                  {selectedUser.profileImagePath ? (
                    <img
                      src={selectedUser.profileImagePath}
                      alt={selectedUser.fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <User size={20} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <h3 className="font-medium">{selectedUser.fullName}</h3>
                  <p className="text-sm text-gray-400">Online</p>
                </div>
              </div>
              <button
                onClick={() => setShowCommunicationModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.senderId === user?.uid
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-700 text-gray-200'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {formatDate(message.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-dark-600">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:border-primary-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  className="p-2 bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <Send size={20} className="text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">User Management</h1>
        <p className="text-gray-400">Manage and monitor user accounts</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
              placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:border-primary-500"
          />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
            <option value="active">Active</option>
          </select>
        </div>
      </div>
      
      {/* Users Table */}
      <div className="bg-dark-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
            <tbody className="divide-y divide-dark-700">
              {filteredUsers.map((user) => (
                <tr 
                  key={user.uid}
                  className="hover:bg-dark-700/50 cursor-pointer transition-colors"
                  onClick={() => handleUserClick(user)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-dark-600 overflow-hidden flex-shrink-0">
                        {user.profileImagePath ? (
                          <img 
                            src={user.profileImagePath} 
                            alt={user.fullName} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <User size={20} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                        <div className="text-sm font-medium">{user.fullName}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-400">{user.contactNumber}</div>
                  </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-400">{user.country}</div>
                      </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.verificationStatus)}
                      </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                              <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(user);
                        }}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit size={18} />
                              </button>
                              <button
                            onClick={(e) => {
                              e.stopPropagation();
                          setSelectedUser(user);
                          setShowStatusModal(true);
                            }}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                          >
                        <UserCog size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
              ))}
              </tbody>
            </table>
        </div>
      </div>
      
      {/* User Details Modal */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowUserModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-800 rounded-lg w-full max-w-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center">
                    <div className="h-20 w-20 rounded-full bg-dark-600 overflow-hidden">
                      {selectedUser.profileImagePath ? (
                        <img 
                          src={selectedUser.profileImagePath} 
                          alt={selectedUser.fullName} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <User size={32} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <h2 className="text-xl font-bold">{selectedUser.fullName}</h2>
                      <div className="flex items-center mt-1">
                        {getStatusBadge(selectedUser.verificationStatus)}
                      </div>
                    </div>
                  </div>
              <button
                    onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-white"
              >
                    <X size={24} />
              </button>
            </div>
            
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Contact Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Mail size={16} className="text-primary-400 mr-2" />
                        {selectedUser.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone size={16} className="text-primary-400 mr-2" />
                        {selectedUser.contactNumber}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Location</h3>
                    <div className="flex items-center text-sm">
                      <MapPin size={16} className="text-primary-400 mr-2" />
                      {selectedUser.country}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Musical Background</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Music size={16} className="text-primary-400 mr-2" />
                        {selectedUser.instrumentType}
                      </div>
                      {selectedUser.singingType && (
                        <div className="flex items-center text-sm">
                          <Mic size={16} className="text-primary-400 mr-2" />
                          {selectedUser.singingType}
                    </div>
                  )}
                </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Account Details</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar size={16} className="text-primary-400 mr-2" />
                        Joined {formatDate(selectedUser.createdAt)}
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock size={16} className="text-primary-400 mr-2" />
                        Last updated {formatDate(selectedUser.lastUpdated)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Bio</h3>
                  <p className="text-sm text-gray-300">{selectedUser.bio}</p>
                </div>

                {renderCommunicationSection()}
                {renderAIInsightsSection()}

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowUserModal(false);
                      handleEditClick(selectedUser);
                    }}
                    className="btn-outline"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={() => {
                      setShowUserModal(false);
                      setShowStatusModal(true);
                    }}
                    className="btn-primary"
                  >
                    Change Status
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-800 rounded-lg w-full max-w-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <form onSubmit={handleEditSubmit} className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Edit User Details</h2>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      value={editForm.contactNumber}
                      onChange={(e) => setEditForm({ ...editForm, contactNumber: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={editForm.country}
                      onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Instrument Type
                    </label>
                    <input
                      type="text"
                      value={editForm.instrumentType}
                      onChange={(e) => setEditForm({ ...editForm, instrumentType: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:border-primary-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Singing Type
                    </label>
                    <input
                      type="text"
                      value={editForm.singingType}
                      onChange={(e) => setEditForm({ ...editForm, singingType: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:border-primary-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Music Culture
                    </label>
                    <input
                      type="text"
                      value={editForm.musicCulture}
                      onChange={(e) => setEditForm({ ...editForm, musicCulture: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader size={16} className="animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Change Modal */}
      <AnimatePresence>
        {showStatusModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowStatusModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-800 rounded-lg w-full max-w-md overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Change User Status</h2>
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      New Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:border-primary-500"
                    >
                      <option value="">Select a status</option>
                      <option value="verified">Verify User</option>
                      <option value="rejected">Reject User</option>
                      <option value="active">Activate User</option>
                      <option value="pending">Set to Pending</option>
                    </select>
              </div>
              
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Reason for Change
                    </label>
                    <textarea
                      value={statusReason}
                      onChange={(e) => setStatusReason(e.target.value)}
                      rows={3}
                      placeholder="Enter reason for status change..."
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:border-primary-500"
                    />
                  </div>
            </div>
            
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedStatus)}
                    className="btn-primary"
                    disabled={!selectedStatus || loading}
                  >
                    {loading ? (
                      <>
                        <Loader size={16} className="animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Check size={16} className="mr-2" />
                        Update Status
                      </>
                    )}
                  </button>
                </div>
            </div>
            </motion.div>
          </motion.div>
      )}
      </AnimatePresence>

      {/* Add the communication modal */}
      {renderCommunicationModal()}
    </div>
  );
};

export default UsersPage;