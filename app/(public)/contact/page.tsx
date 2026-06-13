import { Mail, Phone, MapPin, MessageSquare } from "lucide-react"

import { Footer } from "@/components/layout/Footer"
import { Navbar } from "@/components/layout/Navbar"
import { ContactForm } from "@/components/public/contact-form"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-r from-indigo-600 to-violet-600 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center md:px-6">
          <h1 className="text-4xl font-extrabold text-white">Contact Us</h1>
          <p className="mt-3 text-indigo-200">Have questions? We&apos;d love to hear from you.</p>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 py-14 md:px-6">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Contact info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-800">Get in touch</h2>
              <p className="mt-2 text-gray-500">
                Reach out about courses, enrollment, or anything else. Our team will respond within
                24 hours.
              </p>
            </div>
            {[
              { icon: Mail, label: "Email", value: "support@xyzcare.com", color: "bg-indigo-50 text-indigo-600" },
              { icon: Phone, label: "Phone", value: "+880 1700 000000", color: "bg-emerald-50 text-emerald-600" },
              { icon: MapPin, label: "Location", value: "Dhaka, Bangladesh", color: "bg-cyan-50 text-cyan-600" },
              { icon: MessageSquare, label: "Response time", value: "Within 24 hours", color: "bg-amber-50 text-amber-600" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${item.color}`}>
                  <item.icon className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-700">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
            <h2 className="mb-6 text-xl font-bold text-gray-800">Send us a message</h2>
            <ContactForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
