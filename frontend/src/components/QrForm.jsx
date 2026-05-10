import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export default function QrForm() {
  const [url, setUrl] = useState('');
  const [showQr, setShowQr] = useState(false);
  const qrRef = useRef();

  const handleGenerate = (e) => {
    e.preventDefault();
    if (url) setShowQr(true);
  };

  const downloadQR = () => {
    const canvas = qrRef.current.querySelector('canvas');
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = "qrcode.png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="card shadow-sm border-0 rounded-4 p-4">
      <h3 className="fw-bold mb-4 text-center">Tạo Mã QR</h3>
      <form onSubmit={handleGenerate}>
        <div className="input-group mb-3">
          <input
            type="url"
            className="form-control form-control-lg rounded-start-pill ps-4"
            placeholder="Dán link vào đây để tạo QR..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <button 
            className="btn btn-primary px-4 rounded-end-pill fw-bold" 
            type="submit"
          >
            Tạo QR
          </button>
        </div>
      </form>

      {showQr && (
        <div className="text-center mt-4 animate__animated animate__fadeIn">
          <div ref={qrRef} className="p-3 bg-white d-inline-block rounded-3 shadow-sm border">
            <QRCodeCanvas
              value={url}
              size={200}
              level={"H"} // Độ sửa lỗi cao
              includeMargin={true}
            />
          </div>
          <div className="mt-3">
            <button 
              onClick={downloadQR} 
              className="btn btn-outline-success btn-sm rounded-pill px-4"
            >
              Tải ảnh QR về máy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}