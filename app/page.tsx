"use client";
import { useState, useEffect, useRef } from "react";

interface Test { id: string; type: string; title: string; prompt: string; imageUrl?: string }
interface User { id: string; firstName: string; lastName: string; email: string }
interface Submission {
  id: string; text: string; submittedAt: string;
  teacherScore: number | null; teacherFeedback: string | null;
  status: string; test: { type: string; title: string };
}

function Header({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  return (
    <header style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", position: "sticky", top: 0, zIndex: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 28, height: 28, background: "#111", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>W</span>
        </div>
        <span style={{ fontWeight: 700, fontSize: 16, color: "#111" }}>WritingCD ||</span>
        <a href="https://t.me/Shodiyorov_Dilshodbek"><span  style={{ fontWeight: 700, fontSize: 16, color: "#111" }}>Created by </span>: Shodiyorov Dilshod</a>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {user ? (
          <>
            <a href="/profile" style={{ fontSize: 13, color: "#111", fontWeight: 600, textDecoration: "none" }}>{user.firstName} {user.lastName}</a>
            <button onClick={onLogout} style={{ border: "1px solid #D1D5DB", borderRadius: 6, padding: "5px 12px", fontSize: 13, background: "#fff", cursor: "pointer", color: "#374151" }}>Chiqish</button>
          </>
        ) : (
          <a href="/teacher" style={{ border: "1px solid #D1D5DB", borderRadius: 6, padding: "5px 12px", fontSize: 13, color: "#374151", textDecoration: "none" }}>O'qituvchi →</a>
        )}
      </div>
    </header>
  );
}

function Timer({ totalSeconds }: { totalSeconds: number }) {
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (paused) { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => { if (prev <= 0) { clearInterval(intervalRef.current!); return 0; } return prev - 1; });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [paused]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percent = (timeLeft / totalSeconds) * 100;
  const isWarning = timeLeft < 5 * 60 && timeLeft > 60;
  const isUrgent = timeLeft <= 60;
  const isDone = timeLeft === 0;

  const color = isDone ? "#DC2626" : isUrgent ? "#DC2626" : isWarning ? "#D97706" : "#16A34A";
  const bg = isDone ? "#FEF2F2" : isUrgent ? "#FEF2F2" : isWarning ? "#FFFBEB" : "#F0FDF4";
  const border = isDone ? "#FECACA" : isUrgent ? "#FECACA" : isWarning ? "#FDE68A" : "#BBF7D0";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, background: bg, border: `1.5px solid ${border}`, borderRadius: 12, padding: "6px 14px" }}>
      {/* Circular progress */}
      <div style={{ position: "relative", width: 36, height: 36 }}>
        <svg width="36" height="36" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="18" cy="18" r="14" fill="none" stroke="#E5E7EB" strokeWidth="3" />
          <circle cx="18" cy="18" r="14" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 14}`}
            strokeDashoffset={`${2 * Math.PI * 14 * (1 - percent / 100)}`}
            style={{ transition: "stroke-dashoffset 1s linear" }} />
        </svg>
        <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 9, fontWeight: 700, color }}>
          {isDone ? "⏰" : isUrgent ? "!" : ""}
        </span>
      </div>

      {/* Time display */}
      <span style={{ fontWeight: 800, fontSize: 20, color, fontVariantNumeric: "tabular-nums", fontFamily: "monospace", letterSpacing: 1 }}>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>

      {/* Pause/Resume */}
      <button onClick={() => setPaused(p => !p)}
        style={{ background: "none", border: `1px solid ${border}`, borderRadius: 6, padding: "3px 8px", fontSize: 12, cursor: "pointer", color, fontWeight: 600 }}>
        {paused ? "▶" : "⏸"}
      </button>
    </div>
  );
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<"home" | "register" | "login" | "test" | "done">("home");
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => { if (d.user) setUser(d.user); });
    fetch("/api/tests").then(r => r.json()).then(d => setTests(d.tests ?? []));
  }, []);

  async function handleRegister() {
    setAuthLoading(true); setAuthError("");
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ firstName, lastName, email, password }) });
    const d = await res.json();
    if (d.user) { setUser(d.user); setScreen("home"); } else setAuthError(d.error ?? "Xato");
    setAuthLoading(false);
  }

  async function handleLogin() {
    setAuthLoading(true); setAuthError("");
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, role: "STUDENT" }) });
    const d = await res.json();
    if (d.user) { setUser(d.user); setScreen("home"); } else setAuthError(d.error ?? "Xato");
    setAuthLoading(false);
  }

  async function handleLogout() { await fetch("/api/auth/logout", { method: "POST" }); setUser(null); }

  async function handleSubmit() {
    if (!selectedTest || !user) return;
    setSubmitting(true);
    const res = await fetch("/api/submissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ testId: selectedTest.id, studentId: user.id, text: answer }) });
    const d = await res.json();
    if (d.submission) setScreen("done");
    setSubmitting(false);
  }

  if (screen === "done") return (
    <div style={{ minHeight: "100vh" }}>
      <Header user={user} onLogout={handleLogout} />
      <div style={{ maxWidth: 480, margin: "80px auto", padding: "0 20px", textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Muvaffaqiyatli yuborildi!</h2>
        <p style={{ color: "#6B7280", fontSize: 15, marginBottom: 24 }}>O'qituvchi tez orada baholaydi. Natijani profilingizda ko'rasiz.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <a href="/profile" style={{ background: "#111", color: "#fff", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Profilimga →</a>
          <button onClick={() => { setScreen("home"); setAnswer(""); setSelectedTest(null); }} style={{ border: "1px solid #D1D5DB", borderRadius: 8, padding: "10px 20px", fontSize: 14, background: "#fff", cursor: "pointer" }}>Bosh sahifa</button>
        </div>
      </div>
    </div>
  );

  if (screen === "test" && selectedTest) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", position: "sticky", top: 0, zIndex: 10, gap: 12 }}>
        <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>← Orqaga</button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
          <span style={{ background: "#F3F4F6", color: "#374151", borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{selectedTest.type}</span>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedTest.title}</span>
        </div>
        <Timer totalSeconds={selectedTest.type === "Task 1" ? 20 * 60 : 40 * 60} />
      </header>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", maxWidth: 1200, margin: "0 auto", width: "100%", padding: "24px 20px", gap: 24 }}>
        <div>
          <div style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: 20, marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 10 }}>You should spend about {selectedTest.type === "Task 1" ? "20" : "40"} minutes on this task.</p>
            <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "12px 14px", marginBottom: 8 }}>
              <p style={{ fontSize: 14, fontWeight: 600, fontStyle: "italic", lineHeight: 1.6, color: "#111" }}>{selectedTest.prompt}</p>
            </div>
          </div>
          {selectedTest.imageUrl && (
            <img src={selectedTest.imageUrl} alt="diagram"
              style={{ width: "100%", borderRadius: 8, border: "1px solid #E5E7EB", display: "block" }}
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Javobingiz:</p>
          <textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Bu yerga yozing..."
            style={{ flex: 1, minHeight: 400, border: "1px solid #D1D5DB", borderRadius: 10, padding: 14, fontSize: 15, resize: "vertical", outline: "none", fontFamily: "inherit", lineHeight: 1.7, color: "#111" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <span style={{ fontSize: 13, color: "#6B7280" }}>So'zlar: {answer.trim() ? answer.trim().split(/\s+/).length : 0}</span>
            <button onClick={handleSubmit} disabled={submitting || !answer.trim()}
              style={{ background: submitting || !answer.trim() ? "#D1D5DB" : "#111", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 600, fontSize: 14, cursor: submitting || !answer.trim() ? "not-allowed" : "pointer" }}>
              {submitting ? "Yuborilmoqda..." : "Yuborish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (screen === "register") return (
    <div style={{ minHeight: "100vh" }}>
      <Header user={null} onLogout={handleLogout} />
      <div style={{ maxWidth: 400, margin: "60px auto", padding: "0 20px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Ro'yxatdan o'tish</h2>
        <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>Akkaunt yarating</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          {[{ label: "Ism", val: firstName, set: setFirstName, ph: "Farhod" }, { label: "Familya", val: lastName, set: setLastName, ph: "Aliyev" }].map(f => (
            <div key={f.label}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}>{f.label}</label>
              <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                style={{ width: "100%", border: "1px solid #D1D5DB", borderRadius: 7, padding: "9px 12px", fontSize: 14, outline: "none", boxSizing: "border-box", color: "#111" }} />
            </div>
          ))}
        </div>
        {[{ label: "Email", val: email, set: setEmail, type: "email", ph: "email@gmail.com" }, { label: "Parol", val: password, set: setPassword, type: "password", ph: "••••••••" }].map(f => (
          <div key={f.label} style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}>{f.label}</label>
            <input type={f.type} value={f.val} onChange={e => { f.set(e.target.value); setAuthError(""); }} placeholder={f.ph}
              style={{ width: "100%", border: `1px solid ${authError ? "#DC2626" : "#D1D5DB"}`, borderRadius: 7, padding: "9px 12px", fontSize: 14, outline: "none", boxSizing: "border-box", color: "#111" }} />
          </div>
        ))}
        {authError && <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 10 }}>{authError}</p>}
        <button onClick={handleRegister} disabled={authLoading}
          style={{ width: "100%", background: "#111", color: "#fff", border: "none", borderRadius: 8, padding: "11px", fontWeight: 600, fontSize: 15, cursor: "pointer", marginBottom: 12 }}>
          {authLoading ? "Yuklanmoqda..." : "Ro'yxatdan o'tish"}
        </button>
        <p style={{ textAlign: "center", fontSize: 13, color: "#6B7280" }}>
          Akkaunt bormi? <button onClick={() => { setScreen("login"); setAuthError(""); }} style={{ background: "none", border: "none", color: "#111", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Kirish</button>
        </p>
      </div>
    </div>
  );

  if (screen === "login") return (
    <div style={{ minHeight: "100vh" }}>
      <Header user={null} onLogout={handleLogout} />
      <div style={{ maxWidth: 380, margin: "60px auto", padding: "0 20px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Kirish</h2>
        <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>Akkauntingizga kiring</p>
        {[{ label: "Email", val: email, set: setEmail, type: "email", ph: "email@gmail.com" }, { label: "Parol", val: password, set: setPassword, type: "password", ph: "••••••••" }].map(f => (
          <div key={f.label} style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}>{f.label}</label>
            <input type={f.type} value={f.val} onChange={e => { f.set(e.target.value); setAuthError(""); }} placeholder={f.ph}
              style={{ width: "100%", border: `1px solid ${authError ? "#DC2626" : "#D1D5DB"}`, borderRadius: 7, padding: "9px 12px", fontSize: 14, outline: "none", boxSizing: "border-box", color: "#111" }} />
          </div>
        ))}
        {authError && <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 10 }}>{authError}</p>}
        <button onClick={handleLogin} disabled={authLoading}
          style={{ width: "100%", background: "#111", color: "#fff", border: "none", borderRadius: 8, padding: "11px", fontWeight: 600, fontSize: 15, cursor: "pointer", marginBottom: 12 }}>
          {authLoading ? "Yuklanmoqda..." : "Kirish"}
        </button>
        <p style={{ textAlign: "center", fontSize: 13, color: "#6B7280" }}>
          Akkaunt yo'qmi? <button onClick={() => { setScreen("register"); setAuthError(""); }} style={{ background: "none", border: "none", color: "#111", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Ro'yxatdan o'tish</button>
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh" }}>
      <Header user={user} onLogout={handleLogout} />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "60px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontSize: "clamp(28px,5vw,42px)", fontWeight: 800, color: "#111", lineHeight: 1.2 }}>IELTS Writing<br /><span style={{ color: "#16A34A" }}>Simulator</span></h1>
          <p style={{ color: "#6B7280", marginTop: 12, fontSize: 16 }}>O'qituvchi baholaydi — real feedback olasiz</p>
        </div>
        {!user ? (
          <div style={{ border: "1px solid #E5E7EB", borderRadius: 12, padding: "28px 24px", textAlign: "center", maxWidth: 400, margin: "0 auto" }}>
            <p style={{ color: "#374151", fontSize: 15, marginBottom: 20 }}>Testni boshlash uchun kiring</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setScreen("register")} style={{ background: "#111", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Ro'yxatdan o'tish</button>
              <button onClick={() => setScreen("login")} style={{ border: "1px solid #D1D5DB", borderRadius: 8, padding: "10px 20px", fontSize: 14, background: "#fff", cursor: "pointer" }}>Kirish</button>
            </div>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Choose tests:</h2>
            {tests.length === 0 ? (
              <p style={{ color: "#9CA3AF", textAlign: "center", padding: "40px 0" }}>Hozircha testlar yo'q</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {tests.map(t => (
                  <button key={t.id} onClick={() => { setSelectedTest(t); setScreen("test"); }}
                    style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "16px 18px", textAlign: "left", background: "#fff", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#111"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#E5E7EB"}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ background: "#F3F4F6", color: "#374151", borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{t.type}</span>
                      <span style={{ fontWeight: 600, fontSize: 15, color: "#111" }}>{t.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      {user && (
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <a href="/profile"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid black", borderRadius: 8, padding: "10px 20px", fontSize: 14, color: "black", textDecoration: "none", fontWeight: 600 }}>
            📊 My score →
          </a>
        </div>
      )}
    </div>
  );
}