// frontend/src/pages/admin/AdminDrivers.jsx

import { useState, useEffect } from "react";
import api from "../../services/api";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";

const emptyForm = { name: "", email: "", password: "", phone: "", licenseNumber: "" };

const AdminDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchDrivers = async () => {
    try {
      const response = await api.get("/auth/drivers");
      setDrivers(response.data.drivers);
    } catch (err) {
      console.error("Failed to fetch drivers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const openAddModal = () => {
    setEditingDriver(null);
    setFormData(emptyForm);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      email: driver.email,
      password: "", // never pre-fill password
      phone: driver.phone || "",
      licenseNumber: driver.licenseNumber || "",
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (editingDriver) {
        // Editing doesn't touch password — that's a separate concern
        await api.put(`/auth/drivers/${editingDriver._id}`, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          licenseNumber: formData.licenseNumber,
        });
      } else {
        // Creating a new driver goes through the standard register
        // endpoint, forcing role: "driver"
        await api.post("/auth/register", {
          ...formData,
          role: "driver",
        });
      }
      setIsModalOpen(false);
      fetchDrivers();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (driver) => {
    const confirmed = window.confirm(`Delete driver "${driver.name}"?`);
    if (!confirmed) return;

    try {
      await api.delete(`/auth/drivers/${driver._id}`);
      fetchDrivers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete driver");
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "licenseNumber", label: "License #" },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>Manage Drivers</h1>
        <button
          className="btn-primary"
          style={{ width: "auto", padding: "10px 20px" }}
          onClick={openAddModal}
        >
          + Add Driver
        </button>
      </div>

      {loading ? (
        <p style={{ color: "#94a3b8" }}>Loading drivers...</p>
      ) : (
        <DataTable
          columns={columns}
          data={drivers}
          actions={(row) => (
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => openEditModal(row)}
                style={{
                  padding: "6px 12px",
                  fontSize: "13px",
                  backgroundColor: "#334155",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(row)}
                style={{
                  padding: "6px 12px",
                  fontSize: "13px",
                  backgroundColor: "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          )}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDriver ? "Edit Driver" : "Add New Driver"}
      >
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          {!editingDriver && (
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>License Number</label>
            <input
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting
              ? "Saving..."
              : editingDriver
              ? "Update Driver"
              : "Create Driver"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDrivers;