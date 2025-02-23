import { useEffect, useState } from 'react';
import axios from 'axios';
import styled from '@emotion/styled';

const OrderTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
`;

function Admin() {
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        axios.get('http://localhost:8090/api/collections/orders/records', { headers: { Authorization: 'Bearer ADMIN_TOKEN' } })
            .then(res => setOrders(res.data.items))
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            <h2>Orders</h2>
            <OrderTable>
                <thead>
                <tr>
                    <th>User</th>
                    <th>Status</th>
                    <th>Total</th>
                </tr>
                </thead>
                <tbody>
                {orders.map(order => (
                    <tr key={order.id}>
                        <td>{order.user_id}</td>
                        <td>{order.status}</td>
                        <td>${order.total.toFixed(2)}</td>
                    </tr>
                ))}
                </tbody>
            </OrderTable>
        </div>
    );
}

export default Admin;