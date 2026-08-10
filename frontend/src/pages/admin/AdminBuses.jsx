// frontend/src/pages/admin/AdminBuses.jsx

import { useState, useEffect } from "react";
import api from "../../services/api";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";

const emptyForm = {
  busNumber: "",
  busType: "college",
  capacity: 40,
  assignedDriver: "",
  currentRoute: "",
  status: "inactive",
};

const AdminBuses = () => {
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [busesRes, driversRes, routesRes] = await Promise.all([
        api.get("/buses"),
        api.get("/auth/drivers"),
        api.get("/routes"),
      ]);
      setBuses(busesRes.data.buses);
      setDrivers(driversRes.data.drivers);
      setRoutes(routesRes.data.routes);
    } catch (err) {
      console.error("Failed to fetch bus data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingBus(null);
    setFormData(emptyForm);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (bus) => {
    setEditingBus(bus);
    setFormData({
      busNumber: bus.busNumber,
      busType: bus.busType,
      capacity: bus.capacity,
      assignedDriver: bus.assignedDriver?._id || "",
      currentRoute: bus.currentRoute?._id || "",
      status: bus.status,
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
      busNumber: formData.busNumber,
      busType: formData.busType,
      capacity: parseInt(formData.capacity),
      assignedDriver: formData.assignedDriver || null,
      currentRoute: formData.currentRoute || null,
      status: formData.status,
    };

    try {
      if (editingBus) {
        await api.put(`/buses/${editingBus._id}`, payload);
      } else {
        await api.post("/buses", payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (bus) => {
    const confirmed = window.confirm(`Delete bus "${bus.busNumber}"?`);
    if (!confirmed) return;

    try {
      await api.delete(`/buses/${bus._id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete bus");
    }
  };

  const columns = [
    { key: "busNumber", label: "Bus Number" },
    { key: "busType", label: "Type" },
    { key: "driverName", label: "Driver" },
    { key: "routeName", label: "Route" },
    { key: "status", label: "Status" },
  ];

  const renderCell = (row, col) => {
    if (col.key === "driverName") return row.assignedDriver?.name || "—";
    if (col.key === "routeName") return row.currentRoute?.routeName || "—";
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
        <h1>Manage Buses</h1>
        <button
          className="btn-primary"
          style={{ width: "auto", padding: "10px 20px" }}
          onClick={openAddModal}
        >
          + Add Bus
        </button>
      </div>

      {loading ? (
        <p style={{ color: "#94a3b8" }}>Loading buses...</p>
      ) : (
        <DataTable
          columns={columns}
          data={buses}
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
        title={editingBus ? "Edit Bus" : "Add New Bus"}
      >
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Bus Number</label>
            <input
              type="text"
              name="busNumber"
              value={formData.busNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Bus Type</label>
            <select name="busType" value={formData.busType} onChange={handleChange}>
              <option value="college">College</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="form-group">
            <label>Capacity</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              min="1"
            />
          </div>

          <div className="form-group">
            <label>Assigned Driver</label>
            <select
              name="assignedDriver"
              value={formData.assignedDriver}
              onChange={handleChange}
            >
              <option value="">— None —</option>
              {drivers.map((driver) => (
                <option key={driver._id} value={driver._id}>
                  {driver.name} ({driver.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Current Route</label>
            <select
              name="currentRoute"
              value={formData.currentRoute}
              onChange={handleChange}
            >
              <option value="">— None —</option>
              {routes.map((route) => (
                <option key={route._id} value={route._id}>
                  {route.routeName} ({route.routeNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Saving..." : editingBus ? "Update Bus" : "Create Bus"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminBuses;