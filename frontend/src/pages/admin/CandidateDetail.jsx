import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { ArrowLeft, User, Briefcase, DollarSign, FileText } from 'lucide-react';

const CandidateDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getCandidate, markCandidateViewed } = useData();
    const candidate = getCandidate(id);

    useEffect(() => {
        if (candidate && !candidate.isViewed) {
            markCandidateViewed(id);
        }
    }, [id, candidate, markCandidateViewed]);

    if (!candidate) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
                <h2>Candidate Not Found</h2>
                <button className="btn btn-outline" onClick={() => navigate('/admin')} style={{ marginTop: '1rem' }}>
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const Section = ({ title, icon: Icon, children }) => (
        <section className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                <Icon size={20} color="var(--color-primary)" />
                <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>{title}</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {children}
            </div>
        </section>
    );

    const Item = ({ label, value }) => (
        <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>{label}</div>
            <div style={{ fontWeight: '500', fontSize: '1rem' }}>{value || '-'}</div>
        </div>
    );

    return (
        <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <button
                onClick={() => navigate('/admin')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}
            >
                <ArrowLeft size={20} /> Back to Dashboard
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '700' }}>{candidate.name}</h1>
                    <div style={{ display: 'flex', gap: '1rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                        <span>{candidate.email}</span>
                        <span>•</span>
                        <span>{candidate.mobileNumber}</span>
                        <span>•</span>
                        <span>{candidate.currentLocation}</span>
                    </div>
                </div>
                <div style={{ padding: '0.5rem 1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Applied On</div>
                    <div>{new Date(candidate.submittedAt).toLocaleDateString()}</div>
                </div>
            </div>

            <Section title="Professional Profile" icon={Briefcase}>
                <Item label="Primary Skills" value={candidate.skill} />
                <Item label="Fresher Status" value={candidate.isFresher} />
                {candidate.isFresher === 'No' && (
                    <>
                        <Item label="Total Experience" value={`${candidate.totalExperience} Years`} />
                        <Item label="Relevant Experience" value={`${candidate.relevantExperience} Years`} />
                        <Item label="Current Company" value={candidate.currentCompany} />
                        <Item label="Currently Working" value={candidate.isCurrentlyWorking} />
                        <div style={{ gridColumn: '1 / -1' }}>
                            <Item label="Previous Companies" value={candidate.previousCompanies} />
                        </div>
                    </>
                )}
            </Section>

            {candidate.isFresher === 'No' && (
                <Section title="Compensation & Notice" icon={DollarSign}>
                    <Item label="Current CTC" value={candidate.currentCTC ? `${candidate.currentCTC} LPA` : '-'} />
                    <Item label="Expected CTC" value={candidate.expectedCTC ? `${candidate.expectedCTC} LPA` : '-'} />
                    <Item label="Notice Period" value={candidate.noticePeriod ? `${candidate.noticePeriod} Days` : '-'} />
                    <Item label="PF Account" value={candidate.hasPF} />
                    <Item label="Form 16" value={candidate.hasForm16} />
                </Section>
            )}

            <Section title="Education & Compliance" icon={User}>
                <Item label="Highest Education" value={candidate.highestEducation} />
                <Item label="Passed Out Year" value={candidate.passedOutYear} />
                <Item label="PAN Number" value={candidate.panNumber} />
                {candidate.isFresher === 'No' && (
                    <Item label="Career Gaps" value={candidate.careerGaps} />
                )}
            </Section>

            {candidate.overlaps && (
                <Section title="Additional Info" icon={FileText}>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <Item label="Overlaps / Notes" value={candidate.overlaps} />
                    </div>
                </Section>
            )}
        </div>
    );
};



export default CandidateDetail;
