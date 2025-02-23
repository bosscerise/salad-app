import { useEffect, useState } from 'react';
import axios from 'axios';
import styled from '@emotion/styled';

const SaladGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
`;

const SaladCard = styled.div`
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  overflow: hidden;
  background: white;
`;

const SaladImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const SaladInfo = styled.div`
  padding: 1rem;
`;

const AddButton = styled.button`
  background: #2c3e50;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background: #34495e;
  }
`;

interface Salad {
    id: string;
    name: string;
    price: number;
    image: string;
    ingredients: string[];
}

interface Option {
    id: string;
    name: string;
    price: number;
    category: string;
}

function Menu() {
    const [salads, setSalads] = useState<Salad[]>([]);
    const [options, setOptions] = useState<Option[]>([]);
    const [cart, setCart] = useState<any[]>([]);

    useEffect(() => {
        axios.get('http://localhost:8090/menu')
            .then(res => {
                setSalads(res.data.salads);
                setOptions(res.data.options);
            })
            .catch(err => console.error(err));
    }, []);

    const addToCart = (salad: Salad) => {
        setCart([...cart, salad]);
        // Later: POST to /order or localStorage
    };

    const customizeSalad = (saladId: string) => {
        // Add logic for custom options (e.g., modal with selects)
        console.log('Customizing:', saladId);
    };

    return (
        <SaladGrid>
            {salads.map(salad => (
                <SaladCard key={salad.id}>
                    <SaladImage src={salad.image} alt={salad.name} />
                    <SaladInfo>
                        <h3>{salad.name}</h3>
                        <p>${salad.price.toFixed(2)}</p>
                        <AddButton onClick={() => addToCart(salad)}>Add to Cart</AddButton>
                        <AddButton onClick={() => customizeSalad(salad.id)} style={{ marginLeft: '0.5rem' }}>Customize</AddButton>
                    </SaladInfo>
                </SaladCard>

            ))}
        </SaladGrid>
    );
}
// Add to Menu component
return (
    <>
        <Cart items={cart} />
        <SaladGrid>
            {/* ... existing grid */}
        </SaladGrid>
    </>
);

export default Menu;