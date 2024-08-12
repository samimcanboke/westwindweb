import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Button, Modal, Label } from "flowbite-react";
import { useEffect, useState } from "react";
import moment from "moment";
import axios from "axios";
import * as yup from "yup";
import { Formik, Form, Field } from "formik";
import Swal from "sweetalert2";

export default function HourBanks({ auth, user_id }) {
    const [hourBanks, setHourBanks] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [user, setUser] = useState(null);

    const validationSchema = yup.object().shape({
        hours: yup.number().required(),
        type: yup.mixed().oneOf(["deposit", "withdraw"]).required(),
        date: yup.date().required(),
    });

    const getHourBanks = () => {
        axios.get(route("get-user-hour-banks", user_id)).then((res) => {
            let hourBanksUnsorted = res.data;
            if (hourBanksUnsorted.length > 0) {
                let hourBanksSorted = hourBanksUnsorted.sort((a, b) => {
                    return a.date.localeCompare(b.date);
                });
                setHourBanks(hourBanksSorted);
            }
        });
    };

    const deleteHourBank = (hourBank) => {
        axios.delete(route("delete-hour-bank", hourBank.id)).then((res) => {
            getHourBanks();
            setHourBanks(hourBanks.filter((item) => item.id !== hourBank.id));
        });
    };

    const getUser = () => {
        axios.get(route("user.show", user_id)).then((res) => {
            setUser(res.data);
        });
    };

    useEffect(() => {
        getHourBanks();
        getUser();
        const interval = setInterval(() => {
            getHourBanks();
        }, 1000);
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
            <Head title="Hour Banks" />

            <Modal show={openModal} onClose={() => setOpenModal(false)}>
                <Modal.Header>Hour Bank Hinzufügen</Modal.Header>
                <Modal.Body>
                    <div className="space-y-6">
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-4000">
                            Füllen Sie das Formular aus, um{" "}
                            {user ? user.name : "User"}
                            einen Hour Bank zu geben
                        </p>
                        <Formik
                            initialValues={{
                                hours: "",
                                type: "",
                                date: "",
                            }}
                            validationSchema={validationSchema}
                            onSubmit={(values, { setSubmitting, setErrors }) => {
                                if (values.type === "withdraw") {
                                    const totalHours = hourBanks.reduce((acc, curr) => {
                                        return acc + (curr.type === "deposit" ? curr.hours : -curr.hours);
                                    }, 0);

                                    if (values.hours > totalHours) {
                                        setErrors({ hours: "In der Kasse ist dieser Betrag nicht vorhanden" });
                                        setSubmitting(false);
                                        return;
                                    }
                                }

                                axios
                                    .post(
                                        route("add-hour-bank", user.id),
                                        values
                                    )
                                    .then((res) => {
                                        getHourBanks();
                                        setOpenModal(false);
                                        setSubmitting(false);
                                    });
                            }}
                        >
                            {({ isSubmitting, errors }) => (
                                <Form>
                                    <div>
                                        <Label htmlFor="date">Datum</Label>
                                        <Field
                                            type="date"
                                            id="date"
                                            name="date"
                                            className="w-full border-2 border-gray-300 rounded-md p-2"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="hours">Stunden</Label>
                                        <Field
                                            type="number"
                                            id="hours"
                                            name="hours"
                                            step="0.01"
                                            className="w-full border-2 border-gray-300 rounded-md p-2"
                                        />
                                        {errors.hours && <div className="text-red-500">{errors.hours}</div>}
                                    </div>
                                    <div>
                                        <Label>Typ</Label>
                                        <div
                                            role="group"
                                            aria-labelledby="type"
                                            className="flex space-x-4 mt-2"
                                        >
                                            <label className="flex items-center space-x-2">
                                                <Field
                                                    type="radio"
                                                    name="type"
                                                    value="deposit"
                                                    className="form-radio h-4 w-4 text-blue-600"
                                                />
                                                <span>Einzahlung</span>
                                            </label>
                                            <label className="flex items-center space-x-2">
                                                <Field
                                                    type="radio"
                                                    name="type"
                                                    value="withdraw"
                                                    className="form-radio h-4 w-4 text-blue-600"
                                                />
                                                <span>Abhebung</span>
                                            </label>
                                        </div>
                                    </div>
                                    <Modal.Footer>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                        >
                                            Hinzufügen
                                        </Button>
                                        <Button
                                            color="gray"
                                            onClick={() => setOpenModal(false)}
                                        >
                                            Abbrechen
                                        </Button>
                                    </Modal.Footer>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </Modal.Body>
            </Modal>

            <div className="container mx-auto mt-10">
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <caption className="p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-white dark:bg-gray-800">
                            <div className="flex justify-between align-middle">
                                <div>
                                    {" "}
                                    {user ? user.name : "User"} - Hour Banks
                                    <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                                        {user ? user.name : "User"} - Hour Banks
                                    </p>
                                </div>
                                <div>
                                    <button
                                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                        onClick={() => {
                                            setOpenModal(true);
                                        }}
                                    >
                                        Neu Hour Bank
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
                                    Typ
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
                            {hourBanks &&
                                hourBanks.length > 0 &&
                                hourBanks.map((hourBank, key) => (
                                    <tr
                                        key={key}
                                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                    >
                                        <td className="px-6 py-4">
                                            {moment(
                                                hourBank.date
                                            ).format("DD.MM.YYYY HH:mm")}
                                        </td>
                                        <td className="px-6 py-4">
                                            {hourBank.type}
                                        </td>
                                        <td className={"px-6 py-4" + (hourBank.type == "deposit" ? " text-green-500" : " text-red-500")}>
                                            {hourBank.type == "deposit" ? "+" : "-"}{hourBank.hours}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Button
                                                onClick={() => {
                                                    Swal.fire({
                                                        title: 'Sind Sie sicher?',
                                                        text: "Diese Aktion kann nicht rückgängig gemacht werden!",
                                                        icon: 'warning',
                                                        showCancelButton: true,
                                                        confirmButtonColor: '#3085d6',
                                                        cancelButtonColor: '#d33',
                                                        confirmButtonText: 'Ja, löschen!',
                                                        cancelButtonText: 'Nein, abbrechen'
                                                    }).then((result) => {
                                                        if (result.isConfirmed) {
                                                            deleteHourBank(hourBank);
                                                            Swal.fire(
                                                                'Gelöscht!',
                                                                'Der Eintrag wurde erfolgreich gelöscht.',
                                                                'success'
                                                            )
                                                        }
                                                    })
                                                }}
                                                className="bg-red-500 text-white font-bold py-2 px-4 rounded"
                                            >
                                                Löschen
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    <tfoot>
                        <tr className="bg-gray-50 dark:bg-gray-700">
                            <th scope="col" className="px-6 py-3" colSpan="2">
                                Gesamtbetrag
                            </th>
                            <th scope="col" className="px-6 py-3">
                                <span className={hourBanks.reduce((total, hourBank) => {
                                    return total + (hourBank.type === "deposit" ? hourBank.hours : -hourBank.hours);
                                }, 0) >= 0 ? "text-green-500" : "text-red-500"}>
                                    {hourBanks.reduce((total, hourBank) => {
                                        return total + (hourBank.type === "deposit" ? hourBank.hours : -hourBank.hours);
                                    }, 0)}
                                </span>
                            </th>
                            <th scope="col" className="px-6 py-3"></th>
                        </tr>
                    </tfoot>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
