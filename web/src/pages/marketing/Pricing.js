import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import pricingHero from '../../assets/images/undraw_wallet_diag (1).svg';

export const Pricing = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: 'Can I switch plans?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you\'ll be charged the prorated difference. When downgrading, your account will be credited for the next billing cycle.',
    },
    {
      question: 'What happens if I cancel?',
      answer: 'You can cancel anytime. For monthly subscriptions, you\'ll have access until the end of your billing period. For pay-per-project, you\'ll have access for the full 6 months.',
    },
    {
      question: 'Do I need a credit card for the free tier?',
      answer: 'No! The free tier requires no credit card. You can start using Managrr immediately and upgrade when you\'re ready.',
    },
    {
      question: 'Are there any hidden fees?',
      answer: 'No hidden fees, ever. What you see is what you pay. No setup fees, no cancellation fees, no surprise charges.',
    },
    {
      question: 'Can I get a refund?',
      answer: 'Yes! We offer a 30-day money-back guarantee on all paid plans. If you\'re not satisfied, we\'ll refund your payment, no questions asked.',
    },
  ];

  return (
    <div>
      <section className="bg-background py-12 px-4 text-center">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold text-text mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-text-light max-w-2xl mx-auto">
            Start free, upgrade when you're ready. No credit card required to start.
          </p>
          <div className="max-w-sm mx-auto mt-8">
            <img
              src={pricingHero}
              alt="Pricing Plans"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-10 rounded-lg shadow-md relative">
              <h3 className="text-3xl font-bold text-text mb-4 text-center">Free</h3>
              <div className="text-center mb-4">
                <span className="text-6xl font-bold text-primary">$0</span>
                <span className="text-lg text-text-light"> forever</span>
              </div>
              <p className="text-center text-base text-text-light mb-8 italic">Perfect for: Try before you buy</p>

              <ul className="list-none p-0 mb-8">
                <li className="text-base text-text mb-3 pl-2">✓ 1 project (lifetime)</li>
                <li className="text-base text-text mb-3 pl-2">✓ All core features</li>
                <li className="text-base text-text mb-3 pl-2">✓ Email support</li>
                <li className="text-base text-text mb-3 pl-2">✓ Unlimited employees</li>
                <li className="text-base text-text mb-3 pl-2">✓ Photo uploads</li>
              </ul>

              <Link to="/register" className="block w-full text-center px-4 py-4 bg-white text-primary border-2 border-primary rounded-lg no-underline text-lg font-semibold transition-all hover:bg-primary/10">
                Get Started Free
              </Link>
            </div>

            <div className="bg-white p-10 rounded-lg shadow-md relative">
              <h3 className="text-3xl font-bold text-text mb-4 text-center">Pay Per Project</h3>
              <div className="text-center mb-4">
                <span className="text-6xl font-bold text-primary">$99</span>
                <span className="text-lg text-text-light"> per project</span>
              </div>
              <p className="text-center text-base text-text-light mb-8 italic">Perfect for: Occasional contractors</p>

              <ul className="list-none p-0 mb-8">
                <li className="text-base text-text mb-3 pl-2">✓ One-time payment</li>
                <li className="text-base text-text mb-3 pl-2">✓ Active for 6 months</li>
                <li className="text-base text-text mb-3 pl-2">✓ All features included</li>
                <li className="text-base text-text mb-3 pl-2">✓ Priority support</li>
                <li className="text-base text-text mb-3 pl-2">✓ Unlimited employees</li>
              </ul>

              <Link to="/register" className="block w-full text-center px-4 py-4 bg-white text-primary border-2 border-primary rounded-lg no-underline text-lg font-semibold transition-all hover:bg-primary/10">
                Start a Project
              </Link>
            </div>

            <div className="bg-white p-10 rounded-lg shadow-md relative border-3 border-primary transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white px-6 py-2 rounded-full text-sm font-semibold">
                Recommended
              </div>
              <h3 className="text-3xl font-bold text-text mb-4 text-center">Pro</h3>
              <div className="text-center mb-4">
                <span className="text-6xl font-bold text-primary">$39</span>
                <span className="text-lg text-text-light"> /month</span>
              </div>
              <p className="text-center text-base text-text-light mb-8 italic">Perfect for: Active contractors</p>

              <ul className="list-none p-0 mb-8">
                <li className="text-base text-text mb-3 pl-2">✓ Unlimited projects</li>
                <li className="text-base text-text mb-3 pl-2">✓ All features</li>
                <li className="text-base text-text mb-3 pl-2">✓ Priority support</li>
                <li className="text-base text-text mb-3 pl-2">✓ Advanced analytics (coming soon)</li>
                <li className="text-base text-text mb-3 pl-2">✓ Unlimited employees</li>
              </ul>

              <Link to="/register" className="block w-full text-center px-4 py-4 bg-primary text-white rounded-lg no-underline text-lg font-semibold transition-all hover:shadow-lg">
                Start Free Trial
              </Link>
              <p className="text-center text-sm text-text-light mt-3">14-day free trial available in V1.5</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-text text-center mb-12">Feature Comparison</h2>
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-background">
                  <th className="p-5 text-left text-base text-text">Feature</th>
                  <th className="p-5 text-center text-base text-text">Free</th>
                  <th className="p-5 text-center text-base text-text">Pay Per Project</th>
                  <th className="p-5 text-center text-base text-text">Pro</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-5 text-left font-semibold text-base text-text">Number of Projects</td>
                  <td className="p-5 text-center text-base text-text">1</td>
                  <td className="p-5 text-center text-base text-text">1 per payment</td>
                  <td className="p-5 text-center text-base text-text">Unlimited</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-5 text-left font-semibold text-base text-text">Project Duration</td>
                  <td className="p-5 text-center text-base text-text">Unlimited</td>
                  <td className="p-5 text-center text-base text-text">6 months</td>
                  <td className="p-5 text-center text-base text-text">Unlimited</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-5 text-left font-semibold text-base text-text">Employees</td>
                  <td className="p-5 text-center text-base text-text">Unlimited</td>
                  <td className="p-5 text-center text-base text-text">Unlimited</td>
                  <td className="p-5 text-center text-base text-text">Unlimited</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-5 text-left font-semibold text-base text-text">Photo Uploads</td>
                  <td className="p-5 text-center text-base text-text">✓</td>
                  <td className="p-5 text-center text-base text-text">✓</td>
                  <td className="p-5 text-center text-base text-text">✓</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-5 text-left font-semibold text-base text-text">Expense Tracking</td>
                  <td className="p-5 text-center text-base text-text">✓</td>
                  <td className="p-5 text-center text-base text-text">✓</td>
                  <td className="p-5 text-center text-base text-text">✓</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-5 text-left font-semibold text-base text-text">Daily Updates</td>
                  <td className="p-5 text-center text-base text-text">✓</td>
                  <td className="p-5 text-center text-base text-text">✓</td>
                  <td className="p-5 text-center text-base text-text">✓</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-5 text-left font-semibold text-base text-text">Support</td>
                  <td className="p-5 text-center text-base text-text">Email</td>
                  <td className="p-5 text-center text-base text-text">Priority</td>
                  <td className="p-5 text-center text-base text-text">Priority</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-5 text-left font-semibold text-base text-text">Advanced Analytics</td>
                  <td className="p-5 text-center text-base text-text">-</td>
                  <td className="p-5 text-center text-base text-text">-</td>
                  <td className="p-5 text-center text-base text-text">Coming Soon</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-text text-center mb-12">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white mb-4 rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-6 bg-transparent border-none text-left text-lg font-semibold text-text cursor-pointer flex justify-between items-center"
                >
                  <span>{faq.question}</span>
                  <span className="text-2xl text-primary font-normal">{openFaq === index ? '−' : '+'}</span>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-base text-text-light leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-primary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8 opacity-90">
              Start with our free tier and upgrade when you're ready
            </p>
            <Link to="/register" className="bg-white text-primary px-10 py-4 rounded-lg no-underline text-xl font-semibold inline-block">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
