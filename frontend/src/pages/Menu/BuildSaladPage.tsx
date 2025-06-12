// app/salad-builder/page.tsx
import CustomSaladBuilder from './components/CustomSaladBuilder';
import LoadingSpinner from './components/LoadingSpinner';
import { suggestedCombinations } from '../../services/api';
import { useMenuData } from '../../hooks/useQueries';

function BuildSaladPage() {
  // Use TanStack Query to fetch data
  const { data: menuData, isLoading } = useMenuData();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create Your Custom Salad</h1>
      <CustomSaladBuilder 
        ingredients={menuData?.ingredients || []} 
        categories={menuData?.categories || []}
        suggestedCombinations={suggestedCombinations}
      />
    </div>
  );
}

export default BuildSaladPage;