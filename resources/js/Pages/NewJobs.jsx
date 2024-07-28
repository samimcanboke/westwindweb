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
    Button
} from "flowbite-react";
import Swal from "sweetalert2";
import { Formik, Field, FieldArray, Form } from "formik";
import * as Yup from "yup";
import moment from "moment";
import TimePicker from "@/Components/TimePicker";
import MultipleFileUpload from "@/Components/MultipleFileUpload";

const initialValues = {
    initialDate: "",
    zugNummer: "",
    tourName: "",
    locomotiveNumber: "",
    cancel: false,
    accomodation: false,
    bereitschaft: false,
    ausbildung: false,
    learning: false,
    comment: "",
    client: "",
    user: "",
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
    files: []
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
    const [showAbroad, setShowAbroad] = useState(false);
    const [files, setFiles] = useState([]);
    const [showLockführer, setShowLockführer] = useState(false);
    const [users, setUsers] = useState([]);
    const abroad = ["Niederlande", "Schweiz"];

    const timeString = (e) =>
        e[0]
            ? e[0].toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
              })
            : "";
    useEffect(() => {
        axios.get("/clients").then((res) => {
            if (res.status == 200) {
                setClient(res.data);
            }
        });
        axios.get(route("users.show")).then((res) => {
            if (res.status == 200) {
                setUsers(res.data);
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
                Der gesamte Plan von der Abfahrt bis zur Rückkehr wird hier
                geschrieben.
            </Label>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting, setFieldValue }) => {
                    setSubmitting(true);
                    values.images = files;
                    console.log(values.images);
                    values.initialDate = moment(values.initialDate)
                        .utcOffset(0)
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
                    values.cancel = values.cancel ? 1 : 0;
                    values.accomodation = values.accomodation ? 1 : 0;
                    values.bereitschaft = values.bereitschaft ? 1 : 0;
                    values.learning = values.learning ? 1 : 0;
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
                                                ? moment(values.initialDate)
                                                      .utc()
                                                      .startOf("day")
                                                      .format("DD-MM-YYYY")
                                                : ""
                                        }
                                        onSelectedDateChanged={(date) => {
                                            console.log(date);
                                            setFieldValue(
                                                "initialDate",
                                                moment(date)
                                                    .utc()
                                                    .startOf("day")
                                                    .add(1, "days")
                                                    .format()
                                            );
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
                                    <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
                                        <ToggleSwitch
                                            checked={values.cancel}
                                            label="Storniert"
                                            id="cancel"
                                            name="cancel"
                                            onChange={(value) => {
                                                setFieldValue("cancel", value);
                                            }}
                                        />
                                        {/*
                                        <ToggleSwitch
                                            checked={values.ausland}
                                            label="Ausland"
                                            id="ausland"
                                            name="ausland"
                                            onChange={(value) => {
                                           
                                                setFieldValue(
                                                    "ausland",
                                                    value
                                                );
                                            }}
                                        />
                                        */}

                                        <ToggleSwitch
                                            checked={values.accomodation}
                                            label="Unterkunft"
                                            id="accomodation"
                                            name="accomodation"
                                            onChange={(value) => {
                                                if (value) {
                                                    setFieldValue(
                                                        "feedingFee",
                                                        32
                                                    );
                                                } else {
                                                    setFieldValue(
                                                        "feedingFee",
                                                        0
                                                    );
                                                }
                                                setFieldValue(
                                                    "accomodation",
                                                    value
                                                );
                                            }}
                                        />
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
                                        <ToggleSwitch
                                            checked={values.ausbildung}
                                            label="Ausbildung"
                                            id="ausbildung"
                                            name="ausbildung"
                                            onChange={(value) => {
                                                if (value) {
                                                    setShowLockführer(true);
                                                } else {
                                                    setShowLockführer(false);
                                                }
                                                setFieldValue(
                                                    "ausbildung",
                                                    value
                                                );
                                            }}
                                        />
                                        <ToggleSwitch
                                            checked={values.learning}
                                            label="Streckenkunde"
                                            id="learning"
                                            name="learning"
                                            onChange={(value) => {
                                                setFieldValue(
                                                    "learning",
                                                    value
                                                );
                                            }}
                                        />
                                    </div>

                                    {showLockführer && (
                                        <div className="max-w-md mt-5">
                                            <div className="mb-2 block">
                                                <Label
                                                    htmlFor="user"
                                                    value="Wählen Sie Lockführer"
                                                />
                                            </div>
                                            <Select
                                                id="user"
                                                name="user"
                                                required
                                                onChange={(e) => {
                                                    setFieldValue(
                                                        "user",
                                                        e.target.value
                                                    );
                                                }}
                                            >
                                                <option>Wählen Sie...</option>
                                                {users &&
                                                    users.length > 0 &&
                                                    users.map((user) => (
                                                        <option
                                                            key={user.id}
                                                            value={user.id}
                                                        >
                                                            {user.name}
                                                        </option>
                                                    ))}
                                            </Select>
                                        </div>
                                    )}

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

                                    <div className="mt-5 w-full">
                                        <Label>Foto hinzufügen</Label>
                                       <MultipleFileUpload images={files} setImages={setFiles} />
                                    </div>
                                    <br/>
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
                                            {client &&
                                                client.length > 0 &&
                                                client.map((client) => (
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
                                            <option
                                                value={32}
                                                disabled={!values.accomodation}
                                            >
                                                32€
                                            </option>
                                        </Select>

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
                                        <TimePicker
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
                                                    timeString(e)
                                                );
                                            }}
                                        />
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
                                        <TimePicker
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
                                                    timeString(e)
                                                );
                                            }}
                                        />
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
                                        <TimePicker
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
                                                    timeString(e)
                                                );
                                            }}
                                        />
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
                                                                        Pause
                                                                        Anfang
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
                                                                        Pause
                                                                        Ende
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
                                        <TimePicker
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
                                                    timeString(e)
                                                );
                                            }}
                                        />

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
                                <AccordionTitle>
                                    Gastfahrt Zürück
                                </AccordionTitle>
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
                                        <TimePicker
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
                                                    timeString(e)
                                                );
                                            }}
                                        />

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
                                        <TimePicker
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
                                                    timeString(e)
                                                );
                                            }}
                                        />

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
                                //disabled={isSubmitting}
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
