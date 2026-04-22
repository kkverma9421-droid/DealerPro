'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppNavbar from '@/components/AppNavbar'
import PropertyFormWizard from '@/components/properties/PropertyFormWizard'

export default function AddPropertyPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar
        right={
          <Link
            href="/dashboard"
            className="text-sm text-slate-500 hover:text-slate-700 font-medium transition"
          >
            ← Dashboard
          </Link>
        }
      />

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-800">Add New Property</h1>
          <p className="text-slate-500 text-sm mt-1">Fill in the details to list a property on DealerPro.</p>
        </div>

        <PropertyFormWizard
          onSuccess={(id) => router.push(`/property/${id}`)}
          onCancel={() => router.push('/dashboard')}
        />
      </div>
    </div>
  )
}
