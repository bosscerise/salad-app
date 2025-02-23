import { useEffect, useState } from 'react';
import axios from 'axios';
import styled from '@emotion/styled';

const LoyaltyBox = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 5px;
  margin: 1rem 0;
`;

function Loyalty() {
    const [loyalty, setLoyalty] = useState({ points: 0, salad_streak: 0 });

    useEffect(() => {
        axios.get('http://localhost:8090/loyalty', { headers: { Authorization: 'Bearer YOUR_TOKEN' } })
            .then(res => setLoyalty(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <LoyaltyBox>
            <p>Points: {loyalty.points}</p>
            <p>Salad Streak: {loyalty.salad_streak} days</p>
        </LoyaltyBox>
    );
}

export default Loyalty;