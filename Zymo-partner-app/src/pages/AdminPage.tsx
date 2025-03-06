import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Car, Wallet, Calendar, Phone, MapPin, BadgeInfo, CheckCircle } from 'lucide-react';

interface UserData {
  id: string;
  username: string;
  accountType: string;
  fullName: string;
  phone: string;
  cities: string[];
  carsRange: string;
  bankAccount: string;
  ifscCode: string;
  upiId?: string;
  createdAt: Date;
  updatedAt: Date;
  isApproved: boolean; // New field for approval status
}

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'partnerWebApp'));
        const userList: UserData[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          username: doc.data().username || 'No Username',
          accountType: doc.data().accountType || 'No Account Type',
          fullName: doc.data().fullName || 'No Full Name',
          phone: doc.data().phone || 'No Phone',
          cities: doc.data().cities || [],
          carsRange: doc.data().carsRange || 'No Cars Range',
          bankAccount: doc.data().bankAccount || 'No Bank Account',
          ifscCode: doc.data().ifscCode || 'No IFSC Code',
          upiId: doc.data().upiId || 'No UPI ID',
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          isApproved: doc.data().isApproved || false, // Default to false if not set
        }));
        setUsers(userList);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Function to toggle approval status
  const toggleApproval = async (userId: string, isApproved: boolean) => {
    try {
      const userRef = doc(db, 'partnerWebApp', userId);
      await updateDoc(userRef, { isApproved: !isApproved });

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, isApproved: !isApproved } : user
        )
      );
    } catch (error) {
      console.error('Error updating approval status:', error);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen bg-darkgray p-8 font-montserrat">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center text-4xl font-bold text-lime drop-shadow-lg"
      >
        <Shield className="mr-3 inline-block h-12 w-12" />
        Admin Dashboard
      </motion.h1>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-xl bg-lightgray/30 p-6 shadow-lg"
            >
              <div className="mb-4 h-6 w-3/4 rounded bg-gray-700/50"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 rounded bg-gray-700/30"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AnimatePresence>
          {users.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-2xl text-gray-400"
            >
              No users found
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {users.map((user) => (
                <motion.div
                  key={user.id}
                  variants={cardVariants}
                  className="group relative overflow-hidden rounded-2xl border border-lime/30 bg-lightgray/10 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-lime/60 hover:bg-lightgray/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="absolute inset-0 -z-10 bg-gradient-to-br from-lime/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="mb-4 flex items-center border-b border-lime/30 pb-4">
                    <User className="mr-3 h-8 w-8 text-lime" />
                    <h2 className="text-xl font-semibold text-white">
                      {user.fullName}
                      <span className="ml-2 text-sm text-lime">
                        ({user.accountType})
                      </span>
                    </h2>
                  </div>

                  <div className="space-y-3 text-gray-300">
                    <div className="flex items-center">
                      <Phone className="mr-2 h-5 w-5 text-lime" />
                      <span>{user.phone}</span>
                    </div>

                    <div className="flex items-center">
                      <MapPin className="mr-2 h-5 w-5 text-lime" />
                      <span>Cities: {user.cities.join(', ') || 'N/A'}</span>
                    </div>

                    <div className="flex items-center">
                      <Car className="mr-2 h-5 w-5 text-lime" />
                      <span>Car Range: {user.carsRange}</span>
                    </div>

                    <div className="flex items-center">
                      <Wallet className="mr-2 h-5 w-5 text-lime" />
                      <span>Bank: ****{user.bankAccount.slice(-4)}</span>
                    </div>

                    <div className="flex items-center">
                      <BadgeInfo className="mr-2 h-5 w-5 text-lime" />
                      <span>IFSC: {user.ifscCode}</span>
                    </div>

                    <div className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5 text-lime" />
                      <span>
                        Joined: {user.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-lime/20 pt-4 text-sm text-gray-400">
                    <span className="mr-2">Last Updated:</span>
                    {user.updatedAt.toLocaleDateString()}
                  </div>

                  {/* Approve Button */}
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => toggleApproval(user.id, user.isApproved)}
                      className={`flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
                        user.isApproved
                          ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                          : 'bg-lime/20 text-lime hover:bg-lime/30'
                      }`}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {user.isApproved ? 'Approved' : 'Approve'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};
  
export default AdminPage;