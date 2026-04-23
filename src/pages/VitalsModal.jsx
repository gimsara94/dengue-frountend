import React, { useState } from 'react';
import api from '../api';
import { Activity } from 'lucide-react';

const VitalsModal = ({ isOpen, onClose, date, timeSlot, bedNo, hospital_id, ward_id, onSaveSuccess, activeField }) => {
    const [formData, setFormData] = useState({
        pr_min: '',
        bp_supine_sys: '',
        bp_supine_dia: '',
        pulse_pressure: '',
        bp_sitting_sys: '',
        bp_sitting_dia: '',
        crft: '',
        rr_min: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const payload = {
            chart_date: date,
            chart_time: timeSlot + ':00', // e.g. "03:00" -> "03:00:00"
        };

        // Only include fields that are filled out to satisfy the backend Joi schema
        Object.keys(formData).forEach(key => {
            if (formData[key] !== '') {
                payload[key] = key === 'crft' ? formData[key] : parseInt(formData[key], 10);
            }
        });

        // Ensure at least one actual vital is sent
        if (Object.keys(payload).length <= 2) {
            setError('Please enter at least one vital sign value.');
            setLoading(false);
            return;
        }

        try {
            const endpoint = (hospital_id && ward_id)
                ? `/charts/staff/${hospital_id}/${ward_id}/vitals/${bedNo}`
                : `/charts/ward/vitals/${bedNo}`;
            await api.post(endpoint, payload);
            setFormData({ pr_min: '', bp_supine_sys: '', bp_supine_dia: '', pulse_pressure: '', bp_sitting_sys: '', bp_sitting_dia: '', crft: '', rr_min: '' });
            onSaveSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving vitals');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Activity size={20} color="#1d4ed8" /> Record Vitals
                </h3>
                <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>Entry for {date} @ {timeSlot}</p>

                {error && <div className="alert-message alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {(!activeField || activeField === 'pr_min') && (
                        <div>
                            <label className="admin-form-label">PR /min</label>
                            <input type="number" name="pr_min" className="admin-form-input" value={formData.pr_min} onChange={handleChange} min="0" />
                        </div>
                    )}

                    {(!activeField || activeField === 'rr_min') && (
                        <div>
                            <label className="admin-form-label">RR /min</label>
                            <input type="number" name="rr_min" className="admin-form-input" value={formData.rr_min} onChange={handleChange} min="0" />
                        </div>
                    )}

                    {(!activeField || activeField === 'bp_supine') && (
                        <div>
                            <label className="admin-form-label">BP Supine (Sys/Dia)</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input type="number" name="bp_supine_sys" placeholder="Sys" className="admin-form-input" value={formData.bp_supine_sys} onChange={handleChange} min="0" />
                                <span style={{ display: 'flex', alignItems: 'center' }}>/</span>
                                <input type="number" name="bp_supine_dia" placeholder="Dia" className="admin-form-input" value={formData.bp_supine_dia} onChange={handleChange} min="0" />
                            </div>
                        </div>
                    )}

                    {(!activeField || activeField === 'bp_sitting') && (
                        <div>
                            <label className="admin-form-label">BP Sitting (Sys/Dia)</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input type="number" name="bp_sitting_sys" placeholder="Sys" className="admin-form-input" value={formData.bp_sitting_sys} onChange={handleChange} min="0" />
                                <span style={{ display: 'flex', alignItems: 'center' }}>/</span>
                                <input type="number" name="bp_sitting_dia" placeholder="Dia" className="admin-form-input" value={formData.bp_sitting_dia} onChange={handleChange} min="0" />
                            </div>
                        </div>
                    )}

                    {(!activeField || activeField === 'pulse_pressure') && (
                        <div>
                            <label className="admin-form-label">Pulse Pressure</label>
                            <input type="number" name="pulse_pressure" className="admin-form-input" value={formData.pulse_pressure} onChange={handleChange} min="0" />
                        </div>
                    )}

                    {(!activeField || activeField === 'crft') && (
                        <div>
                            <label className="admin-form-label">CRFT</label>
                            <select name="crft" className="admin-form-input" value={formData.crft} onChange={handleChange}>
                                <option value="">-- Select --</option>
                                <option value="<2 sec">&lt; 2 sec</option>
                                <option value=">2 sec">&gt; 2 sec</option>
                            </select>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" className="admin-btn-submit" style={{ background: 'white', color: '#475569', border: '1px solid #cbd5e1' }} onClick={() => { setError(''); onClose(); }}>Cancel</button>
                        <button type="submit" className="admin-btn-submit" disabled={loading}>{loading ? 'Saving...' : 'Save Vitals'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VitalsModal;
