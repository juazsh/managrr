import { Link } from "react-router-dom"
import dashTech from "../../assets/images/undraw_visionary-technology_f6b3.svg"
import employeesImg from "../../assets/images/undraw_construction-workers_z99i.svg"
import timeTrackingImg from "../../assets/images/undraw_ordinary-day_ak4e.svg"
import expenseImg from "../../assets/images/undraw_wallet_diag (1).svg"
import photosImg from "../../assets/images/undraw_add-information_06qr.svg"
import updatesImg from "../../assets/images/undraw_building_burz.svg"
import transparencyImg from "../../assets/images/undraw_small-town_76a2.svg"

export const Features = () => {
  return (
    <div>
      <section className="bg-gradient-to-br from-primary to-blue-700 py-12 md:py-20 text-center text-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="inline-block bg-white/20 text-white px-5 py-2 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm">
            ✨ All Features Included Free
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            Powerful Features for Construction Management
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed opacity-95">
            Everything you need to manage construction projects with complete transparency and real-time visibility
          </p>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center mb-8">
            <div className="flex-1 min-w-[300px]">
              <div className="text-5xl md:text-6xl mb-4">📋</div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text mb-4 leading-tight">
                Project Dashboard
              </h2>
              <p className="text-base md:text-lg text-text-light leading-relaxed mb-6">
                A centralized hub where house owners and contractors see the same information in real-time. View project
                status, recent updates, expenses, payments, and employee activity all in one place. No more
                back-and-forth emails or wondering what's happening.
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Real-time project overview</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Progress photos timeline</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Daily and weekly updates</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Expense tracking</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Payment history</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Work log summaries</span>
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-[300px] flex justify-center items-center">
              <img
                src={dashTech || "/placeholder.svg"}
                alt="Project Dashboard"
                className="w-full h-auto max-w-md drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row-reverse gap-8 md:gap-16 items-center mb-8">
            <div className="flex-1 min-w-[300px]">
              <div className="text-5xl md:text-6xl mb-4">👷</div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text mb-4 leading-tight">
                Employee Management
              </h2>
              <p className="text-base md:text-lg text-text-light leading-relaxed mb-6">
                Contractors can add employees to their account, assign them to specific projects, and set hourly rates.
                Keep track of your entire crew in one system.
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Add unlimited employees</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Assign to multiple projects</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Set hourly rates</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Track employee activity</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>View work history</span>
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-[300px] flex justify-center items-center">
              <img
                src={employeesImg || "/placeholder.svg"}
                alt="Employee Management"
                className="w-full h-auto max-w-md drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center mb-8">
            <div className="flex-1 min-w-[300px]">
              <div className="text-5xl md:text-6xl mb-4">⏰</div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text mb-4 leading-tight">
                Time Tracking with Photo Verification
              </h2>
              <p className="text-base md:text-lg text-text-light leading-relaxed mb-6">
                Employees check in and out with photo verification and optional GPS tracking. Automatic calculation of
                hours worked ensures accurate time records and reduces disputes.
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Photo check-in/check-out</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>GPS location stamps</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Automatic hours calculation</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Daily work logs</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Weekly summaries</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Accountability through transparency</span>
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-[300px] flex justify-center items-center">
              <img
                src={timeTrackingImg || "/placeholder.svg"}
                alt="Time Tracking"
                className="w-full h-auto max-w-md drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row-reverse gap-8 md:gap-16 items-center mb-8">
            <div className="flex-1 min-w-[300px]">
              <div className="text-5xl md:text-6xl mb-4">💰</div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text mb-4 leading-tight">
                Complete Expense Tracking
              </h2>
              <p className="text-base md:text-lg text-text-light leading-relaxed mb-6">
                Upload receipt photos and track every expense with detailed categorization. See running totals, filter
                by category or payer, and keep a complete financial record of your project. No more lost receipts or
                forgotten costs.
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Receipt photo uploads</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Categorize by materials, labor, equipment</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Track who paid (owner/contractor)</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Running totals by category</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Date range filtering</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Expense breakdown reports</span>
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-[300px] flex justify-center items-center">
              <img
                src={expenseImg || "/placeholder.svg"}
                alt="Expense Tracking"
                className="w-full h-auto max-w-md drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center mb-8">
            <div className="flex-1 min-w-[300px]">
              <div className="text-5xl md:text-6xl mb-4">💳</div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text mb-4 leading-tight">
                Payment Summary & Tracking
              </h2>
              <p className="text-base md:text-lg text-text-light leading-relaxed mb-6">
                House owners record every payment made to contractors with full transparency. Contractors confirm
                receipt to lock the record, creating an indisputable payment history. Track payment methods, dates, and
                amounts all in one place.
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Record payments with proof</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Multiple payment methods</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Contractor confirmation system</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Payment screenshot uploads</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Running total of confirmed payments</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Complete payment history</span>
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-[300px] flex justify-center items-center">
              <img
                src={expenseImg || "/placeholder.svg"}
                alt="Payment Tracking"
                className="w-full h-auto max-w-md drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row-reverse gap-8 md:gap-16 items-center mb-8">
            <div className="flex-1 min-w-[300px]">
              <div className="text-5xl md:text-6xl mb-4">📷</div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text mb-4 leading-tight">
                Progress Photo Documentation
              </h2>
              <p className="text-base md:text-lg text-text-light leading-relaxed mb-6">
                Create a visual timeline of your project's progress. Upload photos with captions to document work as it
                happens. Perfect for insurance, quality assurance, and keeping house owners informed.
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Unlimited photo uploads</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Add captions and notes</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Chronological timeline view</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Before and after documentation</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Shared between owner and contractor</span>
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-[300px] flex justify-center items-center">
              <img
                src={photosImg || "/placeholder.svg"}
                alt="Progress Photos"
                className="w-full h-auto max-w-md drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center mb-8">
            <div className="flex-1 min-w-[300px]">
              <div className="text-5xl md:text-6xl mb-4">📝</div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text mb-4 leading-tight">
                Daily & Weekly Updates
              </h2>
              <p className="text-base md:text-lg text-text-light leading-relaxed mb-6">
                Contractors post daily summaries and weekly plans to keep house owners in the loop. Add multiple photos
                to each update and provide detailed progress notes. Communication that builds trust.
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Daily progress summaries</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Weekly work plans</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Multiple photos per update</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Instant notifications</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Update history timeline</span>
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-[300px] flex justify-center items-center">
              <img
                src={updatesImg || "/placeholder.svg"}
                alt="Project Updates"
                className="w-full h-auto max-w-md drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row-reverse gap-8 md:gap-16 items-center mb-8">
            <div className="flex-1 min-w-[300px]">
              <div className="text-5xl md:text-6xl mb-4">🤝</div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text mb-4 leading-tight">
                Complete Transparency
              </h2>
              <p className="text-base md:text-lg text-text-light leading-relaxed mb-6">
                The biggest challenge in construction projects is miscommunication and hidden information. With Managrr,
                all parties see the same information at the same time. No surprises, no hidden costs, no
                miscommunication. Build trust through transparency.
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Shared view of all project data</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Real-time updates for everyone</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>No information asymmetry</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Payment confirmation system</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Build trust through openness</span>
                </div>
                <div className="flex items-start gap-3 text-sm md:text-base text-text leading-relaxed">
                  <span className="text-success font-bold text-xl flex-shrink-0">✓</span>
                  <span>Reduce disputes and misunderstandings</span>
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-[300px] flex justify-center items-center">
              <img
                src={transparencyImg || "/placeholder.svg"}
                alt="Transparency"
                className="w-full h-auto max-w-md drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-primary to-blue-700">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">Start Using These Features Today</h2>
            <p className="text-lg md:text-xl mb-8 opacity-95 leading-relaxed">
              All features available on the free tier—no credit card required
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to="/register"
                className="bg-white text-primary px-7 md:px-10 py-3 md:py-4 rounded-lg no-underline text-base md:text-xl font-semibold inline-block transition-all hover:shadow-xl shadow-md"
              >
                Create Free Account
              </Link>
              <Link
                to="/how-it-works"
                className="bg-transparent text-white px-7 md:px-10 py-3 md:py-4 rounded-lg no-underline text-base md:text-xl font-semibold inline-block transition-all hover:bg-white/10 border-2 border-white"
              >
                See How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
