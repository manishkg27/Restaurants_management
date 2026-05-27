import React, { useEffect, useState } from "react";
import { getMyRestaurant } from "../../api/restaurantAPI";
import { createItem, updateItem, deleteItem } from "../../api/itemAPI";
import { toast } from "react-toastify";
import LoadingSpinner from "../../components/LoadingSpinner";
import formatCurrency from "../../utils/formatCurrency";
import { Store, Plus, X, IndianRupee, FileText, Image as ImageIcon, Save, Check, Edit, Trash2 } from "lucide-react";
import "./MenuManagementPage.css";

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
  const [editingItemId, setEditingItemId] = useState(null);

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
    if (image) formData.append("image", image);

    try {
      let response;
      if (editingItemId) {
        response = await updateItem(editingItemId, formData);
      } else {
        response = await createItem(restaurant._id, formData);
      }

      if (response.success) {
        toast.success(response.message || (editingItemId ? "Item updated successfully!" : "Item added successfully!"));
        closeModal();
        await fetchMenu();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || (editingItemId ? "Failed to update menu item" : "Failed to add menu item"));
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingItemId(null);
    setName("");
    setPrice("");
    setDescription("");
    setImage(null);
  };

  const handleEdit = (item) => {
    setEditingItemId(item._id);
    setName(item.name);
    setPrice(item.price);
    setDescription(item.description || "");
    setImage(null);
    setShowAddModal(true);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        const response = await deleteItem(itemId);
        if (response.success) {
          toast.success("Item deleted successfully!");
          await fetchMenu();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete item");
      }
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!restaurant) {
    return (
      <div className="menu-mgmt__empty-state">
        <h3>No restaurant registered yet</h3>
        <p className="menu-mgmt__empty-text">Please setup your restaurant before adding menu items.</p>
      </div>
    );
  }

  return (
    <div className="menu-mgmt">
      <div className="container">
        {/* Banner with Add Button */}
        <div className="menu-mgmt__banner">
          <div>
            <h2 className="menu-mgmt__banner-title">
              Menu Management
            </h2>
            <p className="menu-mgmt__banner-subtitle">
              Configure, add or view dishes listed under <strong className="menu-mgmt__banner-highlight">{restaurant.name}</strong>
            </p>
          </div>

          <button onClick={() => setShowAddModal(true)} className="btn btn--primary">
            <Plus size={16} /> Add Menu Item
          </button>
        </div>

        {/* Modal form */}
        {showAddModal && (
          <div className="menu-mgmt__modal-overlay">
            <form onSubmit={handleSubmit} className="menu-mgmt__modal-content">
              <button type="button" onClick={closeModal} className="menu-mgmt__modal-close">
                <X size={20} />
              </button>

              <h3 className="menu-mgmt__modal-title">
                {editingItemId ? "Edit Dish" : "Add New Dish"}
              </h3>

              <div className="form-group">
                <label className="form-label" htmlFor="dishName">Dish Name *</label>
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
                <label className="form-label" htmlFor="price">Price (INR ₹) *</label>
                <div className="menu-mgmt__input-wrapper">
                  <IndianRupee size={16} className="menu-mgmt__input-icon" />
                  <input
                    id="price"
                    type="number"
                    className="form-input menu-mgmt__input"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 150"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">Short Description *</label>
                <textarea
                  id="description"
                  className="form-input menu-mgmt__textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell clients about ingredients, size or special customizations..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="image">Dish Preview Image</label>
                <div className="menu-mgmt__input-wrapper">
                  <ImageIcon size={16} className="menu-mgmt__input-icon" />
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="form-input menu-mgmt__input menu-mgmt__input--file"
                    onChange={(e) => setImage(e.target.files[0])}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn--primary menu-mgmt__submit" disabled={submitting}>
                <Save size={16} />
                {submitting ? "Saving..." : "Save Dish"}
              </button>
            </form>
          </div>
        )}

        {/* Existing items listing */}
        {!restaurant.menuItems || restaurant.menuItems.length === 0 ? (
          <div className="menu-mgmt__no-items">
            <p>You have not listed any items yet. Add your first item to start!</p>
          </div>
        ) : (
          <div className="menu-mgmt__grid">
            {restaurant.menuItems.map((item) => (
              <div key={item._id} className="menu-mgmt__card">
                <img
                  src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80"}
                  alt={item.name}
                  className="menu-mgmt__card-image"
                />
                <div className="menu-mgmt__card-body">
                  <div>
                    <div className="menu-mgmt__card-header">
                      <h4 className="menu-mgmt__card-title">{item.name}</h4>
                      <span className="menu-mgmt__card-price">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                    {item.description && (
                      <p className="menu-mgmt__card-desc">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="menu-mgmt__card-footer" style={{ justifyContent: 'space-between' }}>
                    <div>
                      <span className="menu-mgmt__card-rating">
                        Avg Rating: <strong className="menu-mgmt__card-rating-val">{item.averageRating ? item.averageRating.toFixed(1) : "N/A"}</strong>
                      </span>
                      <span className="menu-mgmt__badge-active">
                        Active
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleEdit(item)} className="btn btn--secondary" style={{ padding: '4px 8px', minWidth: 'auto', backgroundColor: '#f0f0f0', color: '#333' }}>
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(item._id)} className="btn btn--secondary" style={{ padding: '4px 8px', minWidth: 'auto', backgroundColor: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
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
