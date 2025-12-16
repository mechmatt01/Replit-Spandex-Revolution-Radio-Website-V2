/* PHASE 4: Homepage Content (3 Boxes) */
import React from 'react';
import '../styles/theme.css';

const Home = () => {
  // Logic for Box 2: Random Product Showcase
  const products = ["Vintage Tee", "Signed Vinyl", "Sticker Pack"];
  const randomProduct = products[Math.floor(Math.random() * products.length)];

  return (
    <div className="home-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Live Map Header Swap */}
      <h2 style={{ textAlign: 'center' }}>Live Global Listeners</h2>
      <div className="map-placeholder uniform-box" style={{ height: '200px', marginBottom: '40px' }}>
        [MAP COMPONENT GOES HERE]
      </div>

      {/* Overview Section - 3 Boxes */}
      <div className="overview-grid">
        
        {/* Box 1: Join/Sign Up */}
        <div className="uniform-box">
          <h3>Join the Revolution</h3>
          <p>Become a member today for exclusive access.</p>
          <button style={{ padding: '10px 20px', background: 'var(--accent-color)', border: 'none', cursor: 'pointer' }}>
            Sign Up
          </button>
        </div>

        {/* Box 2: Product Showcase (Replaces Show Archives) */}
        <div className="uniform-box">
          <h3>Featured Gear</h3>
          <p>Check out our: <strong>{randomProduct}</strong></p>
          <button>View Shop</button>
        </div>

        {/* Box 3: Merchandise */}
        <div className="uniform-box">
          <h3>Merch Store</h3>
          <p>Get your official Spandex Salvation swag.</p>
          <button>Browse All</button>
        </div>

      </div>

      <style>{`
        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }
      `}</style>
    </div>
  );
};

export default Home;