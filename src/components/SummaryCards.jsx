import React, { useState, useEffect } from 'react';
import { TrendingUp, FileText, Clock, CheckCircle } from 'lucide-react';
import { inspectionAPI } from '../services/api';

const SummaryCards = () => {
    const [summary, setSummary] = useState({
        totalCount: 0,
        monthlyCount: 0,
        pendingCount: 0,
        completedCount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const data = await inspectionAPI.getStatusSummary();

                // Parse status summary to get pending and completed counts
                const pendingStatus = data.statusSummary.find(s => s.status === 'draft');
                const completedStatus = data.statusSummary.find(s => s.status === 'complete');

                setSummary({
                    totalCount: data.totalCount || 0,
                    monthlyCount: data.monthlyCount || 0,
                    pendingCount: pendingStatus ? parseInt(pendingStatus.count) : 0,
                    completedCount: completedStatus ? parseInt(completedStatus.count) : 0
                });
            } catch (error) {
                console.error('Error fetching status summary:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, []);

    const cards = [
        {
            title: 'Total Inspections',
            value: loading ? '...' : summary.totalCount.toString(),
            icon: TrendingUp,
            color: '#3b82f6'
        },
        {
            title: 'This Month',
            value: loading ? '...' : summary.monthlyCount.toString(),
            icon: FileText,
            color: '#10b981'
        },
        {
            title: 'Pending',
            value: loading ? '...' : summary.pendingCount.toString(),
            icon: Clock,
            color: '#f59e0b'
        },
        {
            title: 'Completed',
            value: loading ? '...' : summary.completedCount.toString(),
            icon: CheckCircle,
            color: '#10b981'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                                <p className="text-sm text-gray-600 mt-1">{card.title}</p>
                            </div>
                            <div className="p-3 rounded-lg" style={{ backgroundColor: card.color + '20' }}>
                                <Icon size={24} style={{ color: card.color }} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SummaryCards;
