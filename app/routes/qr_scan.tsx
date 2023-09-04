import React, { useState, useEffect } from "react";
import QrReader from 'react-qr-scanner';


type QRScanData = {
    text: string;
    rawBytes: Uint8Array;
    numBits: number;
    resultPoints: any[];
    format: number;
};

type ScanResult = {
  data: string;
  isValid: boolean;
};

const QR = () => {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleScan = async (data: QRScanData) => {
    if (data && data.text) {
      const ticketId = data.text.split("http://localhost:3000/")[1];
      try {
        const res = await fetch(`/validate/${ticketId}`);
        const result = await res.json();
        if (res.status === 200) {
          setScanResult({ data: ticketId, isValid: true });
        } else {
          setScanResult({ data: ticketId, isValid: false });
          setError(result.message);
        }
      } catch (err) {
        console.error("Error validating ticket:", err);
        setError("Error validating ticket");
      }
    }
  };

  const handleError = (err: any) => {
    console.error(err);
    setError("An error occurred while scanning");
  };

  return (
    <div>
      {isClient && (
        <QrReader
          delay={300}
          onError={handleError}
          onScan={handleScan}
        />
      )}
      {scanResult && (
        <p>
          Scanned Result: {scanResult.data}
          <br />
          {scanResult.isValid ? "Ticket is valid" : "Ticket is invalid"}
        </p>
      )}
      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default QR;

export const loader = async () => {
  return {};
};
