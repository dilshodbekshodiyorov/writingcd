"use client";
import { useState, useEffect } from "react";

interface User { id: string; firstName: string; lastName: string; email: string }
interface Submission {
  id: string; text: string; submittedAt: string;
  teacherScore: number | null; teacherFeedback: string | null;
  status: string; test: { type: string; title: string };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("uz-UZ", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Submission | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.user && d.user.role === "STUDENT") {
        setUser(d.user);
        fetch("/api/submissions").then(r => r.json()).then(s => { setSubmissions(s.submissions ?? []); setLoading(false); });
      } else { window.location.href = "/"; }
    });
  }, []);

  async function handleLogout() { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/"; }

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280" }}>Yuklanmoqda...</div>;

  const approved = submissions.filter(s => s.status === "APPROVED");
  const avgScore = approved.length ? (approved.reduce((a, s) => a + (s.teacherScore ?? 0), 0) / approved.length).toFixed(1) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: "#111", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>W</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#111" }}>WritingCD</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/" style={{ fontSize: 13, color: "#374151", textDecoration: "none" }}>← Testlar</a>
          <button onClick={handleLogout} style={{ border: "1px solid #D1D5DB", borderRadius: 6, padding: "5px 12px", fontSize: 13, background: "#fff", cursor: "pointer" }}>Chiqish</button>
        </div>
      </header>

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
        {/* Profile card */}
        <div style={{ border: "1px solid #E5E7EB", borderRadius: 12, padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ width: 52, height: 52, background: "#111", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>{user?.firstName[0]}{user?.lastName[0]}</span>
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 18, color: "#111" }}>{user?.firstName} {user?.lastName}</p>
            <p style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>{user?.email}</p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 20, flexWrap: "wrap" }}>
            {[
              { label: "Jami", value: submissions.length, color: "#111" },
              { label: "Baholandi", value: approved.length, color: "#16A34A" },
              { label: "Kutilmoqda", value: submissions.filter(s => s.status === "PENDING").length, color: "#D97706" },
              ...(avgScore ? [{ label: "O'rtacha", value: avgScore, color: "#3B82F6" }] : []),
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <p style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</p>
                <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {selected ? (
          <div>
            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", fontSize: 13, marginBottom: 16, padding: 0 }}>← Orqaga</button>

            {/* Test info */}
            <div style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "16px 20px", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ background: "#F3F4F6", borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 700, color: "#374151" }}>{selected.test.type}</span>
                <span style={{ fontWeight: 600, fontSize: 15, color: "#111" }}>{selected.test.title}</span>
                <span style={{ marginLeft: "auto", fontSize: 12, color: "#9CA3AF" }}>{formatDate(selected.submittedAt)}</span>
              </div>
              <div style={{ background: "#F9FAFB", borderRadius: 8, padding: "12px 14px", maxHeight: 280, overflowY: "auto" }}>
                <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{selected.text}</p>
              </div>
              <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 8 }}>
                So'zlar soni: {selected.text.trim().split(/\s+/).length}
              </p>
            </div>

            {/* Score - always visible */}
            <div style={{ border: `1.5px solid ${selected.status === "APPROVED" ? "#BBF7D0" : "#FDE68A"}`, background: selected.status === "APPROVED" ? "#F0FDF4" : "#FFFBEB", borderRadius: 12, padding: "20px 24px", marginBottom: selected.teacherFeedback ? 14 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: selected.status === "APPROVED" ? "#065F46" : "#92400E", marginBottom: 4 }}>
                    {selected.status === "APPROVED" ? "O'qituvchi bahosi" : "⏳ O'qituvchi baholashi kutilmoqda"}
                  </p>
                  {selected.status === "PENDING" && (
                    <p style={{ fontSize: 13, color: "#B45309" }}>Tez orada natijangiz tayyor bo'ladi</p>
                  )}
                </div>
                {selected.status === "APPROVED" && selected.teacherScore !== null && (
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 52, fontWeight: 800, color: "#16A34A", lineHeight: 1 }}>{selected.teacherScore.toFixed(1)}</p>
                    <p style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>/ 9.0</p>
                  </div>
                )}
              </div>
            </div>

            {selected.teacherFeedback && (
              <div style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "16px 20px" }}>
                <p style={{ fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 8 }}>O'qituvchi izohi:</p>
                <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7 }}>{selected.teacherFeedback}</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 14, color: "#111" }}>Mening topshiriqlarim</h2>
            {submissions.length === 0 ? (
              <div style={{ border: "1px solid #E5E7EB", borderRadius: 12, padding: "40px 24px", textAlign: "center" }}>
                <p style={{ fontSize: 32, marginBottom: 10 }}>📝</p>
                <p style={{ color: "#6B7280", fontSize: 15 }}>Hali topshiriq yo'q</p>
                <a href="/" style={{ display: "inline-block", marginTop: 14, background: "#111", color: "#fff", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>Test boshlash →</a>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {submissions.map(s => (
                  <button key={s.id} onClick={() => setSelected(s)}
                    style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "14px 18px", textAlign: "left", background: "#fff", cursor: "pointer", width: "100%" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#111"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#E5E7EB"}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ background: "#F3F4F6", borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 700, color: "#374151" }}>{s.test.type}</span>
                        <span style={{ fontWeight: 600, fontSize: 14, color: "#111" }}>{s.test.title}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {s.status === "APPROVED" && s.teacherScore !== null ? (
                          <span style={{ fontWeight: 800, fontSize: 20, color: "#16A34A" }}>{s.teacherScore.toFixed(1)}</span>
                        ) : (
                          <span style={{ background: "#FEF3C7", color: "#92400E", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>Kutilmoqda</span>
                        )}
                        <span style={{ fontSize: 12, color: "#9CA3AF" }}>{formatDate(s.submittedAt)}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
