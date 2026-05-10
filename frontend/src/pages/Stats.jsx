import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { getStats, getQRCode } from '../services/urlService';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

export default function Stats() {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStats(shortCode);
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [shortCode]);

  const getChartData = () => {
    if (!stats || !stats.clicks) return null;

    const last7Days = [];
    const clicksPerDay = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      last7Days.push(key);
      clicksPerDay[key] = 0;
    }

    stats.clicks.forEach(c => {
      const key = new Date(c.time).toISOString().split('T')[0];
      if (clicksPerDay[key] !== undefined) {
        clicksPerDay[key]++;
      }
    });

    return {
      labels: last7Days.map(d => {
        const date = new Date(d);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Clicks',
          data: last7Days.map(d => clicksPerDay[d]),
          fill: true,
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderColor: 'rgba(99, 102, 241, 1)',
          tension: 0.4,
          pointBackgroundColor: 'rgba(99, 102, 241, 1)',
          pointBorderColor: '#fff',
          pointRadius: 4,
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        callbacks: {
          label: (ctx) => `${ctx.parsed.y} clicks`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  const chartData = getChartData();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">{error}</div>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary mt-3">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning">No stats found for this link.</div>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary mt-3">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <button onClick={() => navigate('/dashboard')} className="btn btn-link text-muted p-0 mb-3 text-decoration-none">
        ← Back to Dashboard
      </button>

      <div className="row mb-4">
        <div className="col">
          <h2 className="fw-bold text-dark">Analytics: {shortCode}</h2>
          <p className="text-muted mb-0">
            Short URL: <a href={`/${shortCode}`} target="_blank" rel="noopener noreferrer" className="text-primary">
              {window.location.origin}/{shortCode}
            </a>
          </p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
            <div className="display-5 fw-bold text-primary">{stats.totalClicks || 0}</div>
            <div className="text-muted small mt-1">Total Clicks</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
            <div className="display-5 fw-bold text-success">{stats.clicks?.length || 0}</div>
            <div className="text-muted small mt-1">Recent Clicks</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
            <div className="display-5 fw-bold text-info">
              {stats.clicks && stats.clicks.length > 0
                ? new Date(stats.clicks[0].time).toLocaleDateString()
                : 'N/A'}
            </div>
            <div className="text-muted small mt-1">Last Click</div>
          </div>
        </div>
      </div>

      {chartData && (
        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
          <h5 className="fw-bold mb-3">Clicks Over Time (Last 7 Days)</h5>
          <div style={{ height: '250px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-white border-0 py-3">
          <h5 className="fw-bold mb-0">Click History</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="bg-light">
              <tr>
                <th className="border-0 py-3 ps-4">Time</th>
                <th className="border-0 py-3 d-none d-md-table-cell">IP Address</th>
                <th className="border-0 py-3 d-none d-lg-table-cell">User Agent</th>
              </tr>
            </thead>
            <tbody>
              {stats.clicks && stats.clicks.length > 0 ? (
                stats.clicks.map((click, idx) => (
                  <tr key={idx}>
                    <td className="py-3 ps-4 small">
                      {new Date(click.time).toLocaleString()}
                    </td>
                    <td className="py-3 d-none d-md-table-cell small text-muted">
                      {click.ip || 'Unknown'}
                    </td>
                    <td className="py-3 d-none d-lg-table-cell small text-muted text-truncate" style={{ maxWidth: '200px' }}>
                      {click.userAgent || 'Unknown'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-muted">No clicks recorded yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}