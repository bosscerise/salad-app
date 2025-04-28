import PocketBase from 'pocketbase';

// Initialize the PocketBase client
const pb = new PocketBase('http://localhost:8090');

async function listUsers() {
  try {
    // Authenticate as admin
    await pb.admins.authWithPassword(
      'djawed.oranais@gmail.com',
      'louna50cerise'
    );
    console.log('Authentication successful!');

    // Fetch the first 5 users
    const users = await pb.collection('users').getList(1, 5, {
      sort: 'created',
    });

    console.log(`Total users in database: ${users.totalItems}`);
    console.log('First 5 users:');
    console.log('==============');
    
    users.items.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`ID: ${user.id}`);
      console.log(`Name: ${user.name || '[No name provided]'}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role || 'customer'}`);
      console.log(`Verified: ${user.verified ? 'Yes' : 'No'}`);
      console.log(`Created: ${new Date(user.created).toLocaleString()}`);
      console.log('----------------------------');
    });
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

// Execute the function
listUsers();