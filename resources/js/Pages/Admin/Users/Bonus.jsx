import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Button } from "flowbite-react";
import { useEffect, useState } from "react";

export default function Bonus({ auth, user_id }) {
    const [bonus, setBonus] = useState([]);

    const getBonus = () => {
        axios.get(route('users-bonus.show', user_id)).then((res) => {
            let bonusUnsorted = res.data;
            let bonusSorted = bonusUnsorted.sort((a, b) => {
                return a.driver_id.localeCompare(b.driver_id);
            });
            setBonus(bonusSorted);
        });
    }

    const deleteBonus = () => {
        axios.post(route('users-bonus.destroy', user_id)).then((res) => {
            getBonus();
        });
    }
    useEffect(() => {
        getBonus();
    },[]);
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {auth.user.name} - Bonus
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
                                    {auth.user.name} - Bonus
                                    <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                                        {auth.user.name} - Bonus
                                    </p>
                                </div>
                                <div>
                                    <a
                                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                    href={route("users.create")}
                                    >
                                        Neu Bonus
                                    </a>
                                </div>
                            </div>
                        </caption>

                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Date
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Amount
                                </th>
                                <th scope="col" className="px-6 py-3">
                                <th scope="col" className="px-6 py-3">
                                    Delete
                                </th>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {bonus && bonus.length > 0 && bonus.map((bonus,key) => (
                                <tr key={key} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <td className="px-6 py-4">{moment(bonus.transaction_date).format('DD.MM.YYYY HH:mm')}</td>
                                <td className="px-6 py-4">{bonus.amount}</td>
                                <td className="px-6 py-4">
                                    <Button
                                        onClick={() => deleteBonus(bonus.id)}
                                        className="bg-red-500 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Bonus Sil
                                    </Button>
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
