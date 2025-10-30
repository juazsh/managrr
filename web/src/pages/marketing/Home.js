import { Link } from "react-router-dom"
import heroConstruction from "../../assets/images/undraw_under-construction_c2y1.svg"
import sectionBudget from "../../assets/images/undraw_wallet_diag (1).svg"

const Home = () => {
  return (
    <div>
      <section className="bg-gradient-to-br from-background to-white py-20 px-4 text-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto">
            <div className="inline-block px-5 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6">
              ✨ Trusted by contractors & homeowners
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-text mb-8 leading-tight tracking-tight">
              Construction Projects Made <span className="text-primary relative">Transparent</span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-text-light mb-8 leading-relaxed max-w-2xl mx-auto">
              Stop the confusion. Track every dollar, every update, and every hour worked—all in one simple platform
              that keeps everyone on the same page.
            </p>
            <div className="flex gap-4 justify-center flex-wrap mb-4">
              <Link
                to="/register"
                className="bg-primary text-white px-10 py-5 rounded-lg no-underline text-lg font-semibold inline-block shadow-lg shadow-primary/30 transition-all hover:shadow-xl"
              >
                Start Free Today →
              </Link>
              <Link
                to="/how-it-works"
                className="bg-transparent text-primary px-10 py-5 rounded-lg no-underline text-lg font-semibold inline-block border-2 border-primary transition-all hover:bg-primary/10"
              >
                See How It Works
              </Link>
            </div>
            <p className="text-sm text-text-light mt-4">No credit card required • Free forever plan available</p>
          </div>
          <div className="max-w-2xl mx-auto mt-12">
            <img src={heroConstruction || "/placeholder.svg"} alt="Construction Management" className="w-full h-auto" />
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-t border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 text-center">
            <div className="p-4">
              <div className="text-4xl font-extrabold text-primary mb-2">98%</div>
              <div className="text-base text-text-light font-medium">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-5 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
              The Challenge
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-4 text-text tracking-tight">
              Construction Projects Are Stressful
            </h2>
            <p className="text-xl text-center text-text-light max-w-2xl mx-auto">
              Without transparency, small issues become big problems
            </p>
          </div>
          <div className="max-w-md mx-auto mb-12">
            <img src={sectionBudget || "/placeholder.svg"} alt="Budget Problems" className="w-full h-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <div className="text-center p-10 bg-white rounded-lg shadow-sm border border-border transition-all hover:shadow-md">
              <div className="text-6xl mb-6">😰</div>
              <h3 className="text-xl font-bold text-text mb-4 tracking-tight">Homeowners feel in the dark</h3>
              <p className="text-base text-text-light leading-relaxed">
                "Where did my money go?" "Is the work actually getting done?" "Did I pay them already?"
              </p>
            </div>
            <div className="text-center p-10 bg-white rounded-lg shadow-sm border border-border transition-all hover:shadow-md">
              <div className="text-6xl mb-6">📞</div>
              <h3 className="text-xl font-bold text-text mb-4 tracking-tight">Too many phone calls</h3>
              <p className="text-base text-text-light leading-relaxed">
                Constant back-and-forth about expenses, work progress, payments, and schedules wastes everyone's time
              </p>
            </div>
            <div className="text-center p-10 bg-white rounded-lg shadow-sm border border-border transition-all hover:shadow-md">
              <div className="text-6xl mb-6">💸</div>
              <h3 className="text-xl font-bold text-text mb-4 tracking-tight">Budget overruns</h3>
              <p className="text-base text-text-light leading-relaxed">
                Untracked expenses, disputed payments, and forgotten costs lead to budget chaos and arguments
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-primary to-blue-700 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-5 py-2 bg-white/20 text-white rounded-full text-sm font-semibold mb-4">
              The Solution
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-4 text-white tracking-tight">
              One Platform, Complete Transparency
            </h2>
            <p className="text-xl text-center text-white/90 max-w-2xl mx-auto">
              Everyone sees the same information in real-time
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            <div className="bg-white p-10 rounded-lg text-center shadow-2xl transition-all hover:shadow-3xl">
              <div className="text-6xl mb-6">📊</div>
              <h3 className="text-xl font-bold text-text mb-4 tracking-tight">Real-time expense tracking</h3>
              <p className="text-base text-text-light leading-relaxed">
                Upload receipt photos and track every dollar spent with complete visibility
              </p>
            </div>
            <div className="bg-white p-10 rounded-lg text-center shadow-2xl transition-all hover:shadow-3xl">
              <div className="text-6xl mb-6">💳</div>
              <h3 className="text-xl font-bold text-text mb-4 tracking-tight">Payment transparency</h3>
              <p className="text-base text-text-light leading-relaxed">
                Record payments with confirmation to prevent disputes and build trust
              </p>
            </div>
            <div className="bg-white p-10 rounded-lg text-center shadow-2xl transition-all hover:shadow-3xl">
              <div className="text-6xl mb-6">📸</div>
              <h3 className="text-xl font-bold text-text mb-4 tracking-tight">Daily progress updates</h3>
              <p className="text-base text-text-light leading-relaxed">
                Document work with photos and status updates everyone can see
              </p>
            </div>
            <div className="bg-white p-10 rounded-lg text-center shadow-2xl transition-all hover:shadow-3xl">
              <div className="text-6xl mb-6">📍</div>
              <h3 className="text-xl font-bold text-text mb-4 tracking-tight">Employee check-in/out</h3>
              <p className="text-base text-text-light leading-relaxed">
                GPS tracking and photo verification for complete accountability
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-br from-primary to-blue-700">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight">
              Ready to Build with Confidence?
            </h2>
            <p className="text-xl mb-10 opacity-95">Join hundreds of contractors and homeowners who trust Managrr</p>
            <Link
              to="/register"
              className="bg-white text-primary px-12 py-5 rounded-lg no-underline text-xl font-bold inline-block shadow-2xl transition-all hover:shadow-3xl"
            >
              Start Your First Project Free →
            </Link>
            <p className="text-base mt-6 opacity-90">
              ✓ No credit card required ✓ Setup in 5 minutes ✓ Cancel anytime
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
