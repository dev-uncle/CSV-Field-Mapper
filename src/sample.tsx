"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";

interface User {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export default function CSVMapper() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [data, setData] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // EMAIL VALIDATION REGEX
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // HANDLE FILE UPLOAD
  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSV(text);
      setModalOpen(true);
      setErrorMessage("");
    };
    reader.readAsText(file);
  };

  // PARSE CSV TEXT
  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (!lines.length) return;

    setHeaders(lines[0].split(",").map((h) => h.trim()));
    setRows(
      lines.slice(1).map((line) => line.split(",").map((cell) => cell.trim())),
    );
  };

  // HANDLE FIELD MAPPING + LIVE VALIDATION
  const handleMappingChange = (field: string, column: string) => {
    setMapping((prev) => ({ ...prev, [field]: column }));

    if (!column) {
      setErrorMessage("");
      return;
    }

    const colIndex = headers.indexOf(column);
    if (colIndex === -1) return;

    let message = "";
    for (let i = 0; i < rows.length; i++) {
      const value = rows[i][colIndex] || "";
      if (field === "email" && !isValidEmail(value)) {
        message = `The column "${column}" mapped to "${field}" has an invalid email at row ${i + 2}: "${value}"`;
        break;
      }
      if (field !== "email" && !value) {
        message = `The column "${column}" mapped to "${field}" has an empty value at row ${i + 2}`;
        break;
      }
    }
    setErrorMessage(message);
  };

  // APPLY MAPPING
  const applyMapping = () => {
    if (errorMessage) return;

    const mappedData: User[] = rows.map((row) => {
      const rowObj: Record<string, string> = {};
      headers.forEach((h, i) => (rowObj[h] = row[i] || ""));

      return {
        name: rowObj[mapping.name] || "",
        email: rowObj[mapping.email] || "",
        phone: rowObj[mapping.phone] || "",
        address: rowObj[mapping.address] || "",
      };
    });

    setData(mappedData);
    setModalOpen(false);
  };

  const applyDisabled =
    errorMessage !== "" || Object.values(mapping).some((v) => !v);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="mb-4">
        <h1 className="text-2xl font-bold mb-1">CSV Field Mapper</h1>
        <p className="text-sm text-gray-500">
          Upload a CSV, map fields in the modal, and preview users. Errors
          update dynamically.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* UPLOAD */}
        <div className="lg:w-1/3 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Upload CSV</h2>
          <input
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        {/* PREVIEW */}
        <div className="flex-1 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Preview Users</h2>
          {data.length === 0 ? (
            <p className="text-gray-500 italic">No users mapped yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.map((user, i) => (
                <div
                  key={i}
                  className="border rounded-lg p-4 shadow hover:shadow-md transition"
                >
                  <h3 className="font-bold text-lg">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-600">{user.phone}</p>
                  <p className="text-sm text-gray-600">{user.address}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-bold mb-4">Map CSV Fields</h2>

            {/* DYNAMIC ERROR MESSAGE */}
            {errorMessage && (
              <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-sm">
                {errorMessage}
              </div>
            )}

            {Object.keys(mapping).map((field) => (
              <div key={field} className="mb-3">
                <label className="block text-sm font-medium mb-1">
                  {field}
                </label>
                <select
                  value={mapping[field]}
                  onChange={(e) => handleMappingChange(field, e.target.value)}
                  className={`w-full border rounded px-2 py-1 ${
                    errorMessage &&
                    mapping[field] &&
                    headers.indexOf(mapping[field]) >= 0
                      ? "border-red-500"
                      : ""
                  }`}
                >
                  <option value="">-- Select Column --</option>
                  {headers.map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={applyMapping}
                disabled={applyDisabled}
                className={`px-4 py-2 rounded text-white transition ${
                  applyDisabled
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
