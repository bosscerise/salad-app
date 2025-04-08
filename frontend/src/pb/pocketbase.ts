import PocketBase from 'pocketbase';

// Create a single PocketBase instance for the entire app
const pb = new PocketBase('https://sharkapi.fresh-box.me');
pb.autoCancellation(false);
export default pb;