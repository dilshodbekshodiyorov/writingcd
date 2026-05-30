"use client";
import { useState, useEffect, useRef } from "react";

interface User { id: string; name: string; email: string; role: string }
interface Test { id: string; type: string; title: string; prompt: string; imageUrl?: string }
interface Submission {
  id: string; text: string; submittedAt: string;
  teacherScore: number | null; teacherFeedback: string | null;
  status: string; testId: string;
  student: { firstName: string; lastName: string; email: string };
  test: { id: string; type: string; title: string };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("uz-UZ", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function TeacherPage() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [tab, setTab] = useState<"submissions" | "addTest">("submissions");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [selected, setSelected] = useState<Submission | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.user && (d.user.role === "TEACHER" || d.user.role === "ADMIN")) setUser(d.user);
      setChecking(false);
    }).catch(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch("/api/submissions").then(r => r.json()).then(d => setSubmissions(d.submissions ?? []));
    fetch("/api/tests").then(r => r.json()).then(d => setTests(d.tests ?? []));
  }, [user]);

  async function handleLogin() {
    setLoginLoading(true); setLoginError("");
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, role: "TEACHER" }) });
    const d = await res.json();
    if (d.user) setUser(d.user); else setLoginError(d.error ?? "Xato");
    setLoginLoading(false);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" }); setUser(null);
  }

  if (checking) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280" }}>Yuklanmoqda...</div>;

  if (!user) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 40, height: 40, background: "#111", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <span style={{ color: "#fff", fontWeight: 800 }}>W</span>
          </div>
          <h2 style={{ fontWeight: 700, fontSize: 20, color: "#111" }}>O'qituvchi kirish</h2>
          <p style={{ color: "#6B7280", fontSize: 13, marginTop: 3 }}>WritingCD Teacher Panel</p>
        </div>
        {[{ label: "Email", val: email, set: setEmail, type: "email", ph: "teacher@writingcd.uz" }, { label: "Parol", val: password, set: setPassword, type: "password", ph: "••••••••" }].map(f => (
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
        <p style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", marginTop: 14 }}>
          teacher@writingcd.uz / Teacher@123
        </p>
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <a href="/" style={{ fontSize: 13, color: "#6B7280", textDecoration: "none" }}>← Bosh sahifaga</a>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: "#111", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>W</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>WritingCD</span>
          <span style={{ background: "#F3F4F6", color: "#374151", borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
            {user.role === "ADMIN" ? "Admin" : "Teacher"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: "#6B7280" }}>{user.name}</span>
          {user.role === "ADMIN" && <a href="/admin" style={{ fontSize: 13, color: "#374151", fontWeight: 600, textDecoration: "none" }}>Admin panel →</a>}
          <button onClick={handleLogout} style={{ border: "1px solid #D1D5DB", borderRadius: 6, padding: "5px 12px", fontSize: 13, background: "#fff", cursor: "pointer" }}>Chiqish</button>
        </div>
      </header>

      <div style={{ borderBottom: "1px solid #E5E7EB", display: "flex", padding: "0 24px" }}>
        {[{ id: "submissions", label: "O'quvchilar ishlari" }, { id: "addTest", label: "Test qo'shish" }].map(t => (
          <button key={t.id} onClick={() => { setTab(t.id as "submissions" | "addTest"); setSelected(null); }}
            style={{ background: "none", border: "none", borderBottom: tab === t.id ? "2px solid #111" : "2px solid transparent", padding: "12px 18px", fontWeight: tab === t.id ? 700 : 400, fontSize: 14, color: tab === t.id ? "#111" : "#6B7280", cursor: "pointer", marginBottom: -1 }}>
            {t.label}
          </button>
        ))}
      </div>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>
        {tab === "submissions" && (
          selected
            ? <SubmissionDetail sub={selected} onBack={() => setSelected(null)}
              onSave={updated => { setSubmissions(p => p.map(s => s.id === updated.id ? updated : s)); setSelected(updated); }} />
            : <SubmissionList submissions={submissions} onSelect={setSelected} />
        )}
        {tab === "addTest" && <AddTestForm onAdd={t => setTests(p => [t, ...p])} tests={tests} onDelete={id => setTests(p => p.filter(t => t.id !== id))} />}
      </main>
    </div>
  );
}

function SubmissionList({ submissions, onSelect }: { submissions: Submission[]; onSelect: (s: Submission) => void }) {
  const [filter, setFilter] = useState("barchasi");
  const filtered = filter === "barchasi" ? submissions : submissions.filter(s => s.status === (filter === "kutilmoqda" ? "PENDING" : "APPROVED"));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ fontWeight: 700, fontSize: 18, color: "#111", margin: 0 }}>Topshiriqlar ({submissions.length})</h2>
        <div style={{ display: "flex", gap: 6 }}>
          {["barchasi", "kutilmoqda", "baholandi"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ background: filter === f ? "#111" : "#fff", color: filter === f ? "#fff" : "#374151", border: "1px solid " + (filter === f ? "#111" : "#D1D5DB"), borderRadius: 6, padding: "5px 12px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ border: "1px solid #E5E7EB", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                {["O'quvchi", "Task", "Topshirilgan", "Baho", "Status", ""].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.3 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                  <td style={{ padding: "13px 16px", fontWeight: 600, color: "#111", fontSize: 14 }}>{s.student.firstName} {s.student.lastName}</td>
                  <td style={{ padding: "13px 16px" }}><span style={{ background: "#F3F4F6", color: "#374151", borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{s.test.type}</span></td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "#6B7280", whiteSpace: "nowrap" }}>{formatDate(s.submittedAt)}</td>
                  <td style={{ padding: "13px 16px", fontWeight: 700, fontSize: 16, color: s.teacherScore ? "#16A34A" : "#9CA3AF" }}>{s.teacherScore?.toFixed(1) ?? "—"}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ background: s.status === "APPROVED" ? "#F0FDF4" : "#FFFBEB", color: s.status === "APPROVED" ? "#065F46" : "#92400E", border: `1px solid ${s.status === "APPROVED" ? "#BBF7D0" : "#FDE68A"}`, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>
                      {s.status === "APPROVED" ? "Baholandi" : "Kutilmoqda"}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <button onClick={() => onSelect(s)} style={{ border: "1px solid #D1D5DB", borderRadius: 6, padding: "5px 12px", fontSize: 13, background: "#fff", cursor: "pointer" }}>
                      {s.status === "PENDING" ? "Baholash" : "Ko'rish"}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>Topilmadi</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SubmissionDetail({ sub, onBack, onSave }: { sub: Submission; onBack: () => void; onSave: (s: Submission) => void }) {
  const [score, setScore] = useState(sub.teacherScore?.toString() ?? "");
  const [feedback, setFeedback] = useState(sub.teacherFeedback ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/submissions/${sub.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teacherScore: parseFloat(score) || null, teacherFeedback: feedback }) });
    const d = await res.json();
    if (d.submission) { onSave(d.submission); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    setSaving(false);
  }

  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", fontSize: 13, marginBottom: 16, padding: 0 }}>← Ro'yxatga qaytish</button>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <div style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "18px 20px", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>{sub.student.firstName} {sub.student.lastName}</p>
                <p style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>{sub.test.title} · {formatDate(sub.submittedAt)}</p>
              </div>
              {sub.teacherScore && <span style={{ fontWeight: 800, fontSize: 22, color: "#16A34A" }}>{sub.teacherScore.toFixed(1)}</span>}
            </div>
            <div style={{ background: "#F9FAFB", borderRadius: 8, padding: "12px 14px", maxHeight: 300, overflowY: "auto" }}>
              <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{sub.text}</p>
            </div>
            <p style={{ fontSize: 12, color: "#6B7280", marginTop: 8, display: "flex", gap: 12 }}>
              <span>📝 So'zlar: <strong>{sub.text.trim().split(/\s+/).length}</strong></span>
              <span>📧 {sub.student.email}</span>
            </p>
          </div>
        </div>

        <div style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "18px 20px" }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: "#111", marginBottom: 14 }}>Baho berish</p>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Baho (0–9)</label>
            <input type="number" min="0" max="9" step="0.5" value={score} onChange={e => setScore(e.target.value)} placeholder="6.5"
              style={{ width: "100%", border: "1px solid #D1D5DB", borderRadius: 7, padding: "9px 12px", fontSize: 16, outline: "none", boxSizing: "border-box", fontWeight: 700 }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Izoh (ixtiyoriy)</label>
            <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={5} placeholder="O'quvchiga izoh yozing..."
              style={{ width: "100%", border: "1px solid #D1D5DB", borderRadius: 7, padding: "9px 12px", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
          </div>
          <button onClick={handleSave} disabled={saving}
            style={{ width: "100%", background: saved ? "#16A34A" : "#111", color: "#fff", border: "none", borderRadius: 8, padding: 11, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
            {saving ? "Saqlanmoqda..." : saved ? "✓ Saqlandi!" : "Saqlash"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddTestForm({ onAdd, tests, onDelete }: { onAdd: (t: Test) => void; tests: Test[]; onDelete: (id: string) => void }) {
  const [type, setType] = useState("Task 1");
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const d = await res.json();
    if (d.url) setImageUrl(d.url);
    setUploading(false);
  }

  async function handleSave() {
    if (!title.trim() || !prompt.trim()) return;
    setSaving(true);
    const res = await fetch("/api/tests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, title, prompt, imageUrl }) });
    const d = await res.json();
    if (d.test) { onAdd(d.test); setSaved(true); setTimeout(() => { setSaved(false); setTitle(""); setPrompt(""); setImagePreview(null); setImageUrl(null); }, 2000); }
    setSaving(false);
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`"${title}" testini o'chirasizmi?`)) return;
    const res = await fetch(`/api/tests?id=${id}`, { method: "DELETE" });
    if (res.ok) onDelete(id);
    else alert("O'chirishda xato!");
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <h2 style={{ fontWeight: 700, fontSize: 18, color: "#111", marginBottom: 20, marginTop: 0 }}>Test Qo'shish</h2>

      {/* Yangi test forma */}
      <div style={{ border: "1px solid #E5E7EB", borderRadius: 12, padding: "24px", marginBottom: 28 }}>
        <p style={{ fontWeight: 600, fontSize: 14, color: "#374151", marginBottom: 14 }}>Yangi test</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14, marginBottom: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Task Turi</label>
            <select value={type} onChange={e => setType(e.target.value)} style={{ width: "100%", border: "1px solid #D1D5DB", borderRadius: 7, padding: "9px 12px", fontSize: 14, outline: "none", background: "#fff" }}>
              <option value="Task 1">Task 1</option>
              <option value="Task 2">Task 2</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Test nomi</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Bamboo Manufacturing"
              style={{ width: "100%", border: "1px solid #D1D5DB", borderRadius: 7, padding: "9px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Savol (Prompt)</label>
          <textarea rows={4} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="The diagram below shows..."
            style={{ width: "100%", border: "1px solid #D1D5DB", borderRadius: 7, padding: "9px 12px", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
        </div>
        {type === "Task 1" && (
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Rasm (ixtiyoriy)</label>
            {imagePreview ? (
              <div style={{ position: "relative", border: "1px solid #E5E7EB", borderRadius: 8, padding: 8, display: "inline-block" }}>
                <img src={imagePreview} alt="preview" style={{ maxHeight: 180, borderRadius: 6, display: "block" }} />
                <button onClick={() => { setImagePreview(null); setImageUrl(null); }}
                  style={{ position: "absolute", top: 8, right: 8, background: "#111", color: "#fff", border: "none", borderRadius: 5, padding: "3px 8px", fontSize: 12, cursor: "pointer" }}>
                  O'chirish
                </button>
                {uploading && <p style={{ fontSize: 12, color: "#6B7280", marginTop: 6 }}>Yuklanmoqda...</p>}
              </div>
            ) : (
              <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed #D1D5DB", borderRadius: 8, padding: "24px 20px", cursor: "pointer", background: "#F9FAFB" }}>
                <span style={{ fontSize: 24, marginBottom: 6 }}>📤</span>
                <span style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>Rasm tanlang</span>
                <span style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>PNG, JPG (max 5MB)</span>
                <input type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
              </label>
            )}
          </div>
        )}
        <button onClick={handleSave} disabled={saving || !title.trim() || !prompt.trim()}
          style={{ background: saved ? "#16A34A" : "#111", color: "#fff", border: "none", borderRadius: 8, padding: "10px 28px", fontWeight: 600, fontSize: 15, cursor: "pointer", opacity: !title.trim() || !prompt.trim() ? 0.5 : 1 }}>
          {saving ? "Saqlanmoqda..." : saved ? "✓ Saqlandi!" : "Testni Saqlash"}
        </button>
      </div>

      {/* Mavjud testlar ro'yxati */}
      <div>
        <p style={{ fontWeight: 600, fontSize: 14, color: "#374151", marginBottom: 12 }}>Mavjud testlar ({tests.length})</p>
        {tests.length === 0 ? (
          <p style={{ color: "#9CA3AF", fontSize: 13 }}>Hozircha testlar yo'q</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tests.map(t => (
              <div key={t.id} style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                  <span style={{ background: "#F3F4F6", color: "#374151", borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{t.type}</span>
                  <span style={{ fontWeight: 600, fontSize: 14, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                  {t.imageUrl && <span style={{ fontSize: 14, flexShrink: 0 }}>🖼️</span>}
                </div>
                <button onClick={() => handleDelete(t.id, t.title)}
                  style={{ border: "1px solid #FECACA", borderRadius: 6, padding: "4px 12px", fontSize: 12, background: "#FEF2F2", color: "#DC2626", cursor: "pointer", fontWeight: 600, flexShrink: 0 }}>
                  O'chirish
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
