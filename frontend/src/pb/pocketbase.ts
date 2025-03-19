import PocketBase from 'pocketbase';

// Create a single PocketBase instance for the entire app
const pb = new PocketBase('http://127.0.0.1:8090'); // Replace with your PocketBase URL
pb.autoCancellation(false);
export default pb;