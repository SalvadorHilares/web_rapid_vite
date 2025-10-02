import React, { useEffect, useState } from 'react'
import './App.css'

interface Order {
  id: number;
  user_id: number;
  product_id: number;
  status: string;
  total_price: number;
  payment_method: string;
  order_date: string;
  user_name: string;
  product_name: string;
}

function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://jiql4i2xy4.execute-api.us-east-1.amazonaws.com/prod/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error:', error);
        setOrders([]);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center' }}>
        Maki Orders
      </h1>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ 
            display: 'inline-block', 
            width: '2rem', 
            height: '2rem', 
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '1rem', color: '#666' }}>Cargando...</p>
        </div>
      ) : (
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
          padding: '1.5rem' 
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
            Órdenes ({orders.length})
          </h2>
          
          {orders.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
              No hay órdenes disponibles
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orders.map((order) => (
                <div key={order.id} style={{ 
                  border: '1px solid #e5e5e5', 
                  borderRadius: '8px', 
                  padding: '1rem',
                  backgroundColor: '#fafafa'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                        {order.product_name}
                      </h3>
                      <p style={{ color: '#666', margin: '0' }}>
                        Cliente: {order.user_name}
                      </p>
                    </div>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      backgroundColor: order.status === 'delivered' ? '#dcfce7' : 
                                     order.status === 'preparing' ? '#fef3c7' : 
                                     order.status === 'confirmed' ? '#dbeafe' : '#f3f4f6',
                      color: order.status === 'delivered' ? '#166534' : 
                             order.status === 'preparing' ? '#92400e' : 
                             order.status === 'confirmed' ? '#1e40af' : '#374151'
                    }}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                    gap: '1rem', 
                    marginTop: '0.5rem',
                    fontSize: '0.875rem'
                  }}>
                    <div>
                      <span style={{ color: '#666' }}>ID:</span>
                      <span style={{ marginLeft: '0.5rem', fontWeight: '500' }}>{order.id}</span>
                    </div>
                    <div>
                      <span style={{ color: '#666' }}>Precio:</span>
                      <span style={{ marginLeft: '0.5rem', fontWeight: '500' }}>${order.total_price}</span>
                    </div>
                    <div>
                      <span style={{ color: '#666' }}>Pago:</span>
                      <span style={{ marginLeft: '0.5rem', fontWeight: '500' }}>{order.payment_method}</span>
                    </div>
                    <div>
                      <span style={{ color: '#666' }}>Fecha:</span>
                      <span style={{ marginLeft: '0.5rem', fontWeight: '500' }}>
                        {new Date(order.order_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App