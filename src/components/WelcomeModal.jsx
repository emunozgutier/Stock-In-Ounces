import React from 'react';

const WelcomeModal = ({ show, onDismiss }) => {
    if (!show) return null;

    return (
        <div 
            className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 1050 }}
            onClick={onDismiss}
        >
            <div 
                className="bg-dark text-light p-4 rounded border border-secondary shadow-lg overflow-auto" 
                style={{ maxWidth: '600px', maxHeight: '90vh', width: '90%' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-secondary">
                    <h3 className="h4 text-warning mb-0">Welcome to Stock In Ounces</h3>
                    <button 
                        className="btn-close btn-close-white" 
                        aria-label="Close"
                        onClick={onDismiss}
                    ></button>
                </div>
                
                <div className="mb-4">
                    <p className="fs-5 mb-3" style={{ lineHeight: '1.6' }}>
                        Dollars are a ponzi scheme and you really do not know their value.
                    </p>
                    <p className="fs-5 mb-3" style={{ lineHeight: '1.6' }}>
                        So instead of analyzing the stocks in dollars we should analyze them as ounces of gold on their respective time.
                    </p>
                    <p className="fs-5 mb-3" style={{ lineHeight: '1.6' }}>
                        Also since an ounce of gold is over $1,000, we use <strong style={{ color: '#F59E0B' }}>Goldbacks</strong>, <strong style={{ color: '#9CA3AF' }}>SilverBacks</strong> and "<strong style={{ color: '#E5E7EB' }}>PlatimunBacks</strong>", which equal to 1000th of an ounce.
                    </p>
                    <p className="fs-5 mb-0" style={{ lineHeight: '1.6', textAlign: 'center' }}>
                        For more information see <a href="https://goldback.com" target="_blank" rel="noopener noreferrer" className="text-info fw-bold text-decoration-none">goldback.com</a>.
                    </p>
                </div>

                <div className="d-flex justify-content-end mt-4 pt-3 border-top border-secondary">
                    <button 
                        className="btn btn-warning px-4 fw-semibold"
                        onClick={onDismiss}
                    >
                        Understand & Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeModal;
