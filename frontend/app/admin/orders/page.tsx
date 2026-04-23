'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { Activity, Search, ArrowLeft, Loader2, CheckCircle2, Clock, XCircle, FileText } from 'lucide-react';
import Link from 'next/link';

export default function AdminOrdersPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!loading && (!user || (user.role !== 'ADMIN' && user.role !== 'ROOT'))) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/orders`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data);
                } else {
                    console.error('Failed to fetch orders');
                }
            } catch (err) {
                console.error('Error fetching orders:', err);
            } finally {
                setPageLoading(false);
            }
        };

        if (user?.role === 'ADMIN' || user?.role === 'ROOT') {
            fetchOrders();
        }
    }, [user]);

    const filteredOrders = orders.filter(o => {
        const query = searchQuery.toLowerCase();
        return o.user?.email?.toLowerCase().includes(query) ||
               o.user?.name?.toLowerCase().includes(query) ||
               o.course?.title?.toLowerCase().includes(query) ||
               o.vnpTxnRef?.toLowerCase().includes(query);
    });

    if (loading || pageLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#0a0f1a]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                    <p className="font-semibold text-gray-500">Loading Transactions...</p>
                </div>
            </div>
        );
    }

    const totalRevenue = orders.reduce((sum, o) => o.status === 'paid' ? sum + (o.amount || 0) : sum, 0);

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0a0f1a] pb-12 transition-colors duration-300">
            {/* Header */}
            <div className="bg-white dark:bg-[#111827] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 -ml-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                                <Activity className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Transactions (VNPay)</h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total Orders</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{orders.length}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Successful</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{orders.filter(o => o.status === 'paid').length}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                            <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total Revenue (VNĐ)</p>
                            <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">{totalRevenue.toLocaleString('vi-VN')}</p>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center gap-4 justify-between">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Order History</h2>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by email, name, course or TxnRef..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead className="sticky top-0 bg-gray-50 dark:bg-[#0f172a] z-10 shadow-sm">
                                <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-800">
                                    <th className="py-4 px-6">User / Email</th>
                                    <th className="py-4 px-6">Course</th>
                                    <th className="py-4 px-6">TxnRef</th>
                                    <th className="py-4 px-6">Amount</th>
                                    <th className="py-4 px-6 text-center">Status</th>
                                    <th className="py-4 px-6 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-gray-500">
                                            No transactions found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map(order => (
                                        <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-semibold text-gray-900 dark:text-white text-sm">{order.user?.name || 'Unknown User'}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{order.user?.email}</div>
                                            </td>
                                            <td className="py-4 px-6 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {order.course?.title || 'Unknown Course'}
                                            </td>
                                            <td className="py-4 px-6 text-xs text-gray-500 font-mono">
                                                {order.vnpTxnRef}
                                            </td>
                                            <td className="py-4 px-6 text-sm font-bold text-gray-900 dark:text-gray-200">
                                                {(order.amount || 0).toLocaleString('vi-VN')} VNĐ
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                {order.status === 'paid' && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                                                    </span>
                                                )}
                                                {order.status === 'pending' && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                        <Clock className="w-3.5 h-3.5" /> Pending
                                                    </span>
                                                )}
                                                {order.status === 'failed' && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                        <XCircle className="w-3.5 h-3.5" /> Failed
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-right text-xs text-gray-500">
                                                {new Date(order.createdAt).toLocaleString('vi-VN')}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
