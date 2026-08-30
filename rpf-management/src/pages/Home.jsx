import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const quickActions = [
    {
      label: "Create RFP",
      to: "/create",
      primary: true,
    },
    {
      label: "View RFPs",
      to: "/rfps",
      primary: false,
    },
    {
      label: "Add Vendors",
      to: "/vendors",
      primary: false,
    },
    {
      label: "View Proposals",
      to: "/proposals",
      primary: false,
    },
  ];

  const workflowCards = [
    {
      title: "Create",
      description:
        "Describe what you want to buy in natural language.",
    },
    {
      title: "Send",
      description:
        "Pick vendors and send the structured RFP over email.",
    },
    {
      title: "Receive",
      description:
        "Inbound replies parsed automatically into proposals.",
    },
    {
      title: "Decide",
      description:
        "AI ranks proposals to help you pick the best vendor.",
    },
  ];

  const features = [
    {
      title: "Natural-language RFP creation",
      description:
        "Write a simple description — the system will extract items, budget, timelines, and terms.",
    },
    {
      title: "Vendor management",
      description:
        "Keep a vendor master, manage contacts, and choose recipients for each RFP.",
    },
    {
      title: "Automated parsing",
      description:
        "Inbound vendor emails are parsed using AI to pull prices, delivery, and warranty details.",
    },
    {
      title: "Recommendation engine",
      description:
        "Compare proposals with scores and concise rationales to pick the best fit.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">

          {/* Heading */}
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            AI RFP Manager
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-7 text-gray-600 sm:mt-6 sm:text-lg sm:leading-8">
            Create RFPs in plain English, send them to vendors,
            automatically parse vendor responses using AI, and get
            recommendation-driven comparisons — all in one place.
          </p>

          {/* Quick Actions */}
          <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 sm:flex sm:flex-wrap">
            {quickActions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="rounded-lg border border-gray-500 bg-gray-300 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-blue-400 active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {action.label}
              </Link>
            ))}
          </div>

          {/* Workflow */}
          <div className="mt-12 grid gap-5 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
            {workflowCards.map((card) => (
              <div
                key={card.title}
                className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >
                <h3 className="font-semibold text-gray-900 transition-colors duration-200 group-hover:text-blue-700">
                  {card.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-10 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Key Features
          </h2>

          <div className="mt-7 grid gap-5 sm:mt-8 sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg sm:p-6"
              >
                <h3 className="font-semibold text-gray-900 transition-colors duration-200 group-hover:text-blue-700">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}