// app/salad-builder/page.tsx
import SaladBuilder from './components/SaladBuilder';
// import ProgressIndicator from "@/components/ui/progress-indicator";
// import { Stepper } from '@/components/ui/stepper';


export default function BuildSaladPage() {
  return (
    <div className="container px-4 mx-auto">
      <SaladBuilder />
    </div>
  );
}