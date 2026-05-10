import { useState } from 'react';
import { shortenUrl, getHistory } from '../services/urlService';

export default function ShortenForm() {
    const [url, setUrl] = useState('');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    // 2. Xử lý khi bấm nút "GET" (Shorten)
    const handleShorten = async (e) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        try {
            // Gửi dữ liệu lên Backend qua Service
            const result = await shortenUrl({
                originalUrl: url,
                userId: user.id,
                title: "My Link" // Thêm title nếu Schema Backend của bạn bắt buộc (như file Seed)
            });

            // Nếu thành công, thêm kết quả từ DB vào danh sách hiển thị
            setHistory(prev => [result, ...prev]);
            setUrl('');
            alert("Rút gọn link thành công!");
        } catch (error) {
            console.error("Lỗi khi rút gọn:", error);
            alert("Không thể kết nối đến Backend. Hãy chắc chắn bạn đã chạy server!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="row justify-content-center w-100 m-0">
            <div className="col-md-10 col-lg-8">
                <div className="text-center mb-5">
                    <h1 className="display-4 fw-black text-dark fw-bolder mb-3">Build stronger connections</h1>
                    <p className="lead text-secondary">A powerful tool to create short, professional, and trackable links.</p>
                </div>

                {/* Form nhập Link */}
                <div className="card border-0 shadow-lg p-4 rounded-4 mb-5">
                    <div className="card-body">
                        <form onSubmit={handleShorten} className="row g-3">
                            <div className="col-md-9">
                                <input
                                    type="text"
                                    required
                                    className="form-control form-control-lg bg-light px-4 border-0"
                                    placeholder="Paste a long URL (e.g., https://example.com/...)"
                                    style={{ borderRadius: '12px' }}
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                />
                            </div>
                            <div className="col-md-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary btn-lg w-100 fw-bold shadow-sm"
                                    style={{ borderRadius: '12px', height: '100%' }}
                                >
                                    {loading ? '...' : 'GET'}
                                </button>
                            </div>
                        </form>
                        <div className="mt-3 small text-muted text-center text-md-start">
                            By clicking GET, you agree to 4H's Terms of Service and Privacy Policy.
                        </div>
                    </div>
                </div>

                {/* Phần hiển thị Lịch sử (History) từ Database */}
                {history.length > 0 && (
                    <div className="history-section">
                        <h4 className="fw-bold mb-4 d-flex align-items-center">
                            <span className="me-2">📋</span> Recent Links
                        </h4>
                        <div className="list-group border-0 shadow-sm rounded-4">
                            {history.map((item) => (
                                <div key={item.id} className="list-group-item list-group-item-action p-3 border-0 border-bottom">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="text-truncate me-3">
                                            {/* Đây là field shortCode trong Prisma của bạn */}
                                            <p className="mb-0 fw-bold text-primary">4hs.link/{item.shortCode}</p>
                                            <small className="text-muted d-block text-truncate" style={{ maxWidth: '400px' }}>
                                                {item.originalUrl}
                                            </small>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="badge bg-light text-dark border py-2 px-3 rounded-pill">
                                                {item.clickCount || 0} clicks
                                            </span>
                                            <button
                                                className="btn btn-sm btn-outline-primary rounded-pill px-3"
                                                onClick={() => navigator.clipboard.writeText(`4hs.link/${item.shortCode}`)}
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}