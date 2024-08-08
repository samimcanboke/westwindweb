import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Button, Modal, Select } from "flowbite-react";
import { useEffect, useState } from "react";
import moment from "moment";

export default function BahnCards({ auth }) {
    const [bahnCards, setBahnCards] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [driver, setDriver] = useState(null);
    const [drivers, setDrivers] = useState([]);
    const [bahnCard, setBahnCard] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const usersResponse = await axios.get(route("users.show"));
            setDrivers(usersResponse.data);

            const bahnCardsResponse = await axios.get("/admin/all-bahn-cards");
            const updatedBahnCards = bahnCardsResponse.data.map((bahnCard) => {
                if (bahnCard.user_id) {
                    const user = usersResponse.data.find(
                        (driver) => driver.id === bahnCard.user_id
                    );
                    bahnCard.user = user;
                } else {
                    bahnCard.user = null;
                }
                return bahnCard;
            });

            setBahnCards(updatedBahnCards);
        };

        fetchData();
    }, []);

    const setMachinist = () => {
        axios
            .put(
                route("bahn-cards-update", {
                    id: bahnCard,
                }),
                {
                    driver: driver,
                }
            )
            .then((res) => {
                setBahnCards(
                    bahnCards.map((bahnCard) => {
                        if (bahnCard.id === bahnCard) {
                            return { ...bahnCard, driver: driver };
                        }
                        return bahnCard;
                    })
                );
            });
        setOpenModal(false);
        setBahnCard(null);
        setDriver(null);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Bahn Karten Liste
                </h2>
            }
        >
            <Head title="Bahn Karten Liste" />

            <Modal show={openModal} onClose={() => setOpenModal(false)}>
                <Modal.Header>Lokführer Wählen</Modal.Header>
                <Modal.Body>
                    <div className="space-y-6">
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-4000">
                            Verfügbare Lokführer
                        </p>
                        <Select
                            className="w-full"
                            onChange={(e) => setDriver(e.target.value)}
                        >
                            <option>Wählen</option>
                            {drivers &&
                                drivers.map((driver) => (
                                    <option key={driver.id} value={driver.id}>
                                        {driver.name}
                                    </option>
                                ))}
                        </Select>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={setMachinist}>Zuweisen</Button>
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
                                    Bahn Karten Liste
                                    <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                                        Hier sind alle Bahn Karten die erstellt
                                        wurden.
                                    </p>
                                </div>
                                <div>
                                    <a
                                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                        href={route("bahn-cards.create")}
                                    >
                                        Neue Bahn Karte
                                    </a>
                                </div>
                            </div>
                        </caption>

                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Bahn Karte Nr.
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-center"
                                >
                                    <span>Lokführer</span>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-right"
                                >
                                    Gültig ab
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-right"
                                >
                                    Gültig bis
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-right"
                                >
                                    Klasse
                                </th>

                                <th scope="col" className="px-6 py-3">
                                    <span className="sr-only">Bearbeiten</span>
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    <span className="sr-only">Löschen</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {bahnCards &&
                                bahnCards.length > 0 &&
                                bahnCards.map((bahnCard) => (
                                    <tr
                                        key={bahnCard.id}
                                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                    >
                                        <td
                                            scope="row"
                                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                        >
                                            {bahnCard.number}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {bahnCard.user_id ? (
                                                bahnCard.user?.name
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setBahnCard(
                                                            bahnCard.id
                                                        );
                                                        setOpenModal(true);
                                                    }}
                                                    className="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-bold py-2 px-4 rounded"
                                                >
                                                    Lokführer zuweisen
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {moment(bahnCard.valid_from).format(
                                                "DD.MM.YYYY"
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {moment(bahnCard.valid_to).format(
                                                "DD.MM.YYYY"
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {bahnCard.class}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <a
                                                href={route("bahn-cards.edit", {
                                                    id: bahnCard.id,
                                                })}
                                                className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                            >
                                                Bearbeiten
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                color="red"
                                                className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                                onClick={() => {
                                                    axios
                                                        .delete(
                                                            route(
                                                                "bahn-cards-destroy",
                                                                {
                                                                    id: bahnCard.id,
                                                                }
                                                            )
                                                        )
                                                        .then((res) => {
                                                            setBahnCards(
                                                                bahnCards.filter(
                                                                    (b) =>
                                                                        b.id !==
                                                                        bahnCard.id
                                                                )
                                                            );
                                                        });
                                                }}
                                            >
                                                Löschen
                                            </Button>
                                        </td>
                                    </tr>
                                ))}

                            {bahnCards && bahnCards.length === 0 && (
                                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td
                                        colSpan="6"
                                        className="px-6 py-4 text-center"
                                    >
                                        Keine Bahn Karten gefunden
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
