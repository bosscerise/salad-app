/// <reference path="../../../backend/pb/pb_data/types.d.ts" />
import PocketBase from 'pocketbase';

// Create a single PocketBase instance
export const pb = new PocketBase("https://sharkapi.fresh-box.me" || 'http://127.0.0.1:8090');

// Enable auto-cancellation of pending requests
pb.autoCancellation(false);

// Export the singleton
export default pb;