import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Music, 
  Globe, 
  BarChart,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Info
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalMusicians: 0,
    verifiedMusicians: 0,
    pendingVerifications: 0,
    recentRegistrations: [] as any[],
    countriesRepresented: 0,
    instrumentBreakdown: [] as { name: string; count: number }[],
  });
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Total musicians
        const totalSnapshot = await getCountFromServer(collection(db, 'users'));
        const totalMusicians = totalSnapshot.data().count;
        
        // Verified musicians
        const verifiedSnapshot = await getCountFromServer(
          query(collection(db, 'users'), where('isVerified', '==', true))
        );
        const verifiedMusicians = verifiedSnapshot.data().count;
        
        // Pending verifications
        const pendingSnapshot = await getCountFromServer(
          query(collection(db, 'users'), where('verificationStatus', '==', 'pending'))
        );
        const pendingVerifications = pendingSnapshot.data().count;
        
        // Recent registrations
        const recentQuery = query(
          collection(db, 'users'), 
          where('createdAt', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        );
        const recentDocs = await getDocs(recentQuery);
        const recentRegistrations = recentDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Get unique countries count
        const usersQuery = query(collection(db, 'users'));
        const userDocs = await getDocs(usersQuery);
        const countries = new Set();
        const instruments: Record<string, number> = {};
        
        userDocs.forEach(doc => {
          const data = doc.data();
          if (data.country) {
            countries.add(data.country);
          }
          
          if (data.instrumentType) {
            instruments[data.instrumentType] = (instruments[data.instrumentType] || 0) + 1;
          }
        });
        
        // Convert instruments to sorted array
        const instrumentBreakdown = Object.entries(instruments)
          .map(([name, count]) => ({ name, count: count as number }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        
        setStats({
          totalMusicians,
          verifiedMusicians,
          pendingVerifications,
          recentRegistrations,
          countriesRepresented: countries.size,
          instrumentBreakdown,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard Overview</h1>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-dark-700 rounded-lg p-6 animate-pulse h-32"></div>
          ))}
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-dark-700 rounded-lg p-6 shadow-md"
            >
              <div className="flex items-center mb-3">
                <div className="bg-primary-500/20 p-3 rounded-lg mr-3">
                  <Users className="h-6 w-6 text-primary-400" />
                </div>
                <span className="text-gray-400 text-sm">Total Musicians</span>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold">{stats.totalMusicians}</div>
                <div className="text-green-500 flex items-center text-sm">
                  <ArrowUp size={14} className="mr-1" />
                  8%
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-dark-700 rounded-lg p-6 shadow-md"
            >
              <div className="flex items-center mb-3">
                <div className="bg-green-500/20 p-3 rounded-lg mr-3">
                  <UserCheck className="h-6 w-6 text-green-400" />
                </div>
                <span className="text-gray-400 text-sm">Verified Musicians</span>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold">{stats.verifiedMusicians}</div>
                <div className="text-green-500 flex items-center text-sm">
                  <ArrowUp size={14} className="mr-1" />
                  12%
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-dark-700 rounded-lg p-6 shadow-md"
            >
              <div className="flex items-center mb-3">
                <div className="bg-yellow-500/20 p-3 rounded-lg mr-3">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <span className="text-gray-400 text-sm">Pending Verifications</span>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold">{stats.pendingVerifications}</div>
                <div className="text-yellow-500 flex items-center text-sm">
                  <ArrowRight size={14} className="mr-1" />
                  Stable
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-dark-700 rounded-lg p-6 shadow-md"
            >
              <div className="flex items-center mb-3">
                <div className="bg-blue-500/20 p-3 rounded-lg mr-3">
                  <Globe className="h-6 w-6 text-blue-400" />
                </div>
                <span className="text-gray-400 text-sm">Countries Represented</span>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold">{stats.countriesRepresented}</div>
                <div className="text-green-500 flex items-center text-sm">
                  <ArrowUp size={14} className="mr-1" />
                  3
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Charts and Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Musicians */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="bg-dark-700 rounded-lg shadow-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-dark-600 flex justify-between items-center">
                <h2 className="font-semibold">Recent Registrations</h2>
                <span className="text-xs text-gray-400">Last 7 days</span>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {stats.recentRegistrations.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-dark-800 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 tracking-wider">Country</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-600">
                      {stats.recentRegistrations.map((user: any) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-dark-600 overflow-hidden flex-shrink-0">
                                {user.profileImageURL ? (
                                  <img src={user.profileImageURL} alt="" className="h-8 w-8 object-cover" />
                                ) : (
                                  <div className="h-8 w-8 flex items-center justify-center">
                                    <Users size={14} className="text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium">{user.fullName}</div>
                                <div className="text-xs text-gray-400">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{user.country}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.isVerified 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {user.isVerified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 text-center text-gray-400">No recent registrations</div>
                )}
              </div>
            </motion.div>

            {/* Instrument Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="bg-dark-700 rounded-lg shadow-md"
            >
              <div className="px-6 py-4 border-b border-dark-600">
                <h2 className="font-semibold">Instrument Breakdown</h2>
              </div>
              
              <div className="p-6">
                {stats.instrumentBreakdown.length > 0 ? (
                  <div className="space-y-4">
                    {stats.instrumentBreakdown.map((item) => (
                      <div key={item.name} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm capitalize">{item.name}</span>
                          <span className="text-sm text-gray-400">{item.count}</span>
                        </div>
                        <div className="w-full bg-dark-600 rounded-full h-2.5">
                          <div 
                            className="bg-primary-500 h-2.5 rounded-full" 
                            style={{ width: `${(item.count / stats.totalMusicians) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400">No instrument data available</div>
                )}
              </div>
            </motion.div>
          </div>
          
          {/* Admin Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="mt-8 bg-dark-700 rounded-lg p-6 shadow-md"
          >
            <div className="flex items-center mb-4">
              <Info size={18} className="text-primary-400 mr-2" />
              <h2 className="font-semibold">Admin Quick Actions</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a 
                href="/admin/users" 
                className="bg-dark-600 hover:bg-dark-500 transition-colors p-4 rounded-lg flex items-center"
              >
                <UserCheck size={18} className="text-green-400 mr-3" />
                <span>Verify Musicians</span>
                {stats.pendingVerifications > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {stats.pendingVerifications}
                  </span>
                )}
              </a>
              
              <a 
                href="/admin/database" 
                className="bg-dark-600 hover:bg-dark-500 transition-colors p-4 rounded-lg flex items-center"
              >
                <BarChart size={18} className="text-blue-400 mr-3" />
                <span>Database Management</span>
              </a>
              
              <a 
                href="#" 
                className="bg-dark-600 hover:bg-dark-500 transition-colors p-4 rounded-lg flex items-center"
              >
                <Music size={18} className="text-purple-400 mr-3" />
                <span>Manage Projects</span>
              </a>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;