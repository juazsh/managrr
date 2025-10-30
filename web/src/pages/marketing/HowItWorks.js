import { Link } from "react-router-dom"
import ownersImg from "../../assets/images/undraw_houses_owky.svg"
import contractorsImg from "../../assets/images/undraw_construction-workers_z99i.svg"
import employeesImg from "../../assets/images/undraw_ordinary-day_ak4e.svg"

export const HowItWorks = () => {
  return (
    <div>
      <section className="bg-gradient-to-br from-primary to-blue-700 py-16 px-4 text-center text-white">
        <div className="max-w-7xl mx-auto">
          <div className="inline-block bg-white/20 text-white px-6 py-2 rounded-full text-sm font-semibold mb-6 tracking-wide uppercase">
            Simple & Transparent
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">How Managrr Works</h1>
          <p className="text-lg md:text-xl lg:text-2xl opacity-95 max-w-3xl mx-auto leading-relaxed">
            Project management made simple for house owners, contractors, and employees
          </p>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-6xl mb-4">🏠</div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text mb-4">For House Owners</h2>
            <p className="text-base md:text-lg lg:text-xl text-text-light max-w-2xl mx-auto">
              Stay informed and in control of your construction project
            </p>
          </div>

          <div className="max-w-md mx-auto mb-16">
            <img src={ownersImg || "/placeholder.svg"} alt="For House Owners" className="w-full h-auto" />
          </div>

          <div className="max-w-4xl mx-auto flex flex-col gap-10">
            {[
              {
                number: 1,
                title: "Create Your Project",
                text: "Sign up for free and create a project with details, estimated budget, and photos. No credit card required to start.",
                icon: "📝",
              },
              {
                number: 2,
                title: "Invite Your Contractor",
                text: "Send an email invitation to your contractor. They'll get access to the project and can start tracking work immediately.",
                icon: "✉️",
              },
              {
                number: 3,
                title: "Track Everything in Real-Time",
                text: "See daily progress updates with photos, monitor expenses as they happen, track employee work hours, and record all payments—all from your dashboard.",
                icon: "📊",
              },
              {
                number: 4,
                title: "Record Payments",
                text: "Every time you pay your contractor, record it in the system with amount, payment method, and optional screenshot proof. Your contractor confirms receipt to create an indisputable payment history.",
                icon: "💳",
              },
            ].map((step) => (
              <div key={step.number} className="grid grid-cols-[auto_auto_1fr] gap-6 items-start p-8 bg-white rounded-lg shadow-sm transition-all">
                <div className="text-5xl">{step.icon}</div>
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold text-text mb-3">{step.title}</h3>
                  <p className="text-base md:text-lg text-text-light leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-6xl mb-4">👷</div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text mb-4">For Contractors</h2>
            <p className="text-base md:text-lg lg:text-xl text-text-light max-w-2xl mx-auto">
              Manage projects efficiently and build trust with transparency
            </p>
          </div>

          <div className="max-w-md mx-auto mb-16">
            <img src={contractorsImg || "/placeholder.svg"} alt="For Contractors" className="w-full h-auto" />
          </div>

          <div className="max-w-4xl mx-auto flex flex-col gap-10">
            {[
              {
                number: 1,
                title: "Accept Project Assignment",
                text: "Receive email invitation from house owner and accept the project. Review project details and estimated costs.",
                icon: "✅",
              },
              {
                number: 2,
                title: "Add Employees to Project",
                text: "Create employee accounts and assign them to the project. Set their hourly rates for automatic time tracking.",
                icon: "👥",
              },
              {
                number: 3,
                title: "Post Daily Updates",
                text: "Share progress with photos, update work status, and add notes about what was accomplished each day. Keep your client informed.",
                icon: "📸",
              },
              {
                number: 4,
                title: "Track Expenses",
                text: "Upload receipts for materials and costs. Tag who paid (owner or contractor) and categorize expenses. Keep everyone informed about spending.",
                icon: "🧾",
              },
              {
                number: 5,
                title: "Confirm Payments Received",
                text: 'When the house owner records a payment, you\'ll see it immediately. Click "Received" to confirm and lock the payment record. This creates a transparent payment history that protects both parties.',
                icon: "✔️",
              },
            ].map((step) => (
              <div key={step.number} className="grid grid-cols-[auto_auto_1fr] gap-6 items-start p-8 bg-white rounded-lg shadow-sm transition-all">
                <div className="text-5xl">{step.icon}</div>
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold text-text mb-3">{step.title}</h3>
                  <p className="text-base md:text-lg text-text-light leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-6xl mb-4">⚒️</div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text mb-4">For Employees</h2>
            <p className="text-base md:text-lg lg:text-xl text-text-light max-w-2xl mx-auto">
              Simple check-in/check-out system for accurate time tracking
            </p>
          </div>

          <div className="max-w-md mx-auto mb-16">
            <img src={employeesImg || "/placeholder.svg"} alt="For Employees" className="w-full h-auto" />
          </div>

          <div className="max-w-4xl mx-auto flex flex-col gap-10">
            {[
              {
                number: 1,
                title: "Get Added by Contractor",
                text: "Your contractor will create an account for you and assign you to projects. You'll receive login credentials via email.",
                icon: "👤",
              },
              {
                number: 2,
                title: "Check In When You Arrive",
                text: "Use the mobile app to check in when you arrive at the work site. Take a photo and optionally share your GPS location for verification.",
                icon: "⏰",
              },
              {
                number: 3,
                title: "Check Out When You Leave",
                text: "Check out at the end of your shift with another photo. Hours worked are calculated automatically and visible to your contractor.",
                icon: "🏁",
              },
            ].map((step) => (
              <div key={step.number} className="grid grid-cols-[auto_auto_1fr] gap-6 items-start p-8 bg-white rounded-lg shadow-sm transition-all">
                <div className="text-5xl">{step.icon}</div>
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold text-text mb-3">{step.title}</h3>
                  <p className="text-base md:text-lg text-text-light leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto mt-12 flex gap-6 items-start">
            <div className="text-5xl flex-shrink-0">📱</div>
            <div>
              <h4 className="text-xl font-semibold text-text mb-2">Mobile App Coming Soon!</h4>
              <p className="text-base text-text-light leading-relaxed m-0">
                Currently, employees can use the web version on their phones for check-in/out. Native mobile app
                launching in Q2 2025.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-primary to-blue-700">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg md:text-xl lg:text-2xl mb-10 opacity-95 max-w-2xl mx-auto">
              Create your free account and start your first project today. No credit card required.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to="/register"
                className="bg-white text-primary px-10 py-4 rounded-lg no-underline text-lg font-semibold inline-block transition-all shadow-md hover:shadow-xl"
              >
                Get Started Free
              </Link>
              <Link
                to="/features"
                className="bg-transparent text-white px-10 py-4 rounded-lg no-underline text-lg font-semibold inline-block transition-all border-2 border-white hover:bg-white/10"
              >
                View All Features
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
