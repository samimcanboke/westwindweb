import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function FinalizedJobs({ auth }) {
    const [year, setYear] = useState("");
    const [month, setMonth] = useState("");

    const handleFilter = () => {
        axios
            .post("/finalized-jobs/export", { year, month })
            .then((response) => {
                if(response.data.status){
                    let url = "/download-pdf/" + response.data.file + ".pdf";
                    window.open(url, "_blank", "noreferrer");
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Hata',
                        text: 'Onaylanan İş Bulunamadı',
                    })
                }
            })
            .catch((error) => {
                console.error("There was an error filtering the jobs!", error);
            });
    };
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Finalized Jobs
                </h2>
            }
        >
            <Head title="Finalized Jobs" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex items-center space-x-4">
                                <div>
                                    <label
                                        htmlFor="year"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Yıl
                                    </label>
                                    <select
                                        id="year"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    >
                                        <option value="">Yıl Seçin</option>
                                        <option value="2020">2020</option>
                                        <option value="2021">2021</option>
                                        <option value="2022">2022</option>
                                        <option value="2023">2023</option>
                                        <option value="2024">2024</option>
                                        <option value="2025">2025</option>
                                        <option value="2026">2026</option>
                                    </select>
                                </div>
                                <div>
                                    <label
                                        htmlFor="month"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Ay
                                    </label>
                                    <select
                                        id="month"
                                        value={month}
                                        onChange={(e) => setMonth(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    >
                                        <option value="">Ay Seçin</option>
                                        <option value="1">Ocak</option>
                                        <option value="2">Şubat</option>
                                        <option value="3">Mart</option>
                                        <option value="4">Nisan</option>
                                        <option value="5">Mayıs</option>
                                        <option value="6">Haziran</option>
                                        <option value="7">Temmuz</option>
                                        <option value="8">Ağustos</option>
                                        <option value="9">Eylül</option>
                                        <option value="10">Ekim</option>
                                        <option value="11">Kasım</option>
                                        <option value="12">Aralık</option>
                                    </select>
                                </div>
                                <div className="pt-6">
                                    <button
                                        onClick={handleFilter}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Filtrele
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
