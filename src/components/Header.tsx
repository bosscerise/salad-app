import { Link } from "react-router-dom"
import { useCart } from "../contexts/CartContext"
import { useState } from "react"
import { ChevronDownIcon } from '@heroicons/react/24/outline'

const navigation = [
  { name: "Home", href: "/" },
  { name: "Menu", href: "/menu" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
]

const Header = () => {
  const { totalItems } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-emerald-950/70 border-b border-emerald-800/20">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-amber-100">
          Salad Shark
        </Link>
        <div className="hidden lg:flex items-center gap-8 text-amber-100">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="text-sm font-medium hover:text-emerald-300 transition-colors"
            >
              {item.name}
            </Link>
          ))}
          <button className="ml-4 px-4 py-2 bg-emerald-400 text-emerald-950 rounded-full hover:bg-emerald-300 transition-colors font-medium">
            🛒 {totalItems}
          </button>
        </div>
        <button
          className="lg:hidden p-2 rounded-full bg-emerald-400 text-emerald-950 hover:bg-emerald-300 transition-colors"
          onClick={() => setMobileMenuOpen(true)}
        >
          <ChevronDownIcon className="w-6 h-6" />
        </button>
      </nav>
    </header>
  )
}

export default Header
