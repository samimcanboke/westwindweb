import { Head } from '@inertiajs/react';
import React, { useEffect,useState } from 'react';
import Chart from "react-apexcharts";   

export default function AdminDashboard({ auth, header }) {
    const [series, setSeries] = useState({});
    const [users, setUsers] = useState([]);
    const getUsers = async () => {
        const response = await axios.get(route('users.show'));
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
        <div>
            {series.series && series.series.length > 0 ? (
                <Chart options={series.options} series={series.series} type="bar" height={350} />
            ) : (
                <p>Loading...</p>
            )}
        </div>
    )

}