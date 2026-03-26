import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      {/* Hero icon */}
      <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center mb-8 shadow-lg">
        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h1 className="text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">
        Get things done.
      </h1>
      <p className="text-lg text-gray-500 mb-10 max-w-md leading-relaxed">
        Create lists, track tasks, and stay on top of your day — simple and distraction-free.
      </p>

      <button
        onClick={() => navigate('/todo-lists')}
        className="group px-8 py-3.5 bg-black text-white rounded-full text-base font-semibold cursor-pointer hover:bg-gray-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
      >
        Get Started
        <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>

      {/* Feature highlights */}
      <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl w-full">
        {[
          { title: 'Organize', desc: 'Group tasks into lists that make sense to you' },
          { title: 'Track', desc: 'Check off items as you complete them' },
          { title: 'Focus', desc: 'A clean interface with zero distractions' },
        ].map(({ title, desc }) => (
          <div key={title} className="text-center">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">{title}</h3>
            <p className="text-sm text-gray-400">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
