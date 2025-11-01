import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/SupplyChainPortal.css";
import ChangePassword from "../auth/ChangePassword";

const SupplyChainPortal: React.FC = () => {
    const navigate = useNavigate();
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [productId, setProductId] = useState("");
    const [shipmentId, setShipmentId] = useState("");
    const [result, setResult] = useState<any>(null);
    const [shipmentResult, setShipmentResult] = useState<any>(null);
    const [role, setRole] = useState<string | null>(null);

    // Loading states for better UX
    const [loadingProduct, setLoadingProduct] = useState(false);
    const [loadingShipment, setLoadingShipment] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const [newProduct, setNewProduct] = useState({
        productId: "",
        productName: "",
        category: "",
        quantity: "",
    });

    const [updateProduct, setUpdateProduct] = useState({
        productId: "",
        // `addQuantity` makes it clear this value will be added to the current stock
        addQuantity: "",
    });

    const [deleteId, setDeleteId] = useState("");
    const [updateShipment, setUpdateShipment] = useState({
        shipmentId: "",
        status: "",
    });

    const [newShipment, setNewShipment] = useState({
        shipmentId: "",
        productId: "",
        origin: "",
        destination: "",
        carrier: "",
        quantity: "",
    });

    // New: place order feature (available to both admin and regular users)
    const [order, setOrder] = useState({ productId: "", quantity: "" });

    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
        } else {
            setRole(storedRole);
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    // Helper: safely parse JSON or return value if already object
    const safeParse = (maybeString: any) => {
        if (maybeString == null) return null;
        if (typeof maybeString === "object") return maybeString;
        try {
            return JSON.parse(maybeString);
        } catch (e) {
            return maybeString;
        }
    };

    // New helper: extract a useful message from various error shapes (axios errors, plain errors or server responses)
    const extractErrorMessage = (error: any, fallback: string) => {
        // Axios error with response body
        if (axios.isAxiosError(error)) {
            const resp = (error as any).response;
            if (resp) {
                // Common server patterns: { message: '...', error: '...' } or plain string body
                const data = resp.data;
                if (data) {
                    if (typeof data === "string") return data;
                    if (typeof data === "object") {
                        // try common fields
                        return data.message || data.error || JSON.stringify(data);
                    }
                }
                // if no data, include status text if available
                return resp.statusText || fallback;
            }
            // if no response (network error), return axios error message
            return error.message || fallback;
        }

        // Non-axios error
        if (error && typeof error === "object") {
            if (error.message) return error.message;
            try {
                return JSON.stringify(error);
            } catch (e) {
                return fallback;
            }
        }

        // Fallback to provided fallback or generic
        return fallback;
    };

    const handleQueryProduct = async () => {
        if (!productId.trim()) {
            alert("Please enter a Product ID to search.");
            return;
        }
        setLoadingProduct(true);
        setResult(null);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `http://localhost:8080/supplychainapp/fabric/assets/queryProduct/${encodeURIComponent(productId.trim())}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const parsed = safeParse(response?.data?.product ?? response?.data);
            setResult(parsed);
        } catch (error: any) {
            const msg = extractErrorMessage(error, "Product not found or unauthorized");
            alert(`❌ ${msg}`);
            console.error(error);
        } finally {
            setLoadingProduct(false);
        }
    };

    const handleQueryShipment = async () => {
        if (!shipmentId.trim()) {
            alert("Please enter a Shipment ID to search.");
            return;
        }
        setLoadingShipment(true);
        setShipmentResult(null);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `http://localhost:8080/supplychainapp/fabric/assets/queryShipment/${encodeURIComponent(shipmentId.trim())}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const parsed = safeParse(response?.data?.shipment ?? response?.data);
            setShipmentResult(parsed);
        } catch (error: any) {
            const msg = extractErrorMessage(error, "Shipment not found or unauthorized");
            alert(`❌ ${msg}`);
            console.error(error);
        } finally {
            setLoadingShipment(false);
        }
    };

    const handleCreateProduct = async () => {
        if (!newProduct.productId.trim() || !newProduct.productName.trim()) {
            alert("Please provide at least Product ID and Name.");
            return;
        }
        setActionLoading(true);
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                "http://localhost:8080/supplychainapp/fabric/assets/createProduct",
                { ...newProduct, productId: newProduct.productId.trim(), quantity: Number(newProduct.quantity) },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            alert("✅ Product created successfully");
        } catch (error: any) {
            const msg = extractErrorMessage(error, "Failed to create product");
            alert(`❌ ${msg}`);
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateProduct = async () => {
        if (!updateProduct.productId.trim() || !updateProduct.addQuantity.trim()) {
            alert("Please provide Product ID and quantity to add.");
            return;
        }
        setActionLoading(true);
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `http://localhost:8080/supplychainapp/fabric/assets/update/${encodeURIComponent(updateProduct.productId.trim())}`,
                // backend expects `quantity` but the UI now clearly indicates this is an additive value
                { quantity: Number(updateProduct.addQuantity) },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            alert("✅ Product updated successfully");
        } catch (error: any) {
            const msg = extractErrorMessage(error, "Failed to update product");
            alert(`❌ ${msg}`);
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteProduct = async () => {
        if (!deleteId.trim()) {
            alert("Please provide a Product ID to delete.");
            return;
        }
        if (!window.confirm(`Are you sure you want to delete product ${deleteId.trim()}?`)) return;
        setActionLoading(true);
        try {
            const token = localStorage.getItem("token");
            await axios.delete(
                `http://localhost:8080/supplychainapp/fabric/assets/removeProduct/${encodeURIComponent(deleteId.trim())}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            alert("✅ Product deleted successfully");
        } catch (error: any) {
            const msg = extractErrorMessage(error, "Failed to delete product");
            alert(`❌ ${msg}`);
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateShipment = async () => {
        if (!updateShipment.shipmentId.trim() || !updateShipment.status.trim()) {
            alert("Please provide Shipment ID and new status.");
            return;
        }
        setActionLoading(true);
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `http://localhost:8080/supplychainapp/fabric/assets/updateShipment/${encodeURIComponent(updateShipment.shipmentId.trim())}`,
                { status: updateShipment.status },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            alert("✅ Shipment updated successfully");
        } catch (error: any) {
            const msg = extractErrorMessage(error, "Failed to update shipment");
            alert(`❌ ${msg}`);
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCreateShipment = async () => {
        if (!newShipment.shipmentId.trim() || !newShipment.productId.trim()) {
            alert("Please provide at least Shipment ID and Product ID.");
            return;
        }
        setActionLoading(true);
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                "http://localhost:8080/supplychainapp/fabric/assets/createShipment",
                { ...newShipment, shipmentId: newShipment.shipmentId.trim(), quantity: Number(newShipment.quantity) },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            alert("✅ Shipment created successfully");
        } catch (error: any) {
            const msg = extractErrorMessage(error, "Failed to create shipment");
            alert(`❌ ${msg}`);
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (!order.productId.trim() || !order.quantity.trim()) {
            alert("Please provide Product ID and quantity to place an order.");
            return;
        }
        setActionLoading(true);
        try {
            const token = localStorage.getItem("token");
            // Backend expects numeric values for productId and quantity
            const payload = { productId: Number(order.productId), quantity: Number(order.quantity) };
            const response = await axios.post(
                "http://localhost:8080/supplychainapp/fabric/assets/placeOrder",
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            // Show server response in alert (or you can display it in UI)
            console.log("placeOrder response:", response?.data);
            alert("✅ Order placed successfully");
            // clear order inputs
            setOrder({ productId: "", quantity: "" });
        } catch (error: any) {
            const msg = extractErrorMessage(error, "Failed to place order");
            alert(`❌ ${msg}`);
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="query-page">
            <header className="query-header">
                <h1 className="portal-title">Supply Chain Portal</h1>
                {role && (
                    <>
                        <button className="logs-btn" onClick={() => navigate('/queryLogs')}>Query Logs</button>
                        <button className="change-password-btn" onClick={() => setShowChangePassword(true)}>
                            Change Password
                        </button>
                    </>
                )}
                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </header>

            {showChangePassword && (
                <div style={{ maxWidth: 480, margin: "16px auto" }}>
                    <ChangePassword onClose={() => setShowChangePassword(false)} />
                </div>
            )}

            {/* Query Product Section */}
            <div className="card">
                <h2>🔍 Query Product</h2>
                <input
                    type="text"
                    placeholder="Enter Product ID"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                />
                <button onClick={handleQueryProduct} disabled={loadingProduct}>
                    {loadingProduct ? "Searching..." : "Search"}
                </button>

                {result && (
                    <div className="result-card">
                        <h3>Product Details</h3>
                        <p><strong>ID:</strong> {result.id}</p>
                        <p><strong>Name:</strong> {result.name}</p>
                        <p><strong>Category:</strong> {result.category}</p>
                        <p><strong>Quantity:</strong> {result.quantity}</p>
                    </div>
                )}
            </div>

            {/* Query Shipment Section (Visible for all roles) */}
            <div className="card">
                <h2>🚚 Query Shipment</h2>
                <input
                    type="text"
                    placeholder="Enter Shipment ID"
                    value={shipmentId}
                    onChange={(e) => setShipmentId(e.target.value)}
                />
                <button onClick={handleQueryShipment} disabled={loadingShipment}>
                    {loadingShipment ? "Searching..." : "Search"}
                </button>

                {shipmentResult && (
                    <div className="result-card">
                        <h3>Shipment Details</h3>
                        <p><strong>ID:</strong> {shipmentResult.shipmentId}</p>
                        <p><strong>Product ID:</strong> {shipmentResult.productId}</p>
                        <p><strong>Origin:</strong> {shipmentResult.origin}</p>
                        <p><strong>Destination:</strong> {shipmentResult.destination}</p>
                        <p><strong>Carrier:</strong> {shipmentResult.carrier}</p>
                        <p><strong>Quantity:</strong> {shipmentResult.quantity}</p>
                        <p><strong>Status:</strong> {shipmentResult.status}</p>
                    </div>
                )}
            </div>

            {/* Place Order (available to all users) */}
            <div className="card">
                <h2>🛒 Place Order</h2>
                <input
                    placeholder="Product ID"
                    value={order.productId}
                    onChange={(e) => setOrder({ ...order, productId: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Quantity"
                    value={order.quantity}
                    onChange={(e) => setOrder({ ...order, quantity: e.target.value })}
                />
                <button onClick={handlePlaceOrder} disabled={actionLoading}>{actionLoading ? "Processing..." : "Place Order"}</button>
            </div>

            {/* Admin Section */}
            {role === "ROLE_ADMIN" && (
                <div className="admin-section">
                    <h2>🛠️ Admin Actions</h2>
                    {/* Create Product */}
                    <div className="card">
                        <h3>📦 Create Product</h3>
                        <input placeholder="Product ID" onChange={(e) => setNewProduct({ ...newProduct, productId: e.target.value })} />
                        <input placeholder="Name" onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })} />
                        <input placeholder="Category" onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} />
                        <input type="number" placeholder="Quantity" onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })} />
                        <button onClick={handleCreateProduct} disabled={actionLoading}>{actionLoading ? "Processing..." : "Create Product"}</button>
                    </div>
                    {/* Update Product */}
                    <div className="card">
                        <h3>✏️ Update Product</h3>
                        <input placeholder="Product ID" onChange={(e) => setUpdateProduct({ ...updateProduct, productId: e.target.value })} />
                        <input type="number" placeholder="Add Quantity (will be added to existing)" onChange={(e) => setUpdateProduct({ ...updateProduct, addQuantity: e.target.value })} />
                        <button onClick={handleUpdateProduct} disabled={actionLoading}>{actionLoading ? "Processing..." : "Update Product"}</button>
                    </div>

                    {/* Delete Product */}
                    <div className="card">
                        <h3>🗑️ Delete Product</h3>
                        <input placeholder="Product ID" onChange={(e) => setDeleteId(e.target.value)} />
                        <button onClick={handleDeleteProduct} disabled={actionLoading}>{actionLoading ? "Processing..." : "Delete Product"}</button>
                    </div>

                    {/* Update Shipment */}
                    <div className="card">
                        <h3>🚚 Update Shipment</h3>
                        <input placeholder="Shipment ID" onChange={(e) => setUpdateShipment({ ...updateShipment, shipmentId: e.target.value })} />
                        <input placeholder="New Status" onChange={(e) => setUpdateShipment({ ...updateShipment, status: e.target.value })} />
                        <button onClick={handleUpdateShipment} disabled={actionLoading}>{actionLoading ? "Processing..." : "Update Shipment"}</button>
                    </div>

                    {/* Create Shipment */}
                    <div className="card">
                        <h3>📦 Create Shipment</h3>
                        <input placeholder="Shipment ID" onChange={(e) => setNewShipment({ ...newShipment, shipmentId: e.target.value })} />
                        <input placeholder="Product ID" onChange={(e) => setNewShipment({ ...newShipment, productId: e.target.value })} />
                        <input placeholder="Origin" onChange={(e) => setNewShipment({ ...newShipment, origin: e.target.value })} />
                        <input placeholder="Destination" onChange={(e) => setNewShipment({ ...newShipment, destination: e.target.value })} />
                        <input placeholder="Carrier" onChange={(e) => setNewShipment({ ...newShipment, carrier: e.target.value })} />
                        <input type="number" placeholder="Quantity" onChange={(e) => setNewShipment({ ...newShipment, quantity: e.target.value })} />
                        <button onClick={handleCreateShipment} disabled={actionLoading}>{actionLoading ? "Processing..." : "Create Shipment"}</button>
                    </div>
                </div>

            )}
        </div>
    );
};

export default SupplyChainPortal;
