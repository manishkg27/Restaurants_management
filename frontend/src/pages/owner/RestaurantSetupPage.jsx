import React, { useEffect, useState } from "react";
import { getMyRestaurant, createRestaurant, updateRestaurant } from "../../api/restaurantAPI";
import { toast } from "react-toastify";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Store, MapPin, Phone, Image as ImageIcon, Save, User, Mail, Clock, Globe, Map } from "lucide-react";
import "./RestaurantSetupPage.css";

const RestaurantSetupPage = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [pinCode, setPinCode] = useState("");
  const [restaurantContact, setRestaurantContact] = useState("");
  
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerContact, setOwnerContact] = useState("");
  
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");

  const [restaurantImage, setRestaurantImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchRestaurant = async () => {
    try {
      const response = await getMyRestaurant();
      if (response.success && response.data) {
        const rest = response.data;
        setRestaurant(rest);
        setName(rest.name || "");
        setCity(rest.city || "");
        setLocation(rest.location || "");
        setState(rest.state || "");
        setCountry(rest.country || "India");
        setPinCode(rest.pinCode || "");
        setRestaurantContact(rest.restaurantContact || "");
        setOwnerName(rest.ownerName || "");
        setOwnerEmail(rest.ownerEmail || "");
        setOwnerContact(rest.ownerContact || "");
        setOpenTime(rest.openTime || "");
        setCloseTime(rest.closeTime || "");
        setIsEditing(false);
      }
    } catch (error) {
      console.log("No existing restaurant found (user is likely first-time owner).");
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurant();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !name || !city || !location || !state || !country || !pinCode ||
      !restaurantContact || !ownerName || !ownerEmail || !ownerContact ||
      !openTime || !closeTime
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("city", city);
    formData.append("location", location);
    formData.append("state", state);
    formData.append("country", country);
    formData.append("pinCode", pinCode);
    formData.append("restaurantContact", restaurantContact);
    formData.append("ownerName", ownerName);
    formData.append("ownerEmail", ownerEmail);
    formData.append("ownerContact", ownerContact);
    formData.append("openTime", openTime);
    formData.append("closeTime", closeTime);

    if (restaurantImage) formData.append("restaurantImage", restaurantImage);

    try {
      let response;
      if (restaurant) {
        response = await updateRestaurant(restaurant._id, formData);
      } else {
        response = await createRestaurant(formData);
      }

      if (response.success) {
        toast.success(response.message || "Saved successfully!");
        setRestaurant(response.data);
        setRestaurantImage(null);
        await fetchRestaurant();
        setIsEditing(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save restaurant details");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="restaurant-setup">
      <div className="restaurant-setup__container">
        <div className="restaurant-setup__card">
          <div className="restaurant-setup__header">
            <div className="restaurant-setup__icon-wrapper">
              <Store size={30} />
            </div>
            <div>
              <h2 className="restaurant-setup__title">
                {restaurant
                  ? "Manage Restaurant Details"
                  : "Register Restaurant"}
              </h2>
              <p className="restaurant-setup__subtitle">
                {restaurant
                  ? "Update your branding details, contact numbers and image galleries."
                  : "Scaffold your gourmet profile and prepare to accept dining orders!"}
              </p>
            </div>
          </div>

          {!isEditing && restaurant ? (
            <div
              className="restaurant-setup__summary"
              style={{ textAlign: "center", padding: "40px 20px" }}
            >
              <Store
                size={48}
                style={{ color: "#ea580c", marginBottom: "16px" }}
              />
              <h2 style={{ color: "#111827", marginBottom: "8px" }}>
                Restaurant Profile Active
              </h2>
              <p style={{ color: "#9ca3af", marginBottom: "24px" }}>
                Your restaurant details are currently set up and active on
                Eatify.
              </p>
              <button
                className="btn btn--primary"
                onClick={() => setIsEditing(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Store size={18} />
                Edit Details
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="restaurant-setup__form">
              <div className="restaurant-setup__grid">
                <div className="form-group restaurant-setup__field">
                  <label className="form-label" htmlFor="name">
                    Restaurant Name *
                  </label>
                  <div className="restaurant-setup__input-wrapper">
                    <Store size={16} className="restaurant-setup__input-icon" />
                    <input
                      id="name"
                      type="text"
                      className="form-input restaurant-setup__input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Olive Garden"
                      required
                    />
                  </div>
                </div>

                <div className="form-group restaurant-setup__field">
                  <label className="form-label" htmlFor="city">
                    Operating City *
                  </label>
                  <div className="restaurant-setup__input-wrapper">
                    <MapPin
                      size={16}
                      className="restaurant-setup__input-icon"
                    />
                    <input
                      id="city"
                      type="text"
                      className="form-input restaurant-setup__input"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mumbai"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="restaurant-setup__grid">
                <div className="form-group restaurant-setup__field">
                  <label className="form-label" htmlFor="state">
                    State *
                  </label>
                  <div className="restaurant-setup__input-wrapper">
                    <Map size={16} className="restaurant-setup__input-icon" />
                    <input
                      id="state"
                      type="text"
                      className="form-input restaurant-setup__input"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Maharashtra"
                      required
                    />
                  </div>
                </div>

                <div className="form-group restaurant-setup__field">
                  <label className="form-label" htmlFor="country">
                    Country *
                  </label>
                  <div className="restaurant-setup__input-wrapper">
                    <Globe size={16} className="restaurant-setup__input-icon" />
                    <input
                      id="country"
                      type="text"
                      className="form-input restaurant-setup__input"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g. India"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="restaurant-setup__grid">
                <div
                  className="form-group restaurant-setup__field"
                  style={{ gridColumn: "1 / -1" }}
                >
                  <label className="form-label" htmlFor="location">
                    Full Location Details *
                  </label>
                  <div className="restaurant-setup__input-wrapper">
                    <MapPin
                      size={16}
                      className="restaurant-setup__input-icon"
                    />
                    <input
                      id="location"
                      type="text"
                      className="form-input restaurant-setup__input"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Bandra West, Linking Road"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="restaurant-setup__grid">
                <div className="form-group restaurant-setup__field">
                  <label className="form-label" htmlFor="pinCode">
                    Pin Code *
                  </label>
                  <div className="restaurant-setup__input-wrapper">
                    <MapPin
                      size={16}
                      className="restaurant-setup__input-icon"
                    />
                    <input
                      id="pinCode"
                      type="text"
                      className="form-input restaurant-setup__input"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      placeholder="e.g. 400050"
                      required
                    />
                  </div>
                </div>

                <div className="form-group restaurant-setup__field">
                  <label className="form-label" htmlFor="restaurantContact">
                    Restaurant Contact *
                  </label>
                  <div className="restaurant-setup__input-wrapper">
                    <Phone size={16} className="restaurant-setup__input-icon" />
                    <input
                      id="restaurantContact"
                      type="tel"
                      className="form-input restaurant-setup__input"
                      value={restaurantContact}
                      onChange={(e) => setRestaurantContact(e.target.value)}
                      placeholder="e.g. 022 12345678"
                      required
                    />
                  </div>
                </div>
              </div>

              <h3
                className="restaurant-setup__section-title"
                style={{
                  marginTop: "20px",
                  marginBottom: "10px",
                  borderBottom: "1px solid #333",
                  paddingBottom: "5px",
                }}
              >
                Owner Details
              </h3>

              <div className="restaurant-setup__grid">
                <div className="form-group restaurant-setup__field">
                  <label className="form-label" htmlFor="ownerName">
                    Owner Name *
                  </label>
                  <div className="restaurant-setup__input-wrapper">
                    <User size={16} className="restaurant-setup__input-icon" />
                    <input
                      id="ownerName"
                      type="text"
                      className="form-input restaurant-setup__input"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="e.g. John Doe"
                      required
                    />
                  </div>
                </div>

                <div className="form-group restaurant-setup__field">
                  <label className="form-label" htmlFor="ownerEmail">
                    Owner Email *
                  </label>
                  <div className="restaurant-setup__input-wrapper">
                    <Mail size={16} className="restaurant-setup__input-icon" />
                    <input
                      id="ownerEmail"
                      type="email"
                      className="form-input restaurant-setup__input"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="e.g. owner@example.com"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="restaurant-setup__grid">
                <div className="form-group restaurant-setup__field">
                  <label className="form-label" htmlFor="ownerContact">
                    Owner Contact *
                  </label>
                  <div className="restaurant-setup__input-wrapper">
                    <Phone size={16} className="restaurant-setup__input-icon" />
                    <input
                      id="ownerContact"
                      type="tel"
                      className="form-input restaurant-setup__input"
                      value={ownerContact}
                      onChange={(e) => setOwnerContact(e.target.value)}
                      placeholder="e.g. +91 9999999999"
                      required
                    />
                  </div>
                </div>
              </div>

              <h3
                className="restaurant-setup__section-title"
                style={{
                  marginTop: "20px",
                  marginBottom: "10px",
                  borderBottom: "1px solid #333",
                  paddingBottom: "5px",
                }}
              >
                Operating Hours
              </h3>

              <div className="restaurant-setup__grid">
                <div className="form-group restaurant-setup__field">
                  <label className="form-label" htmlFor="openTime">
                    Opening Time *
                  </label>
                  <div className="restaurant-setup__input-wrapper">
                    <Clock size={16} className="restaurant-setup__input-icon" />
                    <input
                      id="openTime"
                      type="time"
                      className="form-input restaurant-setup__input"
                      value={openTime}
                      onChange={(e) => setOpenTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group restaurant-setup__field">
                  <label className="form-label" htmlFor="closeTime">
                    Closing Time *
                  </label>
                  <div className="restaurant-setup__input-wrapper">
                    <Clock size={16} className="restaurant-setup__input-icon" />
                    <input
                      id="closeTime"
                      type="time"
                      className="form-input restaurant-setup__input"
                      value={closeTime}
                      onChange={(e) => setCloseTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <h3
                className="restaurant-setup__section-title"
                style={{
                  marginTop: "20px",
                  marginBottom: "10px",
                  borderBottom: "1px solid #333",
                  paddingBottom: "5px",
                }}
              >
                Images
              </h3>

              <div className="restaurant-setup__grid">
                <div className="form-group restaurant-setup__field">
                  <label className="form-label" htmlFor="restaurantImage">
                    Restaurant Cover Image
                  </label>
                  <div className="restaurant-setup__input-wrapper">
                    <ImageIcon
                      size={16}
                      className="restaurant-setup__input-icon"
                    />
                    <input
                      id="restaurantImage"
                      type="file"
                      accept="image/*"
                      className="form-input restaurant-setup__input restaurant-setup__input--file"
                      onChange={(e) => setRestaurantImage(e.target.files[0])}
                    />
                  </div>
                  {restaurant && restaurant.restaurantImage && (
                    <p className="restaurant-setup__status-text">
                      Image is currently uploaded
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn--primary restaurant-setup__submit"
                disabled={submitting}
                style={{ marginTop: "20px" }}
              >
                <Save size={18} />
                {submitting ? "Saving..." : "Save Restaurant Info"}
              </button>
              {restaurant && (
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => setIsEditing(false)}
                  style={{ marginTop: "10px", width: "100%" }}
                >
                  Cancel
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantSetupPage;
