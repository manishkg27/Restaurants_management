import React, { useState, useEffect } from "react";
import "./ProfilePage.css";
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
    <div className="profile-page">
      <div className="profile-page__container">
        {/* Header */}
        <div className="profile-page__header">
          <div className="profile-page__avatar">
            <UserCheck size={22} />
          </div>
          <div>
            <h2 className="profile-page__title">
              User Profile
            </h2>
            <p className="profile-page__subtitle">
              Username: <strong>{user.username}</strong> ({user.role})
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-page__form">
          <div className="profile-page__form-group">
            <label className="profile-page__label" htmlFor="fullName">
              Full Name
            </label>
            <div className="profile-page__input-wrapper">
              <User size={16} className="profile-page__input-icon" />
              <input
                id="fullName"
                type="text"
                className="profile-page__input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                required
              />
            </div>
          </div>

          <div className="profile-page__form-group">
            <label className="profile-page__label" htmlFor="phone">
              Phone Number
            </label>
            <div className="profile-page__input-wrapper">
              <Phone size={16} className="profile-page__input-icon" />
              <input
                id="phone"
                type="tel"
                className="profile-page__input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                required
              />
            </div>
          </div>

          <div className="profile-page__form-group">
            <label className="profile-page__label" htmlFor="address">
              Primary Delivery Address
            </label>
            <div className="profile-page__input-wrapper">
              <MapPin size={16} className="profile-page__input-icon profile-page__input-icon--textarea" />
              <textarea
                id="address"
                className="profile-page__textarea"
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
            className="profile-page__button"
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
