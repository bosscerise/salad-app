import PocketBase from 'pocketbase';

// Create a single PocketBase instance for the entire app
const pb = new PocketBase('https://7793d9d384730dd5acb7be839c71587b.serveo.net');
pb.autoCancellation(false);
pb.beforeSend = (url: string, options: RequestInit) => {
  options.headers = {
      ...options.headers,
      'ngrok-skip-browser-warning': 'true'
  };
  return { url, options };
};
export default pb;