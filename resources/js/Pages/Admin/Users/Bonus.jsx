import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Button, Modal, Label } from "flowbite-react";
import { useEffect, useState } from "react";
import moment from "moment";
import axios from "axios";

export default function Bonus({ auth, user_id }) {
    const [bonus, setBonus] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [user, setUser] = useState({});
    const [newBonus, setNewBonus] = useState({
        transaction_date: new Date(),
        amount: null,
    });

    const getBonus = () => {
        axios.get(route("get-user-bonus", user_id)).then((res) => {
            let bonusUnsorted = res.data;
            if (bonusUnsorted.length > 0) {
                let bonusSorted = bonusUnsorted.sort((a, b) => {
                    return a.driver_id.localeCompare(b.driver_id);
                });
                setBonus(bonusSorted);
            }
        });
    };

    const deleteBonus = (bonus_id) => {
        axios.delete(route("delete-bonus", bonus_id)).then((res) => {
            getBonus();
        setBonus(bonus.filter((item) => item.id !== bonus_id));
        });
    };
    const addNewBonus = () => {
        axios.post(route("add-bonus", user_id), newBonus).then((res) => {
            getBonus();
            setOpenModal(false);
        });
    };

    const getUser = () => {
        axios.get(route("user.show", user_id)).then((res) => {
            setUser(res.data);
        });
    };

    useEffect(() => {
        getBonus();
        getUser();
        const interval = setInterval(() => {
            getBonus();
        }, 10000);
        return () => clearInterval(interval);
    }, []);
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {user ? user.name : "User"} - Bonus
                </h2>
            }
        >
            <Head title="User List" />

            <Modal show={openModal} onClose={() => setOpenModal(false)}>
                <Modal.Header>Bonus Hinzufügen</Modal.Header>
                <Modal.Body>
                    <div className="space-y-6">
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-4000">
                            Füllen Sie das Formular aus, um {user ? user.name : "User"}{" "}
                            einen Bonus zu geben
                        </p>
                        <div>
                            <Label htmlFor="transaction_date">Datum</Label>
                            <input
                                type="date"
                                id="transaction_date"
                                className="w-full border-2 border-gray-300 rounded-md p-2"
                                value={
                                    newBonus.transaction_date
                                        .toISOString()
                                        .split("T")[0]
                                }
                                onChange={(e) => {
                                    setNewBonus({
                                        ...newBonus,
                                        transaction_date: new Date(
                                            e.target.value
                                        ),
                                    });
                                }}
                            />
                        </div>
                        <div>
                            <Label htmlFor="amount">Amount</Label>
                            <input
                                type="number"
                                id="amount"
                                className="w-full border-2 border-gray-300 rounded-md p-2"
                                value={newBonus.amount}
                                onChange={(e) => {
                                    setNewBonus({
                                        ...newBonus,
                                        amount: parseFloat(e.target.value),
                                    });
                                }}
                            />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={addNewBonus}>Hinzufügen</Button>
                    <Button color="gray" onClick={() => setOpenModal(false)}>
                        Abbrechen
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className="container mx-auto mt-10">
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <caption className="p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-white dark:bg-gray-800">
                            <div className="flex justify-between align-middle">
                                <div>
                                    {" "}
                                    {user ? user.name : "User"} - Bonus
                                    <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                                    {user ? user.name : "User"} - Bonus
                                    </p>
                                </div>
                                <div>
                                    <button
                                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                        onClick={() => {
                                            setOpenModal(true);
                                        }}
                                    >
                                        Neu Bonus
                                    </button>
                                </div>
                            </div>
                        </caption>

                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Datum
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Betrag
                                </th>

                                <th scope="col" className="px-6 py-3">
                                    Löschen
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {bonus &&
                                bonus.length > 0 &&
                                bonus.map((bonus, key) => (
                                    <tr
                                        key={key}
                                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                    >
                                        <td className="px-6 py-4">
                                            {moment(
                                                bonus.transaction_date
                                            ).format("DD.MM.YYYY HH:mm")}
                                        </td>
                                        <td className="px-6 py-4">
                                            {bonus.amount}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Button
                                                onClick={() =>
                                                    deleteBonus(bonus.id)
                                                }
                                                className="bg-red-500 text-white font-bold py-2 px-4 rounded"
                                            >
                                                Löschen
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
