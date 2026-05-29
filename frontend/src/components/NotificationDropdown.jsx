import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Trash2, CheckCircle, Package } from "lucide-react";
import { toast } from "react-toastify";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../api/notificationAPI";
import useSocket from "../hooks/useSocket";
import { useAuth } from "../context/AuthContext";
import { getMyRestaurant } from "../api/restaurantAPI";
import "./NotificationDropdown.css";

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const { user, isOwner } = useAuth();
  const socketHook = useSocket(user);

  const fetchNotes = async () => {
    try {
      const res = await getNotifications();
      if (res.success) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  // Global Socket Listeners for Real-time Unread Badge
  useEffect(() => {
    if (!user || !socketHook.socket) return;

    const setupSockets = async () => {
      if (isOwner()) {
        try {
          const resData = await getMyRestaurant();
          if (resData.success && resData.data) {
            socketHook.emit("joinRestaurantRoom", { restaurantId: resData.data._id });
            socketHook.listen("newOrder", (data) => {
              toast.info(data.message || "New order received!");
              fetchNotes(); // Re-fetch to get new notification
            });
          }
        } catch (error) {
          console.error("Failed to get restaurant for socket");
        }
      } else {
        socketHook.emit("joinUserRoom", { userId: user._id });
        socketHook.listen("orderStatusUpdate", (data) => {
          toast.info(data.message || "Order status updated");
          fetchNotes();
        });
      }
    };

    setupSockets();

    return () => {
      if (socketHook.socket) {
        socketHook.stopListening("newOrder");
        socketHook.stopListening("orderStatusUpdate");
      }
    };
  }, [user, socketHook.socket, isOwner]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleMarkRead = async (id, e) => {
    e.stopPropagation(); // prevent bubbling to dropdown toggle
    try {
      await markAsRead(id);
      fetchNotes();
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  const handleNotificationClick = async (note, e) => {
    e.stopPropagation();
    if (!note.isRead) {
      try {
        await markAsRead(note._id);
        fetchNotes();
      } catch (error) {
        console.error("Failed to mark as read", error);
      }
    }
    setIsOpen(false);
    if (isOwner()) {
      navigate("/owner/orders");
    } else {
      navigate("/orders");
    }
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await markAllAsRead();
      fetchNotes();
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      fetchNotes();
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const renderIcon = (type) => {
    if (type === "new_order") return <Package size={16} className="text-orange" />;
    return <CheckCircle size={16} className="text-blue" />;
  };

  return (
    <div className="nav-notification" ref={dropdownRef}>
      <button className="nav-notification__btn" onClick={handleToggle}>
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="nav-notification__badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="nav-notification__dropdown">
          <div className="nav-notification__header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <button className="nav-notification__mark-all" onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>
          <div className="nav-notification__list">
            {notifications.length === 0 ? (
              <div className="nav-notification__empty">No notifications</div>
            ) : (
              notifications.map((note) => (
                <div 
                  key={note._id} 
                  className={`nav-notification__item ${!note.isRead ? 'nav-notification__item--unread' : ''}`}
                  onClick={(e) => handleNotificationClick(note, e)}
                >
                  <div className="nav-notification__item-icon">
                    {renderIcon(note.type)}
                  </div>
                  <div className="nav-notification__item-content">
                    <p className="nav-notification__item-msg">{note.message}</p>
                    <span className="nav-notification__item-time">
                      {new Date(note.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <button 
                    className="nav-notification__item-delete"
                    onClick={(e) => handleDelete(note._id, e)}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
