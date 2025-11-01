import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

type LogEntry = {
  action: string;
  logId: string;
  quantity?: number;
  productId?: string;
  shipmentId?: string;
  timestamp?: string;
};

const containerStyle: React.CSSProperties = {
  maxWidth: 980,
  margin: "20px auto",
  padding: 18,
  borderRadius: 12,
  background: "#fff",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
  fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
};

const labelStyle: React.CSSProperties = { fontSize: 13, color: "#334155" };
const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #e6e9ef",
  outline: "none",
  fontSize: 14,
  width: 160,
};

export default function QueryLogByProduct() {
  const navigate = useNavigate();
  const [productId, setProductId] = useState("1");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  // token is read directly from localStorage when making the request (keeps it hidden from UI)

  const fetchLogs = async () => {
    setError(null);
    setLogs(null);
    if (!productId || productId.trim() === "") {
      setError("Please enter a product id");
      return;
    }

    setLoading(true);
    try {
      const url = `${API_BASE}/supplychainapp/fabric/assets/queryLogByProductId/${encodeURIComponent(
        productId
      )}`;

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      // read token silently from localStorage (do not expose it in the UI)
      try {
        const t =
          localStorage.getItem("token") ||
          localStorage.getItem("authToken") ||
          (() => {
            const user = localStorage.getItem("user");
            if (!user) return null;
            try {
              const obj = JSON.parse(user);
              return obj?.token || obj?.accessToken || null;
            } catch (e) {
              return null;
            }
          })();

        if (t) {
          headers["Authorization"] = t.startsWith("Bearer ") ? t : `Bearer ${t}`;
        }
      } catch (e) {
        // ignore localStorage read errors
      }

      const resp = await axios.get(url, { headers });

      // Response shape in example: { product: "[ {...}, {...} ]" }
      const data = resp?.data;
      let parsed: LogEntry[] = [];

      if (data == null) {
        throw new Error("Empty response");
      }

      const maybe = data.product ?? data;

      if (typeof maybe === "string") {
        // sometimes API returns a JSON string
        try {
          parsed = JSON.parse(maybe);
        } catch (e) {
          // fallback: try to extract JSON-like substring
          const match = maybe.match(/\[.*\]/s);
          if (match) parsed = JSON.parse(match[0]);
          else throw e;
        }
      } else if (Array.isArray(maybe)) {
        parsed = maybe;
      } else if (typeof maybe === "object" && Array.isArray((maybe as any).product)) {
        parsed = (maybe as any).product;
      } else {
        // unknown format, try to treat the whole response as array
        if (Array.isArray(data)) parsed = data;
        else throw new Error("Unexpected response format");
      }

      setLogs(parsed);
    } catch (err: any) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        // show status and message for easier debugging
        const status = err.response?.status ? `(${err.response.status}) ` : "";
        setError(`${status}${err.message || "Network error"}`);
      } else {
        setError(err?.message || String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle} role="region" aria-label="Query logs by product id">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => navigate('/queryProduct')}
            aria-label="Go back to main page"
            style={{
              padding: "8px 12px",
              background: "#0ea5e9",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              boxShadow: "0 6px 18px rgba(14,165,233,0.18)",
              fontWeight: 600,
            }}
          >
            ← Back
          </button>
          <div>
            <h3 style={{ margin: 0 }}>Query Logs by Product Id</h3>
            <div style={{ marginTop: 6, color: "#64748b", fontSize: 13 }}>
              Enter a product id and click Fetch to view audit logs returned by the ledger.
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label style={labelStyle}>
            Product Id
            <input
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              style={{ ...inputStyle, marginLeft: 8 }}
              aria-label="product-id"
            />
          </label>

          <button
            onClick={fetchLogs}
            disabled={loading}
            style={{
              padding: "10px 16px",
              background: "linear-gradient(90deg,#16a34a,#10b981)",
              color: "white",
              border: "none",
              borderRadius: 10,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 8px 24px rgba(16,185,129,0.16)",
              fontWeight: 600,
            }}
          >
            {loading ? "Loading…" : "Fetch"}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        {error && (
          <div style={{ padding: 12, background: "#fff5f5", color: "#991b1b", borderRadius: 8 }}>
            Error: {error}
          </div>
        )}

        {logs == null && !error && (
          <div style={{ marginTop: 8, color: "#64748b" }}>No results yet. Enter a product id and press Fetch.</div>
        )}

        {Array.isArray(logs) && (
          <div style={{ overflowX: "auto", marginTop: 14 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#475569" }}>
                  <th style={{ padding: "10px 8px", borderBottom: "1px solid #e6e9ef" }}>Timestamp</th>
                  <th style={{ padding: "10px 8px", borderBottom: "1px solid #e6e9ef" }}>Action</th>
                  <th style={{ padding: "10px 8px", borderBottom: "1px solid #e6e9ef" }}>Quantity</th>
                  <th style={{ padding: "10px 8px", borderBottom: "1px solid #e6e9ef" }}>Shipment</th>
                  <th style={{ padding: "10px 8px", borderBottom: "1px solid #e6e9ef" }}>Log Id</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l, idx) => (
                  <tr key={l.logId || idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 8px", color: "#374151", width: 220 }}>
                      {l.timestamp ? new Date(l.timestamp).toLocaleString() : "-"}
                    </td>
                    <td style={{ padding: "10px 8px", color: "#0f172a", fontWeight: 600 }}>{l.action}</td>
                    <td style={{ padding: "10px 8px" }}>{l.quantity ?? "-"}</td>
                    <td style={{ padding: "10px 8px" }}>{l.shipmentId ?? "-"}</td>
                    <td style={{ padding: "10px 8px", fontFamily: "monospace", color: "#475569" }}>{l.logId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
