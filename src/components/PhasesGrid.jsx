import React, { useState, useEffect } from 'react';
import {
    AlertTriangle,
    FileText,
    Users,
    Building,
    Scale,
    MessageSquare,
    CheckCircle
} from 'lucide-react';
import { inspectionAPI } from '../services/api';

const PhasesGrid = () => {
    const [loading, setLoading] = useState(true);
    const [statusData, setStatusData] = useState([]);

    const phaseConfig = {
        'Show Cause Notice': {
            description: 'Pending show cause notices',
            icon: AlertTriangle,
            borderColor: '#fecaca',
            iconColor: '#ef4444'
        },
        'Improvement Notice': {
            description: 'Active improvement notices',
            icon: FileText,
            borderColor: '#fed7aa',
            iconColor: '#f59e0b'
        },
        'Proposal by Field Officer': {
            description: 'Proposals under review',
            icon: Users,
            borderColor: '#ddd6fe',
            iconColor: '#8b5cf6'
        },
        'Action at Director': {
            description: 'Awaiting director action',
            icon: Building,
            borderColor: '#e0e7ff',
            iconColor: '#6366f1'
        },
        'Government': {
            description: 'Government level cases',
            icon: Scale,
            borderColor: '#dbeafe',
            iconColor: '#3b82f6'
        },
        'Complaint Filed': {
            description: 'Filed complaints',
            icon: MessageSquare,
            borderColor: '#fef3c7',
            iconColor: '#f59e0b'
        },
        'Disposal': {
            description: 'Cases disposed',
            icon: CheckCircle,
            borderColor: '#d1fae5',
            iconColor: '#10b981'
        }
    };

    useEffect(() => {
        const fetchStatusSummary = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setLoading(false);
                    return;
                }

                const data = await inspectionAPI.getApplicationsStatusSummary(token);
                setStatusData(data);
            } catch (error) {
                console.error('Error fetching applications status summary:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStatusSummary();
    }, []);

    const phases = Object.keys(phaseConfig).map(statusName => {
        const config = phaseConfig[statusName];
        const statusItem = statusData.find(item => item.currentStatus === statusName);
        const count = statusItem ? parseInt(statusItem.count) : 0;

        return {
            title: statusName,
            description: config.description,
            count: loading ? '...' : count,
            icon: config.icon,
            borderColor: config.borderColor,
            iconColor: config.iconColor
        };
    });

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Phases of the Report</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {phases.map((phase, index) => {
                    const Icon = phase.icon;
                    return (
                        <div
                            key={index}
                            className="border-l-4 bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                            style={{ borderLeftColor: phase.borderColor }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div
                                    className="p-2 rounded-lg"
                                    style={{ backgroundColor: phase.iconColor + '20', color: phase.iconColor }}
                                >
                                    <Icon size={24} />
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{phase.count}</div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{phase.title}</h3>
                                <p className="text-sm text-gray-600 mb-3">{phase.description}</p>
                                <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium">View Details →</a>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PhasesGrid;
