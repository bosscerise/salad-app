import { useEffect, useState } from 'react';
import axios from 'axios';
import Confetti from 'react-confetti';
import styled from '@emotion/styled';

const Hero = styled.div`
  background: url('/salad-hero.jpg') no-repeat center center/cover;
  height: 60vh;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const Tagline = styled.p`
  font-size: 1.5rem;
  opacity: 0.8;
`;

const OrderButton = styled.button`
  background: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 5px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.3s;
  &:hover {
    background: #34495e;
  }
`;

interface MenuItem {
    id: string;
    name: string;
    price: number;
    image: string;
}

function Home() {
    const [salads, setSalads] = useState<MenuItem[]>([]);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:8090/menu')
            .then(res => setSalads(res.data.salads.slice(0, 3))) // Top 3 for preview
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            {showConfetti && <Confetti />}
    <Hero>
        <Title>Welcome to Salad Shack</Title>
    <Tagline>Fresh, homemade salads crafted with love and served with a personal touch</Tagline>
    <OrderButton onClick={() => setShowConfetti(true)}>Order Now</OrderButton>
    </Hero>
    <div style={{ padding: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
    {salads.map(salad => (
        <div key={salad.id} style={{
        width: '300px',
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            background: 'white'
    }}>
        <img src={salad.image} alt={salad.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
    <div style={{ padding: '1rem' }}>
        <h3>{salad.name}</h3>
        <p>${salad.price.toFixed(2)}</p>
    <button style={{
        background: '#2c3e50',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
    }}>Add to Cart</button>
    </div>
    </div>
    ))}
    </div>
    <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
    <h2>Ready to Order?</h2>
        <p>Join our community of health-conscious food lovers and experience the freshest salads in town</p>
    <div style={{ marginTop: '1rem' }}>
    <OrderButton as="a" href="/menu">View Full Menu</OrderButton>
    <OrderButton as="a" href="/about" style={{ marginLeft: '1rem', background: '#3498db' }}>Learn More</OrderButton>
    </div>
    </div>
    </div>
);
}

export default Home;