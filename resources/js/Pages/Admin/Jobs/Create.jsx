import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useEffect, useState } from "react";
import {
    Label,
    Datepicker,
    Textarea,
    Select,
    Button,
    ToggleSwitch
} from "flowbite-react";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import moment from "moment";

const initialValues = {
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    zug_nummer: "X",
    locomotive_nummer: "193",
    tour_name: "",
    from: "",
    to: "",
    description: "",
    client: 1,
    extra: false,
};

const validationSchema = Yup.object().shape({
    client: Yup.number().required("Required"),
    start_date: Yup.date().required("Required"),
    start_time: Yup.string().required("Required"),
    end_date: Yup.date().required("Required").when(
        "start_date",
        (eventStartDate, schema) => eventStartDate && schema.min(eventStartDate, "Enddatum muss grßer als Startdatum sein")),
    end_time: Yup.string().required("Required"),
    zug_nummer: Yup.string(),
    locomotive_nummer: Yup.string(),
    tour_name: Yup.string().required("Required"),
    from: Yup.string().required("Required"),
    to: Yup.string().required("Required"),
    description: Yup.string(),
});

export default function Dashboard({ auth }) {
    const [clients, setClients] = useState([]);
    useEffect(() => {
        axios.get("/clients").then((res) => {
            setClients(res.data);
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

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting, resetForm  }) => {
                    setSubmitting(true);
                    axios.post("/planner/jobs", values).then((res) => {
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
                                <div className="flex">
                                    <Datepicker
                                        language="de-DE"
                                        labelTodayButton="Heute"
                                        labelClearButton="Löschen"
                                        id="start_date"
                                        name="start_date"
                                        format="yyyy-MM-dd"
                                        type="date"
                                        value={values.start_date}
                                        onSelectedDateChanged={(date) => {
                                            let datenew = new Date(date).toLocaleDateString().split('.')
                                            datenew[0] = datenew[0].padStart(2, '0');
                                            datenew[1] = datenew[1].padStart(2, '0');
                                            setFieldValue("start_date", datenew.reverse().join('-'));
                                        }}
                                    />
                                    <input
                                        type="time"
                                        id="start_time"
                                        name="start_time"
                                        className={
                                            errors.start_time && touched.start_time
                                                ? "rounded-none rounded-s-lg bg-gray-50 ml-2 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                : "rounded-none rounded-s-lg bg-gray-50 ml-2 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        }
                                        value={values.start_time}
                                        onChange={(e) => {
                                            setFieldValue("start_time", e.target.value);
                                        }}
                                        onBlur={(e) => {
                                            const startTime = e.target.value;
                                            setFieldValue("start_time", startTime);

                                            const [hours, minutes] = startTime.split(':');
                                            const endTime = new Date();
                                            endTime.setHours(parseInt(hours) + 10);
                                            endTime.setMinutes(parseInt(minutes));

                                            const endHours = endTime.getHours().toString().padStart(2, '0');
                                            const endMinutes = endTime.getMinutes().toString().padStart(2, '0');
                                            setFieldValue("end_time", `${endHours}:${endMinutes}`);
                                            const startDateTime = moment(`${values.start_date}T${values.start_time}`);
                                            const endDateTime = moment(`${values.start_date}T${values.end_time}`);
                                            if (endDateTime.isBefore(startDateTime)) {
                                                endDateTime.add(1, 'day');
                                            }
                                            console.log(startDateTime.toDate(), endDateTime.toDate());

                                            setFieldValue("end_date", endDateTime.toISOString().split('T')[0]);
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
                                <p className="text-red-500">
                                    {errors.start_date && touched.start_date && errors.start_date}
                                </p>
                                <p className="text-red-500">
                                    {errors.start_time && touched.start_time && errors.start_time}
                                </p>
                            </div>
                            <span className="mx-4 mt-9 text-gray-500">bis</span>
                            <div className="">
                                <Label>Enddatum</Label>
                                <div className="flex">
                                    <Datepicker
                                        language="de-DE"
                                        labelTodayButton="Heute"
                                        labelClearButton="Löschen"
                                        id="end_date"
                                        format="yyyy-MM-dd"
                                        type="date"
                                        name="end_date"
                                        value={values.end_date}
                                        onSelectedDateChanged={(date) => {
                                            let datenew = new Date(date).toLocaleDateString().split('.')
                                            datenew[0] = datenew[0].padStart(2, '0');
                                            datenew[1] = datenew[1].padStart(2, '0');
                                            setFieldValue("end_date", datenew.reverse().join('-'));
                                        }}
                                    />
                                    <input
                                        type="time"
                                        id="end_time"
                                        name="end_time"
                                        className={
                                            errors.end_time && touched.end_time
                                                ? "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                : "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        }
                                        value={values.end_time}
                                        onChange={(e) => {
                                            setFieldValue("end_time", e.target.value);
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
                                <p className="text-red-500">
                                    {errors.end_date && touched.end_date && errors.end_date}
                                </p>
                                <p className="text-red-500">
                                    {errors.end_time && touched.end_time && errors.end_time}
                                </p>
                            </div>
                        </div>

                        <div className="container mx-auto mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
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

                            <div>
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

                            <div>
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

                            <div>
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

                            <div>
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



                            <div>
                                <div className=" block">
                                    <Label
                                        htmlFor="client"
                                        value="Kunden"
                                    />
                                </div>
                                <Select
                                    id="client"
                                    name="client"
                                    required
                                    value={values.client}
                                    onChange={(e) => {
                                        setFieldValue("client", e.target.value);
                                    }}
                                >
                                    <option value={0}>Wählen Sie...</option>
                                   {clients.map((client) => (
                                    <option key={client.id} value={client.id}>
                                        {client.name}
                                    </option>
                                   ))}
                                </Select>
                                {errors.client && touched.client && (
                                    <p className="text-red-500">*{errors.client}</p>
                                )}
                            </div>
                            <div className="md:col-span-2">
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

                            <div>
                                <div className="mb-2 block">
                                    <Label
                                        htmlFor="extra"
                                        value="Extra"
                                    />
                                </div>
                                <ToggleSwitch
                                    id="extra"
                                    name="extra"
                                    required
                                    checked={values.extra}
                                    onChange={(e) => {
                                        setFieldValue("extra", e);
                                    }}
                                />
                                {errors.client && touched.client && (
                                    <p className="text-red-500">*{errors.client}</p>
                                )}
                            </div>
                        </div>



                        <div className="flex justify-center items-center mt-8">
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
        </AuthenticatedLayout>
    );
}
