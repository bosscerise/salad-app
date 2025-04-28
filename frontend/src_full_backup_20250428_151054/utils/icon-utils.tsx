import * as LucideIcons from 'lucide-react';

export function getIconFromName(iconName: string, size = 16) {
  // @ts-ignore - dynamic import from lucide-react
  const Icon = LucideIcons[iconName];
  
  if (!Icon) {
    console.warn(`Icon "${iconName}" not found, using fallback`);
    return <LucideIcons.HelpCircle size={size} />;
  }
  
  return <Icon size={size} />;
}