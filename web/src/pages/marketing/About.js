import React from 'react';
import { Link } from 'react-router-dom';
import aboutHero from '../../assets/images/undraw_building_burz.svg';
import solutionTech from '../../assets/images/undraw_visionary-technology_f6b3.svg';
import audienceContractors from '../../assets/images/undraw_construction-workers_z99i.svg';
import audienceHomeowners from '../../assets/images/undraw_coming-home_jmbc.svg';
import audienceResidential from '../../assets/images/undraw_houses_owky.svg';

export const About = () => {
  return (
    <div>
      <section className="bg-background py-12 px-4 text-center">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold text-text mb-4">About Managrr</h1>
          <p className="text-2xl text-primary font-semibold italic">
            Making construction projects transparent and stress-free
          </p>
          <div className="max-w-md mx-auto mt-8">
            <img
              src={aboutHero}
              alt="About Managrr"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-text text-center mb-12">The Problem We Solve</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-text mb-4">💸 Budget Overruns</h3>
                <p className="text-base text-text-light leading-relaxed">
                  Construction projects frequently exceed their estimated costs, often due to
                  hidden expenses, miscommunication, or lack of real-time tracking. House
                  owners are left in the dark about where their money is going.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-text mb-4">🤝 Poor Communication</h3>
                <p className="text-base text-text-light leading-relaxed">
                  Disputes arise from misunderstandings between house owners and contractors.
                  Without a shared source of truth, each party may have different expectations
                  and information about the project.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-text mb-4">📊 Tracking Challenges</h3>
                <p className="text-base text-text-light leading-relaxed">
                  It's difficult to track actual expenses versus estimates, monitor daily
                  progress, and verify employee work hours. Manual methods are time-consuming
                  and prone to errors.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-text mb-4">👁️ Lack of Visibility</h3>
                <p className="text-base text-text-light leading-relaxed">
                  House owners have no daily visibility into project progress without visiting
                  the site. Contractors struggle to document work and keep owners informed in
                  a timely manner.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-text text-center mb-12">Our Solution</h2>
            <div className="max-w-sm mx-auto mb-8">
              <img
                src={solutionTech}
                alt="Our Solution"
                className="w-full h-auto"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center p-6">
                <div className="text-5xl mb-4">📱</div>
                <h3 className="text-xl font-semibold text-text mb-4">Simple, Mobile-First Platform</h3>
                <p className="text-base text-text-light leading-relaxed">
                  Designed for ease of use on mobile devices. Contractors and employees can
                  update projects, upload photos, and track time directly from their phones
                  at the work site.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="text-5xl mb-4">🏗️</div>
                <h3 className="text-xl font-semibold text-text mb-4">Built for Small Contractors</h3>
                <p className="text-base text-text-light leading-relaxed">
                  Unlike enterprise software with complicated features, Managrr focuses on
                  what small contractors and homeowners actually need: simple project tracking,
                  expense management, and communication.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="text-5xl mb-4">💎</div>
                <h3 className="text-xl font-semibold text-text mb-4">Transparent Expense Tracking</h3>
                <p className="text-base text-text-light leading-relaxed">
                  Every expense is documented with receipt photos. Both owners and contractors
                  see the same information in real-time. No surprises, no hidden costs, just
                  complete transparency.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="text-5xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold text-text mb-4">Real-Time Progress Updates</h3>
                <p className="text-base text-text-light leading-relaxed">
                  Contractors share daily updates with photos. House owners see progress
                  immediately without having to visit the site. Everyone stays on the same page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-text text-center mb-12">Who We Serve</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="mb-6">
                  <img
                    src={audienceContractors}
                    alt="Small Contractors"
                    className="w-full h-auto max-w-xs mx-auto block"
                  />
                </div>
                <h3 className="text-2xl font-semibold text-text mb-4">Small Contractors</h3>
                <p className="text-base text-text-light leading-relaxed">
                  Independent contractors and small construction companies with 1-10 employees.
                  Those who need simple tools to manage projects, track expenses, and keep
                  clients informed without the complexity of enterprise software.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="mb-6">
                  <img
                    src={audienceHomeowners}
                    alt="Homeowners"
                    className="w-full h-auto max-w-xs mx-auto block"
                  />
                </div>
                <h3 className="text-2xl font-semibold text-text mb-4">Homeowners</h3>
                <p className="text-base text-text-light leading-relaxed">
                  House owners doing renovations, additions, or new construction. Those who
                  want visibility into their project without micromanaging, and who value
                  transparency in expenses and progress.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="mb-6">
                  <img
                    src={audienceResidential}
                    alt="Residential Projects"
                    className="w-full h-auto max-w-xs mx-auto block"
                  />
                </div>
                <h3 className="text-2xl font-semibold text-text mb-4">Residential Projects</h3>
                <p className="text-base text-text-light leading-relaxed">
                  Projects ranging from $10,000 to $100,000. Kitchen remodels, bathroom
                  renovations, home additions, basement finishing, and similar residential
                  construction work.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white p-8 md:p-12 rounded-lg shadow-md text-center max-w-3xl mx-auto border border-border">
            <h2 className="text-3xl font-bold text-text mb-4">Get in Touch</h2>
            <p className="text-lg text-text-light leading-relaxed mb-8">
              Have questions about Managrr? Want to learn more about how we can help your
              construction projects? We'd love to hear from you.
            </p>
            <div className="mb-8">
              <a href="mailto:support@managrr.com" className="text-xl text-primary no-underline font-semibold">
                support@managrr.com
              </a>
            </div>
            <Link to="/contact" className="bg-primary text-white px-8 py-4 rounded-lg no-underline text-lg font-semibold inline-block">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-primary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Projects?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join contractors and homeowners who are building with transparency
            </p>
            <Link to="/register" className="bg-white text-primary px-10 py-4 rounded-lg no-underline text-xl font-semibold inline-block">
              Get Started Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
