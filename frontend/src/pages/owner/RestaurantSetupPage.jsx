import React, { useEffect, useState } from "react";
import { getMyRestaurant, createRestaurant, updateRestaurant } from "../../api/restaurantAPI";
import { toast } from "react-toastify";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Store, MapPin, Phone, FileText, Image as ImageIcon, Save } from "lucide-react";
import "./RestaurantSetupPage.css";

const RestaurantSetupPage = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [description, setDescription] = useState("");
  const [restaurantImage, setRestaurantImage] = useState(null);
  const [menuImage, setMenuImage] = useState(null);
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
        setContactNumber(rest.contactNumber || "");
        setDescription(rest.description || "");
      }
    } catch (error) {
      console.log("No existing restaurant found (user is likely first-time owner).");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurant();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !city || !location || !contactNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("city", city);
    formData.append("location", location);
    formData.append("contactNumber", contactNumber);
    formData.append("description", description);

    if (restaurantImage) formData.append("restaurantImage", restaurantImage);
    if (menuImage) formData.append("menuImage", menuImage);

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
        setMenuImage(null);
        await fetchRestaurant();
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
                {restaurant ? "Manage Restaurant Details" : "Register Restaurant"}
              </h2>
              <p className="restaurant-setup__subtitle">
                {restaurant
                  ? "Update your branding details, contact numbers and image galleries."
                  : "Scaffold your gourmet profile and prepare to accept dining orders!"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="restaurant-setup__form">
            <div className="restaurant-setup__grid">
              <div className="form-group restaurant-setup__field">
                <label className="form-label" htmlFor="name">Restaurant Name *</label>
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
                <label className="form-label" htmlFor="city">Operating City *</label>
                <div className="restaurant-setup__input-wrapper">
                  <MapPin size={16} className="restaurant-setup__input-icon" />
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
                <label className="form-label" htmlFor="location">Full Location Details *</label>
                <div className="restaurant-setup__input-wrapper">
                  <MapPin size={16} className="restaurant-setup__input-icon" />
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

              <div className="form-group restaurant-setup__field">
                <label className="form-label" htmlFor="contactNumber">Contact Number *</label>
                <div className="restaurant-setup__input-wrapper">
                  <Phone size={16} className="restaurant-setup__input-icon" />
                  <input
                    id="contactNumber"
                    type="tel"
                    className="form-input restaurant-setup__input"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="e.g. 022 12345678"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">About / Cuisine Description</label>
              <div className="restaurant-setup__input-wrapper">
                <FileText size={16} className="restaurant-setup__input-icon restaurant-setup__input-icon--top" />
                <textarea
                  id="description"
                  className="form-input restaurant-setup__input restaurant-setup__textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell customers about your kitchen specialities, ambience or delivery options..."
                  rows={4}
                />
              </div>
            </div>

            <div className="restaurant-setup__grid">
              <div className="form-group restaurant-setup__field">
                <label className="form-label" htmlFor="restaurantImage">Restaurant Cover Image</label>
                <div className="restaurant-setup__input-wrapper">
                  <ImageIcon size={16} className="restaurant-setup__input-icon" />
                  <input
                    id="restaurantImage"
                    type="file"
                    accept="image/*"
                    className="form-input restaurant-setup__input restaurant-setup__input--file"
                    onChange={(e) => setRestaurantImage(e.target.files[0])}
                  />
                </div>
                {restaurant && restaurant.restaurantImage && (
                  <p className="restaurant-setup__status-text">Image is currently uploaded</p>
                )}
              </div>

              <div className="form-group restaurant-setup__field">
                <label className="form-label" htmlFor="menuImage">Menu Brochure Image</label>
                <div className="restaurant-setup__input-wrapper">
                  <ImageIcon size={16} className="restaurant-setup__input-icon" />
                  <input
                    id="menuImage"
                    type="file"
                    accept="image/*"
                    className="form-input restaurant-setup__input restaurant-setup__input--file"
                    onChange={(e) => setMenuImage(e.target.files[0])}
                  />
                </div>
                {restaurant && restaurant.menuImage && (
                  <p className="restaurant-setup__status-text">Menu brochure is currently uploaded</p>
                )}
              </div>
            </div>

            <button type="submit" className="btn btn--primary restaurant-setup__submit" disabled={submitting}>
              <Save size={18} />
              {submitting ? "Saving..." : "Save Restaurant Info"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSetupPage;
