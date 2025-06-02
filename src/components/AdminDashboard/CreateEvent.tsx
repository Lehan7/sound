import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Music, DollarSign, Image as ImageIcon, Plus, Minus, Info } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import toast from 'react-hot-toast';

interface MusicianType {
  type: 'singer' | 'instrumentalist' | 'producer' | 'composer' | 'other';
  count: number;
  instruments: string[];
  description: string;
}

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  capacity: number;
  category: string;
  price: number;
  image: File | null;
  tags: string[];
  schedule: Array<{
    time: string;
    activity: string;
    description: string;
  }>;
  requirements: string[];
  requiredMusicianTypes: MusicianType[];
}

const CreateEvent: React.FC = () => {
  const { user } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    time: '',
    endTime: '',
    location: '',
    capacity: 1,
    category: 'concert',
    price: 0,
    image: null,
    tags: [],
    schedule: [{ time: '', activity: '', description: '' }],
    requirements: [''],
    requiredMusicianTypes: []
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim());
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const addScheduleItem = () => {
    setFormData(prev => ({
      ...prev,
      schedule: [...prev.schedule, { time: '', activity: '', description: '' }]
    }));
  };

  const removeScheduleItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index)
    }));
  };

  const handleScheduleChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const handleRequirementChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => 
        i === index ? value : req
      )
    }));
  };

  const addMusicianType = () => {
    setFormData(prev => ({
      ...prev,
      requiredMusicianTypes: [
        ...prev.requiredMusicianTypes,
        {
          type: 'instrumentalist',
          count: 1,
          instruments: [],
          description: ''
        }
      ]
    }));
  };

  const removeMusicianType = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requiredMusicianTypes: prev.requiredMusicianTypes.filter((_, i) => i !== index)
    }));
  };

  const handleMusicianTypeChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      requiredMusicianTypes: prev.requiredMusicianTypes.map((type, i) => 
        i === index ? { ...type, [field]: value } : type
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'image' && value) {
          formDataToSend.append('image', value);
        } else if (typeof value === 'object') {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value.toString());
        }
      });

      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'X-Admin-Token': import.meta.env.VITE_ADMIN_SECRET || ''
        },
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      toast.success('Event created successfully!');
      // Reset form or redirect
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Create New Event</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="glass rounded-xl p-6 space-y-6">
          <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Event Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:border-gray-500"
                    required
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Start Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:border-gray-500"
                    required
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  End Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:border-gray-500"
                    required
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Capacity
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full pl-10 pr-4 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Price
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="concert">Concert</option>
                <option value="workshop">Workshop</option>
                <option value="competition">Competition</option>
                <option value="exhibition">Exhibition</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags.join(', ')}
                onChange={handleTagsChange}
                placeholder="e.g. jazz, live music, collaboration"
                className="w-full px-4 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Event Image
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="event-image"
                    required
                  />
                  <label
                    htmlFor="event-image"
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    <ImageIcon className="h-5 w-5 mr-2" />
                    Choose Image
                  </label>
                </div>
                {previewImage && (
                  <div className="h-20 w-20 rounded-lg overflow-hidden">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="glass rounded-xl p-6 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Event Schedule</h2>
            <button
              type="button"
              onClick={addScheduleItem}
              className="flex items-center px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {formData.schedule.map((item, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <input
                    type="time"
                    value={item.time}
                    onChange={(e) => handleScheduleChange(index, 'time', e.target.value)}
                    className="px-4 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <input
                    type="text"
                    value={item.activity}
                    onChange={(e) => handleScheduleChange(index, 'activity', e.target.value)}
                    placeholder="Activity"
                    className="px-4 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleScheduleChange(index, 'description', e.target.value)}
                    placeholder="Description"
                    className="px-4 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeScheduleItem(index)}
                    className="p-2 text-red-400 hover:text-red-300"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="glass rounded-xl p-6 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Requirements</h2>
            <button
              type="button"
              onClick={addRequirement}
              className="flex items-center px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Requirement
            </button>
          </div>

          <div className="space-y-4">
            {formData.requirements.map((req, index) => (
              <div key={index} className="flex items-center space-x-4">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => handleRequirementChange(index, e.target.value)}
                  placeholder="Enter requirement"
                  className="flex-1 px-4 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    className="p-2 text-red-400 hover:text-red-300"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Required Musicians */}
        <div className="glass rounded-xl p-6 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Required Musicians</h2>
            <button
              type="button"
              onClick={addMusicianType}
              className="flex items-center px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Musician Type
            </button>
          </div>

          <div className="space-y-6">
            {formData.requiredMusicianTypes.map((type, index) => (
              <div key={index} className="p-4 bg-[#1a1a2e] rounded-lg space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Musician Type
                      </label>
                      <select
                        value={type.type}
                        onChange={(e) => handleMusicianTypeChange(index, 'type', e.target.value)}
                        className="w-full px-4 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="singer">Singer</option>
                        <option value="instrumentalist">Instrumentalist</option>
                        <option value="producer">Producer</option>
                        <option value="composer">Composer</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Number Required
                      </label>
                      <input
                        type="number"
                        value={type.count}
                        onChange={(e) => handleMusicianTypeChange(index, 'count', parseInt(e.target.value))}
                        min="1"
                        className="w-full px-4 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => removeMusicianType(index)}
                    className="p-2 text-red-400 hover:text-red-300"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                </div>

                {type.type === 'instrumentalist' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Instruments (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={type.instruments.join(', ')}
                      onChange={(e) => handleMusicianTypeChange(index, 'instruments', e.target.value.split(',').map(i => i.trim()))}
                      placeholder="e.g. guitar, piano, drums"
                      className="w-full px-4 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description/Requirements
                  </label>
                  <textarea
                    value={type.description}
                    onChange={(e) => handleMusicianTypeChange(index, 'description', e.target.value)}
                    placeholder="Describe the requirements for this position"
                    rows={2}
                    className="w-full px-4 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    required
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {/* TODO: Implement preview */}}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Preview
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 bg-indigo-600 text-white rounded-lg transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
            }`}
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
