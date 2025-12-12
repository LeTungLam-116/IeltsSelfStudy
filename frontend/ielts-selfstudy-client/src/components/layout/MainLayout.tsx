import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

function MainLayout({ children }: Props) {
  return (
    <div>
      <header style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
        <h2>Ielts Self Study</h2>
      </header>

      <main style={{ padding: "16px" }}>{children}</main>

      <footer style={{ padding: "10px", borderTop: "1px solid #ccc" }}>
        <small>© 2025 Ielts Self Study</small>
      </footer>
    </div>
  );
}

export default MainLayout;
