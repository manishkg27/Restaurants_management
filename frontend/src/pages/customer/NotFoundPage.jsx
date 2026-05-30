import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Home } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div style={{
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '60vh',
      textAlign: 'center',
      padding: '20px'
    }}>
      <AlertTriangle size={64} color="#ea580c" style={{ marginBottom: '20px' }} />
      <h1 style={{ fontSize: '2rem', color: '#111827', marginBottom: '10px' }}>404 - Page Not Found</h1>
      <p style={{ color: '#6b7280', marginBottom: '30px', maxWidth: '400px' }}>
        Oops! The page you are looking for does not exist. It might have been moved or deleted.
      </p>
      <Link 
        to="/" 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          backgroundColor: '#ea580c',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '6px',
          fontWeight: '500'
        }}
      >
        <Home size={18} />
        Back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
