import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyManager,
  createManager,
  updateManager,
} from "../../api/managerAPI";
import { getMyRestaurant } from "../../api/restaurantAPI";
import { toast } from "react-toastify";
import LoadingSpinner from "../../components/LoadingSpinner";
import { UserCheck, Building, ShieldCheck, Save } from "lucide-react";
import "./ManagerProfilePage.css";

const ManagerProfilePage = () => {
  const [manager, setManager] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [bankIFSC, setBankIFSC] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [about, setAbout] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const fetchManager = async () => {
    try {
      const restResponse = await getMyRestaurant();

      if (!restResponse.success || !restResponse.data) {
        toast.error("Please register a restaurant first.", { toastId: "no-restaurant-error" });
        navigate("/owner/restaurant");
        return;
      }
    } catch (error) {
      toast.error("Please register a restaurant first.", { toastId: "no-restaurant-error" });
      navigate("/owner/restaurant");
      return;
    }

    try {
      const response = await getMyManager();
      if (response.success && response.data) {
        const mgr = response.data;
        setManager(mgr);
        setName(mgr.name || "");
        setContact(mgr.contact || "");
        setEmail(mgr.email || "");
        setAddress(mgr.address || "");
        setBankName(mgr.bankName || "");
        setBankBranch(mgr.bankBranch || "");
        setBankIFSC(mgr.bankIFSC || "");
        setBankAccount(mgr.bankAccount || "");
        setAbout(mgr.about || "");
      }
    } catch (error) {
      console.log("No existing manager profile found.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManager();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !name ||
      !contact ||
      !email ||
      !address ||
      !bankName ||
      !bankBranch ||
      !bankIFSC ||
      !bankAccount
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    const payload = {
      name,
      contact,
      email,
      address,
      bankName,
      bankBranch,
      bankIFSC,
      bankAccount,
      about,
    };

    try {
      let response;
      if (manager) {
        response = await updateManager(manager._id, payload);
      } else {
        response = await createManager(payload);
      }

      if (response.success) {
        toast.success(response.message || "Saved successfully!");
        setManager(response.data);
        await fetchManager();
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate("/owner/dashboard");
        }, 1500);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save manager details",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="manager-profile">
      <div className="manager-profile__container">
        <form onSubmit={handleSubmit} className="manager-profile__form">
          {/* Header */}
          <div className="manager-profile__header">
            <div className="manager-profile__icon-wrapper">
              <ShieldCheck size={30} />
            </div>
            <div>
              <h2 className="manager-profile__title">
                {manager
                  ? "Manage Manager Profile"
                  : "Register Restaurant Manager"}
              </h2>
              <p className="manager-profile__subtitle">
                Establish administrative and commercial banking details for
                payouts.
              </p>
            </div>
          </div>

          {/* Section: Administrative Info */}
          <div>
            <h3 className="manager-profile__section-title">
              <UserCheck size={18} className="manager-profile__section-icon" />{" "}
              Administrative Details
            </h3>

            <div className="manager-profile__grid">
              <div className="form-group">
                <label className="form-label" htmlFor="mgrName">
                  Manager Name *
                </label>
                <input
                  id="mgrName"
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Robert Baratheon"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="mgrContact">
                  Contact Number *
                </label>
                <input
                  id="mgrContact"
                  type="tel"
                  className="form-input"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="e.g. +91 9999999999"
                  required
                />
              </div>
            </div>

            <div className="manager-profile__grid">
              <div className="form-group">
                <label className="form-label" htmlFor="mgrEmail">
                  Email Address *
                </label>
                <input
                  id="mgrEmail"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. robert@gourmet.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="mgrAbout">
                  About Description
                </label>
                <input
                  id="mgrAbout"
                  type="text"
                  className="form-input"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Additional credentials or roles..."
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="mgrAddress">
                Full Address *
              </label>
              <textarea
                id="mgrAddress"
                className="form-input manager-profile__textarea"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full address of the manager..."
                rows={2}
                required
              />
            </div>
          </div>

          {/* Section: Commercial Banking Details */}
          <div className="manager-profile__banking">
            <h3 className="manager-profile__section-title">
              <Building size={18} className="manager-profile__section-icon" />{" "}
              Payout Banking Details
            </h3>

            <div className="manager-profile__grid">
              <div className="form-group">
                <label className="form-label" htmlFor="bankName">
                  Bank Name *
                </label>
                <input
                  id="bankName"
                  type="text"
                  className="form-input"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. HDFC Bank"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="bankBranch">
                  Bank Branch *
                </label>
                <input
                  id="bankBranch"
                  type="text"
                  className="form-input"
                  value={bankBranch}
                  onChange={(e) => setBankBranch(e.target.value)}
                  placeholder="e.g. Bandra West, Mumbai"
                  required
                />
              </div>
            </div>

            <div className="manager-profile__grid">
              <div className="form-group">
                <label className="form-label" htmlFor="bankAccount">
                  Account Number *
                </label>
                <input
                  id="bankAccount"
                  type="text"
                  className="form-input"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="e.g. 50100012345678"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="bankIFSC">
                  IFSC Code *
                </label>
                <input
                  id="bankIFSC"
                  type="text"
                  className="form-input"
                  value={bankIFSC}
                  onChange={(e) => setBankIFSC(e.target.value)}
                  placeholder="e.g. HDFC0000042"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn--primary manager-profile__submit"
            disabled={submitting}
          >
            <Save size={18} />
            {submitting ? "Saving..." : "Save Manager Details"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManagerProfilePage;
