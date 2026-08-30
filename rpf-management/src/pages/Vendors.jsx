import React, { useEffect, useState } from "react";
import { listVendors, createVendor, deleteVendor } from "../api";

function validateName(value) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "Vendor name is required.";
  }

  return "";
}

function validateEmail(value) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "Vendor email is required.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmedValue)) {
    return "Please enter a valid email address.";
  }

  return "";
}

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [deletingVendorId, setDeletingVendorId] = useState(null);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);

    try {
      const data = await listVendors();
      setVendors(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  }

  function handleNameChange(e) {
    const value = e.target.value;

    setName(value);

    if (touched.name) {
      setNameError(validateName(value));
    }
  }

  function handleEmailChange(e) {
    const value = e.target.value;

    setEmail(value);

    if (touched.email) {
      setEmailError(validateEmail(value));
    }
  }

  function handleNameBlur() {
    setTouched((current) => ({
      ...current,
      name: true,
    }));

    setNameError(validateName(name));
  }

  function handleEmailBlur() {
    setTouched((current) => ({
      ...current,
      email: true,
    }));

    setEmailError(validateEmail(email));
  }

  const currentNameError = validateName(name);
  const currentEmailError = validateEmail(email);
  const isFormValid = !currentNameError && !currentEmailError;

  async function handleAdd(e) {
    e.preventDefault();

    const nameValidation = validateName(name);
    const emailValidation = validateEmail(email);

    setTouched({
      name: true,
      email: true,
    });

    setNameError(nameValidation);
    setEmailError(emailValidation);

    if (nameValidation || emailValidation) {
      return;
    }

    setSubmitting(true);

    try {
      const v = await createVendor({
        name: name.trim(),
        email: email.trim().toLowerCase(),
      });

      setVendors((current) => [v, ...current]);

      setName("");
      setEmail("");

      setNameError("");
      setEmailError("");

      setTouched({
        name: false,
        email: false,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to create vendor");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(vendor) {
    const confirmed = window.confirm(
      `Are you sure you want to remove "${vendor.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingVendorId(vendor._id);

    try {
      await deleteVendor(vendor._id);

      setVendors((current) =>
        current.filter((currentVendor) => currentVendor._id !== vendor._id),
      );
    } catch (err) {
      console.error(err);
      alert("Failed to remove vendor");
    } finally {
      setDeletingVendorId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>

        {/* Add vendor */}
        <form
          className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          onSubmit={handleAdd}
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Vendor name */}
            <div>
              <label
                htmlFor="vendor-name"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Vendor name
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                id="vendor-name"
                type="text"
                name="vendorName"
                autoComplete="organization"
                placeholder="Enter vendor name"
                value={name}
                onChange={handleNameChange}
                onBlur={handleNameBlur}
                required
                aria-invalid={touched.name && Boolean(nameError)}
                aria-describedby={
                  touched.name && nameError ? "vendor-name-error" : undefined
                }
                className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-2 ${
                  touched.name && nameError
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
              />

              {touched.name && nameError && (
                <p
                  id="vendor-name-error"
                  className="mt-1.5 text-sm text-red-600"
                >
                  {nameError}
                </p>
              )}
            </div>

            {/* Vendor email */}
            <div>
              <label
                htmlFor="vendor-email"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Vendor email
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                id="vendor-email"
                type="email"
                name="vendorEmail"
                autoComplete="email"
                placeholder="vendor@example.com"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                required
                aria-invalid={touched.email && Boolean(emailError)}
                aria-describedby={
                  touched.email && emailError ? "vendor-email-error" : undefined
                }
                className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-2 ${
                  touched.email && emailError
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
              />

              {touched.email && emailError && (
                <p
                  id="vendor-email-error"
                  className="mt-1.5 text-sm text-red-600"
                >
                  {emailError}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={!isFormValid || submitting}
              className="rounded-lg border border-gray-500 bg-gray-300 px-4 py-2.5 text-sm font-medium text-black transition enabled:hover:bg-blue-400 enabled:active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add vendor"}
            </button>
          </div>
        </form>

        {/* Vendor list */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">All vendors</h3>

          {loading ? (
            <div className="mt-4 text-sm text-gray-500">Loading...</div>
          ) : (
            <ul className="mt-4 divide-y divide-gray-100">
              {vendors.map((v) => (
                <li
                  key={v._id}
                  className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <strong className="text-sm font-semibold text-gray-900">
                      {v.name}
                    </strong>

                    <div className="mt-1 truncate text-sm text-gray-500">
                      {v.email}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(v)}
                    disabled={deletingVendorId === v._id}
                    className="rounded-lg border border-gray-500 bg-gray-300 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-blue-400 active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingVendorId === v._id ? "Removing..." : "Remove"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
