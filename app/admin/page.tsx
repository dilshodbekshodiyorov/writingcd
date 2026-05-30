"use client";
import { useState, useEffect } from "react";

interface Stats { totalSubmissions: number; pendingCount: number; approvedCount: number; totalTests: number; totalTeachers: number; totalStudents: number }
interface Teacher { id: string; name: string; email: string; createdAt: string }
interface Submission {
  id: string; submittedAt: string; status: string;
  teacherScore: number | null;
  student: { firstName: string; lastName: string };
  test: { type: string; title: string };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("uz-UZ", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [tab, setTab] = useState<"stats" | "submissions" | "teachers">("stats");
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.user?.role === "ADMIN") setUser(d.user);
      setChecking(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch("/api/admin/stats").then(r => r.json()).then(d => setStats(d.stats));
    fetch("/api/admin/teachers").then(r => r.json()).then(d => setTeachers(d.teachers ?? []));
    fetch("/api/submissions").then(r => r.json()).then(d => setSubmissions(d.submissions ?? []));
  }, [user]);

  async function handleLogin() {
    setLoginLoading(true); setLoginError("");
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, role: "TEACHER" }) });
    const d = await res.json();
    if (d.user?.role === "ADMIN") setUser(d.user);
    else setLoginError("Admin huquqi yo'q yoki parol noto'g'ri");
    setLoginLoading(false);
  }

  async function handleLogout() { await fetch("/api/auth/logout", { method: "POST" }); setUser(null); }

  async function handleAddTeacher() {
    setAdding(true); setAddMsg("");
    const res = await fetch("/api/admin/teachers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: newEmail, name: newName, password: newPassword }) });
    const d = await res.json();
    if (d.teacher) { setTeachers(p => [d.teacher, ...p]); setNewEmail(""); setNewName(""); setNewPassword(""); setAddMsg("✅ Qo'shildi!"); }
    else setAddMsg("❌ " + (d.error ?? "Xato"));
    setAdding(false);
  }

  if (checking) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280" }}>Yuklanmoqda...</div>;

  if (!user) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 40, height: 40, background: "#111", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <span style={{ color: "#fff", fontWeight: 800 }}>W</span>
          </div>
          <h2 style={{ fontWeight: 700, fontSize: 20, color: "#111" }}>SuperAdmin kirish</h2>
        </div>
        {[{ label: "Email", val: email, set: setEmail, type: "email", ph: "admin@writingcd.uz" }, { label: "Parol", val: password, set: setPassword, type: "password", ph: "••••••••" }].map(f => (
          <div key={f.label} style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}>{f.label}</label>
            <input type={f.type} value={f.val} onChange={e => { f.set(e.target.value); setLoginError(""); }} placeholder={f.ph}
              style={{ width: "100%", border: `1px solid ${loginError ? "#DC2626" : "#D1D5DB"}`, borderRadius: 7, padding: "9px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
        ))}
        {loginError && <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 10 }}>{loginError}</p>}
        <button onClick={handleLogin} disabled={loginLoading}
          style={{ width: "100%", background: "#111", color: "#fff", border: "none", borderRadius: 8, padding: 11, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
          {loginLoading ? "Yuklanmoqda..." : "Kirish"}
        </button>
        <p style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", marginTop: 14 }}>admin@writingcd.uz / Admin@12345</p>
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <a href="/" style={{ fontSize: 13, color: "#6B7280", textDecoration: "none" }}>← Bosh sahifa</a>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <header style={{ background: "#111", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: "#fff", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#111", fontWeight: 800, fontSize: 13 }}>W</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>WritingCD</span>
          <span style={{ background: "#374151", color: "#D1D5DB", borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>SuperAdmin</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a href="/teacher" style={{ fontSize: 13, color: "#9CA3AF", textDecoration: "none" }}>Teacher Panel</a>
          <button onClick={handleLogout} style={{ border: "1px solid #374151", borderRadius: 6, padding: "5px 12px", fontSize: 13, background: "transparent", color: "#9CA3AF", cursor: "pointer" }}>Chiqish</button>
        </div>
      </header>

      <div style={{ borderBottom: "1px solid #E5E7EB", display: "flex", padding: "0 24px" }}>
        {[{ id: "stats", label: "📊 Statistika" }, { id: "submissions", label: "📝 Barcha ishlar" }, { id: "teachers", label: "👨‍🏫 O'qituvchilar" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            style={{ background: "none", border: "none", borderBottom: tab === t.id ? "2px solid #111" : "2px solid transparent", padding: "12px 18px", fontWeight: tab === t.id ? 700 : 400, fontSize: 14, color: tab === t.id ? "#111" : "#6B7280", cursor: "pointer", marginBottom: -1 }}>
            {t.label}
          </button>
        ))}
      </div>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>
        {tab === "stats" && stats && (
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 18, color: "#111", marginBottom: 20, marginTop: 0 }}>Umumiy statistika</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 28 }}>
              {[
                { label: "Jami topshiriqlar", value: stats.totalSubmissions, color: "#3B82F6" },
                { label: "Kutilmoqda", value: stats.pendingCount, color: "#D97706" },
                { label: "Baholandi", value: stats.approvedCount, color: "#16A34A" },
                { label: "Testlar", value: stats.totalTests, color: "#8B5CF6" },
                { label: "O'qituvchilar", value: stats.totalTeachers, color: "#EC4899" },
                { label: "O'quvchilar", value: stats.totalStudents, color: "#111" },
              ].map(s => (
                <div key={s.label} style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "16px 18px" }}>
                  <p style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 }}>{s.label}</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "submissions" && (
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 18, color: "#111", marginBottom: 16, marginTop: 0 }}>Barcha topshiriqlar ({submissions.length})</h2>
            <div style={{ border: "1px solid #E5E7EB", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
                  <thead>
                    <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                      {["O'quvchi", "Task", "So'zlar", "Baho", "Status", "Vaqt"].map(h => (
                        <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map(s => (
                      <tr key={s.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 600, color: "#111" }}>{(s as any).student?.firstName} {(s as any).student?.lastName}</td>
                        <td style={{ padding: "12px 16px" }}><span style={{ background: "#F3F4F6", color: "#374151", borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{s.test.type}</span></td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#6B7280" }}>{(s as any).text?.trim().split(/\s+/).length ?? "—"}</td>
                        <td style={{ padding: "12px 16px", fontWeight: 700, fontSize: 16, color: s.teacherScore ? "#16A34A" : "#9CA3AF" }}>{s.teacherScore?.toFixed(1) ?? "—"}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ background: s.status === "APPROVED" ? "#F0FDF4" : "#FFFBEB", color: s.status === "APPROVED" ? "#065F46" : "#92400E", border: `1px solid ${s.status === "APPROVED" ? "#BBF7D0" : "#FDE68A"}`, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>
                            {s.status === "APPROVED" ? "Baholandi" : "Kutilmoqda"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#9CA3AF", whiteSpace: "nowrap" }}>{formatDate(s.submittedAt)}</td>
                      </tr>
                    ))}
                    {submissions.length === 0 && <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#9CA3AF" }}>Hozircha topshiriqlar yo'q</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "teachers" && (
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 18, color: "#111", marginBottom: 20, marginTop: 0 }}>O'qituvchilar</h2>
            <div style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "20px", marginBottom: 24 }}>
              <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Yangi o'qituvchi qo'shish</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                {[{ label: "Ism", val: newName, set: setNewName, ph: "Shodiyorov Dilshod" }, { label: "Email", val: newEmail, set: setNewEmail, ph: "aziz@writingcd.uz" }, { label: "Parol", val: newPassword, set: setNewPassword, ph: "Parol@123" }].map(f => (
                  <div key={f.label}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>{f.label}</label>
                    <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                      style={{ width: "100%", border: "1px solid #D1D5DB", borderRadius: 6, padding: "8px 10px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>
              {addMsg && <p style={{ fontSize: 13, color: addMsg.startsWith("✅") ? "#16A34A" : "#DC2626", marginBottom: 10 }}>{addMsg}</p>}
              <button onClick={handleAddTeacher} disabled={adding}
                style={{ background: "#111", color: "#fff", border: "none", borderRadius: 7, padding: "8px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                {adding ? "Qo'shilmoqda..." : "Qo'shish"}
              </button>
            </div>

            <div style={{ border: "1px solid #E5E7EB", borderRadius: 10, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                    {["Ism", "Email", "Qo'shilgan"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {teachers.map(t => (
                    <tr key={t.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "#111" }}>{t.name}</td>
                      <td style={{ padding: "12px 16px", color: "#6B7280", fontSize: 14 }}>{t.email}</td>
                      <td style={{ padding: "12px 16px", color: "#9CA3AF", fontSize: 13 }}>{formatDate(t.createdAt)}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <button
                          onClick={async () => {
                            if (!confirm(`"${t.name}" ni o'chirasizmi?`)) return;
                            const res = await fetch(`/api/admin/teachers/${t.id}`, { method: "DELETE" });
                            if (res.ok) setTeachers(p => p.filter(x => x.id !== t.id));
                            else alert("O'chirishda xato!");
                          }}
                          style={{ border: "1px solid #FECACA", borderRadius: 6, padding: "4px 10px", fontSize: 12, background: "#FEF2F2", color: "#DC2626", cursor: "pointer", fontWeight: 600 }}>
                          O'chirish
                        </button>
                      </td>
                    </tr>
                  ))}
                  {teachers.length === 0 && <tr><td colSpan={3} style={{ padding: 24, textAlign: "center", color: "#9CA3AF" }}>O'qituvchilar yo'q</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
