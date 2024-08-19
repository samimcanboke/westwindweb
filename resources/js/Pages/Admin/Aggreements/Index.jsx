import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Button } from "flowbite-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function BahnCards({ auth }) {
    const [aggreements, setAggreements] = useState([]);

    const fetchData = async () => {
        const bahnCardsResponse = await axios.get(route("aggreements"));
        setAggreements(bahnCardsResponse.data);
    };

    useEffect(() => {
        fetchData();
        const id = setInterval(fetchData, 2000);
        return () => clearInterval(id);
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Vertrag Liste
                </h2>
            }
        >
            <Head title="Vertrag Liste" />



            <div className="container mx-auto mt-10">
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <caption className="p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-white dark:bg-gray-800">
                            <div className="flex justify-between align-middle">
                                <div>
                                    {" "}
                                    Vertrag Liste
                                    <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                                        Hier sind alle Vertrag die erstellt
                                        wurden.
                                    </p>
                                </div>
                                <div>
                                    <a
                                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                        href={route("aggreements.create")}
                                    >
                                        Neue Vereinbarung
                                    </a>
                                </div>
                            </div>
                        </caption>

                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Vereinbarung Name
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-right"
                                >
                                   Ist Pflicht
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
                            {aggreements &&
                                aggreements.length > 0 &&
                                aggreements.map((aggreement) => (
                                    <tr
                                        key={aggreement.id}
                                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                    >
                                        <td
                                            scope="row"
                                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                        >
                                            {aggreement.name}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            {aggreement.is_mandatory ? "Ja" : "Nein"}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <a
                                                href={route("aggreements.edit", {
                                                    id: aggreement.id,
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
                                                    Swal.fire({
                                                        title: 'Sind Sie sicher, dass Sie den Vertrag löschen möchten?',
                                                        icon: 'warning',
                                                        showCancelButton: true,
                                                        confirmButtonColor: '#3085d6',
                                                        cancelButtonColor: '#d33',
                                                        confirmButtonText: 'Ja, löschen!',
                                                        cancelButtonText: 'Nein, abbrechen'
                                                    }).then((result) => {
                                                        if (result.isConfirmed) {
                                                            axios
                                                                .delete(
                                                                    route(
                                                                        "aggreements.destroy",
                                                                        {
                                                                            id: aggreement.id,
                                                                        }
                                                                    )
                                                                )
                                                                .then((res) => {
                                                                    setAggreements(
                                                                        aggreements.filter(
                                                                            (b) =>
                                                                                b.id !==
                                                                                aggreement.id
                                                                        )
                                                                    );
                                                                    Swal.fire(
                                                                        'Gelöscht!',
                                                                        'Vertrag wurde erfolgreich gelöscht.',
                                                                        'success'
                                                                    );
                                                                });
                                                        }
                                                    });
                                                }}
                                            >
                                                Löschen
                                            </Button>
                                        </td>
                                    </tr>
                                ))}

                            {aggreements && aggreements.length === 0 && (
                                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td
                                        colSpan="6"
                                        className="px-6 py-4 text-center"
                                    >
                                        Keine Vertrag gefunden
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
