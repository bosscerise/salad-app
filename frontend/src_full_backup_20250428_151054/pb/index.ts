export * from './client';
export * from './services';
export * from './types';

// Re-export the services for convenience
import { saladService, ingredientService, categoryService, orderService, authService } from './services';
export { saladService, ingredientService, categoryService, orderService, authService };

import pb from './client';
export default pb;