// OPSIE ASSESSMENT FOR FRONTED

// OBJECTTIVES

// Allow user to upload a CSV file and parse the data in the frontend and display it on the table or list
// Allow mapping CSV columns to predefined the fields (name, email, phone, address)
// Use atleast one Modal for field mapping.
// // Transformed data via POST request to a public API (https://jsonplaceholder.typicode.com/posts, https://reqres.in/api/users)

// ADDITIONAL FEATURES
// - Drag & Drop
// - Loading & Disabled states
// - clean logic and code

// EXPLANATION
// I do this setup by using a reusable component so it can be manage effeciently
// i also add the email validation
// first i integrate the file input so i can input the csv file then, gagamitin natin ang FileReader para basahin yung file as text. Once read na siya, ipapasa natin yung raw text sa parseCSV function. Dito sa function na to, inisplit natin yung text based on newlines (\r?\n) para makuha bawat row, at comma (,) para makuha bawat column.
// Ang first line ang magiging headers natin, at yung rest ay magiging rows.
// After parsing, mag open yung MappingModal. Dito sa modal, mapapansin niyo na may select dropdowns tayo. Ito yung ginagamit para mamap yung CSV columns (galing sa headers state) papunta sa User interface fields (name, email, etc.).
// Kapag clinick yung "Map and Preview", tatakbo yung processData function. Dito ginagawa yung data transformation. nitest natin if required fields like name at email ay naimap.
// Added validation din:
// const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// const hasInvalidEmails = mappedUsers.some(
//   (user) => user.email && !emailRegex.test(user.email),
// );
// If may invalid email, mag-set tayo ng feedback message as error at hindi natin ipapakita 'yung data sa table.
// Finally, 'yung handleSubmit function. Ginagamit natin ito para i-send 'yung transformed data state sa ating public API using fetch with POST method. May loading state tayo para disabled 'yung button habang naghihintay ng response from the API, at feedback state naman para ma-inform 'yung user if successful o failed 'yung submission.

// TOOLS Na nagamit
// Gumamit po ako nang AI for styling and some logic for the function
// Gumamit din po ako nang VITE para mapabiles yung pag initialize ko nang project
// I also used tailwindcss for the style

// HOW TO RUN.
// Make sure you clone the repository from this github link:
// then open the terminal and download the package needed by typing this command 'npm install'
// after that you can run the project by typing the 'npm run dev' command
// or you can visit the deployed version of this

import { useState, type DragEvent } from "react";

interface User {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export default function App() {
  // STATE
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

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (file: File | undefined) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSV(text);
      setModalOpen(true);
    };

    reader.readAsText(file);

    const parseCSV = (text: string) => {
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (!lines.length) return;

      setHeaders(lines[0].split(",").map((h) => h.trim()));
      setRows(
        lines
          .slice(1)
          .map((line) => line.split(",").map((cell) => cell.trim())),
      );
    };
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileChange(file);
  };

  const handleMappingChange = (systemField: string, csvHeader: string) => {
    setMapping((prev) => ({ ...prev, [systemField]: csvHeader }));
  };

  const processData = () => {
    if (!mapping.name || !mapping.email) {
      setFeedback({
        message: "Error: 'Name' and 'Email' fields must be mapped.",
        type: "error",
      });
      setModalOpen(false);
      return;
    }

    const mappedUsers: User[] = rows.map((row) => {
      const user: any = {};
      Object.keys(mapping).forEach((systemField) => {
        const csvHeader = mapping[systemField];
        const headerIndex = headers.indexOf(csvHeader);
        user[systemField] = headerIndex !== -1 ? row[headerIndex] : "";
      });
      return user as User;
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const hasInvalidEmails = mappedUsers.some(
      (user) => user.email && !emailRegex.test(user.email),
    );

    if (hasInvalidEmails) {
      setFeedback({
        message: "Error: Some email addresses in the CSV are invalid.",
        type: "error",
      });
      setModalOpen(false);
      return;
    }

    setData(mappedUsers);
    setModalOpen(false);
    setFeedback(null);
  };

  const handleSubmit = async () => {
    if (data.length === 0) {
      setFeedback({
        message: "No data to submit. Please map a CSV file first.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to submit data.");
      }

      setFeedback({ message: "Data submitted successfully!", type: "success" });
    } catch (error) {
      console.error("Error:", error);
      setFeedback({
        message: "Error submitting data. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <header>
            <h1 className="text-2xl font-bold mb-1">CSV Field Mapper</h1>
            <p className="text-sm text-muted-foreground">
              Map CSV columns to system fields, preview, and submit.
            </p>
          </header>

          {/* LIST GRID */}
          <div className=" w-full border rounded-2xl bg-white p-4">
            <UsersList users={data} />
          </div>
        </div>

        {/* --- INPUT FILE --- */}
        <aside className="lg:col-span-1 p-4 bg-white rounded-2xl border flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Input Your CSV File here</h2>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition
              ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
          >
            <p className="text-sm text-gray-600">
              Drag & Drop your CSV file here or
            </p>
            <label className="text-sm text-blue-600 font-semibold cursor-pointer hover:underline">
              browse
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileChange(e.target.files?.[0])}
                className="hidden"
              />
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || data.length === 0}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
          >
            {loading ? "Submitting..." : "Submit to API"}
          </button>

          {feedback && (
            <p
              className={`text-sm p-3 rounded-lg ${feedback.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {feedback.message}
            </p>
          )}
        </aside>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <MappingModal
          headers={headers}
          mapping={mapping}
          onMappingChange={handleMappingChange}
          onProcess={processData}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

const UserCard = ({ user }: { user: User }) => {
  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-md transition bg-white">
      <h3 className="font-bold text-lg">{user.name || "N/A"}</h3>
      <p className="text-sm text-gray-600">Email: {user.email || "N/A"}</p>
      <p className="text-sm text-gray-600">Phone: {user.phone || "N/A"}</p>
      <p className="text-sm text-gray-600">Address: {user.address || "N/A"}</p>
    </div>
  );
};

const UsersList = ({ users }: { users: User[] }) => {
  if (users.length === 0) {
    return (
      <p className="text-gray-500 italic text-center py-10">
        No users mapped yet. Please upload and map a CSV file.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map((user, index) => (
        <UserCard key={index} user={user} />
      ))}
    </div>
  );
};

interface MappingModalProps {
  headers: string[];
  mapping: Record<string, string>;
  onMappingChange: (systemField: string, csvHeader: string) => void;
  onProcess: () => void;
  onClose: () => void;
}

const MappingModal = ({
  headers,
  mapping,
  onMappingChange,
  onProcess,
  onClose,
}: MappingModalProps) => {
  const systemFields = ["name", "email", "phone", "address"];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4">Map CSV Columns</h2>
        <p className="text-sm text-gray-600 mb-6">
          Match your CSV columns to the required system fields.
          <span className="text-red-500 font-medium">
            {" "}
            *Name and Email are required.
          </span>
        </p>

        <div className="space-y-4 mb-6">
          {systemFields.map((field) => (
            <div key={field} className="grid grid-cols-2 gap-4 items-center">
              <label className="font-medium text-sm capitalize">{field}</label>
              <select
                value={mapping[field]}
                onChange={(e) => onMappingChange(field, e.target.value)}
                className="border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-300"
              >
                <option value="">Select CSV Column</option>
                {headers.map((header) => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onProcess}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Map and Preview
          </button>
        </div>
      </div>
    </div>
  );
};
