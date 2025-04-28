import { XMarkIcon } from '@heroicons/react/24/solid';

interface MobileMenuProps {
  navigation: { name: string; href: string }[];
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function MobileMenu({ navigation, mobileMenuOpen, setMobileMenuOpen }: MobileMenuProps) {
  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
      <div className="fixed inset-0 bg-black/80" onClick={() => setMobileMenuOpen(false)} />
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-emerald-900 p-6 transform transition-transform duration-300 ease-in-out"
        style={{ transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)' }}>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-white">Salad Shack</span>
          <button
            className="p-2 rounded-full bg-emerald-400 text-emerald-950 hover:bg-emerald-300 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <nav className="mt-8 space-y-4">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="block py-2 px-4 rounded-lg text-white hover:bg-emerald-800 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
