import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useEffect, useState } from "react";
import {
    Label,
    Datepicker,
    Textarea,
    Select,
    Button,
} from "flowbite-react";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";

const validationSchema = Yup.object().shape({
    client_id: Yup.number().required("Required"),
    start_date: Yup.date().required("Required"),
    start_time: Yup.string().required("Required"),
    end_date: Yup.date().required("Required"),
    end_time: Yup.string().required("Required"),
    zug_nummer: Yup.string().required("Required"),
    locomotive_nummer: Yup.string().required("Required"),
    tour_name: Yup.string().required("Required"),
    from: Yup.string().required("Required"),
    to: Yup.string().required("Required"),
    description: Yup.string(),
});

export default function EditUser({ auth, id }) {
    const [client, setClient] = useState([]);
    const [job, setJob] = useState([]);

    useEffect(() => {
        axios.get("/planner/jobs/show/"+id).then((res) => {
            console.log(res.data);
            setJob(res.data);
        });
        axios.get("/clients").then((res) => {
            setClient(res.data);
        });
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Neue Arbeit Erstellen
                </h2>
            }
        >
            <Head title="Create New Jobs" />

            {   job.id && (
            <Formik
                initialValues={job}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting, resetForm  }) => {
                    setSubmitting(true);
                    axios.put(route("planner-jobs-update", { id: id }), values).then((res) => {
                        if (res.data.status) {
                            Swal.fire(
                                "Erfolgreich",
                                "Aufgabe Gespeichert",
                                "success"
                            );
                            setSubmitting(false);
                            resetForm();
                        } else {
                            Swal.fire(
                                "Fehlgeschlagen",
                                "Aufgabe konnte nicht gespeichert werden",
                                "error"
                            );
                        }
                    });
                    setSubmitting(false);
                }}
            >
                {({
                    values,
                    handleSubmit,
                    errors,
                    touched,
                    setFieldValue,
                    isSubmitting,
                }) => (
                    <Form onSubmit={handleSubmit}>
                        <div className="container mx-auto mt-10 flex flex-row justify-center">

                            <div className="">
                                <Label>Startdatum</Label>
                                <Datepicker
                                    language="de-DE"
                                    labelTodayButton="Heute"
                                    labelClearButton="Löschen"
                                    id="start_date"
                                    name="start_date"
                                    format="yyyy-MM-dd"
                                    type="date"
                                    value={
                                        values.start_date
                                    }
                                    onSelectedDateChanged={(date) => {
                                        let datenew = new Date(date).toLocaleDateString().split('.')
                                        datenew[0] = datenew[0].padStart(2, '0');
                                        datenew[1] = datenew[1].padStart(2, '0');
                                        setFieldValue("start_date", datenew.reverse().join('-'));
                                    }}
                                />
                                {errors.start_date &&
                                    touched.start_date &&
                                    errors.start_date}
                            </div>
                            <span className="mx-4 mt-9 text-gray-500">bis</span>
                            <div className="">
                                <Label>Enddatum</Label>
                                <Datepicker
                                    language="de-DE"
                                    labelTodayButton="Heute"
                                    labelClearButton="Löschen"
                                    id="end_date"
                                    name="end_date"
                                    format="yyyy-MM-dd"
                                    type="date"
                                    value={
                                        values.end_date
                                    }
                                    onSelectedDateChanged={(date) => {
                                        let datenew = new Date(date).toLocaleDateString().split('.')
                                        datenew[0] = datenew[0].padStart(2, '0');
                                        datenew[1] = datenew[1].padStart(2, '0');
                                        setFieldValue("end_date", datenew.reverse().join('-'));                                    }}
                                />
                                {errors.end_date &&
                                    touched.end_date &&
                                    errors.end_date}
                            </div>
                        </div>

                        <div className="container mx-auto mt-3 flex flex-row justify-center">
                            <div className="">
                                <Label>Startzeit</Label>
                                <div className="flex">
                                    <input
                                        type="time"
                                        id="start_time"
                                        name="start_time"
                                        className={
                                            errors.start_time &&
                                            touched.start_time
                                                ? "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                : "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        }
                                        value={values.start_time}
                                        onChange={(e) => {
                                            setFieldValue(
                                                "start_time",
                                                e.target.value
                                            );
                                        }}
                                    />
                                    <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-s-0 border-s-0 border-gray-300 rounded-e-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                                        <svg
                                            className="w-4 h-4 text-gray-500 dark:text-gray-400"
                                            aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" />
                                        </svg>
                                    </span>
                                </div>
                                {errors.start_time &&
                                    touched.start_time &&
                                    errors.start_time}
                            </div>
                            <span className="mx-4 mt-9 text-gray-500">bis</span>
                            <div className="">
                                <Label>Endzeit</Label>
                                <div className="flex">
                                    <input
                                        type="time"
                                        id="end_time"
                                        name="end_time"
                                        className={
                                            errors.end_time &&
                                            touched.end_time
                                                ? "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                : "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        }
                                        value={values.end_time}
                                        onChange={(e) => {
                                            setFieldValue(
                                                "end_time",
                                                e.target.value
                                            );
                                        }}
                                    />
                                    <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-s-0 border-s-0 border-gray-300 rounded-e-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                                        <svg
                                            className="w-4 h-4 text-gray-500 dark:text-gray-400"
                                            aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" />
                                        </svg>
                                    </span>
                                </div>
                                {errors.end_time &&
                                    touched.end_time &&
                                    errors.end_time}
                            </div>
                        </div>

                       
                        <div className="container mx-auto mt-10">
                            <Label>Zug Nummer</Label>
                            <Field
                                id="zugNummer"
                                type="text"
                                placeholder="Zug Nummer"
                                name="zugNummer"
                                className={
                                    errors.zug_nummer && touched.zug_nummer
                                        ? "placeholder:italic placeholder:text-slate-4000 block bg-white border border-red-500 w-full rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        : "placeholder:italic placeholder:text-slate-400 block bg-white  border border-slate-300 w-full rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                }
                                onChange={(e) => {
                                    setFieldValue("zug_nummer", e.target.value);
                                }}
                                value={values.zug_nummer}
                            />
                            {errors.zug_nummer && touched.zug_nummer && (
                                <p className="text-red-500">
                                    *{errors.zug_nummer}
                                </p>
                            )}
                        </div>
                        

                        <div className="container mx-auto mt-10">
                            <Label>Lokomotive Nummer</Label>
                            <Field
                                id="locomotive_nummer"
                                type="text"
                                placeholder="Locomotive Nummer"
                                name="locomotive_nummer"
                                className={
                                    errors.locomotive_nummer && touched.locomotive_nummer
                                        ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                }
                                onChange={(e) => {
                                    setFieldValue("locomotive_nummer", e.target.value);
                                }}
                                value={values.locomotive_nummer}
                            />
                            {errors.locomotive_nummer && touched.locomotive_nummer && (
                                <p className="text-red-500">
                                    *{errors.locomotive_nummer}
                                </p>
                            )}
                        </div>
                  

                        <div className="container mx-auto mt-10">
                            <Label>Tour Name</Label>
                            <Field
                                id="tour_name"
                                type="text"
                                placeholder="Tour Name"
                                name="tour_name"
                                className={
                                    errors.tour_name && touched.tour_name
                                        ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                }
                                onChange={(e) => {
                                    setFieldValue("tour_name", e.target.value);
                                }}
                                value={values.tour_name}
                            />
                            {errors.tour_name && touched.tour_name && (
                                <p className="text-red-500">
                                    *{errors.tour_name}
                                </p>
                            )}
                        </div>
                        

                        <div className="container mx-auto mt-10">
                            <Label>Von</Label>
                            <Field
                                id="from"
                                type="text"
                                placeholder="From"
                                name="from"
                                className={
                                    errors.from && touched.from
                                        ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                }
                                onChange={(e) => {
                                    setFieldValue("from", e.target.value);
                                }}
                                value={values.from}
                            />
                            {errors.from && touched.from && (
                                <p className="text-red-500">
                                    *{errors.from}
                                </p>
                            )}
                        </div>
                        <br />
                        <div className="container mx-auto mt-10">
                            <Label>Bis</Label>
                            <Field
                                id="to"
                                type="text"
                                placeholder="To"
                                name="to"
                                className={
                                    errors.to && touched.to
                                        ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                }
                                onChange={(e) => {
                                    setFieldValue("to", e.target.value);
                                }}
                                value={values.to}
                            />
                            {errors.to && touched.to && (
                                <p className="text-red-500">
                                    *{errors.to}
                                </p>
                            )}
                        </div>
                        <br />
                        <div className="container mx-auto mt-10">
                        <Label>Kommenter</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Einen Kommentar hinterlassen..."
                            value={values.description}
                            rows={4}
                            className={
                                errors.description && touched.description
                                    ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                    : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                            }
                            onChange={(e) => {
                                setFieldValue("description", e.target.value);
                            }}
                        />
                        {errors.description && touched.description && (
                            <p className="text-red-500">*{errors.description}</p>
                        )}
                        </div>
                        
                        <div className="container mx-auto mt-10">
                            <div className="mb-2 block">
                                <Label
                                    htmlFor="client"
                                    value="Wählen Sie Ihren Kunden"
                                />
                            </div>
                            <Select
                                id="client_id"
                                name="client_id"
                                required
                                value={values.client_id}
                                onChange={(e) => {
                                    setFieldValue("client_id", e.target.value);
                                }}
                            >
                                <option>Wählen Sie...</option>
                                {client.map((client) => (
                                    <option key={client.id} value={client.id} >
                                        {client.name}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        {errors.client && touched.client && (
                            <p className="text-red-500">*{errors.client}</p>
                        )}
                        <br />
                        <div className="flex justify-center items-center">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="mb-5"
                            >
                                Speichern
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
            )}
        </AuthenticatedLayout>
    );
}
