import { Dashboard } from '@/components/Dashboard'
import { createFileRoute } from '@tanstack/react-router'

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Dashboard userId="dummy" />
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: App,
})

