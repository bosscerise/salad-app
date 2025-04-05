// import { useState, useEffect } from 'react';
// import { pb } from '../services/api';

// export function usePocketBaseStatus() {
//   const [isConnected, setIsConnected] = useState(true);
//   const [isChecking, setIsChecking] = useState(true);
  
//   useEffect(() => {
//     let isMounted = true;
//     let timeoutId: NodeJS.Timeout;
    
//     const checkConnection = async () => {
//       try {
//         setIsChecking(true);
//         await pb.health.check();
//         if (isMounted) setIsConnected(true);
//       } catch (err) {
//         if (isMounted) setIsConnected(false);
//       } finally {
//         if (isMounted) setIsChecking(false);
//       }
//     };
    
//     // Check immediately
//     checkConnection();
    
//     // Then set up periodic checks (every 30 seconds)
//     const intervalId = setInterval(() => {
//       checkConnection();
//     }, 30000);
    
//     return () => {
//       isMounted = false;
//       clearInterval(intervalId);
//       if (timeoutId) clearTimeout(timeoutId);
//     };
//   }, []);
  
//   return { isConnected, isChecking };
// }