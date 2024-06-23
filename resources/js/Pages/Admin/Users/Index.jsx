import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function Dashboard({ auth }) {
    const [users, setUsers] = useState([]);
    useEffect(() => {
        axios.get(route('users.show')).then((res) => {
            
            setUsers(res.data);
        });
        //console.log(users);
    },[]);
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Benutzername
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
                                    Benutzername
                                    <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                                        Die Benutzerliste wird unten angezeigt.
                                    </p>
                                </div>
                                <div>
                                    <a 
                                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                    href={route("users.create")}
                                    >
                                        Neu Hinzufügen
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
                                    Name Nachname
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    E-Mail
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Telefon
                                </th>
                              
                                <th scope="col" className="px-6 py-3">
                                    Is Admin
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    <span className="sr-only">Bearbeiten</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users && users.length > 0 && users.map((user,key) => (
                                <tr key={key} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <th
                                    scope="row"
                                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                >
                                    {user.driver_id}
                                </th>
                                <td className="px-6 py-4">{user.name}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">{user.phone}</td>
                                <td className="px-6 py-4">{user.is_admin == 1 ? "Yes" : "No"}</td>
                                <td className="px-6 py-4 text-right">
                                    <a
                                        href={route("users.edit", user.id)}
                                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                    >
                                        Bearbeiten
                                    </a>
                                </td>
                            </tr>
                            ))}
                            
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
