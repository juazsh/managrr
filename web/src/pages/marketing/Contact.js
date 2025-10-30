"use client"

import { useState } from "react"
import contactHero from "../../assets/images/undraw_add-information_06qr.svg"

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "general",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const mailtoLink = `mailto:support@managrr.com?subject=${encodeURIComponent(
      `[${formData.subject}] ${formData.name}`,
    )}&body=${encodeURIComponent(`From: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`)}`

    window.location.href = mailtoLink

    setSubmitted(true)
    setFormData({
      name: "",
      email: "",
      subject: "general",
      message: "",
    })

    setTimeout(() => setSubmitted(false), 5000)
  }

  return (
    <div>
      <section className="bg-gradient-to-br from-primary to-blue-700 py-12 md:py-20 px-4 text-center text-white">
        <div className="max-w-7xl mx-auto">
          <div className="inline-block bg-white/20 text-white px-5 py-2 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm">
            💬 We're Here to Help
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">Contact Us</h1>
          <p className="text-lg md:text-xl lg:text-2xl opacity-95 leading-relaxed">
            Have questions? We typically respond within 24 hours
          </p>
          <div className="max-w-sm mx-auto mt-8">
            <img src={contactHero || "/placeholder.svg"} alt="Contact Us" className="w-full h-auto drop-shadow-lg" />
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
            <div className="bg-white p-6 md:p-10 rounded-lg shadow-lg border border-border">
              <h2 className="text-2xl md:text-3xl font-bold text-text mb-8">Send Us a Message</h2>

              {submitted && (
                <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6 border border-green-200 text-sm leading-relaxed">
                  ✓ Your email client should open. If not, please email us directly at support@managrr.com
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="mb-6">
                  <label className="block text-base font-semibold text-text mb-2" htmlFor="name">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-base border-2 border-border rounded-lg outline-none transition-all focus:border-primary"
                    placeholder="Your name"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-base font-semibold text-text mb-2" htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-base border-2 border-border rounded-lg outline-none transition-all focus:border-primary"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-base font-semibold text-text mb-2" htmlFor="subject">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-base border-2 border-border rounded-lg bg-white outline-none transition-all cursor-pointer focus:border-primary"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="support">Support</option>
                    <option value="sales">Sales</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-base font-semibold text-text mb-2" htmlFor="message">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="w-full px-4 py-3 text-base border-2 border-border rounded-lg resize-y outline-none transition-all leading-relaxed focus:border-primary"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-4 text-lg font-semibold border-none rounded-lg cursor-pointer transition-all shadow-md hover:shadow-lg"
                >
                  Send Message
                </button>
              </form>
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-primary text-white p-6 md:p-8 rounded-lg shadow-lg">
                <h3 className="text-xl md:text-2xl font-bold mb-4">📧 Email Us Directly</h3>
                <p className="text-base leading-relaxed mb-4 opacity-95">
                  For immediate assistance, you can email us at:
                </p>
                <a
                  href="mailto:support@managrr.com"
                  className="block text-xl text-white no-underline font-bold mb-4 px-3 py-3 bg-white/20 rounded-lg text-center transition-all hover:bg-white/30"
                >
                  support@managrr.com
                </a>
                <p className="text-sm italic opacity-90">⏱️ We typically respond within 24 hours</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-border transition-all">
                <h3 className="text-lg font-semibold text-text mb-3">💬 General Inquiry</h3>
                <p className="text-sm text-text-light leading-relaxed">
                  Questions about Managrr, our features, or how we can help your project
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-border transition-all">
                <h3 className="text-lg font-semibold text-text mb-3">🛠️ Support</h3>
                <p className="text-sm text-text-light leading-relaxed">
                  Technical issues, account problems, or help using the platform
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-border transition-all">
                <h3 className="text-lg font-semibold text-text mb-3">💼 Sales</h3>
                <p className="text-sm text-text-light leading-relaxed">
                  Pricing questions, plan comparisons, or enterprise inquiries
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-border transition-all">
                <h3 className="text-lg font-semibold text-text mb-3">🤝 Partnership</h3>
                <p className="text-sm text-text-light leading-relaxed">
                  Interested in partnering with Managrr or integration opportunities
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm max-w-3xl mx-auto text-center border border-border">
            <div className="text-5xl mb-4">ℹ️</div>
            <h3 className="text-xl md:text-2xl font-semibold text-text mb-4">Note on Contact Form</h3>
            <p className="text-base text-text-light leading-relaxed">
              Currently, clicking "Send Message" will open your email client with a pre-filled message. A dedicated
              contact form with backend integration is planned for version 1.5. For now, you can also email us directly
              at support@managrr.com.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
