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
    Spinner,
    Select,
    Button,
} from "flowbite-react";
import Swal from "sweetalert2";
import { Formik, Field, FieldArray, Form } from "formik";
import * as Yup from "yup";
import moment from "moment";
import TimePicker from "@/Components/TimePicker";
import MultipleFileUpload from "@/Components/MultipleFileUpload";
import LocationField from "@/Components/LocationField";
const initialValues = {
    initialDate: "",
    zugNummer: "",
    tourName: "",
    locomotiveNumber: "",
    guest: false,
    cancel: false,
    accomodation: false,
    bereitschaft: false,
    ausbildung: false,
    learning: false,
    comment: "",
    client: "",
    user: "",
    ausland: false,
    earlyExit: false,
    lateEnter: false,
    country: "nl",
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
    files: [],
};

const validationSchema = Yup.object().shape({
    initialDate: Yup.date().required("Required"),
    client: Yup.number().required("Required"),
    zugNummer: Yup.string().when(['bereitschaft', 'cancel'], {
        is: (bereitschaft, cancel) => bereitschaft || cancel,
        then: () => Yup.string(),
        otherwise: () => Yup.string().required("Required")
    }),
    tourName: Yup.string().when(['bereitschaft', 'cancel'], {
        is: (bereitschaft, cancel) => bereitschaft || cancel,
        then: () => Yup.string(),
        otherwise: () => Yup.string().required("Required")
    }),
    workStartPlace: Yup.string().when('guest', {
        is: true,
        then: () => Yup.string().notRequired(),
        otherwise: () => Yup.string().required("Required")
    }),
    workEndPlace: Yup.string().when('guest', {
        is: true,
        then: () => Yup.string().notRequired(),
        otherwise: () => Yup.string().required("Required")
    }),
    workStartTime: Yup.string().when('guest', {
        is: true,
        then: () => Yup.string().notRequired(),
        otherwise: () => Yup.string()
            .required("Required")
            .test(
                "is-valid-time",
                "Ungültiges Zeitformat. Die Zeit muss ein Vielfaches von 15 Minuten sein.",
                function (value) {
                    const time = moment(value, "HH:mm");
                    return time.isValid() && time.minute() % 15 === 0;
                }
            )
    }),
    workEndTime: Yup.string().when('guest', {
        is: true,
        then: () => Yup.string().notRequired(),
        otherwise: () => Yup.string()
            .required("Required")
            .test(
                "is-valid-time",
                "Ungültiges Zeitformat. Die Zeit muss ein Vielfaches von 15 Minuten sein.",
                function (value) {
                    const time = moment(value, "HH:mm");
                    return time.isValid() && time.minute() % 15 === 0;
                }
            )
            .test(
                "is-valid-duration",
                "Bei Bereitschafts- oder stornierten Arbeiten darf die Arbeitsendzeit 8 Stunden nicht überschreiten",
                function (value) {
                    const { cancel, bereitschaft, workStartTime } = this.parent;
                    if (cancel || bereitschaft) {
                        const start = moment(workStartTime, "HH:mm");
                        let end = moment(value, "HH:mm");
                        if (end.isBefore(start)) {
                            end.add(1, "day");
                        }
                        const duration = moment.duration(end.diff(start));
                        const hours = duration.asHours();
                        return hours <= 8;
                    }
                    return true;
                }
            )
    }),
    user: Yup.number().when('ausbildung', {
        is: true,
        then: () => Yup.number().required("Required"),
        otherwise: () => Yup.number().notRequired(),
    }),
    country: Yup.string().when('ausland', {
        is: true,
        then: () => Yup.string().required("Required"),
        otherwise: () => Yup.string().notRequired(),
    }),
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
    const scrollToError = (errors) => {
        const errorKeys = Object.keys(errors);
        if (errorKeys.length > 0) {
            const errorElement = document.querySelector(
                `[name="${errorKeys[0]}"]`
            );
            if (errorElement) {
                errorElement.scrollIntoView({ behavior: "smooth" });
            }
        }
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
            Der gesamte Plan, von der Abfahrt bis zur Rückkehr, wird hier geschrieben. Bitte beachten Sie, dass, wenn die Optionen ‘storniert’ und ‘Bereitschaft’ ausgewählt werden, die Felder ‘Zugnummer’ und ‘Tourname’ nicht mehr obligatorisch sind. Die Bereitschaft darf maximal 8 Stunden betragen.
            </Label>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting, setFieldValue }) => {
                    setSubmitting(true);
                    values.images = files;
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
                    values.ausland = values.ausland ? 1 : 0;
                    values.guest = values.guest ? 1 : 0;
                    axios
                        .post("/save-draft-jobs", values)
                        .then((res) => {
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
                        })
                        .catch((err) => {
                            Swal.fire({
                                icon: "error",
                                title: "Hata",
                                text: err.response.data.message,
                            });
                            setSubmitting(false);
                        });
                }}
                validateOnBlur={true}
                validateOnChange={true}
                validateOnMount={true}
            >
                {({
                    values,
                    handleSubmit,
                    errors,
                    touched,
                    setFieldValue,
                    isSubmitting,
                    validateForm,
                }) => (
                    <Form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            const formErrors = await validateForm();
                            if (Object.keys(formErrors).length > 0) {
                                scrollToError(formErrors);
                            } else {
                                handleSubmit();
                            }
                        }}
                    >
                        <Accordion>
                            <AccordionPanel isOpen={false}>
                                <AccordionTitle className={Object.keys(errors).some(key => ['initialDate', 'zugNummer', 'tourName', 'locomotiveNumber', 'cancel', 'accomodation', 'bereitschaft', 'ausbildung', 'learning', 'comment', 'client', 'user', 'ausland', 'country', 'feedingFee'].includes(key)) ? "text-red-500" : ""}>
                                    Allgemeine Informationen
                                </AccordionTitle>
                                <AccordionContent>
                                    <Label className={errors.initialDate ? "text-red-500" : ""}>Startdatum</Label>

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
                                        (<p className="text-red-500">
                                            *{errors.initialDate}
                                        </p>)
                                    }
                                    <br />
                                    <Label className={errors.zugNummer ? "text-red-500" : ""}>Zug Nummer</Label>
                                    <Field
                                        id="zugNummer"
                                        type="text"
                                        placeholder="Zug Nummer"
                                        name="zugNummer"
                                        className={
                                            errors.zugNummer
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
                                    {errors.zugNummer && (
                                        <p className="text-red-500">
                                            *{errors.zugNummer}
                                        </p>
                                    )}

                                    <br />
                                    <Label className={errors.tourName? "text-red-500" : ""}>Tour Name</Label>
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
                                            errors.tourName 
                                                ? "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        }
                                    />
                                    {errors.tourName  && (
                                        <p className="text-red-500">
                                            *{errors.tourName}
                                        </p>
                                    )}
                                    <br />
                                    <Label className={errors.locomotiveNumber ? "text-red-500" : ""}>Lokomotivnummer</Label>
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
                                            errors.locomotiveNumber 
                                                ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        }
                                    />
                                    {errors.locomotiveNumber && (
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
                                            checked={values.ausland}
                                            label="Ausland"
                                            id="ausland"
                                            name="ausland"
                                            onChange={(value) => {
                                                if (value) {
                                                    if (values.accomodation) {
                                                        if (
                                                            values.country ===
                                                            "nl"
                                                        ) {
                                                            setFieldValue(
                                                                "feedingFee",
                                                                47
                                                            );
                                                        } else if (
                                                            values.country ===
                                                            "ch"
                                                        ) {
                                                            setFieldValue(
                                                                "feedingFee",
                                                                64
                                                            );
                                                        } else {
                                                            setFieldValue(
                                                                "feedingFee",
                                                                32
                                                            );
                                                        }
                                                    } else {
                                                        if (
                                                            values.country ===
                                                            "nl"
                                                        ) {
                                                            setFieldValue(
                                                                "feedingFee",
                                                                32
                                                            );
                                                        } else if (
                                                            values.country ===
                                                            "ch"
                                                        ) {
                                                            setFieldValue(
                                                                "feedingFee",
                                                                43
                                                            );
                                                        }
                                                    }
                                                } else {
                                                    if (values.accomodation) {

                                                        setFieldValue("feedingFee", 32);


                                                    } else {
                                                        setFieldValue("feedingFee", 16);
                                                    }
                                                }
                                                setFieldValue("ausland", value);
                                            }}
                                        />

                                        <ToggleSwitch
                                            checked={values.accomodation}
                                            label="Unterkunft"
                                            id="accomodation"
                                            name="accomodation"
                                            onChange={(value) => {

                                                setFieldValue(
                                                    "accomodation",
                                                    value
                                                );
                                                if (value) {
                                                    if (values.ausland) {
                                                        if (
                                                            values.country ===
                                                            "nl"
                                                        ) {
                                                            setFieldValue(
                                                                "feedingFee",
                                                                47
                                                            );
                                                        } else if (
                                                            values.country ===
                                                            "ch"
                                                        ) {
                                                            setFieldValue(
                                                                "feedingFee",
                                                                64
                                                            );
                                                        }
                                                    } else {
                                                        setFieldValue(
                                                            "feedingFee",
                                                            32
                                                        );
                                                    }
                                                } else {
                                                    if (values.ausland) {
                                                        if (
                                                            values.country ===
                                                            "nl"
                                                        ) {
                                                            setFieldValue(
                                                                "feedingFee",
                                                                32
                                                            );
                                                        } else if (
                                                            values.country ===
                                                            "ch"
                                                        ) {
                                                            setFieldValue(
                                                                "feedingFee",
                                                                43
                                                            );
                                                        } else {
                                                            setFieldValue(
                                                                "feedingFee",
                                                                0
                                                            );
                                                        }
                                                    } else {
                                                        setFieldValue(
                                                            "feedingFee",
                                                            16
                                                        );
                                                    }
                                                }
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
                                        <ToggleSwitch
                                            checked={values.guest}
                                            label="Gastfahrt Tour"
                                            id="guest"
                                            name="guest"
                                            onChange={(value) => {
                                                setFieldValue(
                                                    "guest",
                                                    value
                                                );
                                            }}
                                        />
                                    </div>

                                    <div className="max-w-md mt-5">
                                        {values.ausland && (
                                            <div>
                                                <Label className={errors.country  ? "text-red-500" : ""}>Land</Label>
                                                <Select
                                                    id="country"
                                                    name="country"
                                                    placeholder="Land"
                                                    onChange={(e) => {
                                                        setFieldValue("country", e.target.value);
                                                        if (values.accomodation) {
                                                            if (e.target.value === "nl") {
                                                                setFieldValue("feedingFee", 47);
                                                            } else if (e.target.value === "ch") {
                                                                setFieldValue("feedingFee", 64);
                                                            } else {
                                                                setFieldValue("feedingFee", 32);
                                                            }
                                                        } else {
                                                            if (e.target.value === "nl") {
                                                                setFieldValue("feedingFee", 32);
                                                            } else if (e.target.value === "ch") {
                                                                setFieldValue("feedingFee", 43);
                                                            } else {
                                                                setFieldValue("feedingFee", 16);
                                                            }
                                                        }
                                                    }}
                                                    value={values.country}
                                                >
                                                    <option value="nl">
                                                        Niederlande
                                                    </option>
                                                    <option value="ch">
                                                        Schweiz
                                                    </option>
                                                </Select>
                                                {errors.country  && (
                                                <p className="text-red-500">
                                                    *{errors.country}
                                                </p>
                                            )}
                                            </div>
                                        )}
                                    </div>

                                    {showLockführer && (
                                        <div className="max-w-md mt-5">
                                            <div className="mb-2 block">
                                                <Label
                                                    className={errors.user ? "text-red-500" : ""}
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
                                            {errors.user  && (
                                                <p className="text-red-500">
                                                    *{errors.user}
                                                </p>
                                            )}
                                        </div>

                                    )}

                                    <br />
                                    <Label className={errors.comment  ? "text-red-500" : ""}>Kommenter</Label>
                                    <Textarea
                                        id="comment"
                                        name="comment"
                                        placeholder="Hinterlassen Sie einen Kommentar..."
                                        value={values.comment}
                                        rows={4}
                                        className={
                                            errors.comment 
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
                                    {errors.comment && (
                                        <p className="text-red-500">
                                            *{errors.comment}
                                        </p>
                                    )}

                                    <div className="mt-5 w-full">
                                        <Label className={errors.images  ? "text-red-500" : ""}>Foto hinzufügen</Label>
                                        <MultipleFileUpload
                                            images={files}
                                            setImages={setFiles}
                                        />
                                    </div>
                                    <br />
                                    <div className="max-w-md">
                                        <div className="mb-2 block">
                                            <Label
                                                className={errors.client  ? "text-red-500" : ""}
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
                                    {errors.client  && (
                                        <p className="text-red-500">
                                            *{errors.client}
                                        </p>
                                    )}
                                    <br />

                                    <div className="max-w-md">
                                        <div className="mb-2 block">
                                            <Label
                                                className={errors.feedingFee  ? "text-red-500" : ""}
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
                                            <option value={43} disabled={!values.ausland}>43€</option>
                                            <option value={47} disabled={!values.ausland}>47€</option>
                                            <option value={64} disabled={!values.ausland}>64€</option>
                                            <option
                                                value={32}
                                                disabled={!values.accomodation && !values.ausland}
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
                                <AccordionTitle className={Object.keys(errors).some(key => ['guestStartPlace', 'guestStartTime', 'guestStartEndPlace', 'guestStartEndTime'].includes(key)) ? "text-red-500" : ""}>Gastfahrt</AccordionTitle>
                                <AccordionContent>
                                    <ToggleSwitch
                                        checked={values.earlyExit}
                                        label="Anreise Vortag"
                                        id="earlyExit"
                                        name="earlyExit"
                                        onChange={(value) => {
                                            setFieldValue("earlyExit", value);
                                        }}
                                    />
                                    <br />
                                    <Label className={errors.guestStartPlace ? "text-red-500" : ""}>GF Standort Beginn</Label>
                                    <Field
                                        id="guestStartPlace"
                                        name="guestStartPlace"
                                        type="text"
                                        placeholder="Gastfahrt Beginn "
                                        className={
                                            errors.guestStartPlace 
                                                ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        }
                                        value={values.guestStartPlace}
                                        onChange={(e) => {
                                            setFieldValue(
                                                "guestStartPlace",
                                                e.target.value
                                            );
                                        }}
                                        error={errors.guestStartPlace}
                                    />
                                   

                                    <br />

                                    <Label>GF Start Uhrzeit</Label>
                                    <div className="flex">
                                        <TimePicker
                                            id="guestStartTime"
                                            name="guestStartTime"
                                            className={
                                                errors.guestStartTime 
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
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                        />
                                    </div>
                                    {errors.guestStartTime && (
                                            <p className="text-red-500">
                                                *{errors.guestStartTime}
                                            </p>
                                        )}
                                    <br />

                                    <Label className={errors.guestStartEndPlace ? "text-red-500" : ""}>GF Standort Ende</Label>
                                    <Field
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
                                            errors.guestStartEndPlace 
                                                ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        }
                                        value={values.guestStartEndPlace}
                                    />
                                    {errors.guestStartEndPlace && (
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
                                                errors.guestStartEndTime 
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
                                    {errors.guestStartEndTime && (
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
                                <AccordionTitle className={Object.keys(errors).some(key => ['workStartPlace', 'workStartTime'].includes(key)) ? "text-red-500" : ""}>Dienst Beginn</AccordionTitle>
                                <AccordionContent>
                                    <Label className={errors.workStartPlace ? "text-red-500" : ""}>Start Ort</Label>
                                    <LocationField
                                        id="workStartPlace"
                                        name="workStartPlace"
                                        type="text"
                                        placeholder="Start Ort"
                                        onChange={(e) => {
                                            setFieldValue(
                                                "workStartPlace",
                                                e.value
                                            );
                                        }}
                                        className={
                                            errors.workStartPlace 
                                                ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        }
                                        selected={values.workStartPlace}
                                    />
                                    {errors.workStartPlace && (
                                            <p className="text-red-500">
                                                *{errors.workStartPlace}
                                            </p>
                                        )}
                                    <br />

                                    <Label className={errors.workStartTime ? "text-red-500" : ""}>Anfangszeit</Label>
                                    <div className="flex">
                                        <TimePicker
                                            type="time"
                                            name="workStartTime"
                                            id="workStartTime"
                                            className={
                                                errors.workStartTime 
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
                                    {errors.workStartTime && (
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
                                <AccordionTitle className={Object.keys(errors).some(key => ['trainStartPlace', 'trainStartTime', 'trainEndPlace', 'trainEndTime'].includes(key)) ? "text-red-500" : ""}>
                                    Zug Abfahrt und Ankunft
                                </AccordionTitle>
                                <AccordionContent>
                                    <Label className={errors.trainStartPlace ? "text-red-500" : ""}>Zug Abfahrtsort</Label>
                                    <LocationField
                                        id="trainStartPlace"
                                        name="trainStartPlace"
                                        type="text"
                                        placeholder="Zug Abfahrtsort"
                                        onChange={(e) => {
                                            setFieldValue(
                                                "trainStartPlace",
                                                e.value
                                            );
                                        }}
                                        className={
                                            errors.trainStartPlace

                                                ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        }
                                        selected={values.trainStartPlace}
                                    />
                                    {errors.trainStartPlace &&
                                        (
                                            <p className="text-red-500">
                                                *{errors.trainStartPlace}
                                            </p>
                                        )}
                                    <br />

                                    <Label className={errors.trainStartTime ? "text-red-500" : ""}>Zug Abfahrtszeit</Label>
                                    <div className="flex">
                                        <input
                                            type="time"
                                            id="trainStartTime"
                                            name="trainStartTime"
                                            className={
                                                errors.trainStartTime
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
                                    {errors.trainStartTime && (
                                            <p className="text-red-500">
                                                *{errors.trainStartTime}
                                            </p>
                                        )}
                                    <Label className={errors.trainEndPlace ? "text-red-500" : ""}>Zug Ankunftsort</Label>
                                    <LocationField
                                        id="trainEndPlace"
                                        name="trainEndPlace"
                                        type="text"
                                        placeholder="Zug Ankunftsort"
                                        onChange={(e) => {
                                            setFieldValue(
                                                "trainEndPlace",
                                                e.value
                                            );
                                        }}
                                        className={
                                            errors.trainEndPlace
                                                ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        }
                                        selected={values.trainEndPlace}
                                    />
                                    {errors.trainEndPlace && (
                                        <p className="text-red-500">
                                            *{errors.trainEndPlace}
                                        </p>
                                    )}
                                    <br />

                                    <Label className={errors.trainEndTime ? "text-red-500" : ""}>Zug Ankunftszeit</Label>
                                    <div className="flex">
                                        <input
                                            type="time"
                                            id="trainEndTime"
                                            name="trainEndTime"
                                            className={
                                                errors.trainEndTime 
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
                                    {errors.trainEndTime && (
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
                                {/** TODO: Pause  girişlerinde JSON.stringify kullanılacak. */}
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
                                <AccordionTitle className={Object.keys(errors).some(key => ['workEndPlace', 'workEndTime'].includes(key)) ? "text-red-500" : ""}>Dienst Ende</AccordionTitle>
                                <AccordionContent>
                                    <Label className={errors.workEndPlace ? "text-red-500" : ""}>Dienst Ende Ort</Label>
                                    <LocationField
                                        id="workEndPlace"
                                        type="text"
                                        placeholder="Dienst Ort"
                                        onChange={(e) => {
                                            setFieldValue(
                                                "workEndPlace",
                                                e.value
                                            );
                                        }}
                                        className={
                                            errors.workEndPlace 
                                                ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        }
                                        selected={values.workEndPlace}
                                    />
                                    {errors.workEndPlace && (
                                        <p className="text-red-500">
                                            *{errors.workEndPlace}
                                        </p>
                                    )}
                                    <br />

                                    <Label className={errors.workEndTime ? "text-red-500" : ""}>
                                        Dienst Ende Zeit{" "}
                                        {errors.workEndTime && (
                                            <p className="text-red-500">
                                                *{errors.workEndTime}
                                            </p>
                                        )}
                                    </Label>
                                    <div className="flex">
                                        <TimePicker
                                            type="time"
                                            id="workEndTime"
                                            className={
                                                errors.workEndTime
                                                    ? "rounded-none rounded-s-lg bg-gray-50 border text-red-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-red-300 p-2.5 dark:bg-red-700 dark:border-red-600 dark:placeholder-red-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                    : "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-re-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            }
                                            value={values.workEndTime}
                                            onChange={(e) => {
                                                setFieldValue(
                                                    "workEndTime",
                                                    timeString(e)
                                                );
                                            }}
                                        />
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
                                   
                                    <ToggleSwitch
                                        checked={values.lateEnter}
                                        label="Abreise Folgetag"
                                        id="lateEnter"
                                        name="lateEnter"
                                        onChange={(value) => {
                                            setFieldValue("lateEnter", value);
                                        }}
                                    />
                                    <br />
                                    <Label className={errors.guestEndPlace ? "text-red-500" : ""}>Gastfahrt Zürück Ort</Label>
                                    <Field
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
                                            errors.guestEndPlace 
                                                ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        }
                                        value={values.guestEndPlace}
                                    />
                                    {errors.guestEndPlace && (
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
                                                errors.guestEndTime 
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

                                        {errors.guestStartPlace && (
                                                <p className="text-red-500">
                                                    *{errors.guestStartPlace}
                                                </p>
                                            )}
                                    </div>
                                    <br />
                                    <Label className={errors.guestEndEndPlace ? "text-red-500" : ""}>Gastfahrt Zürück Ende Ort</Label>
                                    <Field
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
                                            errors.guestEndEndPlace 
                                                ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        }
                                        value={values.guestEndEndPlace}
                                    />
                                    {errors.guestEndEndPlace && (
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
                                                errors.guestEndEndTime 
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

                                        {errors.guestEndEndTime && (
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
                            {isSubmitting ? (
                                <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded">
                                    <Spinner
                                        aria-label="Spinner button example"
                                        size="sm"
                                    />
                                    <span className="pl-3">Loading...</span>
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    //disabled={isSubmitting}
                                    className="mb-5"
                                >
                                    Speichern
                                </Button>
                            )}
                        </div>
                    </Form>
                )}
            </Formik>
        </AuthenticatedLayout>
    );
}
