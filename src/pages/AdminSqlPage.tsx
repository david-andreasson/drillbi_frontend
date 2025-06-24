import React, { useState } from "react";
import { useTranslation } from 'react-i18next';

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
      // Fallback: Send directly to backend port in dev mode, otherwise use proxy path
      const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const backendPort = 8080; // Change if your backend runs on another port
      const apiBase = isDev ? `http://localhost:${backendPort}` : "";
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await fetch(`${apiBase}/admin/sql`, {
        method: "POST",
        headers,
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

  const { t } = useTranslation();
  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 24 }} className="bg-white dark:bg-neutral-900 dark:text-neutral-100 rounded shadow">
      <h2 className="dark:text-neutral-100">{t('adminSql.title')}</h2>

      <form onSubmit={handleSubmit}>
        <textarea
          value={sql}
          onChange={e => setSql(e.target.value)}
          rows={6}
          className="w-full font-mono mb-3 bg-gray-100 text-neutral-900 border border-gray-300 rounded dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700 dark:placeholder-gray-400"
          placeholder={t('adminSql.sqlPlaceholder')}
        />
        <button type="submit" disabled={loading || !sql.trim()} className="px-6 py-2 rounded bg-gray-200 text-neutral-900 hover:bg-gray-300 dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-600 transition">
          {loading ? t('adminSql.running') : t('adminSql.runSql')}
        </button>
      </form>
      {error && <div style={{ color: "red", marginTop: 16 }}>{t('adminSql.error')}: {String(error)}</div>}
      {result && (
        <div style={{ marginTop: 24 }}>
          <h4>{t('adminSql.result')}</h4>
          <pre style={{ background: "#f4f4f4", padding: 12, borderRadius: 4, overflowX: "auto" }}>
            {typeof result === "object" ? JSON.stringify(result, null, 2) : String(result)}
          </pre>
        </div>
      )}
      <div style={{ marginTop: 32, background: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: 6, padding: 16 }}>
        <h4 style={{ marginBottom: 10 }}>{t('adminSql.commonCommands')}</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <b>{t('adminSql.listUsers')}</b>
            <pre style={{ background: '#f4f4f4', padding: 8, borderRadius: 4, margin: 0 }}>SELECT * FROM users;</pre>
          </div>
          <div>
            <b>{t('adminSql.listCourses')}</b>
            <pre style={{ background: '#f4f4f4', padding: 8, borderRadius: 4, margin: 0 }}>SELECT * FROM course;</pre>
          </div>
          <div>
            <b>{t('adminSql.deleteUser')}</b>
            <pre style={{ background: '#f4f4f4', padding: 8, borderRadius: 4, margin: 0 }}>DELETE FROM users WHERE id = 1;</pre>
          </div>
          <div>
            <b>{t('adminSql.deleteCourse')}</b>
            <pre style={{ background: '#f4f4f4', padding: 8, borderRadius: 4, margin: 0 }}>DELETE FROM course WHERE id = 1;</pre>
          </div>
          <div>
            <b>{t('adminSql.deleteOptionsForCourseX')}</b>
            <pre style={{ background: '#f4f4f4', padding: 8, borderRadius: 4, margin: 0 }}>DELETE FROM question_option
WHERE question_id IN 
(
  SELECT id
  FROM question
  WHERE course_id = X
);
</pre>
          </div>
          <div>
            <b>{t('adminSql.deleteAllQuestionsForCourseX')}</b>
            <pre style={{ background: '#f4f4f4', padding: 8, borderRadius: 4, margin: 0 }}>DELETE FROM question
WHERE course_id = X;</pre>
          </div>
          <div>
            <b>{t('adminSql.listQuestions')}</b>
            <pre style={{ background: '#f4f4f4', padding: 8, borderRadius: 4, margin: 0 }}>SELECT * FROM question;</pre>
          </div>
          <div>
            <b>{t('adminSql.deleteQuestion')}</b>
            <pre style={{ background: '#f4f4f4', padding: 8, borderRadius: 4, margin: 0 }}>DELETE FROM question WHERE id = 1;</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSqlPage;
