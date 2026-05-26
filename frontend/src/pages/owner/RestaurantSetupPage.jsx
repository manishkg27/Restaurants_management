import React, { useEffect, useState } from "react";
import { getMyRestaurant, createRestaurant, updateRestaurant } from "../../api/restaurantAPI";
import { toast } from "react-toastify";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Store, MapPin, Phone, FileText, Image as ImageIcon, Save } from "lucide-react";

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
      // 404 is expected if they don't have a restaurant yet, so we just log it and ignore
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

    if (restaurantImage) {
      formData.append("restaurantImage", restaurantImage);
    }
    if (menuImage) {
      formData.append("menuImage", menuImage);
    }

    try {
      let response;
      if (restaurant) {
        // Update existing restaurant
        response = await updateRestaurant(restaurant._id, formData);
      } else {
        // Create new restaurant
        response = await createRestaurant(formData);
      }

      if (response.success) {
        toast.success(response.message || "Saved successfully!");
        setRestaurant(response.data);
        // Reset file selections
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
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px", borderBottom: "1px solid var(--border-glass)", paddingBottom: "20px" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "var(--accent-glow)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent)",
              }}
            >
              <Store size={30} />
            </div>

            <div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 800, fontFamily: "var(--font-heading)" }}>
                {restaurant ? "Manage Restaurant Details" : "Register Restaurant"}
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "2px" }}>
                {restaurant
                  ? "Update your branding details, contact numbers and image galleries."
                  : "Scaffold your gourmet profile and prepare to accept dining orders!"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="name">
                  Restaurant Name *
                </label>
                <div style={{ position: "relative" }}>
                  <Store size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    id="name"
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Olive Garden"
                    required
                    style={{ paddingLeft: "36px" }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="city">
                  Operating City *
                </label>
                <div style={{ position: "relative" }}>
                  <MapPin size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    id="city"
                    type="text"
                    className="form-input"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    required
                    style={{ paddingLeft: "36px" }}
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="location">
                  Full Location Details *
                </label>
                <div style={{ position: "relative" }}>
                  <MapPin size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    id="location"
                    type="text"
                    className="form-input"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bandra West, Linking Road"
                    required
                    style={{ paddingLeft: "36px" }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="contactNumber">
                  Contact Number *
                </label>
                <div style={{ position: "relative" }}>
                  <Phone size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    id="contactNumber"
                    type="tel"
                    className="form-input"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="e.g. 022 12345678"
                    required
                    style={{ paddingLeft: "36px" }}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">
                About / Cuisine Description
              </label>
              <div style={{ position: "relative" }}>
                <FileText size={16} style={{ position: "absolute", left: "12px", top: "20px", color: "var(--text-muted)" }} />
                <textarea
                  id="description"
                  className="form-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell customers about your kitchen specialities, ambience or delivery options..."
                  rows={4}
                  style={{ paddingLeft: "36px", paddingTop: "14px", resize: "none" }}
                />
              </div>
            </div>

            {/* Images upload */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="restaurantImage">
                  Restaurant Cover Image
                </label>
                <div style={{ position: "relative" }}>
                  <ImageIcon size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    id="restaurantImage"
                    type="file"
                    accept="image/*"
                    className="form-input"
                    onChange={(e) => setRestaurantImage(e.target.files[0])}
                    style={{ paddingLeft: "36px", paddingTop: "8px" }}
                  />
                </div>
                {restaurant && restaurant.restaurantImage && (
                  <p style={{ fontSize: "0.75rem", color: "var(--success)", marginTop: "4px" }}>
                    Image is currently uploaded
                  </p>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="menuImage">
                  Menu Brochure Image
                </label>
                <div style={{ position: "relative" }}>
                  <ImageIcon size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    id="menuImage"
                    type="file"
                    accept="image/*"
                    className="form-input"
                    onChange={(e) => setMenuImage(e.target.files[0])}
                    style={{ paddingLeft: "36px", paddingTop: "8px" }}
                  />
                </div>
                {restaurant && restaurant.menuImage && (
                  <p style={{ fontSize: "0.75rem", color: "var(--success)", marginTop: "4px" }}>
                    Menu brochure is currently uploaded
                  </p>
                )}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "14px", gap: "10px", marginTop: "12px" }} disabled={submitting}>
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
