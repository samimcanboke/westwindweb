import { useState, useEffect } from "react";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import {
    Accordion,
    AccordionContent,
    AccordionPanel,
    AccordionTitle,
    Label,
    Datepicker,
    Textarea,
    ToggleSwitch,
    Select,
    Button,
    Table,
} from "flowbite-react";
import Swal from "sweetalert2";
import { Formik, Field, FieldArray, Form } from "formik";
import * as Yup from "yup";
import moment from "moment";

const initialValues = {
    initialDate: "",
    zugNummer: "",
    tourName: "",
    locomotiveNumber: "",
    cancel: false,
    accomodation: false,
    bereitschaft: false,
    comment: "",
    client: "",
    feedingFee: "",
    guestStartPlace: "",
    guestStartTime: "",
    guestStartEndPlace: "",
    guestStartEndTime: "",
    workStartPlace: "",
    workStartTime: "",
    trainStartPlace: "",
    trainStartTime: "",
    trainEndPlace: "",
    trainEndTime: "",
    breaks: [],
    workEndPlace: "",
    workEndTime: "",
    guestEndPlace: "",
    guestEndTime: "",
    guestEndEndPlace: "",
    guestEndEndTime: "",
};

const validationSchema = Yup.object().shape({
    initialDate: Yup.date().required("Required"),
    client: Yup.number().required("Required"),
    zugNummer: Yup.string().required("Required"),
    tourName: Yup.string().required("Required"),
    workStartPlace: Yup.string().required("Required"),
    workEndPlace: Yup.string().required("Required"),
    workStartTime: Yup.string().required("Required"),
    workEndTime: Yup.string().required("Required"),
});

export default function NewJobs({ auth }) {
    const [client, setClient] = useState([]);

    useEffect(() => {
        axios.get("/clients").then((res) => {
            if (res.status == 200) {
                console.log(res.data);
                setClient(res.data);
            }
        });
    }, []);

    const generateTimeOptions = () => {
        const options = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                const formattedHour = String(hour).padStart(2, "0");
                const formattedMinute = String(minute).padStart(2, "0");
                options.push(`${formattedHour}:${formattedMinute}`);
            }
        }
        return options;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Neue Bereichte
                </h2>
            }
        >
            <Head title="New Jobs" />
            <Label className="p-3 flex justify-center ">
                Der gesamte Plan von der Abfahrt bis zur Rückkehr wird hier geschrieben.
            </Label>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    setSubmitting(true);

                    values.initialDate = moment(values.initialDate)
                        .add(1, "days")
                        .toDate();

                    if (
                        values.breaks &&
                        values.breaks.length > 0 &&
                        (values.breaks[0].start || values.breaks[0].end)
                    ) {
                        if (values.breaks[0].start && !values.breaks[0].end) {
                            Swal.fire(
                                "Fehler",
                                "Die Pausenendzeit darf nicht leer sein.",
                                "error"
                            );
                            return;
                        } else if (
                            !values.breaks[0].start &&
                            values.breaks[0].end
                        ) {
                            Swal.fire(
                                "Fehler",
                                "Die Pausenstartzeit darf nicht leer sein.",
                                "error"
                            );
                            return;
                        }
                    }

                    axios.post("/save-draft-jobs", values).then((res) => {
                        if (res.status) {
                            console.log(res.data);
                            Swal.fire(
                                "Erfolgreich",
                                "Entwurf gespeichert.",
                                "success"
                            );
                            router.visit("/draft-jobs");
                            setSubmitting(false);
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
                        <Accordion>
                            <AccordionPanel isOpen={false}>
                                <AccordionTitle>
                                    Allgemeine Informationen
                                </AccordionTitle>
                                <AccordionContent>
                                    <Label>Startdatum</Label>

                                    <Datepicker
                                        language="de-DE"
                                        labelTodayButton="Heute"
                                        labelClearButton="Löschen"
                                        id="initialDate"
                                        name="initialDate"
                                        value={
                                            values.initialDate
                                                ? moment(
                                                      values.initialDate
                                                  ).format("DD-MM-YYYY")
                                                : ""
                                        }
                                        onSelectedDateChanged={(date) => {
                                            setFieldValue("initialDate", date);
                                        }}
                                    />
                                    {errors.initialDate &&
                                        touched.initialDate &&
                                        errors.initialDate}
                                    <br />
                                    <Label>Zug Nummer</Label>
                                    <Field
                                        id="zugNummer"
                                        type="text"
                                        placeholder="Zug Nummer"
                                        name="zugNummer"
                                        className={
                                            errors.zugNummer &&
                                            touched.zugNummer
                                                ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        }
                                        onChange={(e) => {
                                            setFieldValue(
                                                "zugNummer",
                                                e.target.value
                                            );
                                        }}
                                        value={values.zugNummer}
                                    />
                                    {errors.zugNummer && touched.zugNummer && (
                                        <p className="text-red-500">
                                            *{errors.zugNummer}
                                        </p>
                                    )}

                                    <br />
                                    <Label>Tour Name</Label>
                                    <Field
                                        id="tourName"
                                        name="tourName"
                                        type="text"
                                        placeholder="T-123"
                                        onChange={(e) => {
                                            setFieldValue(
                                                "tourName",
                                                e.target.value
                                            );
                                        }}
                                        className={
                                            errors.tourName && touched.tourName
                                                ? "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        }
                                    />
                                    {errors.tourName && touched.tourName && (
                                        <p className="text-red-500">
                                            *{errors.tourName}
                                        </p>
                                    )}
                                    <br />
                                    <Label>Lokomotivnummer</Label>
                                    <Field
                                        id="locomotiveNumber"
                                        name="locomotiveNumber"
                                        type="text"
                                        placeholder="Lokomotivnummer"
                                        onChange={(e) => {
                                            setFieldValue(
                                                "locomotiveNumber",
                                                e.target.value
                                            );
                                        }}
                                        className={
                                            errors.locomotiveNumber &&
                                            touched.locomotiveNumber
                                                ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        }
                                    />
                                    {errors.locomotiveNumber &&
                                        touched.locomotiveNumber && (
                                            <p className="text-red-500">
                                                *{errors.locomotiveNumber}
                                            </p>
                                        )}
                                    <br />

                                    <ToggleSwitch
                                        checked={values.cancel}
                                        label="Storniert"
                                        id="cancel"
                                        name="cancel"
                                        onChange={(value) => {
                                            setFieldValue("cancel", value);
                                        }}
                                    />

                                    <br />

                                    <ToggleSwitch
                                        checked={values.accomodation}
                                        label="Unterkunft"
                                        id="accomodation"
                                        name="accomodation"
                                        onChange={(value) => {
                                            if (value) {
                                                setFieldValue("feedingFee", 32);
                                            }
                                            setFieldValue(
                                                "accomodation",
                                                value
                                            );
                                        }}
                                    />
                                    <br />
                                    <ToggleSwitch
                                        checked={values.bereitschaft}
                                        label="Bereitschaft"
                                        id="bereitschaft"
                                        name="bereitschaft"
                                        onChange={(value) => {
                                            setFieldValue(
                                                "bereitschaft",
                                                value
                                            );
                                        }}
                                    />
                                    <br />
                                    <Label>Kommenter</Label>
                                    <Textarea
                                        id="comment"
                                        name="comment"
                                        placeholder="Hinterlassen Sie einen Kommentar..."
                                        value={values.comment}
                                        rows={4}
                                        className={
                                            errors.comment && touched.comment
                                                ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        }
                                        onChange={(e) => {
                                            setFieldValue(
                                                "comment",
                                                e.target.value
                                            );
                                        }}
                                    />
                                    {errors.comment && touched.comment && (
                                        <p className="text-red-500">
                                            *{errors.comment}
                                        </p>
                                    )}

                                    <br />
                                    <div className="max-w-md">
                                        <div className="mb-2 block">
                                            <Label
                                                htmlFor="client"
                                                value="Wählen Sie Ihren Kunden"
                                            />
                                        </div>
                                       <Select
                                            id="client"
                                            name="client"
                                            required
                                            onChange={(e) => {
                                                setFieldValue(
                                                    "client",
                                                    e.target.value
                                                );
                                            }}
                                        >
                                            <option>Wählen Sie...</option>
                                            {client && client.length > 0 && client.map((client) => (
                                                <option
                                                    key={client.id}
                                                    value={client.id}
                                                >
                                                    {client.name}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>
                                    {errors.client && touched.client && (
                                        <p className="text-red-500">
                                            *{errors.client}
                                        </p>
                                    )}
                                    <br />

                                    <div className="max-w-md">
                                        <div className="mb-2 block">
                                            <Label
                                                htmlFor="feedingFee"
                                                value="Wählen Sie Ihre Verpflegungspauschale"
                                            />
                                        </div>
                                        <Select
                                            id="feedingFee"
                                            name="feedingFee"
                                            onChange={(e) => {
                                                setFieldValue(
                                                    "feedingFee",
                                                    e.target.value
                                                );
                                            }}
                                            required
                                            value={values.feedingFee}
                                        >
                                            <option value={0}>0€</option>
                                            <option value={16}>16€</option>
                                            <option value={32}>32€</option>
                                        </Select>

                                        {/*//TODO: Bu alana bir buton koyulacak. Bu buton eğer bu güzergah ile ilgili bir not alınmışsa görünecek. Tıklanınca ilgili notlar görünecek. (en son iş)*/}
                                    </div>
                                </AccordionContent>
                            </AccordionPanel>
                        </Accordion>

                        <Accordion>
                            <AccordionPanel />
                            <AccordionPanel isOpen={false}>
                                <AccordionTitle>Gastfahrt</AccordionTitle>
                                <AccordionContent>
                                    <Label>GF Standort Beginn</Label>
                                    <Field
                                        id="guestStartPlace"
                                        name="guestStartPlace"
                                        type="text"
                                        placeholder="Gastfahrt Beginn "
                                        onChange={(e) => {
                                            setFieldValue(
                                                "guestStartPlace",
                                                e.target.value
                                            );
                                        }}
                                        className={
                                            errors.guestStartPlace &&
                                            touched.guestStartPlace
                                                ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        }
                                        value={values.guestStartPlace}
                                    />

                                    {errors.guestStartPlace &&
                                        touched.guestStartPlace && (
                                            <p className="text-red-500">
                                                *{errors.guestStartPlace}
                                            </p>
                                        )}

                                    <br />

                                    <Label>GF Start Uhrzeit</Label>
                                    <div className="flex">
                                        <input
                                            type="time"
                                            id="guestStartTime"
                                            name="guestStartTime"
                                            className={
                                                errors.guestStartTime &&
                                                touched.guestStartTime
                                                    ? "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                    : "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            }
                                            value={values.guestStartTime}
                                            onChange={(e) => {
                                                setFieldValue(
                                                    "guestStartTime",
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
                                    {errors.guestStartTime &&
                                        touched.guestStartTime && (
                                            <p className="text-red-500">
                                                *{errors.guestStartTime}
                                            </p>
                                        )}
                                    <br />
                                    <Label>GF Standort Ende</Label>
                                    <input
                                        id="guestStartEndPlace"
                                        name="guestStartEndPlace"
                                        type="text"
                                        placeholder="Gastfahrt Ende"
                                        onChange={(e) => {
                                            setFieldValue(
                                                "guestStartEndPlace",
                                                e.target.value
                                            );
                                        }}
                                        className={
                                            errors.guestStartEndPlace &&
                                            touched.guestStartEndPlace
                                                ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        }
                                        value={values.guestStartEndPlace}
                                    />
                                    {errors.guestStartEndPlace &&
                                        touched.guestStartEndPlace && (
                                            <p className="text-red-500">
                                                *{errors.guestStartEndPlace}
                                            </p>
                                        )}

                                    <br />

                                    <Label>GF Ende Uhrzeit</Label>
                                    <div className="flex">
                                        <input
                                            type="time"
                                            id="guestStartEndTime"
                                            name="guestStartEndTime"
                                            className={
                                                errors.guestStartEndTime &&
                                                touched.guestStartEndTime
                                                    ? "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                    : "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            }
                                            value={values.guestStartEndTime}
                                            onChange={(e) => {
                                                setFieldValue(
                                                    "guestStartEndTime",
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
                                    {errors.guestStartEndTime &&
                                        touched.guestStartEndTime && (
                                            <p className="text-red-500">
                                                *{errors.guestStartEndTime}
                                            </p>
                                        )}
                                    <br />
                                </AccordionContent>
                            </AccordionPanel>
                        </Accordion>

                        <Accordion>
                            <AccordionPanel />
                            <AccordionPanel isOpen={false}>
                                <AccordionTitle>Dienst Beginn</AccordionTitle>
                                <AccordionContent>
                                    <Label>Start Ort</Label>
                                    <input
                                        id="workStartPlace"
                                        name="workStartPlace"
                                        type="text"
                                        placeholder="Start Ort"
                                        onChange={(e) => {
                                            setFieldValue(
                                                "workStartPlace",
                                                e.target.value
                                            );
                                        }}
                                        className={
                                            errors.workStartPlace &&
                                            touched.workStartPlace
                                                ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        }
                                        value={values.workStartPlace}
                                    />
                                    {errors.workStartPlace &&
                                        touched.workStartPlace && (
                                            <p className="text-red-500">
                                                *{errors.workStartPlace}
                                            </p>
                                        )}
                                    <br />

                                    <Label>Anfangszeit</Label>
                                    <div className="flex">
                                        <input
                                            type="time"
                                            name="workStartTime"
                                            id="workStartTime"
                                            className={
                                                errors.workStartTime &&
                                                touched.workStartTime
                                                    ? "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                    : "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            }
                                            value={values.workStartTime}
                                            onChange={(e) => {
                                                setFieldValue(
                                                    "workStartTime",
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
                                    {errors.workStartTime &&
                                        touched.workStartTime && (
                                            <p className="text-red-500">
                                                *{errors.workStartTime}
                                            </p>
                                        )}
                                </AccordionContent>
                            </AccordionPanel>
                        </Accordion>

                        <Accordion>
                            <AccordionPanel />
                            <AccordionPanel isOpen={false}>
                                <AccordionTitle>
                                Zug Abfahrt und Ankunft
                                </AccordionTitle>
                                <AccordionContent>
                                    <Label>Zug Abfahrtsort</Label>
                                    <input
                                        id="trainStartPlace"
                                        name="trainStartPlace"
                                        type="text"
                                        placeholder="Zug Abfahrtsort"
                                        onChange={(e) => {
                                            setFieldValue(
                                                "trainStartPlace",
                                                e.target.value
                                            );
                                        }}
                                        className={
                                            errors.trainStartPlace &&
                                            touched.trainStartPlace
                                                ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        }
                                        value={values.trainStartPlace}
                                    />
                                    {errors.trainStartPlace &&
                                        touched.trainStartPlace && (
                                            <p className="text-red-500">
                                                *{errors.trainStartPlace}
                                            </p>
                                        )}
                                    <br />

                                    <Label>Zug Abfahrtszeit</Label>
                                    <div className="flex">
                                        <input
                                            type="time"
                                            id="trainStartTime"
                                            name="trainStartTime"
                                            className={
                                                errors.trainStartTime &&
                                                touched.trainStartTime
                                                    ? "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                    : "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            }
                                            value={values.trainStartTime}
                                            onChange={(e) => {
                                                setFieldValue(
                                                    "trainStartTime",
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
                                    {errors.trainStartTime &&
                                        touched.trainStartTime && (
                                            <p className="text-red-500">
                                                *{errors.trainStartTime}
                                            </p>
                                        )}
                                    <Label>Zug Ankunftsort</Label>
                                    <input
                                        id="trainEndPlace"
                                        name="trainEndPlace"
                                        type="text"
                                        placeholder="Zug Ankunftsort"
                                        onChange={(e) => {
                                            setFieldValue(
                                                "trainEndPlace",
                                                e.target.value
                                            );
                                        }}
                                        className={
                                            errors.trainEndPlace &&
                                            touched.trainEndPlace
                                                ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        }
                                        value={values.trainEndPlace}
                                    />
                                    {errors.trainEndPlace &&
                                        touched.trainEndPlace && (
                                            <p className="text-red-500">
                                                *{errors.trainEndPlace}
                                            </p>
                                        )}
                                    <br />

                                    <Label>Zug Ankunftszeit</Label>
                                    <div className="flex">
                                        <input
                                            type="time"
                                            id="trainEndTime"
                                            name="trainEndTime"
                                            className={
                                                errors.trainEndTime &&
                                                touched.trainEndTime
                                                    ? "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                    : "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            }
                                            value={values.trainEndTime}
                                            onChange={(e) => {
                                                setFieldValue(
                                                    "trainEndTime",
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
                                    {errors.trainEndTime &&
                                        touched.trainEndTime && (
                                            <p className="text-red-500">
                                                *{errors.trainEndTime}
                                            </p>
                                        )}
                                </AccordionContent>
                            </AccordionPanel>
                        </Accordion>

                        <Accordion>
                            <AccordionPanel />
                            <AccordionPanel isOpen={false}>
                                <AccordionTitle>Pause</AccordionTitle>
                                <AccordionContent>
                                    <br />
                                    <FieldArray name="breaks">
                                        {({ insert, remove, push }) => (
                                            <div className="">
                                                {values.breaks.length > 0 &&
                                                    values.breaks.map(
                                                        (breakItem, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex justify-around items-center mt-5 mb-5"
                                                            >
                                                                <div>
                                                                    <label className="text-sm">
                                                                    Pause Anfang
                                                                    </label>
                                                                    <Select
                                                                        name={`breaks.${index}.start`}
                                                                        type="time"
                                                                        className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            setFieldValue(
                                                                                `breaks.${index}.start`,
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            );
                                                                        }}
                                                                    >
                                                                        {generateTimeOptions().map(
                                                                            (
                                                                                timeOption,
                                                                                index
                                                                            ) => (
                                                                                <option
                                                                                    key={
                                                                                        index
                                                                                    }
                                                                                    value={
                                                                                        timeOption
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        timeOption
                                                                                    }
                                                                                </option>
                                                                            )
                                                                        )}
                                                                    </Select>
                                                                </div>
                                                                <div>
                                                                    <label className="text-sm">
                                                                        Pause Ende
                                                                    </label>
                                                                    <Select
                                                                        name={`breaks.${index}.end`}
                                                                        type="time"
                                                                        className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            setFieldValue(
                                                                                `breaks.${index}.end`,
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            );
                                                                        }}
                                                                    >
                                                                        {generateTimeOptions().map(
                                                                            (
                                                                                timeOption,
                                                                                index
                                                                            ) => (
                                                                                <option
                                                                                    key={
                                                                                        index
                                                                                    }
                                                                                    value={
                                                                                        timeOption
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        timeOption
                                                                                    }
                                                                                </option>
                                                                            )
                                                                        )}
                                                                    </Select>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    className="bg-red-500 text-white p-2 rounded-md mt-5"
                                                                    onClick={() =>
                                                                        remove(
                                                                            index
                                                                        )
                                                                    }
                                                                >
                                                                    Löschen
                                                                </button>
                                                            </div>
                                                        )
                                                    )}
                                                <div className="flex justify-center items-center">
                                                    <button
                                                        type="button"
                                                        className="bg-green-500 text-white p-2 rounded-md w-20"
                                                        onClick={() =>
                                                            push({
                                                                start: "",
                                                                end: "",
                                                            })
                                                        }
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </FieldArray>
                                </AccordionContent>
                            </AccordionPanel>
                        </Accordion>
                        <Accordion>
                            <AccordionPanel />
                            <AccordionPanel isOpen={false}>
                                <AccordionTitle>Dienst Ende</AccordionTitle>
                                <AccordionContent>
                                    <Label>Dienst Ende Ort</Label>
                                    <input
                                        id="workEndPlace"
                                        type="text"
                                        placeholder="Dienst Ort"
                                        onChange={(e) => {
                                            setFieldValue(
                                                "workEndPlace",
                                                e.target.value
                                            );
                                        }}
                                        className={
                                            errors.workEndPlace &&
                                            touched.workEndPlace
                                                ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        }
                                        value={values.workEndPlace}
                                    />
                                    {errors.workEndPlace &&
                                        touched.workEndPlace && (
                                            <p className="text-red-500">
                                                *{errors.workEndPlace}
                                            </p>
                                        )}
                                    <br />

                                    <Label>Dienst Ende Zeit</Label>
                                    <div className="flex">
                                        <input
                                            type="time"
                                            id="workEndTime"
                                            className={
                                                errors.workEndTime &&
                                                touched.workEndTime
                                                    ? "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                    : "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            }
                                            value={values.workEndTime}
                                            onChange={(e) => {
                                                setFieldValue(
                                                    "workEndTime",
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
                                        {errors.workEndTime &&
                                            touched.workEndTime && (
                                                <p className="text-red-500">
                                                    *{errors.workEndTime}
                                                </p>
                                            )}
                                    </div>
                                </AccordionContent>
                            </AccordionPanel>
                        </Accordion>
                        <Accordion>
                            <AccordionPanel />
                            <AccordionPanel isOpen={false}>
                                <AccordionTitle>Gastfahrt Zürück</AccordionTitle>
                                <AccordionContent>
                                    <Label>Gastfahrt Zürück Ort</Label>
                                    <input
                                        id="guestEndPlace"
                                        type="text"
                                        placeholder="Gastfahrt Zürück Ort"
                                        onChange={(e) => {
                                            setFieldValue(
                                                "guestEndPlace",
                                                e.target.value
                                            );
                                        }}
                                        className={
                                            errors.guestEndPlace &&
                                            touched.guestEndPlace
                                                ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        }
                                        value={values.guestEndPlace}
                                    />
                                    {errors.guestEndPlace &&
                                        touched.guestEndPlace && (
                                            <p className="text-red-500">
                                                *{errors.guestEndPlace}
                                            </p>
                                        )}
                                    <br />

                                    <Label>Gastfahrt Zürück Zeit</Label>
                                    <div className="flex">
                                        <input
                                            type="time"
                                            id="guestEndTime"
                                            className={
                                                errors.guestEndTime &&
                                                touched.guestEndTime
                                                    ? "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                    : "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            }
                                            value={values.guestEndTime}
                                            onChange={(e) => {
                                                setFieldValue(
                                                    "guestEndTime",
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
                                        {errors.guestStartPlace &&
                                            touched.guestStartPlace && (
                                                <p className="text-red-500">
                                                    *{errors.guestStartPlace}
                                                </p>
                                            )}
                                    </div>
                                    <br />
                                    <Label>Gastfahrt Zürück Ende Ort</Label>
                                    <input
                                        id="guestEndEndPlace"
                                        type="text"
                                        placeholder="Gastfahrt Zürück Ende Ort"
                                        onChange={(e) => {
                                            setFieldValue(
                                                "guestEndEndPlace",
                                                e.target.value
                                            );
                                        }}
                                        className={
                                            errors.guestEndEndPlace &&
                                            touched.guestEndEndPlace
                                                ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        }
                                        value={values.guestEndEndPlace}
                                    />
                                    {errors.guestEndEndPlace &&
                                        touched.guestEndEndPlace && (
                                            <p className="text-red-500">
                                                *{errors.guestEndEndPlace}
                                            </p>
                                        )}
                                    <br />

                                    <Label>Gastfahrt Zürück Ende Zeit:</Label>
                                    <div className="flex">
                                        <input
                                            type="time"
                                            id="guestEndEndTime"
                                            className={
                                                errors.guestEndEndTime &&
                                                touched.guestEndEndTime
                                                    ? "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                    : "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            }
                                            value={values.guestEndEndTime}
                                            onChange={(e) => {
                                                setFieldValue(
                                                    "guestEndEndTime",
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
                                        {errors.guestEndEndTime &&
                                            touched.guestEndEndTime && (
                                                <p className="text-red-500">
                                                    *{errors.guestEndEndTime}
                                                </p>
                                            )}
                                    </div>
                                    <br />
                                </AccordionContent>
                            </AccordionPanel>
                        </Accordion>
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
        </AuthenticatedLayout>
    );
}
