import React, { useEffect, useState } from "react";
import { getMyManager, createManager, updateManager } from "../../api/managerAPI";
import { toast } from "react-toastify";
import LoadingSpinner from "../../components/LoadingSpinner";
import { UserCheck, Mail, Phone, MapPin, Building, ShieldCheck, Save, ClipboardList } from "lucide-react";

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

  const fetchManager = async () => {
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
    if (!name || !contact || !email || !address || !bankName || !bankBranch || !bankIFSC || !bankAccount) {
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
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save manager details");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8 flex flex-col gap-6"
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", borderBottom: "1px solid var(--border-glass)", paddingBottom: "20px" }}>
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
              <ShieldCheck size={30} />
            </div>

            <div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 800, fontFamily: "var(--font-heading)" }}>
                {manager ? "Manage Manager Profile" : "Register Restaurant Manager"}
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "2px" }}>
                Establish administrative and commercial banking details for payouts.
              </p>
            </div>
          </div>

          {/* Section: Administrative Info */}
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <UserCheck size={18} style={{ color: "var(--accent)" }} /> Administrative Details
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="mgrName">Manager Name *</label>
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
                <label className="form-label" htmlFor="mgrContact">Contact Number *</label>
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="mgrEmail">Email Address *</label>
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
                <label className="form-label" htmlFor="mgrAbout">About Description</label>
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
              <label className="form-label" htmlFor="mgrAddress">Full Address *</label>
              <textarea
                id="mgrAddress"
                className="form-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full address of the manager..."
                rows={2}
                required
                style={{ resize: "none" }}
              />
            </div>
          </div>

          {/* Section: Commercial Banking Details */}
          <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "24px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Building size={18} style={{ color: "var(--accent)" }} /> Payout Banking Details
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="bankName">Bank Name *</label>
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
                <label className="form-label" htmlFor="bankBranch">Bank Branch *</label>
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="bankAccount">Account Number *</label>
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
                <label className="form-label" htmlFor="bankIFSC">IFSC Code *</label>
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

          <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "14px", gap: "10px" }} disabled={submitting}>
            <Save size={18} />
            {submitting ? "Saving..." : "Save Manager Details"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManagerProfilePage;
