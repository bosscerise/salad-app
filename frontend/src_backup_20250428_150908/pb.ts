import { pb } from './pb/client';
import { BaseRecord } from './pb/types';

// Import and re-export services directly from their files
import * as ingredientServiceImport from './pb/ingredientService';
import * as categoryServiceImport from './pb/categoryService';
import * as saladServiceImport from './pb/saladService';
import * as orderServiceImport from './pb/orderService';
import * as subscriptionServiceImport from './pb/subscriptionService';

// Export the PocketBase client instance for use in other files
export { pb };

// Export services
export const ingredientService = ingredientServiceImport;
export const categoryService = categoryServiceImport;
export const saladService = saladServiceImport;
export const orderService = orderServiceImport;
export const subscriptionService = subscriptionServiceImport;

// Export types
export * from './pb/types';

// File URL utility function using the correct method name (getURL instead of getUrl)
export const getFileUrl = (record: BaseRecord, filename: string) => {
  return pb.files.getURL(record, filename);
};
