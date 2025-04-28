// This file exists to provide backward compatibility with any code that might still 
// be importing from this path. It re-exports everything from client.ts.

export { pb, useCurrentUser, loginWithEmail, registerUser, logout } from './client';