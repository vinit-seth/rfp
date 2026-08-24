import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            AI RFP Manager
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600">
            Create RFPs in plain English, send them to vendors,
            automatically parse vendor responses using AI, and get
            recommendation-driven comparisons — all in one place.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/create"
              className="rounded-lg border border-gray-500 bg-gray-300 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-blue-400 active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Create RFP
            </Link>

            <Link to="/rfps"
              className="rounded-lg border border-gray-500 bg-gray-300 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-blue-400 active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              View RFPs
            </Link>

            <Link to="/vendors"
              className="rounded-lg border border-gray-500 bg-gray-300 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-blue-400 active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add Vendors
            </Link>

            <Link to="/proposals"
              className="rounded-lg border border-gray-500 bg-gray-300 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-blue-400 active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              View Proposals
            </Link>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900">
                Create
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Describe what you want to buy in natural language.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900">
                Send
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Pick vendors and send the structured RFP over email.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900">
                Receive
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Inbound replies parsed automatically into proposals.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900">
                Decide
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                AI ranks proposals to help you pick the best vendor.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

          <h2 className="text-2xl font-bold text-gray-900">
            Key Features
          </h2>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900">
                Natural-language RFP creation
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Write a simple description — the system will extract
                items, budget, timelines, and terms.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900">
                Vendor management
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Keep a vendor master, manage contacts, and choose
                recipients for each RFP.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900">
                Automated parsing
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Inbound vendor emails are parsed using AI to pull
                prices, delivery, and warranty details.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900">
                Recommendation engine
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Compare proposals with scores and concise rationales
                to pick the best fit.
              </p>
            </div>

          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <small className="text-sm text-black">
            © <Link to="https://linkedin.com/in/vinit-seth" className="font-bold" target="_blank">Vinit Seth</Link> • Single-user Website • All Rights Reserved
          </small>
        </div>
      </footer>

    </div>
  );
}