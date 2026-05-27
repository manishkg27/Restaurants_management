import React, { useState, useEffect } from "react";
import "./ProfilePage.css";
import { useAuth } from "../context/AuthContext";
import { updateUserProfile } from "../api/managerAPI";
import { toast } from "react-toastify";
import LoadingSpinner from "../components/LoadingSpinner";
import { User, Phone, MapPin, Save, UserCheck, Edit, Globe } from "lucide-react";

const ProfilePage = () => {
  const { user, setUser } = useAuth();

  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user && user.profile) {
      setFullName(user.profile.fullName || "");
      setContactNumber(user.profile.contactNumber || "");
      setAddress(user.profile.address || "");
      setCity(user.profile.city || "");
      setState(user.profile.state || "");
      setCountry(user.profile.country || "");
      setZipCode(user.profile.zipCode || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await updateUserProfile({
        profile: {
          fullName,
          contactNumber,
          address,
          city,
          state,
          country,
          zipCode,
        },
      });

      if (response.success && response.data) {
        setUser(response.data);
        toast.success("Profile updated successfully!");
        setIsEditing(false);
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

        {!isEditing && user?.profile?.fullName ? (
          <div className="profile-page__summary" style={{ textAlign: "center", padding: "40px 20px", backgroundColor: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb", marginTop: "20px" }}>
            <UserCheck size={48} style={{ color: "#ea580c", marginBottom: "16px" }} />
            <h2 style={{ color: "#111827", marginBottom: "8px" }}>User Profile Active</h2>
            <p style={{ color: "#4b5563", marginBottom: "24px" }}>
              Your delivery details and contact information are currently set up.
            </p>
            <button 
              className="btn btn--primary" 
              onClick={() => setIsEditing(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#ea580c", color: "white", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "600" }}
            >
              <Edit size={18} />
              Edit Details
            </button>
          </div>
        ) : (
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
              <label className="profile-page__label" htmlFor="contactNumber">
                Contact Number
              </label>
              <div className="profile-page__input-wrapper">
                <Phone size={16} className="profile-page__input-icon" />
                <input
                  id="contactNumber"
                  type="tel"
                  className="profile-page__input"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="e.g. 9876543210"
                  required
                />
              </div>
            </div>

            <div className="profile-page__form-group">
              <label className="profile-page__label" htmlFor="address">
                Delivery Address
              </label>
              <div className="profile-page__input-wrapper">
                <MapPin size={16} className="profile-page__input-icon profile-page__input-icon--textarea" />
                <textarea
                  id="address"
                  className="profile-page__textarea"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Flat No, building street name, location details..."
                  rows={3}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <div className="profile-page__form-group" style={{ flex: 1 }}>
                <label className="profile-page__label" htmlFor="city">
                  City
                </label>
                <div className="profile-page__input-wrapper">
                  <MapPin size={16} className="profile-page__input-icon" />
                  <input
                    id="city"
                    type="text"
                    className="profile-page__input"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    required
                  />
                </div>
              </div>

              <div className="profile-page__form-group" style={{ flex: 1 }}>
                <label className="profile-page__label" htmlFor="state">
                  State
                </label>
                <div className="profile-page__input-wrapper">
                  <MapPin size={16} className="profile-page__input-icon" />
                  <input
                    id="state"
                    type="text"
                    className="profile-page__input"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Maharashtra"
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <div className="profile-page__form-group" style={{ flex: 1 }}>
                <label className="profile-page__label" htmlFor="country">
                  Country
                </label>
                <div className="profile-page__input-wrapper">
                  <Globe size={16} className="profile-page__input-icon" />
                  <input
                    id="country"
                    type="text"
                    className="profile-page__input"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. India"
                    required
                  />
                </div>
              </div>

              <div className="profile-page__form-group" style={{ flex: 1 }}>
                <label className="profile-page__label" htmlFor="zipCode">
                  Zip Code
                </label>
                <div className="profile-page__input-wrapper">
                  <MapPin size={16} className="profile-page__input-icon" />
                  <input
                    id="zipCode"
                    type="text"
                    className="profile-page__input"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="e.g. 400050"
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                type="submit"
                className="profile-page__button"
                disabled={submitting}
                style={{ flex: 1 }}
              >
                <Save size={16} />
                {submitting ? "Saving..." : "Save Changes"}
              </button>
              
              {user?.profile?.fullName && (
                <button
                  type="button"
                  className="profile-page__button"
                  onClick={() => setIsEditing(false)}
                  style={{ flex: 1, backgroundColor: '#f3f4f6', color: '#111827' }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
