import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, Activity } from 'lucide-react';
import api from '../api';
import PatientChartGrid from './PatientChartGrid';
import './WardPatientProfile.css';

const WardPatientProfile = () => {
    const { state, pathname } = useLocation();
    const navigate = useNavigate();
    const { bed_no, hospital_id, ward_id } = useParams();
    const patient = state?.patient;
    const wardName = state?.wardName;
    const [patientData, setPatientData] = React.useState(patient);
    const [isUpdating, setIsUpdating] = React.useState(false);

    // Determine return path based on layout origin
    const isDoctorView = pathname.startsWith('/doctor');
    const isNurseView = pathname.startsWith('/nurse');
    const isStaffView = !!(hospital_id && ward_id); // True for both doctor and nurse

    let returnPath = '/ward';
    if (isDoctorView) returnPath = `/doctor/ward/${hospital_id}/${ward_id}`;
    if (isNurseView) returnPath = `/nurse/ward/${hospital_id}/${ward_id}`;

    if (!patientData) {
        return (
            <div className="error-message">
                <p>Patient data not found. Please navigate from the dashboard.</p>
                <button onClick={() => navigate(returnPath)} className="admin-btn-submit" style={{ width: 'auto', marginTop: '1rem' }}>Return to Dashboard</button>
            </div>
        );
    }
    const handleToggleCritical = async () => {
        setIsUpdating(true);
        try {
            const endpoint = isStaffView
                ? `/staff/${hospital_id}/${ward_id}/patients/${bed_no}/critical`
                : `/ward/patients/${bed_no}/critical`;

            await api.put(endpoint, { is_critical: !patientData.is_critical });
            setPatientData({ ...patientData, is_critical: !patientData.is_critical });
        } catch (err) {
            alert('Failed to update critical state');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDischarge = async () => {
        if (!window.confirm(`Are you sure you want to discharge ${patientData.name}? This bed will become available immediately.`)) {
            return;
        }

        setIsUpdating(true);
        try {
            const endpoint = isStaffView
                ? `/staff/${hospital_id}/${ward_id}/patients/${bed_no}/discharge`
                : `/ward/patients/${patientData.id}/discharge`;

            await api.put(endpoint);
            alert('Patient discharged successfully.');
            navigate(returnPath, { state: { wardName } });
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to discharge patient');
            setIsUpdating(false);
        }
    };

    return (
        <div className="patient-profile-container">
            <div className="profile-header-actions">
                <button className="btn-back" onClick={() => navigate(returnPath, { state: { wardName } })}>
                    <ArrowLeft size={18} /> Back to Dashboard
                </button>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                        className={`btn-toggle-critical ${patientData.is_critical ? 'active' : ''}`}
                        onClick={handleToggleCritical}
                        disabled={isUpdating || isNurseView}
                        title={isNurseView ? "Nurses cannot change critical state" : ""}
                        style={isNurseView ? { cursor: 'not-allowed', opacity: 0.7 } : {}}
                    >
                        {isUpdating ? 'Updating...' : (patientData.is_critical ? 'Mark Stable' : 'Mark Critical')}
                    </button>
                    {!isNurseView && (
                        <button
                            onClick={handleDischarge}
                            disabled={isUpdating}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                border: '1px solid #ef4444',
                                background: 'transparent',
                                color: '#ef4444',
                                fontWeight: '600',
                                cursor: isUpdating ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                            }}
                            onMouseOver={(e) => {
                                if (!isUpdating) {
                                    e.currentTarget.style.background = '#ef4444';
                                    e.currentTarget.style.color = 'white';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!isUpdating) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = '#ef4444';
                                }
                            }}
                        >
                            Discharge
                        </button>
                    )}
                    {patientData.is_critical && (
                        <span className="critical-badge-large"><Activity size={18} /> CRITICAL PHASE MONITORING</span>
                    )}
                </div>
            </div>

            <div className="patient-header-card">
                <div className="header-top">
                    <User size={40} className="avatar-icon" />
                    <div className="title-area">
                        <h1>{patientData.name}</h1>
                        <p className="subtitle">Bed {bed_no} | NIC: {patientData.nic}</p>
                    </div>
                </div>

                <div className="demographics-grid">
                    <div className="demo-item">
                        <span className="label">Age:</span>
                        <span className="value">{patientData.age} yrs</span>
                    </div>
                    <div className="demo-item">
                        <span className="label">Date of Birth:</span>
                        <span className="value">{new Date(patientData.b_day).toLocaleDateString()}</span>
                    </div>
                    <div className="demo-item">
                        <span className="label">Telephone:</span>
                        <span className="value">{patientData.telephone || 'N/A'}</span>
                    </div>
                    <div className="demo-item">
                        <span className="label">Address:</span>
                        <span className="value">{patientData.address || 'N/A'}</span>
                    </div>
                </div>
            </div>

            <div className="chart-section">
                <div className="chart-section-header">
                    <h2>Observation Chart for Management of Dengue</h2>
                    <p className="chart-instructions">
                        {patientData.is_critical
                            ? "Critical Phase: Hourly monitoring required for fluids, vitals, and UOP."
                            : "Stable Phase: Monitor parameters 3 hourly. Do FBC daily/bd."
                        }
                    </p>
                </div>

                <PatientChartGrid
                    isCritical={patientData.is_critical}
                    bedNo={bed_no}
                    patientId={patientData.id}
                    hospital_id={hospital_id}
                    ward_id={ward_id}
                />
            </div>
        </div>
    );
};

export default WardPatientProfile;
