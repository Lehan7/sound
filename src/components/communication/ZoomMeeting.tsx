import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Phone,
  PhoneOff,
  Share,
  MoreVertical,
  Calendar,
  Clock,
  Users,
  MessageSquare,
  Settings,
  Plus,
} from 'lucide-react';

interface Meeting {
  id: string;
  title: string;
  host: {
    id: string;
    name: string;
    avatar?: string;
  };
  participants: {
    id: string;
    name: string;
    avatar?: string;
    role: 'host' | 'co-host' | 'participant';
  }[];
  startTime: Date;
  duration: number;
  status: 'scheduled' | 'ongoing' | 'ended';
  type: 'one-on-one' | 'group';
}

const ZoomMeeting: React.FC = () => {
  const { user } = useAuth();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);

  const [scheduledMeetings, setScheduledMeetings] = useState<Meeting[]>([
    {
      id: '1',
      title: 'Audio Setup Consultation',
      host: {
        id: '1',
        name: 'Support Team',
        avatar: '👨‍💼',
      },
      participants: [
        {
          id: '1',
          name: 'Support Team',
          avatar: '👨‍💼',
          role: 'host',
        },
        {
          id: user?.uid || '',
          name: user?.email || 'You',
          avatar: '👤',
          role: 'participant',
        },
      ],
      startTime: new Date(Date.now() + 3600000), // 1 hour from now
      duration: 30, // 30 minutes
      status: 'scheduled',
      type: 'one-on-one',
    },
    {
      id: '2',
      title: 'Soundalchemy Workshop',
      host: {
        id: '2',
        name: 'Technical Support',
        avatar: '👨‍💻',
      },
      participants: [
        {
          id: '2',
          name: 'Technical Support',
          avatar: '👨‍💻',
          role: 'host',
        },
        {
          id: user?.uid || '',
          name: user?.email || 'You',
          avatar: '👤',
          role: 'participant',
        },
      ],
      startTime: new Date(Date.now() + 7200000), // 2 hours from now
      duration: 60, // 1 hour
      status: 'scheduled',
      type: 'group',
    },
  ]);

  const handleStartMeeting = (meeting: Meeting) => {
    setActiveMeeting({
      ...meeting,
      status: 'ongoing',
    });
  };

  const handleEndMeeting = () => {
    if (activeMeeting) {
      setScheduledMeetings(meetings =>
        meetings.map(m =>
          m.id === activeMeeting.id
            ? { ...m, status: 'ended' }
            : m
        )
      );
      setActiveMeeting(null);
    }
  };

  return (
    <div className="h-full flex bg-dark-900">
      {/* Meetings List */}
      <div className="w-80 border-r border-dark-700 flex flex-col">
        <div className="p-4 border-b border-dark-700">
          <button className="w-full bg-primary-500 text-white rounded-lg py-2 px-4 flex items-center justify-center space-x-2 hover:bg-primary-600 transition-colors">
            <Plus size={20} />
            <span>New Meeting</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <h3 className="text-sm font-semibold text-gray-400">Upcoming Meetings</h3>
          {scheduledMeetings
            .filter(meeting => meeting.status === 'scheduled')
            .map(meeting => (
              <div
                key={meeting.id}
                className="bg-dark-800 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{meeting.title}</h4>
                  <span className="text-xs text-gray-400">
                    {meeting.type === 'one-on-one' ? '1:1' : 'Group'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Calendar size={16} />
                  <span>
                    {new Date(meeting.startTime).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Clock size={16} />
                  <span>
                    {new Date(meeting.startTime).toLocaleTimeString()} ({meeting.duration} min)
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Users size={16} />
                  <span>{meeting.participants.length} participants</span>
                </div>
                <button
                  onClick={() => handleStartMeeting(meeting)}
                  className="w-full bg-primary-500 text-white rounded-lg py-2 hover:bg-primary-600 transition-colors"
                >
                  Join Meeting
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Meeting Area */}
      <div className="flex-1 flex flex-col">
        {activeMeeting ? (
          <>
            {/* Video Grid */}
            <div className="flex-1 bg-dark-800 p-4 grid grid-cols-2 gap-4">
              {activeMeeting.participants.map(participant => (
                <div
                  key={participant.id}
                  className="bg-dark-700 rounded-lg aspect-video flex items-center justify-center relative"
                >
                  <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center">
                    {participant.avatar}
                  </div>
                  <div className="absolute bottom-4 left-4 bg-dark-900/80 px-3 py-1 rounded-full text-sm">
                    {participant.name}
                    {participant.role === 'host' && (
                      <span className="ml-2 text-xs text-primary-500">(Host)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="border-t border-dark-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-3 rounded-full ${
                      isMuted ? 'bg-red-500' : 'bg-dark-700'
                    } text-white hover:bg-opacity-80 transition-colors`}
                  >
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                  </button>
                  <button
                    onClick={() => setIsVideoOff(!isVideoOff)}
                    className={`p-3 rounded-full ${
                      isVideoOff ? 'bg-red-500' : 'bg-dark-700'
                    } text-white hover:bg-opacity-80 transition-colors`}
                  >
                    {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                  </button>
                  <button
                    onClick={() => setIsScreenSharing(!isScreenSharing)}
                    className={`p-3 rounded-full ${
                      isScreenSharing ? 'bg-primary-500' : 'bg-dark-700'
                    } text-white hover:bg-opacity-80 transition-colors`}
                  >
                    <Share size={24} />
                  </button>
                </div>

                <button
                  onClick={handleEndMeeting}
                  className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  <PhoneOff size={24} />
                </button>

                <div className="flex items-center space-x-4">
                  <button className="p-3 rounded-full bg-dark-700 text-white hover:bg-dark-600 transition-colors">
                    <MessageSquare size={24} />
                  </button>
                  <button className="p-3 rounded-full bg-dark-700 text-white hover:bg-dark-600 transition-colors">
                    <Users size={24} />
                  </button>
                  <button className="p-3 rounded-full bg-dark-700 text-white hover:bg-dark-600 transition-colors">
                    <Settings size={24} />
                  </button>
                  <button className="p-3 rounded-full bg-dark-700 text-white hover:bg-dark-600 transition-colors">
                    <MoreVertical size={24} />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select or start a meeting to begin
          </div>
        )}
      </div>
    </div>
  );
};

export default ZoomMeeting; 