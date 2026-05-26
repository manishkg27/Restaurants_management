import React from "react";

const LoadingSpinner = ({ fullPage = false }) => {
  const spinnerElement = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        padding: "40px",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          border: "4px solid var(--border-glass)",
          borderTop: "4px solid var(--accent)",
          borderRadius: "50%",
          animation: "spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        }}
      />
      <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", fontWeight: 500, fontFamily: "var(--font-heading)" }}>
        Loading Eatify...
      </p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (fullPage) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "var(--bg-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
      >
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
};

export default LoadingSpinner;
