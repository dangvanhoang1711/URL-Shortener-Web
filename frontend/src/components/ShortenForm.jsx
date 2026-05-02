export default function ShortenForm() {
    return (
        <div className="row justify-content-center w-100">
            <div className="col-md-10 col-lg-8">
                <div className="text-center mb-5">
                    <h1 className="display-4 fw-black text-dark fw-bolder mb-3">Build stronger connections</h1>
                    <p className="lead text-secondary">A powerful tool to create short, professional, and trackable links.</p>
                </div>

                <div className="card border-0 shadow-lg p-4 rounded-4">
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-9">
                                <input
                                    type="text"
                                    className="form-control form-control-lg bg-light px-4"
                                    placeholder="Paste a long URL (e.g., https://example.com/...)"
                                    style={{ borderRadius: '12px' }}
                                />
                            </div>
                            <div className="col-md-3">
                                <button
                                    className="btn btn-primary btn-lg w-100 fw-bold shadow-sm"
                                    style={{ borderRadius: '12px', height: '100%' }}
                                >
                                    GET
                                </button>
                            </div>
                        </div>
                        <div className="mt-3 small text-muted">
                            By clicking Shorten, you agree to 4H's Terms of Service and Privacy Policy.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}