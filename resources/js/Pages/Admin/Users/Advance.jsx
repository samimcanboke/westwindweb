import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Button, Modal, Label } from "flowbite-react";
import { useEffect, useState } from "react";
import moment from "moment";
import axios from "axios";

export default function Advances({ auth, user_id }) {
    const [advances, setAdvances] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [newAdvances, setNewAdvances] = useState({
        transaction_date: new Date(),
        amount: null,
    });

    const getAdvances = () => {
        axios.get(route("get-user-advances", user_id)).then((res) => {
            let advancesUnsorted = res.data;
            if (advancesUnsorted.length > 0) {
                let advancesSorted = advancesUnsorted.sort((a, b) => {
                    return a.driver_id.localeCompare(b.driver_id);
                });
                setAdvances(advancesSorted);
            }
        });
    };

    const deleteAdvances = (advances_id) => {
        axios.delete(route("delete-advances", advances_id)).then((res) => {
            getAdvances();
            setAdvances(advances.filter((item) => item.id !== advances_id));
        });
    };
    const addNewAdvances = () => {
        axios.post(route("add-advances", user_id), newAdvances).then((res) => {
            getAdvances();
            setOpenModal(false);
        });
    };
    useEffect(() => {
        getAdvances();
        const interval = setInterval(() => {
            getAdvances();
        }, 10000);
        return () => clearInterval(interval);
    }, []);
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {auth.user.name} - Vorauszahlungen
                </h2>
            }
        >
            <Head title="User List" />

            <Modal show={openModal} onClose={() => setOpenModal(false)}>
                <Modal.Header>Vorauszahlung Hinzufügen</Modal.Header>
                <Modal.Body>
                    <div className="space-y-6">
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-4000">
                            Füllen Sie das Formular aus, um {auth.user.name}{" "}
                            eine Vorauszahlung zu geben
                        </p>
                        <div>
                            <Label htmlFor="transaction_date">Datum</Label>
                            <input
                                type="date"
                                id="transaction_date"
                                className="w-full border-2 border-gray-300 rounded-md p-2"
                                value={
                                    newAdvances.transaction_date
                                        .toISOString()
                                        .split("T")[0]
                                }
                                onChange={(e) => {
                                    setNewAdvances({
                                        ...newAdvances,
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
                                value={newAdvances.amount}
                                onChange={(e) => {
                                    setNewAdvances({
                                        ...newAdvances,
                                        amount: parseFloat(e.target.value),
                                    });
                                }}
                            />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={addNewAdvances}>Hinzufügen</Button>
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
                                    {auth.user.name} - Vorauszahlungen
                                    <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                                        {auth.user.name} - Vorauszahlungen
                                    </p>
                                </div>
                                <div>
                                    <button
                                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                        onClick={() => {
                                            setOpenModal(true);
                                        }}
                                    >
                                        Neu Vorauszahlung
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
                            {advances &&
                                advances.length > 0 &&
                                advances.map((advances, key) => (
                                    <tr
                                        key={key}
                                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                    >
                                        <td className="px-6 py-4">
                                            {moment(
                                                advances.transaction_date
                                            ).format("DD.MM.YYYY HH:mm")}
                                        </td>
                                        <td className="px-6 py-4">
                                            {advances.amount}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Button
                                                onClick={() =>
                                                    deleteAdvances(advances.id)
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
