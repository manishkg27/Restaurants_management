import React, { useEffect, useState } from "react";
import { getMyRestaurant } from "../../api/restaurantAPI";
import { createItem } from "../../api/itemAPI";
import { toast } from "react-toastify";
import LoadingSpinner from "../../components/LoadingSpinner";
import formatCurrency from "../../utils/formatCurrency";
import { Store, Plus, X, IndianRupee, FileText, Image as ImageIcon, Save, Check } from "lucide-react";

const MenuManagementPage = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchMenu = async () => {
    try {
      const response = await getMyRestaurant();
      if (response.success && response.data) {
        setRestaurant(response.data);
      }
    } catch (error) {
      toast.error("Please setup your restaurant before managing menu items!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await createItem(restaurant._id, formData);
      if (response.success) {
        toast.success(response.message || "Item added successfully!");
        setShowAddModal(false);
        // Clear fields
        setName("");
        setPrice("");
        setDescription("");
        setImage(null);
        await fetchMenu();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add menu item");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!restaurant) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <h3>No restaurant registered yet</h3>
        <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>Please setup your restaurant before adding menu items.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "80vh", padding: "40px 0" }}>
      <div className="container">
        {/* Banner with Add Button */}
        <div
          className="glass animate-fade-in"
          style={{
            padding: "24px 32px",
            borderRadius: "var(--radius-lg)",
            marginBottom: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, fontFamily: "var(--font-heading)" }}>
              Menu Management
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
              Configure, add or view dishes listed under <strong style={{ color: "var(--accent)" }}>{restaurant.name}</strong>
            </p>
          </div>

          <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={{ padding: "10px 20px" }}>
            <Plus size={16} /> Add Menu Item
          </button>
        </div>

        {/* Modal form */}
        {showAddModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
            }}
          >
            <form
              onSubmit={handleSubmit}
              className="glass animate-fade-in"
              style={{
                width: "100%",
                maxWidth: "500px",
                borderRadius: "var(--radius-lg)",
                padding: "32px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                }}
              >
                <X size={20} />
              </button>

              <h3 style={{ fontSize: "1.3rem", fontWeight: 800, fontFamily: "var(--font-heading)" }}>
                Add New Dish
              </h3>

              <div className="form-group">
                <label className="form-label" htmlFor="dishName">
                  Dish Name *
                </label>
                <input
                  id="dishName"
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Garlic Bread"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="price">
                  Price (INR ₹) *
                </label>
                <div style={{ position: "relative" }}>
                  <IndianRupee size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    id="price"
                    type="number"
                    className="form-input"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 150"
                    required
                    style={{ paddingLeft: "36px" }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">
                  Short Description
                </label>
                <textarea
                  id="description"
                  className="form-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell clients about ingredients, size or special customizations..."
                  rows={3}
                  style={{ resize: "none" }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="image">
                  Dish Preview Image
                </label>
                <div style={{ position: "relative" }}>
                  <ImageIcon size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="form-input"
                    onChange={(e) => setImage(e.target.files[0])}
                    style={{ paddingLeft: "36px", paddingTop: "8px" }}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px", gap: "8px" }} disabled={submitting}>
                <Save size={16} />
                {submitting ? "Saving..." : "Save Dish"}
              </button>
            </form>
          </div>
        )}

        {/* Existing items listing */}
        {!restaurant.menuItems || restaurant.menuItems.length === 0 ? (
          <div className="glass" style={{ padding: "80px", textAlign: "center", color: "var(--text-muted)", borderRadius: "var(--radius-lg)" }}>
            <p>You have not listed any items yet. Add your first item to start!</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            {restaurant.menuItems.map((item) => (
              <div
                key={item._id}
                className="glass"
                style={{
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <img
                  src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80"}
                  alt={item.name}
                  style={{ width: "100%", height: "160px", objectFit: "cover" }}
                />
                <div style={{ padding: "16px", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "12px" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                      <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>{item.name}</h4>
                      <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--accent)" }}>
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                    {item.description && (
                      <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.4, marginTop: "6px" }}>
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-glass)", paddingTop: "12px" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      Avg Rating: <strong style={{ color: "var(--text-primary)" }}>{item.averageRating ? item.averageRating.toFixed(1) : "N/A"}</strong>
                    </span>
                    <span
                      style={{
                        padding: "2px 8px",
                        backgroundColor: "var(--success-glow)",
                        color: "var(--success)",
                        borderRadius: "var(--radius-full)",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    >
                      Active
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuManagementPage;
