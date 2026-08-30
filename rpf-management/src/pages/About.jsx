import React from "react";
import { Link } from "react-router-dom";
import { getExperience } from "../utils/experience";

export default function About() {
  const experience = getExperience("2024-01-02");
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            About AI RFP Manager
          </h1>

          <p className="mt-4 max-w-4xl text-base leading-7 text-gray-600">
            AI RFP Manager is a full-stack procurement management application
            designed to simplify the process of creating Requests for Proposal
            (RFPs), communicating with vendors, processing vendor responses,
            comparing proposals, and selecting the most suitable vendor.
          </p>

          <p className="mt-3 max-w-4xl text-base leading-7 text-gray-600">
            Instead of manually preparing RFP documents, sending emails, reading
            vendor responses, and comparing quotations, the application uses
            AI-assisted processing to automate much of this workflow and present
            the important information in a structured and easy-to-understand
            format.
          </p>
        </div>

        {/* How to use */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900">
            How to use the application
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            The complete workflow can be divided into the following steps.
          </p>

          <div className="mt-8 space-y-8">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                1
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Create an RFP
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Start by navigating to the <strong>Create RFP</strong> page.
                  Describe your procurement requirement using natural language.
                  You can mention the products you need, quantities, technical
                  specifications, budget, expected delivery time, payment terms,
                  warranty requirements, and any other relevant information.
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  The application sends this description to the backend, where
                  the information is processed and converted into a structured
                  RFP containing fields such as items, quantities, budget,
                  delivery requirements, payment terms, and warranty.
                </p>

                <div className="mt-3 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                  <strong>Example:</strong> Instead of manually filling a form,
                  you can write something like:
                  <span className="mt-1 block italic text-gray-500">
                    "We need 25 laptops and 25 monitors for our Chennai office.
                    The laptops should have at least 8GB RAM and 512GB SSD.
                    Required delivery is within 14 days with a budget of
                    ₹15,00,000."
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                2
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Review the structured RFP
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Once the RFP is created, the application stores the structured
                  information in MongoDB. The RFP detail page allows you to
                  review the generated requirement before sending it to vendors.
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  This gives you an opportunity to verify important details such
                  as item quantities, budget, delivery requirements, payment
                  terms, and warranty before proceeding.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                3
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Manage vendors
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Use the <strong>Vendors</strong> section to maintain the
                  vendor master. You can add vendor names and their email
                  addresses, which can then be selected when sending an RFP.
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Keeping vendor information in one place makes it easier to
                  reuse vendor contacts across multiple procurement requests.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                4
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Send the RFP to vendors
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  From the RFP detail page, select one or more registered
                  vendors and send the RFP to them. The backend uses the
                  configured email service to send the procurement request.
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Each email contains the RFP information and a unique RFP ID.
                  This ID allows the system to identify which procurement
                  request a vendor response belongs to.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                5
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Receive vendor proposals
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Vendors can reply to the RFP through email with their
                  proposals. The backend monitors the configured mailbox and
                  identifies responses from registered vendors.
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  The system identifies the relevant RFP using the RFP ID
                  contained in the email and processes the vendor's response.
                  The mailbox is checked periodically, so please allow a few
                  minutes after replying before the proposal appears in the
                  application. Previously processed emails are tracked to
                  prevent the same proposal from being processed multiple times.
                </p>
              </div>
            </div>

            {/* Step 6 */}
            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                6
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  AI-assisted proposal extraction
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Vendor emails are processed using AI to extract structured
                  proposal information. Important details such as vendor name,
                  individual items, quantities, unit prices, total prices,
                  overall proposal value, delivery time, payment terms, and
                  warranty are extracted from the email.
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  The extracted information is stored as a proposal in MongoDB,
                  making vendor responses much easier to compare than reading
                  individual emails manually.
                </p>
              </div>
            </div>

            {/* Step 7 */}
            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                7
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Review proposals
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Navigate to the <strong>Proposals</strong> page to view vendor
                  responses in a structured format. Each proposal shows the
                  vendor, total price, proposed items, delivery timeline,
                  payment terms, and warranty.
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  The proposal list is periodically refreshed so that newly
                  processed vendor responses can appear without requiring the
                  user to manually reload the page.<strong> If you are testing the
                  application, please allow a few minutes after sending a vendor
                  reply for it to be processed and appear here</strong>.
                </p>
              </div>
            </div>

            {/* Step 8 */}
            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                8
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Compare proposals
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Once proposals have been received, use the{" "}
                  <strong>Compare Proposals</strong> action for the relevant
                  RFP.
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  The comparison process evaluates the available proposals
                  against important procurement criteria such as price, delivery
                  timeline, warranty, payment terms, and the original RFP
                  requirements.
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  The result is presented as a readable comparison table
                  containing vendor details, pricing, delivery information,
                  warranty, ranking scores, and an explanation of why each
                  proposal received its score.
                </p>
              </div>
            </div>

            {/* Step 9 */}
            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                9
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Get an AI-powered recommendation
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  After comparing the proposals, the{" "}
                  <strong>Recommend Vendor</strong> action becomes available.
                  The recommendation process evaluates the available options and
                  provides a ranked recommendation along with a concise
                  rationale.
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  The recommendation is designed to support the final
                  procurement decision by highlighting the strengths and
                  weaknesses of each vendor rather than simply selecting the
                  lowest-priced proposal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technology */}
        <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Technology & Architecture
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            AI RFP Manager is built using the MERN stack along with supporting
            technologies for email processing and AI-assisted data extraction.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-5">
              <h3 className="text-lg font-semibold text-gray-900">MongoDB</h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                MongoDB is used as the application's database. It stores RFPs,
                vendors, proposals, processed email information, and other
                application data in a flexible document-oriented structure.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-5">
              <h3 className="text-lg font-semibold text-gray-900">
                Express.js
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Express.js is used to build the backend REST APIs. The API layer
                handles operations such as creating RFPs, managing vendors,
                retrieving proposals, sending RFP emails, comparing proposals,
                and generating vendor recommendations.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-5">
              <h3 className="text-lg font-semibold text-gray-900">React</h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                React powers the frontend application. The UI is divided into
                reusable components and pages for RFP creation, RFP details,
                vendor management, proposal management, comparison, and
                recommendations.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-5">
              <h3 className="text-lg font-semibold text-gray-900">Node.js</h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Node.js provides the runtime environment for the backend. It
                handles API requests, database operations, email processing,
                background mailbox polling, and integration with the AI
                processing layer.
              </p>
            </div>
          </div>

          {/* Supporting technologies */}
          <div className="mt-6 rounded-lg bg-gray-50 p-5">
            <h3 className="text-lg font-semibold text-gray-900">
              Supporting technologies
            </h3>

            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-gray-600">
              <li>
                <strong>Tailwind CSS</strong> for responsive and utility-based
                frontend styling.
              </li>

              <li>
                <strong>React Router</strong> for client-side navigation and
                routing between application pages.
              </li>

              <li>
                <strong>Mongoose</strong> for MongoDB data modeling and database
                interaction.
              </li>

              <li>
                <strong>IMAP/email processing</strong> for monitoring incoming
                vendor responses.
              </li>

              <li>
                <strong>AI-assisted parsing and evaluation</strong> for
                converting unstructured vendor emails into structured proposals
                and generating comparison and recommendation insights.
              </li>
            </ul>
          </div>

          {/* Architecture flow */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900">
              High-level workflow
            </h3>

            <div className="mt-4 overflow-x-auto rounded-lg bg-gray-900 p-5">
              <pre className="text-sm leading-7 text-gray-100">
                {`React + Tailwind CSS
        │
        │ REST API
        ▼
Node.js + Express.js
        │
        ├──────────────► MongoDB
        │
        ├──────────────► Email / IMAP
        │                    │
        │                    ▼
        │              Vendor responses
        │                    │
        │                    ▼
        └──────────────► AI processing
                             │
                             ▼
                       Structured proposals
                             │
                             ▼
                  Comparison + Recommendation`}
              </pre>
            </div>
          </div>
        </section>

        {/* About developer */}
        <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900">
            About the Developer
          </h2>

          <p className="mt-4 text-base leading-7 text-gray-600">
            Hi, I'm{" "}
            <Link
              to="https://linkedin.com/in/vinit-seth"
              className="font-bold"
              target="_blank"
            >
              Vinit Seth
            </Link>
            , a MERN Stack Developer with
            <strong> {experience} of professional experience</strong>{" "}
          </p>

          <p className="mt-4 text-base leading-7 text-gray-600">
            I started my corporate journey in <strong>January 2024</strong>,
            where I have worked on developing and contributing to web
            applications using modern JavaScript and full-stack technologies.
          </p>

          <p className="mt-4 text-base leading-7 text-gray-600">
            My primary area of interest is full-stack web development,
            particularly building applications using the MERN stack. I enjoy
            working across both frontend and backend layers — from designing
            responsive React interfaces and managing application state to
            developing REST APIs, integrating databases, and implementing
            backend services.
          </p>

          <p className="mt-4 text-base leading-7 text-gray-600">
            I completed my{" "}
            <strong>Master of Computer Applications (MCA)</strong> from{" "}
            <strong>Heritage Institute of Technology, Kolkata</strong> in
            <strong> 2023</strong>.
          </p>

          <p className="mt-4 text-base leading-7 text-gray-600">
            AI RFP Manager is an example of how I approach full-stack
            application development — combining a practical business workflow
            with a modern web stack, database-driven architecture, email
            automation, AI-assisted processing, and a user-friendly interface.
          </p>
        </section>
      </div>
    </div>
  );
}
