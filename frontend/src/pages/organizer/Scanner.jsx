import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import toast from "react-hot-toast";
import api from "../../services/api";

function Scanner() {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
    });

    const success = async (result) => {
      scanner.clear();
      setLoading(true);
      try {
        const response = await api.post("/ticket/scan", { ticketNumber: result });
        toast.success(response.data.message || "Ticket Verified!");
        setScanResult(response.data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Invalid Ticket");
        setScanResult({ error: error.response?.data?.message || "Invalid Ticket" });
      } finally {
        setLoading(false);
      }
    };

    const error = (err) => {
      // Ignore routine scan errors
    };

    scanner.render(success, error);

    return () => {
      scanner.clear();
    };
  }, []);

  const resetScanner = () => {
    setScanResult(null);
    window.location.reload(); // Simple way to remount the scanner easily
  };

  return (
    <div className="max-w-xl mx-auto p-4 mt-8">
      <h1 className="text-2xl font-bold mb-4 text-center">Ticket Scanner</h1>

      {loading ? (
        <div className="text-center p-8">Processing ticket...</div>
      ) : !scanResult ? (
        <div id="reader" className="bg-white p-4 rounded-xl shadow"></div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-lg text-center">
          {scanResult.error ? (
            <div className="text-red-600">
              <h2 className="text-2xl font-bold mb-2">Error</h2>
              <p>{scanResult.error}</p>
            </div>
          ) : (
            <div className="text-green-600">
              <h2 className="text-2xl font-bold mb-2">Verified!</h2>
              <p className="mb-2"><strong>Attendee:</strong> {scanResult.attendee?.name}</p>
              <p className="mb-2"><strong>Event:</strong> {scanResult.event?.title}</p>
              <p className="mb-2 text-sm text-gray-500">Ticket #: {scanResult.ticketNumber}</p>
            </div>
          )}
          
          <button
            onClick={resetScanner}
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Scan Another
          </button>
        </div>
      )}
    </div>
  );
}

export default Scanner;
