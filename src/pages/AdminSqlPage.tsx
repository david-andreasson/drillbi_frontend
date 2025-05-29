import React, { useState } from "react";

const AdminSqlPage = () => {
  const [sql, setSql] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/admin/sql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data && typeof data === 'object' && data.error) {
          setError(data.error);
        } else if (typeof data === 'string') {
          setError(data);
        } else {
          setError(JSON.stringify(data));
        }
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #0001" }}>
      <h2>Admin SQL-gränssnitt</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={sql}
          onChange={e => setSql(e.target.value)}
          rows={6}
          style={{ width: "100%", fontFamily: "monospace", marginBottom: 12 }}
          placeholder="Skriv ditt SQL-kommando här..."
        />
        <button type="submit" disabled={loading || !sql.trim()} style={{ padding: "8px 24px" }}>
          {loading ? "Kör..." : "Kör SQL"}
        </button>
      </form>
      {error && <div style={{ color: "red", marginTop: 16 }}>Fel: {String(error)}</div>}
      {result && (
        <div style={{ marginTop: 24 }}>
          <h4>Resultat:</h4>
          <pre style={{ background: "#f4f4f4", padding: 12, borderRadius: 4, overflowX: "auto" }}>
            {typeof result === "object" ? JSON.stringify(result, null, 2) : String(result)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AdminSqlPage;
