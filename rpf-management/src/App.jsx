// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import CreateRfp from "./pages/CreateRfp";
import Vendors from "./pages/Vendors";
import Proposals from "./pages/Proposals";
import Rfps from "./pages/Rfps";
import RfpDetail from "./pages/RfpDetail";
import Home from "./pages/Home";
import About from "./pages/About";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Brand */}
            <Link
              to="/"
              className="text-lg font-bold tracking-tight text-gray-900 transition hover:text-blue-600"
            >
              AI RFP Manager
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              <Link
                to="/create"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
              >
                Create
              </Link>

              <Link
                to="/rfps"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
              >
                RFPs
              </Link>

              <Link
                to="/vendors"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
              >
                Vendors
              </Link>

              <Link
                to="/proposals"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
              >
                Proposals
              </Link>

              <Link
                to="/about"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
              >
                About
              </Link>
            </nav>
          </div>
        </header>

        {/* Main content */}
        <main>
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
      </div>
    </Router>
  );
}
