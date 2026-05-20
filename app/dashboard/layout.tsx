import Sidebar from '../components/dashboard/Sidebar'
import Header from '../components/dashboard/Header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-8 flex-1 bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  )
}