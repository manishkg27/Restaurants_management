import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for better UX or fetch order details if needed
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [orderId]);

  if (loading) return <LoadingSpinner fullPage />;

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
      <CheckCircle size={64} color="#10b981" style={{ marginBottom: '20px' }} />
      <h1 style={{ fontSize: '2rem', color: '#111827', marginBottom: '10px' }}>Order Confirmed!</h1>
      <p style={{ color: '#6b7280', marginBottom: '10px', maxWidth: '400px' }}>
        Thank you for your order. Your payment was successful and your order has been placed.
      </p>
      <div style={{ background: '#f3f4f6', padding: '10px 20px', borderRadius: '8px', marginBottom: '30px', fontWeight: '500', color: '#374151' }}>
        Order ID: {orderId}
      </div>
      
      <div style={{ display: 'flex', gap: '15px' }}>
        <Link 
          to="/orders" 
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
          <ShoppingBag size={18} />
          Track Order
        </Link>
        <Link 
          to="/restaurants" 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: 'white',
            color: '#ea580c',
            border: '1px solid #ea580c',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: '500'
          }}
        >
          Continue Exploring <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
