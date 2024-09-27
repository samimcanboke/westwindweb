import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import React, { useEffect,useState } from 'react';
import Chart from "react-apexcharts";


export default function Dashboard({ auth }) {

    const [users, setUsers] = useState([]);
    const [series, setSeries] = useState({});
    const getUsers = async () => {
        const response = await axios.get(route('users.show'));
        console.log(response.data);
        setUsers(response.data);
        setSeries({
            options: {
                chart: {
                    id: "basic-bar"
                },
                xaxis: {
                    categories: response.data.map(user => user.name)
                }
            },
            series: [
                {
                      name: "Onaylanmış İşler",
                      data: Array.from({ length: response.data.length }, () => Math.floor(Math.random() * 100))
                    },
                    {
                      name: "Onay Bekleyen İşler",
                      data: Array.from({ length: response.data.length }, () => Math.floor(Math.random() * 100))
                }
            ]
        });
    }
    

    useEffect(() => {
        getUsers();
    }, []);

    useEffect(() => {
        console.log(series);
    }, [series]);
   
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
                            series.series && series.series.length > 0 ? (
                                <Chart options={series.options} series={series.series} type="bar" height={350} />
                            ) : (
                                <p>Loading...</p>
                            )
                        ) : (
                            <p>Willkommen!</p>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
