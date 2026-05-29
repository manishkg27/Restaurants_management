import React, { useState, useEffect } from "react";
import "./ProfilePage.css";
import { useAuth } from "../context/AuthContext";
import { updateUserProfile, addAddress, updateAddress, deleteAddress } from "../api/managerAPI";
import { toast } from "react-toastify";
import LoadingSpinner from "../components/LoadingSpinner";
import { User, Phone, MapPin, Save, UserCheck, Edit, Globe, Plus, Trash2, X } from "lucide-react";

const ProfilePage = () => {
  const { user, setUser } = useAuth();

  // Profile States
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [submittingProfile, setSubmittingProfile] = useState(false);
  
  // Address States
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [submittingAddress, setSubmittingAddress] = useState(false);

  // Modal Form States
  const [title, setTitle] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [pinCode, setPinCode] = useState("");
  const [addressContact, setAddressContact] = useState("");

  useEffect(() => {
    if (user && user.profile) {
      setFullName(user.profile.fullName || "");
      setContactNumber(user.profile.contactNumber || "");
      setAddresses(user.profile.addresses || []);
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSubmittingProfile(true);
    try {
      const response = await updateUserProfile({
        profile: {
          fullName,
          contactNumber,
        },
      });

      if (response.success && response.data) {
        setUser(response.data);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setSubmittingAddress(true);
    try {
      const payload = {
        title,
        address: addressLine,
        city,
        state,
        country,
        pinCode,
        contactNumber: addressContact,
      };

      let response;
      if (editingAddressId) {
        response = await updateAddress(editingAddressId, payload);
      } else {
        response = await addAddress(payload);
      }

      if (response.success && response.data) {
        setUser({ ...user, profile: { ...user.profile, addresses: response.data } });
        setAddresses(response.data);
        toast.success(editingAddressId ? "Address updated!" : "Address added!");
        closeAddressModal();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save address");
    } finally {
      setSubmittingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        const response = await deleteAddress(addressId);
        if (response.success && response.data) {
          setUser({ ...user, profile: { ...user.profile, addresses: response.data } });
          setAddresses(response.data);
          toast.success("Address deleted successfully!");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete address");
      }
    }
  };

  const openEditAddressModal = (addr) => {
    setEditingAddressId(addr._id);
    setTitle(addr.title);
    setAddressLine(addr.address);
    setCity(addr.city);
    setState(addr.state);
    setCountry(addr.country || "India");
    setPinCode(addr.pinCode);
    setAddressContact(addr.contactNumber);
    setShowAddressModal(true);
  };

  const closeAddressModal = () => {
    setShowAddressModal(false);
    setEditingAddressId(null);
    setTitle("");
    setAddressLine("");
    setCity("");
    setState("");
    setCountry("India");
    setPinCode("");
    setAddressContact("");
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

        {/* Basic Info Form */}
        <form onSubmit={handleProfileSubmit} className="profile-page__form" style={{ marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '15px', color: '#111827' }}>Personal Details</h3>
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

          <button
            type="submit"
            className="profile-page__button"
            disabled={submittingProfile}
          >
            <Save size={16} />
            {submittingProfile ? "Saving..." : "Save Details"}
          </button>
        </form>

        {/* Address Book Section */}
        <div className="profile-page__addresses-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ color: '#111827', margin: 0 }}>Address Book</h3>
            <button 
              onClick={() => setShowAddressModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#ea580c', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              <Plus size={16} /> Add Address
            </button>
          </div>

          {addresses.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
              <MapPin size={32} style={{ color: '#9ca3af', marginBottom: '10px' }} />
              <p style={{ color: '#6b7280', margin: 0 }}>No saved addresses. Add an address to make checkout faster.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
              {addresses.map((addr) => (
                <div key={addr._id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '15px', backgroundColor: '#fff', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <span style={{ backgroundColor: '#fff7ed', color: '#ea580c', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{addr.title}</span>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => openEditAddressModal(addr)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }} title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteAddress(addr._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#374151' }}>{addr.address}</p>
                  <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#374151' }}>{addr.city}, {addr.state} - {addr.pinCode}</p>
                  <p style={{ margin: '0', fontSize: '14px', color: '#374151', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Phone size={14} /> {addr.contactNumber}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Address Modal */}
        {showAddressModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#111827' }}>{editingAddressId ? "Edit Address" : "Add New Address"}</h3>
                <button onClick={closeAddressModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              
              <form onSubmit={handleAddressSubmit}>
                <div className="profile-page__form-group">
                  <label className="profile-page__label">Address Title (e.g. Home, Work)</label>
                  <input className="profile-page__input" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Home" style={{ padding: '10px' }} />
                </div>
                
                <div className="profile-page__form-group">
                  <label className="profile-page__label">Address Line</label>
                  <textarea className="profile-page__textarea" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} required rows={2} style={{ padding: '10px' }} />
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div className="profile-page__form-group" style={{ flex: 1 }}>
                    <label className="profile-page__label">City</label>
                    <input className="profile-page__input" type="text" value={city} onChange={(e) => setCity(e.target.value)} required style={{ padding: '10px' }} />
                  </div>
                  <div className="profile-page__form-group" style={{ flex: 1 }}>
                    <label className="profile-page__label">State</label>
                    <input className="profile-page__input" type="text" value={state} onChange={(e) => setState(e.target.value)} required style={{ padding: '10px' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div className="profile-page__form-group" style={{ flex: 1 }}>
                    <label className="profile-page__label">Zip/Pin Code</label>
                    <input className="profile-page__input" type="text" value={pinCode} onChange={(e) => setPinCode(e.target.value)} required style={{ padding: '10px' }} />
                  </div>
                  <div className="profile-page__form-group" style={{ flex: 1 }}>
                    <label className="profile-page__label">Phone Number</label>
                    <input className="profile-page__input" type="tel" value={addressContact} onChange={(e) => setAddressContact(e.target.value)} required style={{ padding: '10px' }} />
                  </div>
                </div>

                <button type="submit" className="profile-page__button" disabled={submittingAddress} style={{ width: '100%' }}>
                  <Save size={16} /> {submittingAddress ? "Saving..." : "Save Address"}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProfilePage;
