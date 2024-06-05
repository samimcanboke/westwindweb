import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function Dashboard({ auth }) {
    const [users, setUsers] = useState([]);
    useEffect(() => {
        axios.get("/user-list").then((res) => {
            console.log(res.data);
        });
    });
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Users list
                </h2>
            }
        >
            <Head title="User List" />

            <div className="container mx-auto mt-10">
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <caption className="p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-white dark:bg-gray-800">
                            <div className="flex justify-between align-middle">
                                <div>
                                    {" "}
                                    Users List
                                    <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                                        Kullanıcı Listesi aşağıda
                                        listelenecektir.
                                    </p>
                                </div>
                                <div>
                                    <a 
                                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                    href={route("users.create")}
                                    >
                                        Yeni Ekle
                                    </a>
                                </div>
                            </div>
                        </caption>

                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    ID
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Ad Soyad
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    E-Mail
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Telefon
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Durum
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    <span className="sr-only">Edit</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <th
                                    scope="row"
                                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                >
                                    Apple MacBook Pro 17"
                                </th>
                                <td className="px-6 py-4">Silver</td>
                                <td className="px-6 py-4">Laptop</td>
                                <td className="px-6 py-4">$2999</td>
                                <td className="px-6 py-4 text-right">
                                    <a
                                        href="#"
                                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                    >
                                        Edit
                                    </a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
