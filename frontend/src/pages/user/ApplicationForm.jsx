import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { Save, Loader2, CheckCircle } from 'lucide-react';

const ApplicationForm = () => {
    const { addCandidate } = useData();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobileNumber: '',
        currentLocation: '',
        panNumber: '',
        highestEducation: '',
        passedOutYear: '',
        skill: '',
        isFresher: 'No',
        totalExperience: '',
        relevantExperience: '',
        currentCompany: '',
        previousCompanies: '',
        isCurrentlyWorking: 'Yes',
        currentCTC: '',
        expectedCTC: '',
        noticePeriod: '',
        hasForm16: 'Yes',
        hasPF: 'Yes',
        careerGaps: '',
        overlaps: '',
        referredBy: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        // Name
        if (!formData.name.trim()) newErrors.name = "Full Name is required";
        else if (formData.name.trim().length < 3) newErrors.name = "Name must be at least 3 characters";

        // Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) newErrors.email = "Email is required";
        else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format";

        // Mobile (10 digits)
        const phoneRegex = /^\d{10}$/;
        if (!formData.mobileNumber) newErrors.mobileNumber = "Mobile Number is required";
        else if (!phoneRegex.test(formData.mobileNumber)) newErrors.mobileNumber = "Mobile number must be exactly 10 digits";

        // Location
        if (!formData.currentLocation.trim()) newErrors.currentLocation = "Location is required";

        // PAN (ABCDE1234F)
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
        if (!formData.panNumber) newErrors.panNumber = "PAN Number is required";
        else if (!panRegex.test(formData.panNumber)) {
            newErrors.panNumber = "Invalid PAN format (e.g. ABCDE1234F)";
        }

        // Education
        if (!formData.highestEducation.trim()) newErrors.highestEducation = "Highest Education is required";

        // Year
        const currentYear = new Date().getFullYear();
        if (!formData.passedOutYear) newErrors.passedOutYear = "Year is required";
        else {
            const year = parseInt(formData.passedOutYear);
            if (year < 1980 || year > currentYear + 1) newErrors.passedOutYear = "Enter a valid passing year";
        }

        // Skills
        if (!formData.skill.trim()) newErrors.skill = "Primary Skills are required";

        // Experience validations
        if (formData.isFresher === 'No') {
            if (!formData.totalExperience) newErrors.totalExperience = "Total Experience is required";
            if (!formData.relevantExperience) newErrors.relevantExperience = "Relevant Experience is required";
            if (!formData.currentCompany.trim()) newErrors.currentCompany = "Current Company is required";
            if (!formData.previousCompanies.trim()) newErrors.previousCompanies = "Previous Companies are required";
            if (!formData.careerGaps.trim()) newErrors.careerGaps = "Career Gaps info is required (enter 'None' if applicable)";

            if (parseFloat(formData.relevantExperience) > parseFloat(formData.totalExperience)) {
                newErrors.relevantExperience = "Relevant experience cannot be greater than total experience";
            }
        }

        // CTC & Notice Period
        if (!formData.currentCTC) newErrors.currentCTC = "Current CTC is required";
        else if (parseFloat(formData.currentCTC) < 0) newErrors.currentCTC = "CTC cannot be negative";

        if (!formData.expectedCTC) newErrors.expectedCTC = "Expected CTC is required";
        else if (parseFloat(formData.expectedCTC) < 0) newErrors.expectedCTC = "CTC cannot be negative";

        if (!formData.noticePeriod) newErrors.noticePeriod = "Notice Period is required";

        // Overlaps
        if (!formData.overlaps.trim()) newErrors.overlaps = "Overlaps/Other info is required (enter 'None' if applicable)";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            // Scroll to first error?
            const firstError = document.querySelector('.error-text');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setLoading(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newId = await addCandidate(formData);
        setLoading(false);

        if (newId) {
            setSuccess(true);
        } else {
            alert("Failed to submit application. Please try again.");
        }
    };

    if (success) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'hsla(var(--hue-success), 20%, 90%, 1)', marginBottom: '1.5rem' }}>
                    <CheckCircle size={64} color="hsl(var(--hue-success), 80%, 40%)" />
                </div>
                <h2 style={{ marginBottom: '1rem' }}>Application Submitted!</h2>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                    Thank you for providing your details. Your profile has been successfully recorded.
                </p>
                <button className="btn btn-outline" onClick={() => {
                    setSuccess(false); setFormData({
                        name: '', email: '', mobileNumber: '', currentLocation: '', panNumber: '',
                        highestEducation: '', passedOutYear: '', skill: '', isFresher: 'No',
                        totalExperience: '', relevantExperience: '', currentCompany: '', previousCompanies: '',
                        isCurrentlyWorking: 'Yes', currentCTC: '', expectedCTC: '', noticePeriod: '',
                        hasForm16: 'Yes', hasPF: 'Yes', careerGaps: '', overlaps: '', referredBy: ''
                    });
                }}>
                    Submit Another Response
                </button>
            </div>
        );
    }

    const ErrorMsg = ({ name }) => errors[name] ? <span className="error-text" style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors[name]}</span> : null;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, var(--color-primary), violet)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Candidate Application</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Please fill in your professional details accurately.</p>
            </header>

            <form onSubmit={handleSubmit} className="card animate-fade-in" noValidate>

                {/* Personal Details */}
                <section style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)', color: 'var(--color-primary)' }}>Personal Details</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="label">Full Name *</label>
                            <input name="name" className={`input ${errors.name ? 'input-error' : ''}`} value={formData.name} onChange={handleChange} placeholder="John Doe" />
                            <ErrorMsg name="name" />
                        </div>
                        <div className="form-group">
                            <label className="label">Email ID *</label>
                            <input type="email" name="email" className={`input ${errors.email ? 'input-error' : ''}`} value={formData.email} onChange={handleChange} placeholder="john@example.com" />
                            <ErrorMsg name="email" />
                        </div>
                        <div className="form-group">
                            <label className="label">Mobile Number *</label>
                            <input name="mobileNumber" className={`input ${errors.mobileNumber ? 'input-error' : ''}`} value={formData.mobileNumber} onChange={handleChange} placeholder="9876543210 (10 digits)" maxLength="10" />
                            <ErrorMsg name="mobileNumber" />
                        </div>
                        <div className="form-group">
                            <label className="label">Current Location *</label>
                            <input name="currentLocation" className={`input ${errors.currentLocation ? 'input-error' : ''}`} value={formData.currentLocation} onChange={handleChange} placeholder="Bangalore, India" />
                            <ErrorMsg name="currentLocation" />
                        </div>
                        <div className="form-group">
                            <label className="label">PAN Number *</label>
                            <input name="panNumber" className={`input ${errors.panNumber ? 'input-error' : ''}`} value={formData.panNumber} onChange={handleChange} placeholder="ABCDE1234F" style={{ textTransform: 'uppercase' }} maxLength="10" />
                            <ErrorMsg name="panNumber" />
                        </div>
                        <div className="form-group">
                            <label className="label">Referred By (Optional)</label>
                            <input name="referredBy" className="input" value={formData.referredBy} onChange={handleChange} placeholder="Name of referrer" />
                        </div>
                    </div>
                </section>

                {/* Education & Skills */}
                <section style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)', color: 'var(--color-primary)' }}>Education & Skills</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="label">Highest Education *</label>
                            <input name="highestEducation" className={`input ${errors.highestEducation ? 'input-error' : ''}`} value={formData.highestEducation} onChange={handleChange} placeholder="B.Tech / MCA / MBA" />
                            <ErrorMsg name="highestEducation" />
                        </div>
                        <div className="form-group">
                            <label className="label">Passed Out Year *</label>
                            <input type="number" name="passedOutYear" className={`input ${errors.passedOutYear ? 'input-error' : ''}`} value={formData.passedOutYear} onChange={handleChange} placeholder="2024" />
                            <ErrorMsg name="passedOutYear" />
                        </div>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="label">Primary Skills *</label>
                            <input name="skill" className={`input ${errors.skill ? 'input-error' : ''}`} value={formData.skill} onChange={handleChange} placeholder="React, Node.js, Java..." />
                            <ErrorMsg name="skill" />
                        </div>
                    </div>
                </section>

                {/* Professional Experience */}
                <section style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)', color: 'var(--color-primary)' }}>Professional Experience</h3>

                    <div className="form-group">
                        <label className="label">Are you a Fresher?</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {['Yes', 'No'].map(opt => (
                                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="radio" name="isFresher" value={opt} checked={formData.isFresher === opt} onChange={handleChange} />
                                    {opt}
                                </label>
                            ))}
                        </div>
                    </div>

                    {formData.isFresher === 'No' && (
                        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="label">Total Experience (Years) *</label>
                                <input type="number" step="0.1" name="totalExperience" className={`input ${errors.totalExperience ? 'input-error' : ''}`} value={formData.totalExperience} onChange={handleChange} placeholder="e.g. 3.5" />
                                <ErrorMsg name="totalExperience" />
                            </div>
                            <div className="form-group">
                                <label className="label">Relevant Experience (Years) *</label>
                                <input type="number" step="0.1" name="relevantExperience" className={`input ${errors.relevantExperience ? 'input-error' : ''}`} value={formData.relevantExperience} onChange={handleChange} placeholder="e.g. 2.5" />
                                <ErrorMsg name="relevantExperience" />
                            </div>
                            <div className="form-group">
                                <label className="label">Current Company *</label>
                                <input name="currentCompany" className={`input ${errors.currentCompany ? 'input-error' : ''}`} value={formData.currentCompany} onChange={handleChange} />
                                <ErrorMsg name="currentCompany" />
                            </div>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label className="label">Previous Companies *</label>
                                <textarea name="previousCompanies" className={`textarea ${errors.previousCompanies ? 'input-error' : ''}`} rows="2" value={formData.previousCompanies} onChange={handleChange} placeholder="List previous employers..." />
                                <ErrorMsg name="previousCompanies" />
                            </div>
                            <div className="form-group">
                                <label className="label">Currently Working?</label>
                                <select name="isCurrentlyWorking" className="select" value={formData.isCurrentlyWorking} onChange={handleChange}>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="label">Career Gaps (if any) *</label>
                                <input name="careerGaps" className={`input ${errors.careerGaps ? 'input-error' : ''}`} value={formData.careerGaps} onChange={handleChange} placeholder="e.g. 1 year due to..." />
                                <ErrorMsg name="careerGaps" />
                            </div>
                        </div>
                    )}
                </section>

                {/* Compensation & Compliance */}
                <section style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)', color: 'var(--color-primary)' }}>Compensation & Compliance</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="label">Current CTC (LPA) *</label>
                            <input name="currentCTC" className={`input ${errors.currentCTC ? 'input-error' : ''}`} type="number" value={formData.currentCTC} onChange={handleChange} />
                            <ErrorMsg name="currentCTC" />
                        </div>
                        <div className="form-group">
                            <label className="label">Expected CTC (LPA) *</label>
                            <input name="expectedCTC" className={`input ${errors.expectedCTC ? 'input-error' : ''}`} type="number" value={formData.expectedCTC} onChange={handleChange} />
                            <ErrorMsg name="expectedCTC" />
                        </div>
                        <div className="form-group">
                            <label className="label">Notice Period (Days) *</label>
                            <input name="noticePeriod" className={`input ${errors.noticePeriod ? 'input-error' : ''}`} value={formData.noticePeriod} onChange={handleChange} />
                            <ErrorMsg name="noticePeriod" />
                        </div>

                        <div className="form-group">
                            <label className="label">Form 16 Available?</label>
                            <select name="hasForm16" className="select" value={formData.hasForm16} onChange={handleChange}>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="label">PF Account?</label>
                            <select name="hasPF" className="select" value={formData.hasPF} onChange={handleChange}>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="label">Overlaps / Other Info *</label>
                            <textarea name="overlaps" className={`textarea ${errors.overlaps ? 'input-error' : ''}`} rows="2" value={formData.overlaps} onChange={handleChange} placeholder="Details about offer overlaps or other notes..." />
                            <ErrorMsg name="overlaps" />
                        </div>
                    </div>
                </section>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '150px' }}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Submit Application</>}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default ApplicationForm;
