// frontend/src/pages/admin/AdminStops.jsx

import { useState, useEffect } from "react";
import api from "../../services/api";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";

const emptyForm = { stopName: "", longitude: "", latitude: "" };

const AdminStops = () => {
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStop, setEditingStop] = useState(null); // null = creating new
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchStops = async () => {
    try {
      const response = await api.get("/stops");
      setStops(response.data.stops);
    } catch (err) {
      console.error("Failed to fetch stops:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStops();
  }, []);

  const openAddModal = () => {
    setEditingStop(null);
    setFormData(emptyForm);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (stop) => {
    setEditingStop(stop);
    setFormData({
      stopName: stop.stopName,
      longitude: stop.location.coordinates[0],
      latitude: stop.location.coordinates[1],
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

    const payload = {
      stopName: formData.stopName,
      longitude: parseFloat(formData.longitude),
      latitude: parseFloat(formData.latitude),
    };

    try {
      if (editingStop) {
        await api.put(`/stops/${editingStop._id}`, payload);
      } else {
        await api.post("/stops", payload);
      }
      setIsModalOpen(false);
      fetchStops();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (stop) => {
    const confirmed = window.confirm(
      `Delete stop "${stop.stopName}"? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await api.delete(`/stops/${stop._id}`);
      fetchStops();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete stop");
    }
  };

  const columns = [
    { key: "stopName", label: "Stop Name" },
    { key: "longitude", label: "Longitude" },
    { key: "latitude", label: "Latitude" },
  ];

  const renderCell = (row, col) => {
    if (col.key === "longitude") return row.location.coordinates[0];
    if (col.key === "latitude") return row.location.coordinates[1];
    return row[col.key];
  };

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
        <h1>Manage Stops</h1>
        <button
          className="btn-primary"
          style={{ width: "auto", padding: "10px 20px" }}
          onClick={openAddModal}
        >
          + Add Stop
        </button>
      </div>

      {loading ? (
        <p style={{ color: "#94a3b8" }}>Loading stops...</p>
      ) : (
        <DataTable
          columns={columns}
          data={stops}
          renderCell={renderCell}
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
        title={editingStop ? "Edit Stop" : "Add New Stop"}
      >
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Stop Name</label>
            <input
              type="text"
              name="stopName"
              value={formData.stopName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Longitude</label>
            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Latitude</label>
            <input
              type="number"
              step="any"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Saving..." : editingStop ? "Update Stop" : "Create Stop"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminStops;