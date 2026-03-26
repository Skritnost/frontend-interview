import { NavLink, Link } from 'react-router-dom'
import ThemeToggle from '../ThemeToggle'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/todo-lists', label: 'Todo Lists' },
]

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-header backdrop-blur-sm text-header-foreground border-b border-header-border">
      <nav className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-10">
        <Link to="/" className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
          TodoApp
        </Link>
        <ul className="flex gap-1">
          {navItems.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `relative px-4 py-4 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-header-foreground'
                      : 'text-header-muted hover:text-header-foreground'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {label}
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-header-foreground rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
