import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import axios from "axios";
import { useEffect, useState } from "react";
import { Head } from "@inertiajs/react";
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
    Spinner,
    Button,
    Table,
} from "flowbite-react";
import Swal from "sweetalert2";
import { Formik, Field, FieldArray, Form } from "formik";
import * as Yup from "yup";
import MultipleFileUpload from "@/Components/MultipleFileUpload";
import moment from "moment";
import LocationField from "@/Components/LocationField";

export default function DraftJobs({ auth }) {
    const [data, setData] = useState([]);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEdit, setShowEdit] = useState(false);
    const [values, setValues] = useState({});
    const [client, setClient] = useState([]);

    const validationSchema = Yup.object().shape({
        initialDate: Yup.date().required("Required"),
        zugNummer: Yup.string().required("Required"),
        tourName: Yup.string().required("Required"),
        workStartPlace: Yup.string().required("Required"),
        workEndPlace: Yup.string().required("Required"),
        workStartTime: Yup.string()
            .required("Required")
            .test(
                "is-valid-time",
                "Ungültiges Zeitformat. Die Zeit muss ein Vielfaches von 15 Minuten sein.",
                function (value) {
                    const time = moment(value, "HH:mm");
                    return time.isValid() && time.minute() % 15 === 0;
                }
            ),
        workEndTime: Yup.string()
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
            ),
    });

    const camelCase = (obj) => {
        var newObj = {};
        for (const d in obj) {
            if (obj.hasOwnProperty(d)) {
                newObj[
                    d.replace(/(\_\w)/g, function (k) {
                        return k[1].toUpperCase();
                    })
                ] = obj[d];
            }
        }
        return newObj;
    };
    const snakeCase = (obj) => {
        var newObj = {};
        for (const d in obj) {
            if (obj.hasOwnProperty(d)) {
                newObj[d.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase()] =
                    obj[d];
            }
        }
        return newObj;
    };

    const edit = (draft) => {
        let editingDraft = draft;
        editingDraft.breaks = JSON.parse(draft.breaks);
        setFiles(JSON.parse(draft.files));
        setValues(camelCase(editingDraft));
        console.log(camelCase(editingDraft));
        setShowEdit(true);
    };

    const deleteDraft = (draft_id) => {
        axios.post("/delete-draft-jobs", { draft_id: draft_id }).then((res) => {
            let deletedDraft = data.findIndex((draft) => {
                return draft.id === draft_id;
            });
            let newArr = data.splice(deletedDraft, 1);
            setData(newArr);
        });
    };

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

    const sendSubmit = (draft_id) => {
        axios
            .post("/send-submit-draft-jobs", { draft_id: draft_id })
            .then((res) => {
                let sendedDrafts = data.findIndex((draft) => {
                    return draft.id === draft_id;
                });
                if (sendedDrafts !== -1) {
                    let newArr = data.splice(sendedDrafts, 1);
                    setData(newArr);
                } else {
                    setData([]);
                }
                axios.get("/data-draft-jobs").then((res) => {
                    setData(res.data);
                    setLoading(false);
                });
                Swal.fire(
                    "Erfolgreich",
                    "Der Entwurf wurde an die Verwaltung gesendet.",
                    "success"
                );
            });
    };

    useEffect(() => {
        axios.get("/data-draft-jobs").then((res) => {
            setData(res.data);
            setLoading(false);
        });
        axios.get("/clients").then((res) => {
            if (res.status == 200) {
                setClient(res.data);
            }
        });
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Entwurf Berichte
                </h2>
            }
        >
            <Head title="DraftJobs" />

            {data.length == 0 && (
                <div className="flex justify-center items-center h-48">
                    Keine Daten gefunden.
                </div>
            )}

            {data.length > 0 && (
                <div>
                    <div className="overflow-x-auto">
                        <Table striped>
                            <Table.Head>
                                <Table.HeadCell>Anfangsdatum</Table.HeadCell>
                                <Table.HeadCell>Tour Name</Table.HeadCell>
                                <Table.HeadCell>
                                    <span className="sr-only">Bearbeiten</span>
                                </Table.HeadCell>
                            </Table.Head>
                            <Table.Body className="divide-y">
                                {!showEdit &&
                                    !loading &&
                                    data.map((draft, index) => (
                                        <Table.Row
                                            key={index}
                                            className="bg-white dark:border-gray-700 dark:bg-gray-800"
                                        >
                                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                                {new Date(
                                                    draft.initial_date
                                                ).toLocaleDateString()}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {draft.tour_name}
                                            </Table.Cell>
                                            <Table.Cell className=" text-center ">
                                                <a
                                                    href="#"
                                                    className="font-medium text-cyan-600 hover:underline dark:text-cyan-500"
                                                    onClick={() => {
                                                        deleteDraft(draft.id);
                                                    }}
                                                >
                                                    Löschen
                                                </a>{" "}
                                                <br /> <br /> <br />
                                                <a
                                                    href="#"
                                                    className="font-medium text-cyan-600 hover:underline dark:text-cyan-500"
                                                    onClick={() => {
                                                        edit(draft);
                                                    }}
                                                >
                                                    Bearbeiten
                                                </a>{" "}
                                                <br /> <br /> <br />
                                                <a
                                                    href="#"
                                                    className="font-medium text-cyan-600 hover:underline dark:text-cyan-500"
                                                    onClick={() => {
                                                        sendSubmit(draft.id);
                                                    }}
                                                >
                                                    Einreichen
                                                </a>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                            </Table.Body>
                        </Table>
                    </div>

                    {showEdit && (
                        <div>
                            <div className="flex justify-center items-center flex-column h-24 font-bold ">
                                <p>Informationen bearbeiten</p>
                            </div>
                            <Formik
                                initialValues={values}
                                enableReinitialize={true}
                                validationSchema={validationSchema}
                                onSubmit={(values, { setSubmitting }) => {
                                    values.images = files;
                                    console.log(
                                        "düzenlemeye giden",
                                        values.images
                                    );
                                    setSubmitting(true);
                                    setLoading(true);
                                    values.guest = values.guest ? 1 : 0;
                                    values.cancel = values.cancel ? 1 : 0;
                                    values.ausland = values.ausland ? 1 : 0;
                                    values.accomodation = values.accomodation ? 1 : 0;
                                    values.learning = values.learning ? 1 : 0;
                                    axios
                                        .post(
                                            "/update-draft-jobs",
                                            snakeCase(values)
                                        )
                                        .then((res) => {
                                            if (res.status) {
                                                axios
                                                    .get("/data-draft-jobs")
                                                    .then((res) => {
                                                        setData(res.data);
                                                        setLoading(false);
                                                        setShowEdit(false);
                                                        setSubmitting(false);
                                                    });
                                            }
                                        })
                                        .catch((err) => {
                                            setSubmitting(false);
                                            Swal.fire({
                                                icon: "error",
                                                title: "Fehler",
                                                text: err.response.data.message,
                                            });
                                        });
                                }}
                            >
                                {({
                                    values,
                                    handleSubmit,
                                    errors,
                                    touched,
                                    setFieldValue,
                                    validateForm,
                                    isSubmitting,
                                }) => {
                                    return (
                                        <Form onSubmit={handleSubmit}>
                                            <Accordion>
                                                <AccordionPanel isOpen={false}>
                                                    <AccordionTitle>
                                                        Allgemeine Informationen
                                                    </AccordionTitle>
                                                    <AccordionContent>
                                                        <Label>
                                                            Startdatum
                                                        </Label>
                                                        <Datepicker
                                                            language="de-DE"
                                                            labelTodayButton="Heute"
                                                            labelClearButton="Löschen"
                                                            id="initialDate"
                                                            name="initialDate"
                                                            value={
                                                                values.initialDate
                                                                    ? new Date(
                                                                          values.initialDate
                                                                      ).toDateString()
                                                                    : new Date().toDateString()
                                                            }
                                                            onSelectedDateChanged={(
                                                                date
                                                            ) => {
                                                                setFieldValue(
                                                                    "initialDate",
                                                                    date
                                                                );
                                                            }}
                                                        />
                                                        {errors.initialDate &&
                                                            touched.initialDate &&
                                                            errors.initialDate}
                                                        <br />
                                                        <Label>
                                                            Zug Nummer
                                                        </Label>
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
                                                                    e.target
                                                                        .value
                                                                );
                                                            }}
                                                            value={
                                                                values.zugNummer
                                                            }
                                                        />
                                                        {errors.zugNummer &&
                                                            touched.zugNummer && (
                                                                <p className="text-red-500">
                                                                    *
                                                                    {
                                                                        errors.zugNummer
                                                                    }
                                                                </p>
                                                            )}

                                                        <br />
                                                        <Label>Tour Name</Label>
                                                        <Field
                                                            id="tourName"
                                                            name="tourName"
                                                            type="text"
                                                            placeholder="Tour Name"
                                                            onChange={(e) => {
                                                                setFieldValue(
                                                                    "tourName",
                                                                    e.target
                                                                        .value
                                                                );
                                                            }}
                                                            className={
                                                                errors.tourName &&
                                                                touched.tourName
                                                                    ? "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                                    : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                            }
                                                        />
                                                        {errors.tourName &&
                                                            touched.tourName && (
                                                                <p className="text-red-500">
                                                                    *
                                                                    {
                                                                        errors.tourName
                                                                    }
                                                                </p>
                                                            )}
                                                        <br />
                                                        <Label>
                                                            Lokomotiv Nummer
                                                        </Label>
                                                        <Field
                                                            id="locomotiveNumber"
                                                            name="locomotiveNumber"
                                                            type="text"
                                                            placeholder="Lokomotiv Nummer"
                                                            onChange={(e) => {
                                                                setFieldValue(
                                                                    "locomotiveNumber",
                                                                    e.target
                                                                        .value
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
                                                                    *
                                                                    {
                                                                        errors.locomotiveNumber
                                                                    }
                                                                </p>
                                                            )}
                                                        <br />
                                                        <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
                                                            <ToggleSwitch
                                                                checked={
                                                                    values.cancel
                                                                }
                                                                label="Storniert"
                                                                id="cancel"
                                                                name="cancel"
                                                                onChange={(
                                                                    value
                                                                ) => {
                                                                    setFieldValue(
                                                                        "cancel",
                                                                        value
                                                                    );
                                                                }}
                                                            />

                                                            <ToggleSwitch
                                                                checked={
                                                                    values.ausland
                                                                }
                                                                label="Ausland"
                                                                id="ausland"
                                                                name="ausland"
                                                                onChange={(
                                                                    value
                                                                ) => {
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
                                                                        if(values.accomodation){

                                                                                setFieldValue("feedingFee", 32);


                                                                        } else {
                                                                            setFieldValue("feedingFee", 16);
                                                                        }
                                                                    }
                                                                    setFieldValue(
                                                                        "ausland",
                                                                        value
                                                                    );
                                                                }}
                                                            />


                                                            <ToggleSwitch
                                                                checked={
                                                                    values.accomodation
                                                                }
                                                                label="Unterkunft"
                                                                id="accomodation"
                                                                name="accomodation"
                                                                onChange={(
                                                                    value
                                                                ) => {
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
                                                                checked={
                                                                    values.bereitschaft
                                                                }
                                                                label="Bereitschaft"
                                                                id="bereitschaft"
                                                                name="bereitschaft"
                                                                onChange={(
                                                                    value
                                                                ) => {
                                                                    setFieldValue(
                                                                        "bereitschaft",
                                                                        value
                                                                    );
                                                                }}
                                                            />
                                                            <ToggleSwitch
                                                                checked={
                                                                    values.learning
                                                                }
                                                                label="Streckenkunde"
                                                                id="learning"
                                                                name="learning"
                                                                onChange={(
                                                                    value
                                                                ) => {
                                                                    setFieldValue(
                                                                        "learning",
                                                                        value
                                                                    );
                                                                }}
                                                            />
                                                            <ToggleSwitch
                                                                checked={
                                                                    values.learning
                                                                }
                                                                label="Gastfahr Tour"
                                                                id="guest"
                                                                name="guest"
                                                                onChange={(
                                                                    value
                                                                ) => {
                                                                    setFieldValue(
                                                                        "guest",
                                                                        value
                                                                    );
                                                                }}
                                                            />
                                                        </div>
                                                        <br />
                                                        <div className="max-w-md mt-5">
                                        {values.ausland && (
                                            <div>
                                                <Label>Land</Label>
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
                                            </div>
                                        )}
                                    </div>
                                                        <Label>Kommenter</Label>
                                                        <Textarea
                                                            id="comment"
                                                            name="comment"
                                                            placeholder="Hinterlassen Sie einen Kommentar..."
                                                            rows={4}
                                                            className={
                                                                errors.comment &&
                                                                touched.comment
                                                                    ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                                    : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                            }
                                                            onChange={(e) => {
                                                                setFieldValue(
                                                                    "comment",
                                                                    e.target
                                                                        .value
                                                                );
                                                            }}
                                                        >
                                                            {values.comment}
                                                        </Textarea>
                                                        {errors.comment &&
                                                            touched.comment && (
                                                                <p className="text-red-500">
                                                                    *
                                                                    {
                                                                        errors.comment
                                                                    }
                                                                </p>
                                                            )}
                                                        <div className="mt-5 w-full">
                                                            <Label>
                                                                Foto hinzufügen
                                                            </Label>
                                                            <MultipleFileUpload
                                                                images={files}
                                                                setImages={
                                                                    setFiles
                                                                }
                                                            />
                                                        </div>
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
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    setFieldValue(
                                                                        "client",
                                                                        e.target
                                                                            .value
                                                                    );
                                                                }}
                                                                value={
                                                                    values.clientId
                                                                }
                                                            >
                                                                <option>
                                                                    Wählen
                                                                    Sie...
                                                                </option>
                                                                {client.map(
                                                                    (
                                                                        client
                                                                    ) => (
                                                                        <option
                                                                            key={
                                                                                client.id
                                                                            }
                                                                            value={
                                                                                client.id
                                                                            }
                                                                        >
                                                                            {
                                                                                client.name
                                                                            }
                                                                        </option>
                                                                    )
                                                                )}
                                                            </Select>
                                                        </div>
                                                        {errors.client &&
                                                            touched.client && (
                                                                <p className="text-red-500">
                                                                    *
                                                                    {
                                                                        errors.client
                                                                    }
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
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    setFieldValue(
                                                                        "feedingFee",
                                                                        e.target
                                                                            .value
                                                                    );
                                                                }}
                                                                required
                                                                value={
                                                                    values.feedingFee
                                                                }
                                                            >
                                                                <option
                                                                    value={0}
                                                                >
                                                                    0€
                                                                </option>
                                                                <option
                                                                    value={16}
                                                                >
                                                                    16€
                                                                </option>
                                                                <option
                                                                    value={32}
                                                                >
                                                                    32€
                                                                </option>
                                                                <option
                                                                    value={43}
                                                                >
                                                                    43€
                                                                </option> <option
                                                                    value={47}
                                                                >
                                                                    47€
                                                                </option>
                                                                <option
                                                                    value={64}
                                                                >
                                                                    64€
                                                                </option>
                                                            </Select>
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionPanel>
                                            </Accordion>

                                            <Accordion>
                                                <AccordionPanel />
                                                <AccordionPanel isOpen={false}>
                                                    <AccordionTitle>
                                                        Gastfahrt
                                                    </AccordionTitle>
                                                    <AccordionContent>
                                                        <ToggleSwitch
                                                            checked={
                                                                values.earlyExit
                                                            }
                                                            label="Anreise Vortag"
                                                            id="earlyExit"
                                                            name="earlyExit"
                                                            onChange={(value) => {
                                                                setFieldValue("earlyExit", value);
                                                            }}
                                                        />
                                                        <Label>
                                                            Gastfahrt Begin
                                                        </Label>
                                                        <Field
                                                            id="guestStartPlace"
                                                            name="guestStartPlace"
                                                            type="text"
                                                            placeholder="Zug Nummer"
                                                            onChange={(e) => {
                                                                setFieldValue(
                                                                    "guestStartPlace",
                                                                    e.target
                                                                        .value
                                                                );
                                                            }}
                                                            className={
                                                                errors.guestStartPlace &&
                                                                touched.guestStartPlace
                                                                    ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                                    : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                            }
                                                            value={
                                                                values.guestStartPlace
                                                            }
                                                        />

                                                        {errors.guestStartPlace &&
                                                            touched.guestStartPlace && (
                                                                <p className="text-red-500">
                                                                    *
                                                                    {
                                                                        errors.guestStartPlace
                                                                    }
                                                                </p>
                                                            )}

                                                        <br />

                                                        <Label>
                                                            Gastfahrt Start
                                                        </Label>
                                                        <div className="flex">
                                                            <Field
                                                                type="time"
                                                                id="guestStartTime"
                                                                name="guestStartTime"
                                                                className={
                                                                    errors.guestStartTime &&
                                                                    touched.guestStartTime
                                                                        ? "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                                        : "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                                }
                                                                value={
                                                                    values.guestStartTime || ""
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    setFieldValue(
                                                                        "guestStartTime",
                                                                        e.target
                                                                            .value
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
                                                                    *
                                                                    {
                                                                        errors.guestStartTime
                                                                    }
                                                                </p>
                                                            )}
                                                        <br />
                                                        <Label>
                                                            Gastfahrt Ende
                                                        </Label>
                                                        <Field
                                                            id="guestStartEndPlace"
                                                            name="guestStartEndPlace"
                                                            type="text"
                                                            placeholder="Varış Yeri"
                                                            onChange={(e) => {
                                                                setFieldValue(
                                                                    "guestStartEndPlace",
                                                                    e.target
                                                                        .value
                                                                );
                                                            }}
                                                            className={
                                                                errors.guestStartEndPlace &&
                                                                touched.guestStartEndPlace
                                                                    ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                                    : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                            }
                                                            value={
                                                                values.guestStartEndPlace || ""
                                                            }
                                                        />
                                                        {errors.guestStartEndPlace &&
                                                            touched.guestStartEndPlace && (
                                                                <p className="text-red-500">
                                                                    *
                                                                    {
                                                                        errors.guestStartEndPlace
                                                                    }
                                                                </p>
                                                            )}

                                                        <br />

                                                        <Label>
                                                            Gastfahrt Ende
                                                        </Label>
                                                        <div className="flex">
                                                            <Field
                                                                type="time"
                                                                id="guestStartEndTime"
                                                                name="guestStartEndTime"
                                                                className={
                                                                    errors.guestStartEndTime &&
                                                                    touched.guestStartEndTime
                                                                        ? "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                                        : "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                                }
                                                                value={
                                                                    values.guestStartEndTime || ""
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    setFieldValue(
                                                                        "guestStartEndTime",
                                                                        e.target
                                                                            .value
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
                                                                    *
                                                                    {
                                                                        errors.guestStartEndTime
                                                                    }
                                                                </p>
                                                            )}
                                                        <br />
                                                    </AccordionContent>
                                                </AccordionPanel>
                                            </Accordion>

                                            <Accordion>
                                                <AccordionPanel />
                                                <AccordionPanel isOpen={false}>
                                                    <AccordionTitle>
                                                        Dienst Beginn
                                                    </AccordionTitle>
                                                    <AccordionContent>
                                                        <LocationField
                                                            id="workStartPlace"
                                                            name="workStartPlace"
                                                            type="text"
                                                            label={"Start Ort"}
                                                            placeholder="Start Ort"
                                                            error={errors.workStartPlace}
                                                            onChange={(e) => {
                                                                setFieldValue(
                                                                    "workStartPlace",
                                                                    e.value
                                                                );
                                                            }}
                                                            className={
                                                                errors.workStartPlace &&
                                                                touched.workStartPlace
                                                                    ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                                    : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                            }
                                                            selected={
                                                                values.workStartPlace
                                                            }
                                                        />
                                                        {errors.workStartPlace &&
                                                            touched.workStartPlace && (
                                                                <p className="text-red-500">
                                                                    *
                                                                    {
                                                                        errors.workStartPlace
                                                                    }
                                                                </p>
                                                            )}
                                                        <br />

                                                        <Label>
                                                            Anfangszeit
                                                            {errors.workStartTime &&
                                                                touched.workStartTime && (
                                                                    <p className="text-red-500">
                                                                        *
                                                                        {
                                                                            errors.workStartTime
                                                                        }
                                                                    </p>
                                                                )}
                                                        </Label>
                                                        <div className="flex">
                                                            <Field
                                                                type="time"
                                                                name="workStartTime"
                                                                id="workStartTime"
                                                                className={
                                                                    errors.workStartTime &&
                                                                    touched.workStartTime
                                                                        ? "rounded-none rounded-s-lg bg-gray-50 border text-red-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-red-300 p-2.5 dark:bg-red-700 dark:border-red-600 dark:placeholder-red-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                                        : "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                                }
                                                                value={
                                                                    values.workStartTime || ""
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    setFieldValue(
                                                                        "workStartTime",
                                                                        e.target
                                                                            .value
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
                                                      
                                                        <LocationField
                                                            id="trainStartPlace"
                                                            name="trainStartPlace"
                                                            placeholder="Zug Abfahrtsort"
                                                            label={"Zug Abfahrtsort"}
                                                            error={errors.trainStartPlace}
                                                            selected={
                                                                values.trainStartPlace
                                                            }
                                                            onChange={(e) => {
                                                                setFieldValue(
                                                                    "trainStartPlace",
                                                                    e.value
                                                                );
                                                            }}
                                                            className={
                                                                errors.trainStartPlace &&
                                                                touched.trainStartPlace
                                                                    ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                                    : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                            }
                                                           
                                                        />
                                                        {errors.trainStartPlace &&
                                                            touched.trainStartPlace && (
                                                                <p className="text-red-500">
                                                                    *
                                                                    {
                                                                        errors.trainStartPlace
                                                                    }
                                                                </p>
                                                            )}
                                                        <br />

                                                        <Label>
                                                            Zug Abfahrtszeit
                                                        </Label>
                                                        <div className="flex">
                                                            <Field
                                                                type="time"
                                                                id="trainStartTime"
                                                                name="trainStartTime"
                                                                className={
                                                                    errors.trainStartTime &&
                                                                    touched.trainStartTime
                                                                        ? "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                                        : "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                                }
                                                                value={
                                                                    values.trainStartTime || ""
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    setFieldValue(
                                                                        "trainStartTime",
                                                                        e.target
                                                                            .value
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
                                                                    *
                                                                    {
                                                                        errors.trainStartTime
                                                                    }
                                                                </p>
                                                            )}
                                                       
                                                        <LocationField
                                                            id="trainEndPlace"
                                                            name="trainEndPlace"
                                                            label={"Zug Ankunftsort"}
                                                            placeholder="Zug Ankunftsort"
                                                            error={errors.trainEndPlace}
                                                            selected={
                                                                values.trainEndPlace
                                                            }
                                                            onChange={(e) => {
                                                                setFieldValue(
                                                                    "trainEndPlace",
                                                                    e.target
                                                                        .value
                                                                );
                                                            }}
                                                            className={
                                                                errors.trainEndPlace &&
                                                                touched.trainEndPlace
                                                                    ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                                    : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                            }
                                                        />
                                                        {errors.trainEndPlace &&
                                                            touched.trainEndPlace && (
                                                                <p className="text-red-500">
                                                                    *
                                                                    {
                                                                        errors.trainEndPlace
                                                                    }
                                                                </p>
                                                            )}
                                                        <br />

                                                        <Label>
                                                            Zug Ankunftszeit
                                                        </Label>
                                                        <div className="flex">
                                                            <Field
                                                                type="time"
                                                                id="trainEndTime"
                                                                name="trainEndTime"
                                                                className={
                                                                    errors.trainEndTime &&
                                                                    touched.trainEndTime
                                                                        ? "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                                        : "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                                }
                                                                value={
                                                                    values.trainEndTime || ""
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    setFieldValue(
                                                                        "trainEndTime",
                                                                        e.target
                                                                            .value
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
                                                                    *
                                                                    {
                                                                        errors.trainEndTime
                                                                    }
                                                                </p>
                                                            )}
                                                    </AccordionContent>
                                                </AccordionPanel>
                                            </Accordion>

                                            <Accordion>
                                                <AccordionPanel />
                                                <AccordionPanel isOpen={false}>
                                                    <AccordionTitle>
                                                        Pause
                                                    </AccordionTitle>
                                                    <AccordionContent>
                                                        <br />
                                                        <FieldArray name="breaks">
                                                            {({
                                                                insert,
                                                                remove,
                                                                push,
                                                            }) => (
                                                                <div className="">
                                                                    {values.breaks &&
                                                                        values
                                                                            .breaks
                                                                            .length >
                                                                            0 &&
                                                                        values.breaks.map(
                                                                            (
                                                                                breakItem,
                                                                                index
                                                                            ) => {
                                                                                return (
                                                                                    <div
                                                                                        key={
                                                                                            index
                                                                                        }
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
                                                                                                value={
                                                                                                    breakItem.start || ""
                                                                                                }
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
                                                                                                                timeOption || ""
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
                                                                                                value={
                                                                                                    breakItem.end || ""
                                                                                                }
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
                                                                                                                timeOption || ""
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
                                                                                );
                                                                            }
                                                                        )}
                                                                    <div className="flex justify-center items-center">
                                                                        <button
                                                                            type="button"
                                                                            className="bg-green-500 text-white p-2 rounded-md w-20"
                                                                            onClick={() =>
                                                                                push(
                                                                                    {
                                                                                        start: "",
                                                                                        end: "",
                                                                                    }
                                                                                )
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
                                                    <AccordionTitle>
                                                        Dienst Ende
                                                    </AccordionTitle>
                                                    <AccordionContent>
                                                      
                                                        <LocationField
                                                            id="workEndPlace"
                                                            placeholder="Dienst Ende Ort"
                                                            label="Dienst Ende Ort"
                                                            error={errors.workEndPlace}
                                                            selected={
                                                                values.workEndPlace
                                                            }
                                                            onChange={(e) => {
                                                                setFieldValue(
                                                                    "workEndPlace",
                                                                    e.value
                                                                );
                                                            }}
                                                            className={
                                                                errors.workEndPlace &&
                                                                touched.workEndPlace
                                                                    ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                                    : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                            }
                                                        />
                                                        {errors.workEndPlace &&
                                                            touched.workEndPlace && (
                                                                <p className="text-red-500">
                                                                    *
                                                                    {
                                                                        errors.workEndPlace
                                                                    }
                                                                </p>
                                                            )}
                                                        <br />

                                                        <Label>
                                                            Dienst Ende Zeit
                                                            {errors.workEndTime &&
                                                                touched.workEndTime && (
                                                                    <p className="text-red-500">
                                                                        *
                                                                        {
                                                                            errors.workEndTime
                                                                        }
                                                                    </p>
                                                                )}
                                                        </Label>
                                                        <div className="flex">
                                                            <Field
                                                                type="time"
                                                                id="workEndTime"
                                                                className={
                                                                    errors.workEndTime &&
                                                                    touched.workEndTime
                                                                        ? "rounded-none rounded-s-lg bg-gray-50 border text-red-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-red-300 p-2.5 dark:bg-red-700 dark:border-red-600 dark:placeholder-red-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                                        : "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                                }
                                                                value={
                                                                    values.workEndTime || ""
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    setFieldValue(
                                                                        "workEndTime",
                                                                        e.target
                                                                            .value
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
                                                            checked={
                                                                values.lateEnter
                                                            }
                                                            label="Abreise Folgetag"
                                                            id="lateEnter"
                                                            name="lateEnter"
                                                            onChange={(value) => {
                                                                setFieldValue("lateEnter", value);
                                                            }}
                                                        />
                                                        <br />
                                                        <Label>
                                                            Gastfahrt Zürück Ort
                                                        </Label>
                                                        <Field
                                                            id="guestEndPlace"
                                                            type="text"
                                                            placeholder="Gastfahrt Zürück Ort"
                                                            onChange={(e) => {
                                                                setFieldValue(
                                                                    "guestEndPlace",
                                                                    e.target
                                                                        .value
                                                                );
                                                            }}
                                                            className={
                                                                errors.guestEndPlace &&
                                                                touched.guestEndPlace
                                                                    ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                                    : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                            }
                                                            value={
                                                                values.guestEndPlace || ""
                                                            }
                                                        />
                                                        {errors.guestEndPlace &&
                                                            touched.guestEndPlace && (
                                                                <p className="text-red-500">
                                                                    *
                                                                    {
                                                                        errors.guestEndPlace
                                                                    }
                                                                </p>
                                                            )}
                                                        <br />

                                                        <Label>
                                                            Gastfahrt Zürück
                                                            Zeit
                                                        </Label>
                                                        <div className="flex">
                                                            <Field
                                                                type="time"
                                                                id="guestEndTime"
                                                                className={
                                                                    errors.guestEndTime &&
                                                                    touched.guestEndTime
                                                                        ? "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                                        : "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                                }
                                                                value={
                                                                    values.guestEndTime || ""
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    setFieldValue(
                                                                        "guestEndTime",
                                                                        e.target
                                                                            .value
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
                                                                        *
                                                                        {
                                                                            errors.guestStartPlace
                                                                        }
                                                                    </p>
                                                                )}
                                                        </div>
                                                        <br />
                                                        <Label>
                                                            Gastfahrt Zürück End
                                                            Ort
                                                        </Label>
                                                        <Field
                                                            id="guestEndEndPlace"
                                                            type="text"
                                                            placeholder="Gastfahrt Zürück End Ort"
                                                            onChange={(e) => {
                                                                setFieldValue(
                                                                    "guestEndEndPlace",
                                                                    e.target
                                                                        .value
                                                                );
                                                            }}
                                                            className={
                                                                errors.guestEndEndPlace &&
                                                                touched.guestEndEndPlace
                                                                    ? "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-red-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                                    : "placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                            }
                                                            value={
                                                                values.guestEndEndPlace || ""
                                                            }
                                                        />
                                                        {errors.guestEndEndPlace &&
                                                            touched.guestEndEndPlace && (
                                                                <p className="text-red-500">
                                                                    *
                                                                    {
                                                                        errors.guestEndEndPlace
                                                                    }
                                                                </p>
                                                            )}
                                                        <br />

                                                        <Label>
                                                            Gastfahrt Zürück End
                                                            Zeit
                                                        </Label>
                                                        <div className="flex">
                                                            <Field
                                                                type="time"
                                                                id="guestEndEndTime"
                                                                className={
                                                                    errors.guestEndEndTime &&
                                                                    touched.guestEndEndTime
                                                                        ? "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                                        : "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                                }
                                                                value={
                                                                    values.guestEndEndTime || ""
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    setFieldValue(
                                                                        "guestEndEndTime",
                                                                        e.target
                                                                            .value
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
                                                                        *
                                                                        {
                                                                            errors.guestEndEndTime
                                                                        }
                                                                    </p>
                                                                )}
                                                        </div>
                                                        <br />
                                                    </AccordionContent>
                                                </AccordionPanel>
                                            </Accordion>
                                            <div className="flex justify-center items-center mt-5 pb-5">
                                                <Button
                                                    className=" bg-red-500 "
                                                    onClick={() => {
                                                        setShowEdit(false);
                                                    }}
                                                >
                                                    Abbrechen
                                                </Button>

                                                {isSubmitting ? (
                                                    <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded">
                                                        <Spinner
                                                            aria-label="Spinner button example"
                                                            size="sm"
                                                        />
                                                        <span className="pl-3">
                                                            Loading...
                                                        </span>
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        type="submit"
                                                        className="ml-4"
                                                    >
                                                        Speichern
                                                    </Button>
                                                )}

                                            </div>
                                        </Form>
                                    );
                                }}
                            </Formik>
                        </div>
                    )}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
