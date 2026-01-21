import { FiMessageSquare } from "react-icons/fi";

export const Index = () => {
  return (
    
      <div className="hidden flex-1 md:flex flex-col items-center justify-center text-center px-6">
        <img src="../../public/logo2.png" className="w-20 h-20" />

        <h2 className="text-2xl font-semibold text-gray-800">
          Welcome to QuickChat
        </h2>

        <p className="text-gray-500 mt-2 max-w-md">
          Send and receive messages securely. Start a new conversation by
          selecting a contact.
        </p>

        <button
          className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg
                         hover:bg-green-700 transition flex items-center gap-2"
        >
          <FiMessageSquare />
          Start New Chat
        </button>
      </div>

  );
};
