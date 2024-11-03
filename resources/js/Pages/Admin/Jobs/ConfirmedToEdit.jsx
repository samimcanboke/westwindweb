import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useEffect, useState } from "react";
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
import { Formik, Field, FieldArray, Form } from "formik";
import * as Yup from "yup";
import moment from "moment";
import Swal from "sweetalert2";
import PhotoGallery from "@/Components/PhotoGallery";
import LocationField from "@/Components/LocationField";

const validationSchema = Yup.object().shape({
    initialDate: Yup.date().required("Required"),
    zugNummer: Yup.string().required("Required"),
    tourName: Yup.string().required("Required"),
    workStartPlace: Yup.string().required("Required"),
    workEndPlace: Yup.string().required("Required"),
    workStartTime: Yup.string().required("Required"),
    workEndTime: Yup.string().required("Required"),
});

export default function ConfirmedToEdit({ auth }) {
    const [data, setData] = useState([]);
    const [filter, setFilter] = useState({
        year: moment().format("YYYY"),
        month: moment().format("MM"),
        text: "",
    });
    const [loading, setLoading] = useState(true);
    const [showEdit, setShowEdit] = useState(false);
    const [values, setValues] = useState({});
    const [showLockführer, setShowLockführer] = useState(false);
    const [drivers, setDrivers] = useState("");
    const [users, setUsers] = useState([]);

    const [clients, setClients] = useState("");

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

    const deleteDraft = async (draft) => {
        Swal.fire({
            title: "Sind Sie sicher?",
            text: "Das Job wird gelscht",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Lschen",
            cancelButtonText: "Abbrechen",
        }).then((result) => {
            if (result.isConfirmed) {
                console.log(draft);
                axios
                    .delete(route("jobs-unconfirmed-destroy", { id: draft.id }))
                    .then((res) => {
                        if (res.data.status) {
                            Swal.fire({
                                title: "Erfolgreich",
                                text: "Job wurde gelschen",
                                icon: "success",
                            });
                            getUnconfirmed();
                        }
                    });
            }
        });
    };

    const edit = async (finalized) => {
        let editingDraft = finalized;
        try {
            editingDraft.breaks = JSON.parse(finalized.breaks);
        } catch (e) {
            console.log(e);
        }
        setValues(camelCase(editingDraft));
        setShowEdit(true);
    };

    useEffect(() => {
        getUnconfirmed();
    }, [filter.month, filter.year, filter.text]);

    const getUnconfirmed = async () => {
        await axios
            .get("/data-confirmed-jobs", { params: filter })
            .then((res) => {
                setData(res.data);
                setLoading(false);
               
            });
    };

    useEffect(() => {
        axios.get(route("users.show")).then((res) => {
            setDrivers(res.data);
            setUsers(res.data);
        });
        axios.get("/clients").then((res) => {
            setClients(res.data);
        });
    }, []);

    function handleConfirm(e) {
        e.preventDefault();
        setLoading(true);
        axios.post("/jobs-confirmation", snakeCase(values)).then((res) => {
            getUnconfirmed();
            setShowEdit(false);
            setLoading(false);
        });
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Warten auf bestätigte Jobs
                </h2>
            }
        >
            <Head title="Waiting Confirmed Jobs" />
            <div>
                <div className="overflow-x-auto">
                    <Table striped>
                        <Table.Head>
                            <Table.HeadCell>
                                <div className="flex space-x-2.5">
                                    <Select
                                        id="yearFilter"
                                        name="yearFilter"
                                        className="placeholder:italic placeholder:text-slate-400 block bg-white border border-slate-300 rounded-md py-2 pl-3 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        value={
                                            filter.year ||
                                            moment().format("YYYY")
                                        }
                                        onChange={(e) => {
                                            setFilter({
                                                ...filter,
                                                year: e.target.value,
                                            });
                                        }}
                                    >
                                        <option value="">Jahr wählen...</option>
                                        <option value="2023">2023</option>
                                        <option value="2024">2024</option>
                                        <option value="2025">2025</option>
                                    </Select>

                                    <Select
                                        id="monthFilter"
                                        name="monthFilter"
                                        className="placeholder:italic placeholder:text-slate-400 block bg-white border border-slate-300 rounded-md py-2 pl-3 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        value={
                                            filter.month ||
                                            moment().format("MM")
                                        }
                                        onChange={(e) => {
                                            setFilter({
                                                ...filter,
                                                month: e.target.value,
                                            });
                                        }}
                                    >
                                        <option value="">
                                            Monat wählen...
                                        </option>
                                        <option value="01">Januar</option>
                                        <option value="02">Februar</option>
                                        <option value="03">März</option>
                                        <option value="04">April</option>
                                        <option value="05">Mai</option>
                                        <option value="06">Juni</option>
                                        <option value="07">Juli</option>
                                        <option value="08">August</option>
                                        <option value="09">September</option>
                                        <option value="10">Oktober</option>
                                        <option value="11">November</option>
                                        <option value="12">Dezember</option>
                                    </Select>
                                </div>
                            </Table.HeadCell>
                            <Table.HeadCell>Tour Name</Table.HeadCell>
                            <Table.HeadCell>Fahrer ID</Table.HeadCell>
                            <Table.HeadCell>
                                <input
                                    type="text"
                                    id="filter"
                                    name="filter"
                                    placeholder="Lokführer suchen..."
                                    className="placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                    onChange={(e) => {
                                        setFilter({
                                            ...filter,
                                            text: e.target.value,
                                        });
                                    }}
                                />
                            </Table.HeadCell>
                            <Table.HeadCell>
                                <span className="sr-only">Bearbeiten</span>
                            </Table.HeadCell>
                            <Table.HeadCell>
                                <span className="sr-only">Löschen</span>
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
                                            {moment
                                                .utc(draft.initial_date)
                                                .startOf("00:00")
                                                .format("DD.MM.YYYY")}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {draft.tour_name}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {draft.user_id &&
                                                draft.user_id != "" &&
                                                drivers
                                                ? drivers
                                                    .find(
                                                        (driver) =>
                                                            driver.id ==
                                                            draft.user_id
                                                    )
                                                    .id.toString()
                                                    .padStart(3, "0")
                                                : "Fahrer nicht gefunden"}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {draft.user_id &&
                                                draft.user_id != "" &&
                                                drivers
                                                ? drivers.find(
                                                    (driver) =>
                                                        driver.id ==
                                                        draft.user_id
                                                ).name
                                                : "Fahrer nicht gefunden"}
                                        </Table.Cell>
                                        <Table.Cell className=" text-center ">
                                            <a
                                                href="#"
                                                className="font-medium text-cyan-600 hover:underline dark:text-cyan-500"
                                                onClick={() => {
                                                    edit(draft);
                                                }}
                                            >
                                                Anzeigen
                                            </a>
                                        </Table.Cell>
                                        <Table.Cell className=" text-center ">
                                            <a
                                                href="#"
                                                className="font-medium text-cyan-600 hover:underline dark:text-cyan-500"
                                                onClick={() => {
                                                    deleteDraft(draft);
                                                }}
                                            >
                                                Löschen
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
                                setSubmitting(true);
                                setLoading(true);
                                axios
                                    .post("/jobs-editing", snakeCase(values))
                                    .then((res) => {
                                        if (res.status) {
                                            setLoading(false);
                                            getUnconfirmed();
                                            setShowEdit(false);
                                            setSubmitting(false);
                                            location.reload();
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
                                                    <Label>Startdatum</Label>
                                                    <input
                                                        type="hidden"
                                                        name="user_id"
                                                        value={values.userId}
                                                    ></input>
                                                    <Datepicker
                                                        language="de-DE"
                                                        labelTodayButton="Heute"
                                                        labelClearButton="Löschen"
                                                        id="initialDate"
                                                        name="initialDate"
                                                        value={moment(
                                                            values.initialDate
                                                        ).format("DD.MM.YYYY")}
                                                        onSelectedDateChanged={(
                                                            date
                                                        ) => {

                                                            setFieldValue(
                                                                "initialDate",
                                                                moment(date)
                                                                    .add(
                                                                        2,
                                                                        "hours"
                                                                    )
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
                                                        placeholder="T-123"
                                                        onChange={(e) => {
                                                            setFieldValue(
                                                                "tourName",
                                                                e.target.value
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
                                                    <Label>Lok Nummer</Label>
                                                    <Field
                                                        id="locomotiveNumber"
                                                        name="locomotiveNumber"
                                                        type="text"
                                                        placeholder="L123123"
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
                                                                *
                                                                {
                                                                    errors.locomotiveNumber
                                                                }
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
                                                    value ? 1 : 0
                                                );
                                            }}
                                        />

                                        <ToggleSwitch
                                            checked={values.extra}
                                            label="Extra"
                                            id="extra"
                                            name="extra"
                                            onChange={(value) => {
                                                setFieldValue(
                                                    "extra",
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

                                    {values.ausbildung && (
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
                                                value={values.ausbilder}
                                                required
                                                onChange={(e) => {
                                                    setFieldValue(
                                                        "ausbilder",
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
                                                    <Label>Kommentar</Label>
                                                    <Textarea
                                                        id="comment"
                                                        name="comment"
                                                        placeholder="Hinterlassen Sie einen Kommentar..."
                                                        value={
                                                            values.comment ??
                                                            undefined
                                                        }
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
                                                                e.target.value
                                                            );
                                                        }}
                                                    />
                                                    {errors.comment &&
                                                        touched.comment && (
                                                            <p className="text-red-500">
                                                                *
                                                                {errors.comment}
                                                            </p>
                                                        )}

                                                    <br />
                                                    {JSON.parse(values.files) &&
                                                        JSON.parse(values.files)
                                                            .length > 0 && (
                                                            <div className="max-w-md">
                                                                <PhotoGallery
                                                                    images={JSON.parse(
                                                                        values.files
                                                                    )}
                                                                />
                                                            </div>
                                                        )}

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
                                                                    "clientId",
                                                                    e.target
                                                                        .value
                                                                );
                                                            }}
                                                            value={
                                                                values.clientId ??
                                                                ""
                                                            }
                                                        >
                                                            <option>
                                                                Wählen Sie...
                                                            </option>
                                                            {clients &&
                                                                clients.map(
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
                                                                *{errors.client}
                                                            </p>
                                                        )}
                                                    <br />

                                                    <div className="max-w-md">
                                                        <div className="mb-2 block">
                                                            <Label
                                                                htmlFor="feedingFee"
                                                                value="Wählen Sie Ihre Verpflegungspauschale                                                                    "
                                                            />
                                                        </div>
                                                        <Select
                                                            id="feedingFee"
                                                            name="feedingFee"
                                                            onChange={(e) => {
                                                                setFieldValue(
                                                                    "feedingFee",
                                                                    e.target
                                                                        .value
                                                                );
                                                            }}
                                                            required
                                                            value={
                                                                values.feedingFee ??
                                                                ""
                                                            }
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
                                                <AccordionTitle>
                                                    Gastfahrt
                                                </AccordionTitle>
                                                <AccordionContent>
                                                    <ToggleSwitch
                                                        checked={
                                                            values.earlyExit
                                                        }
                                                        label="Vorzeitiges Verlassen"
                                                        id="earlyExit"
                                                        name="earlyExit"
                                                        onChange={(value) => {
                                                            setFieldValue("earlyExit", value);
                                                        }}
                                                    />
                                                    <br />
                                                    <Label>
                                                        Gastfahrt Beginn
                                                    </Label>
                                                    <Field
                                                        id="guestStartPlace"
                                                        name="guestStartPlace"
                                                        type="text"
                                                        placeholder="Gastfahrt Beginn"
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
                                                        value={
                                                            values.guestStartPlace ??
                                                            undefined
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
                                                            value={
                                                                values.guestStartTime ??
                                                                undefined
                                                            }
                                                            onChange={(e) => {
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
                                                        value={
                                                            values.guestStartEndPlace ??
                                                            undefined
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
                                                            value={
                                                                values.guestStartEndTime ??
                                                                undefined
                                                            }
                                                            onChange={(e) => {
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
                                                        label="Startort"
                                                        error={errors.workStartPlace}
                                                        touched={touched.workStartPlace}
                                                        selected={values.workStartPlace}
                                                        placeholder="Startort"
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

                                                    <Label>Anfangszeit:</Label>
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
                                                            value={
                                                                values.workStartTime ??
                                                                undefined
                                                            }
                                                            onChange={(e) => {
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
                                                    {errors.workStartTime &&
                                                        touched.workStartTime && (
                                                            <p className="text-red-500">
                                                                *
                                                                {
                                                                    errors.workStartTime
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
                                                    Zug Abfahrt und Ankunft
                                                </AccordionTitle>
                                                <AccordionContent>
                                                    
                                                    <LocationField
                                                        id="trainStartPlace"
                                                        name="trainStartPlace"
                                                        label="Zug Abfahrtsort"
                                                        error={errors.trainStartPlace}
                                                        selected={values.trainStartPlace}
                                                        placeholder="Zug Abfahrtsort"
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
                                                        Zug Abfahrtszeit:
                                                    </Label>
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
                                                            value={
                                                                values.trainStartTime ??
                                                                undefined
                                                            }
                                                            onChange={(e) => {
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
                                                    <br />
                                                    <LocationField
                                                        id="trainEndPlace"
                                                        name="trainEndPlace"
                                                        label="Zug Ankunftsort"
                                                        error={errors.trainEndPlace}
                                                        selected={values.trainEndPlace}
                                                        placeholder="Zug Ankunftsort"
                                                        onChange={(e) => {
                                                            setFieldValue(
                                                                "trainEndPlace",
                                                                e.value
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
                                                        Zug Ankunftszeit:
                                                    </Label>
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
                                                            value={
                                                                values.trainEndTime ??
                                                                undefined
                                                            }
                                                            onChange={(e) => {
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
                                                                    typeof values.breaks !==
                                                                    "string" &&
                                                                    values.breaks.map(
                                                                        (
                                                                            breakItem,
                                                                            index
                                                                        ) => (
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
                                                                                    <Field
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
                                                                                    />
                                                                                </div>
                                                                                <div>
                                                                                    <label className="text-sm">
                                                                                        Pause
                                                                                        Ende
                                                                                    </label>
                                                                                    <Field
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
                                                                                    />
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
                                                                {values.breaks &&
                                                                    typeof values.breaks !==
                                                                    "object" &&
                                                                    JSON.parse(
                                                                        values.breaks
                                                                    ).map(
                                                                        (
                                                                            breakItem,
                                                                            index
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    index
                                                                                }
                                                                                className="flex justify-around items-center mt-5 mb-5"
                                                                            >
                                                                                <div>
                                                                                    <label className="text-sm">
                                                                                        Break
                                                                                        Start
                                                                                    </label>
                                                                                    <Field
                                                                                        name={`breaks.${index}.start`}
                                                                                        type="time"
                                                                                        className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                                                        value={
                                                                                            breakItem.start ??
                                                                                            undefined
                                                                                        }
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
                                                                                    />
                                                                                </div>
                                                                                <div>
                                                                                    <label className="text-sm">
                                                                                        Break
                                                                                        End
                                                                                    </label>
                                                                                    <Field
                                                                                        name={`breaks.${index}.end`}
                                                                                        type="time"
                                                                                        className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                                                        value={
                                                                                            breakItem.end ??
                                                                                            undefined
                                                                                        }
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
                                                                                    />
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
                                                                                    Sil
                                                                                </button>
                                                                            </div>
                                                                        )
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
                                                    Arbeitsende
                                                </AccordionTitle>
                                                <AccordionContent>
                                                    
                                                    <LocationField
                                                        id="workEndPlace"
                                                        label="Arbeitsende Ort"
                                                        error={errors.workEndPlace}
                                                        placeholder="Arbeitsende Ort"
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
                                                        selected={
                                                            values.workEndPlace ??
                                                            undefined
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
                                                        Arbeitsende Zeit:
                                                    </Label>
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
                                                            value={
                                                                values.workEndTime ??
                                                                undefined
                                                            }
                                                            onChange={(e) => {
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
                                                        {errors.workEndTime &&
                                                            touched.workEndTime && (
                                                                <p className="text-red-500">
                                                                    *
                                                                    {
                                                                        errors.workEndTime
                                                                    }
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
                                                    Rückkehr des Gastes nach
                                                    Hause
                                                </AccordionTitle>
                                                <AccordionContent>
                                                    <Label>
                                                        Gastfahrt Start Ort
                                                    </Label>
                                                    <ToggleSwitch
                                                        checked={
                                                            values.lateEnter
                                                        }
                                                        label="Spät Eintreffen"
                                                        id="lateEnter"
                                                        name="lateEnter"
                                                        onChange={(value) => {
                                                            setFieldValue("lateEnter", value);
                                                        }}
                                                    />
                                                    <br />
                                                    <input
                                                        id="guestEndPlace"
                                                        type="text"
                                                        placeholder="Gastfahrt Start Ort"
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
                                                        value={
                                                            values.guestEndPlace ??
                                                            undefined
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
                                                        Gastfahrt Start Zeit
                                                    </Label>
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
                                                            value={
                                                                values.guestEndTime ??
                                                                undefined
                                                            }
                                                            onChange={(e) => {
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
                                                        Gastfahrt End Ort
                                                    </Label>
                                                    <input
                                                        id="guestEndEndPlace"
                                                        type="text"
                                                        placeholder="Gastfahrt End Ort"
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
                                                        value={
                                                            values.guestEndEndPlace ??
                                                            undefined
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
                                                        Gastfahrt End Zeit :
                                                    </Label>
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
                                                            value={
                                                                values.guestEndEndTime ??
                                                                undefined
                                                            }
                                                            onChange={(e) => {
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
                                                Zurück
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="ml-4"
                                            >
                                                Speichern
                                            </Button>
                                          
                                        </div>
                                    </Form>
                                );
                            }}
                        </Formik>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
