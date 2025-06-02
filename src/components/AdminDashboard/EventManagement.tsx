import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, MapPin, Users,
  Music, DollarSign, Edit, Trash2,
  Search, Filter, Download, Plus
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import { useNavigate } from 'react-router-dom';

type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  capacity: number;
  ticketPrice: number;
  genre: string;
  status: EventStatus;
  registrations: number;
  organizer: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

const EventManagement: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | EventStatus>('all');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const { user } = useAdmin();

  useEffect(() => {
    fetchEvents();
  }, []);

  const getHeaders = (): HeadersInit => ({
    'Authorization': `Bearer ${user?.token}`,
    'X-Admin-Token': import.meta.env.VITE_ADMIN_SECRET || '',
    'Content-Type': 'application/json'
  });

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/events', {
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const response = await fetch(`/api/admin/events/${eventId}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete event');
        await fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const handleExportEvents = async () => {
    try {
      const response = await fetch('/api/admin/events/export', {
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Failed to export events');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'events.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting events:', error);
    }
  };

  const handleEditEvent = (eventId: string) => {
    navigate(`/admin/events/edit/${eventId}`);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || event.status === selectedStatus;
    const matchesGenre = selectedGenre === 'all' || event.genre === selectedGenre;
    return matchesSearch && matchesStatus && matchesGenre;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Event Management</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleExportEvents}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Events
          </button>
          <button
            onClick={() => navigate('/admin/events/create')}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1a1a2e] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as 'all' | EventStatus)}
          className="px-4 py-2 bg-[#1a1a2e] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="px-4 py-2 bg-[#1a1a2e] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Genres</option>
          <option value="classical">Classical</option>
          <option value="jazz">Jazz</option>
          <option value="rock">Rock</option>
          <option value="pop">Pop</option>
          <option value="electronic">Electronic</option>
          <option value="folk">Folk</option>
        </select>
      </div>

      {/* Events Table */}
      <div className="bg-[#1a1a2e] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#2a2a3e] text-gray-400">
              <th className="px-6 py-3 text-left">Event</th>
              <th className="px-6 py-3 text-left">Date & Time</th>
              <th className="px-6 py-3 text-left">Venue</th>
              <th className="px-6 py-3 text-left">Capacity</th>
              <th className="px-6 py-3 text-left">Price</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredEvents.map((event) => (
              <tr key={event._id} className="text-white hover:bg-[#2a2a3e]">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-lg bg-indigo-900/50 flex items-center justify-center">
                      <Music className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div className="ml-4">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-gray-400">{event.genre}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                    <Clock className="h-4 w-4 text-gray-400 ml-2" />
                    <span>{event.time}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{event.venue}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>{event.registrations}/{event.capacity}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span>${event.ticketPrice}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    event.status === 'upcoming' ? 'bg-blue-900 text-blue-200' :
                    event.status === 'ongoing' ? 'bg-green-900 text-green-200' :
                    event.status === 'completed' ? 'bg-gray-700 text-gray-200' :
                    'bg-red-900 text-red-200'
                  }`}>
                    {event.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleEditEvent(event._id)}
                      className="p-1 text-blue-400 hover:text-blue-300"
                      title="Edit Event"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event._id)}
                      className="p-1 text-red-400 hover:text-red-300"
                      title="Delete Event"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventManagement; 