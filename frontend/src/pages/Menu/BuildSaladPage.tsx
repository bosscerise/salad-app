// app/salad-builder/page.tsx
import SaladBuilder from './components/SaladBuilder';
import ProgressIndicator from "@/components/ui/progress-indicator";
import { Stepper } from '@/components/ui/stepper';


export default function BuildSaladPage() {
  return (
    <div className="container px-4 mx-auto">
      <h1 className="my-8 text-4xl font-bold text-center">
        Build Your Perfect Salad 🌱
      </h1>
      <ProgressIndicator/>
      <SaladBuilder />
      <Stepper />
    </div>
  );
}