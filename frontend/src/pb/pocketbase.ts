import PocketBase from 'pocketbase';

// Create a single PocketBase instance for the entire app
const pb = new PocketBase('https://597d-2a09-bac5-3071-1a78-00-2a3-17.ngrok-free.app');
pb.autoCancellation(false);
pb.beforeSend = (url: string, options: RequestInit) => {
  options.headers = {
      ...options.headers,
      'ngrok-skip-browser-warning': 'true'
  };
  return { url, options };
};
export default pb;