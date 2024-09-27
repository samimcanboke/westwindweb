import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import React, { useEffect,useState } from 'react';
import Chart from "react-apexcharts";
import DashboardComponent from '@/Components/Dashboard';
import AdminDashboard from '@/Components/AdminDashboard';


export default function Dashboard({ auth }) {

    const [users, setUsers] = useState([]);
    
   
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        {auth.user.is_admin || auth.user.accountant ? (
                            <AdminDashboard auth={auth} />
                        ) : (
                            <DashboardComponent auth={auth} />
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
