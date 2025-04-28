import PocketBase from 'pocketbase';

async function getSchema() {
  const pb = new PocketBase('http://localhost:8090');
  
  try {
    await pb.admins.authWithPassword('djawed.oranais@gmail.com', 'louna50cerise');
    console.log("Authentication successful!");
    
    // Get users collection schema
    const usersColl = await pb.collections.getOne('users');
    console.log("Users collection schema:");
    console.log(JSON.stringify(usersColl, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

getSchema();