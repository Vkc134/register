import { useData } from '../../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { Eye, FileText, Search, Download, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Papa from 'papaparse';

const Dashboard = () => {
    const { candidates, deleteCandidate } = useData();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [expFilter, setExpFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [locationFilter, setLocationFilter] = useState('all');

    // Get unique locations
    const locations = ['all', ...new Set(candidates.map(c => c.currentLocation).filter(Boolean))];

    const filteredCandidates = candidates.filter(c => {
        // Search
        const matchesSearch =
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.skill.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.mobileNumber.includes(searchTerm);

        // Status Filter
        const matchesStatus =
            statusFilter === 'all' ? true :
                statusFilter === 'viewed' ? c.isViewed :
                    statusFilter === 'pending' ? !c.isViewed : true;

        // Experience Filter
        let matchesExp = true;
        if (expFilter !== 'all') {
            if (expFilter === 'fresher') matchesExp = c.isFresher === 'Yes';
            else if (c.isFresher === 'No') {
                const exp = parseFloat(c.totalExperience || 0);
                if (expFilter === '1-3') matchesExp = exp >= 1 && exp <= 3;
                else if (expFilter === '3-5') matchesExp = exp > 3 && exp <= 5;
                else if (expFilter === '5+') matchesExp = exp > 5;
            } else {
                matchesExp = false; // Filter set to exp range but candidate is fresher
            }
        }

        // Date Filter
        let matchesDate = true;
        if (dateFilter !== 'all') {
            const submitDate = new Date(c.submittedAt);
            const today = new Date();
            const diffTime = Math.abs(today - submitDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (dateFilter === 'today') matchesDate = submitDate.toDateString() === today.toDateString();
            else if (dateFilter === 'last7') matchesDate = diffDays <= 7;
            else if (dateFilter === 'last30') matchesDate = diffDays <= 30;
        }

        // Location Filter
        const matchesLocation = locationFilter === 'all' || c.currentLocation === locationFilter;

        return matchesSearch && matchesStatus && matchesExp && matchesDate && matchesLocation;
    });

    const resetFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setExpFilter('all');
        setDateFilter('all');
        setLocationFilter('all');
    };

    const handleExport = () => {
        if (filteredCandidates.length === 0) return;

        // Map candidates to a consistent structure for export
        const exportData = filteredCandidates.map(c => ({
            "Name": c.name,
            "Email": c.email,
            "Mobile": c.mobileNumber,
            "Skills": c.skill,
            "Experience Type": c.isFresher === 'Yes' ? 'Fresher' : 'Experienced',
            "Total Experience": c.totalExperience ? `${c.totalExperience} Years` : '',
            "Current Location": c.currentLocation,
            "Application Status": c.isViewed ? 'Viewed' : 'Pending Review',
            "Submitted At": new Date(c.submittedAt).toLocaleString(),
            "Expected Salary": c.expectedSalary || '',
            "Resume Link": c.resumeLink || ''
        }));

        const csv = Papa.unparse(exportData);

        // Add BOM for better Excel compatibility
        const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        // Include full timestamp ensure unique filenames
        const timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
        link.setAttribute('download', `candidates_export_${timestamp}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete the application for ${name}? This action cannot be undone.`)) {
            const success = await deleteCandidate(id);
            if (success) {
                // Optional: Show a toast notification or alert
            } else {
                alert("Failed to delete candidate. Please try again.");
            }
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>Admin Dashboard</h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>Overview of all candidate applications</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                        onClick={handleExport}
                        className="btn btn-outline"
                        style={{ height: '42px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        disabled={filteredCandidates.length === 0}
                        title="Export current list to CSV"
                    >
                        <Download size={18} /> Export CSV
                    </button>

                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input
                            className="input"
                            placeholder="Search candidates..."
                            style={{ paddingLeft: '2.5rem' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="card" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <FilterSelect
                    label="Status"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                        { value: 'all', label: 'All Status' },
                        { value: 'pending', label: 'Pending Review' },
                        { value: 'viewed', label: 'Viewed' }
                    ]}
                />
                <FilterSelect
                    label="Experience"
                    value={expFilter}
                    onChange={setExpFilter}
                    options={[
                        { value: 'all', label: 'All Experience' },
                        { value: 'fresher', label: 'Fresher' },
                        { value: '1-3', label: '1-3 Years' },
                        { value: '3-5', label: '3-5 Years' },
                        { value: '5+', label: '5+ Years' }
                    ]}
                />
                <FilterSelect
                    label="Date"
                    value={dateFilter}
                    onChange={setDateFilter}
                    options={[
                        { value: 'all', label: 'Any Date' },
                        { value: 'today', label: 'Today' },
                        { value: 'last7', label: 'Last 7 Days' },
                        { value: 'last30', label: 'Last 30 Days' }
                    ]}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-text-muted)' }}>Location</label>
                    <select
                        className="input"
                        style={{ padding: '0.4rem', fontSize: '0.9rem' }}
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                    >
                        {locations.map(loc => (
                            <option key={loc} value={loc}>{loc === 'all' ? 'All Locations' : loc}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={resetFilters}
                    className="btn btn-outline"
                    style={{ marginLeft: 'auto', height: '38px' }}
                >
                    Reset Filters
                </button>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <StatCard title="Total Applications" value={candidates.length} icon={<FileText size={24} />} color="blue" />
                <StatCard title="Today's Applications" value={candidates.filter(c => new Date(c.submittedAt).toDateString() === new Date().toDateString()).length} icon={<FileText size={24} />} color="green" />
                <StatCard title="Viewed" value={candidates.filter(c => c.isViewed).length} icon={<Eye size={24} />} color="purple" />
                <StatCard title="Pending Review" value={candidates.filter(c => !c.isViewed).length} icon={<FileText size={24} />} color="orange" />
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                {candidates.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>No applications received yet.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'hsla(var(--hue-primary), 10%, 50%, 0.05)' }}>
                                    <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Name</th>
                                    <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Mobile / Email</th>
                                    <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Skills</th>
                                    <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Experience</th>
                                    <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Location</th>
                                    <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCandidates.map(candidate => (
                                    <tr key={candidate.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '1rem', fontWeight: '500' }}>{candidate.name}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontSize: '0.9rem' }}>{candidate.mobileNumber}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{candidate.email}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{candidate.skill}</td>
                                        <td style={{ padding: '1rem' }}>
                                            {candidate.isFresher === 'Yes' ? (
                                                <span style={{ padding: '0.25rem 0.5rem', borderRadius: '1rem', background: 'hsla(var(--hue-success), 20%, 90%, 1)', color: 'hsl(var(--hue-success), 80%, 30%)', fontSize: '0.8rem', fontWeight: '600' }}>Fresher</span>
                                            ) : (
                                                <span>{candidate.totalExperience} Years</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem' }}>{candidate.currentLocation}</td>
                                        <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="btn btn-primary"
                                                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                                                onClick={() => navigate(`/admin/candidate/${candidate.id}`)}
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className="btn btn-outline"
                                                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                                                onClick={() => handleDelete(candidate.id, candidate.name)}
                                                title="Delete Application"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
const StatCard = ({ title, value, icon, color }) => (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
        <div style={{ padding: '0.75rem', borderRadius: '50%', background: `var(--color-${color}-light, #f0f0f0)`, color: `var(--color-${color}, #333)` }}>
            {icon}
        </div>
        <div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>{title}</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</h3>
        </div>
    </div>
);

const FilterSelect = ({ label, value, onChange, options }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-text-muted)' }}>{label}</label>
        <select
            className="input"
            style={{ padding: '0.4rem', fontSize: '0.9rem' }}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

export default Dashboard;
