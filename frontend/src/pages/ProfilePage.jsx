import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateUserProfile } from "../api/managerAPI";
import { toast } from "react-toastify";
import LoadingSpinner from "../components/LoadingSpinner";
import { User, Phone, MapPin, Save, UserCheck } from "lucide-react";

const ProfilePage = () => {
  const { user, setUser } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && user.profile) {
      setFullName(user.profile.fullName || "");
      setPhone(user.profile.phone || "");
      setAddress(user.profile.address || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await updateUserProfile({
        profile: {
          fullName,
          phone,
          address,
        },
      });

      if (response.success && response.data) {
        setUser(response.data);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return <LoadingSpinner fullPage />;

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-lg shadow-sm p-8 mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-200">
          <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
            <UserCheck size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 m-0">
              User Profile
            </h2>
            <p className="text-xs text-gray-500 mt-1 m-0">
              Username: <strong className="text-gray-800">{user.username}</strong> ({user.role})
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-700" htmlFor="fullName">
              Full Name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="fullName"
                type="text"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm text-gray-800 outline-none focus:border-blue-500"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-700" htmlFor="phone">
              Phone Number
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="phone"
                type="tel"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm text-gray-800 outline-none focus:border-blue-500"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-700" htmlFor="address">
              Primary Delivery Address
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
              <textarea
                id="address"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm text-gray-800 outline-none focus:border-blue-500 resize-none"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Flat No, building street name, location details..."
                rows={4}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded text-sm flex items-center justify-center gap-2 cursor-pointer border-none mt-2"
            disabled={submitting}
          >
            <Save size={16} />
            {submitting ? "Saving..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
