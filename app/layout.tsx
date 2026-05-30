import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WritingCD — IELTS Writing Simulator",
  description: "IELTS Writing simulator",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>
        {children}
        <footer style={{ borderTop: "1px solid black", padding: "12px 0", textAlign: "center", fontSize: 15, color: "blue", marginTop: "auto" }}>
          <a href="https://t.me/Shodiyorov_Dilshodbek">For offer:  Shodiyorov Dilshod</a> <br />
          Tel : +998971787471
        </footer>
      </body>
    </html>
  );
}
