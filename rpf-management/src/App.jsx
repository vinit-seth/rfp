// src/App.jsx
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import CreateRfp from "./pages/CreateRfp";
import Vendors from "./pages/Vendors";
import Proposals from "./pages/Proposals";
import Rfps from "./pages/Rfps";
import RfpDetail from "./pages/RfpDetail";
import Home from "./pages/Home";
import About from "./pages/About";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <Router>
      <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
          <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Brand */}
            {/* Brand */}
            <Link
              to="/"
              onClick={closeMenu}
              className="flex min-w-0 shrink-0 items-center gap-2 text-lg font-bold tracking-tight text-gray-900 transition hover:text-blue-600 sm:text-xl"
            >
              <img
                src="/logo.svg"
                alt=""
                className="h-8 w-8 shrink-0 object-contain"
              />
              <span className="truncate">AI RFP Manager</span>
            </Link>

            {/* Desktop / Tablet Navigation */}
            <nav className="hidden items-center gap-1 md:flex lg:gap-2">
              <Link
                to="/create"
                className="rounded-lg px-2.5 py-2 text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-600 lg:px-3"
              >
                Create
              </Link>

              <Link
                to="/rfps"
                className="rounded-lg px-2.5 py-2 text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-600 lg:px-3"
              >
                RFPs
              </Link>

              <Link
                to="/vendors"
                className="rounded-lg px-2.5 py-2 text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-600 lg:px-3"
              >
                Vendors
              </Link>

              <Link
                to="/proposals"
                className="rounded-lg px-2.5 py-2 text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-600 lg:px-3"
              >
                Proposals
              </Link>

              <Link
                to="/about"
                className="rounded-lg px-2.5 py-2 text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-600 lg:px-3"
              >
                About
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={
                menuOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={menuOpen}
              className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 md:hidden"
            >
              {menuOpen ? (
                /* X icon */
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                /* Hamburger icon */
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {menuOpen && (
            <nav className="border-t border-gray-100 bg-white px-4 py-3 md:hidden sm:px-6">
              <div className="mx-auto flex max-w-6xl flex-col gap-1">
                <Link
                  to="/create"
                  onClick={closeMenu}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
                >
                  Create
                </Link>

                <Link
                  to="/rfps"
                  onClick={closeMenu}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
                >
                  RFPs
                </Link>

                <Link
                  to="/vendors"
                  onClick={closeMenu}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
                >
                  Vendors
                </Link>

                <Link
                  to="/proposals"
                  onClick={closeMenu}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
                >
                  Proposals
                </Link>

                <Link
                  to="/about"
                  onClick={closeMenu}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
                >
                  About
                </Link>
              </div>
            </nav>
          )}
        </header>

        {/* Main content */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateRfp />} />
            <Route path="/rfps" element={<Rfps />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/proposals" element={<Proposals />} />
            <Route path="/rfps/:id" element={<RfpDetail />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white py-6">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
            <small className="text-sm text-gray-600">
              ©{" "}
              <a
                href="https://linkedin.com/in/vinit-seth"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-gray-900 hover:text-blue-600"
              >
                Vinit Seth
              </a>{" "}
              • Single-user Website • All Rights Reserved
            </small>
          </div>
        </footer>
      </div>
    </Router>
  );
}
