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
    Button,
    Table,
} from "flowbite-react";
import Swal from "sweetalert2";
import { Formik, Field, FieldArray, Form } from "formik";
import * as Yup from "yup";

export default function DraftJobs({ auth }) {
    const [data, setData] = useState([]);
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
        workStartTime: Yup.string().required("Required"),
        workEndTime: Yup.string().required("Required"),
    });


    const camelCase = (obj) => {
        var newObj = {};
        for (const d in obj) {
          if (obj.hasOwnProperty(d)) {
            newObj[d.replace(/(\_\w)/g, function(k) {
              return k[1].toUpperCase();
            })] = obj[d];
          }
        }
        return newObj;
      }
    const snakeCase = (obj) => {
        var newObj = {};
        for (const d in obj) {
            if (obj.hasOwnProperty(d)) {
                newObj[d.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()] = obj[d];
            }
        }
        return newObj;
    }

    const edit = (draft) => {
        let editingDraft = draft;
        editingDraft.breaks = JSON.parse(draft.breaks);
        setValues(camelCase(editingDraft));
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
                Swal.fire("Başarılı", "Taslak Yönetime gönderildi.", "success");
            });
    };

    useEffect(() => {
        axios.get("/data-draft-jobs").then((res) => {
            setData(res.data);
            setLoading(false);
        });
        axios.get("/clients").then((res) => {
            if(res.status  == 200){
                setClient(res.data);
            }
        });
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    DraftJobs
                </h2>
            }
        >
            <Head title="DraftJobs" />

            {data.length == 0 && (
                <div className="flex justify-center items-center h-48">
                    Hiç veri bulunamadı.
                </div>
            )}

            {data.length > 0 && (
                <div>
                    <div className="overflow-x-auto">
                        <Table striped>
                            <Table.Head>
                                <Table.HeadCell>Initial Date</Table.HeadCell>
                                <Table.HeadCell>Tour Name</Table.HeadCell>
                                <Table.HeadCell>
                                    <span className="sr-only">Edit</span>
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
                                                {draft.initial_date}
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
                                                    Delete
                                                </a>{" "}
                                                <br /> <br /> <br />
                                                <a
                                                    href="#"
                                                    className="font-medium text-cyan-600 hover:underline dark:text-cyan-500"
                                                    onClick={() => {
                                                        edit(draft);
                                                    }}
                                                >
                                                    Edit
                                                </a>{" "}
                                                <br /> <br /> <br />
                                                <a
                                                    href="#"
                                                    className="font-medium text-cyan-600 hover:underline dark:text-cyan-500"
                                                    onClick={() => {
                                                        sendSubmit(draft.id);
                                                    }}
                                                >
                                                    Submit
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
                                <p>Edit Information</p>
                            </div>
                            <Formik
                                initialValues={values}
                                enableReinitialize={true}
                                validationSchema={validationSchema}
                                onSubmit={(values, { setSubmitting }) => {
                                    setSubmitting(true);
                                    setLoading(true);
                                    axios
                                        .post("/update-draft-jobs", snakeCase(values))
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
                                    
                                    return (<Form onSubmit={handleSubmit}>
                                        <Accordion>
                                            <AccordionPanel isOpen={false}>
                                                <AccordionTitle>
                                                    General Information
                                                </AccordionTitle>
                                                <AccordionContent>
                                                    <Label>Start Date</Label>
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
                                                    <Label>
                                                        Locomotive Number
                                                    </Label>
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

                                                    <ToggleSwitch
                                                        checked={values.cancel}
                                                        label="Cancel"
                                                        id="cancel"
                                                        name="cancel"
                                                        onChange={(value) => {
                                                            setFieldValue(
                                                                "cancel",
                                                                value
                                                            );
                                                        }}
                                                    />

                                                    <br />

                                                    <ToggleSwitch
                                                        checked={
                                                            values.accomodation
                                                        }
                                                        label="Accomodation"
                                                        id="accomodation"
                                                        name="accomodation"
                                                        onChange={(value) => {
                                                            if (value) {
                                                                setFieldValue(
                                                                    "feedingFee",
                                                                    32
                                                                );
                                                            }
                                                            setFieldValue(
                                                                "accomodation",
                                                                value
                                                            );
                                                        }}
                                                    />
                                                    <br />
                                                    <ToggleSwitch
                                                        checked={
                                                            values.bereitschaft
                                                        }
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
                                                    <Label>Comment</Label>
                                                    <Textarea
                                                        id="comment"
                                                        name="comment"
                                                        placeholder="Leave a comment..."
                                                        
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
                                                    >{values.comment}</Textarea>
                                                    {errors.comment &&
                                                        touched.comment && (
                                                            <p className="text-red-500">
                                                                *
                                                                {errors.comment}
                                                            </p>
                                                        )}

                                                    <br />
                                                    <div className="max-w-md">
                                                        <div className="mb-2 block">
                                                            <Label
                                                                htmlFor="client"
                                                                value="Select your client"
                                                            />
                                                        </div>
                                                        <Select
                                                            id="client"
                                                            name="client"
                                                            required
                                                            onChange={(e) => {
                                                                setFieldValue(
                                                                    "client",
                                                                    e.target
                                                                        .value
                                                                );
                                                            }}
                                                            value={values.clientId}
                                                        >
                                                             <option>Seçiniz...</option>
                                                {client.map((client) => (
                                                    <option key={client.id} value={client.id}>{client.name}</option>
                                                ))}
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
                                                                value="Select your feeding Fee"
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
                                                                values.feedingFee
                                                            }
                                                        >
                                                            <option value={0}>
                                                                0€
                                                            </option>
                                                            <option value={16}>
                                                                16€
                                                            </option>
                                                            <option value={32}>
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
                                                    Misafir Gidişi
                                                </AccordionTitle>
                                                <AccordionContent>
                                                    <Label>
                                                        Nereden Gittiği
                                                    </Label>
                                                    <Field
                                                        id="guestStartPlace"
                                                        name="guestStartPlace"
                                                        type="text"
                                                        placeholder="Zug Nummer"
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

                                                    <Label>Gidiş Saat:</Label>
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
                                                                values.guestStartTime
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
                                                    <Label>Varış Yeri</Label>
                                                    <input
                                                        id="guestStartEndPlace"
                                                        name="guestStartEndPlace"
                                                        type="text"
                                                        placeholder="Varış Yeri"
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
                                                            values.guestStartEndPlace
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

                                                    <Label>Varış Saati:</Label>
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
                                                                values.guestStartEndTime
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
                                                    İş Başlangıcı
                                                </AccordionTitle>
                                                <AccordionContent>
                                                    <Label>
                                                        Başlangıç Yeri
                                                    </Label>
                                                    <input
                                                        id="workStartPlace"
                                                        name="workStartPlace"
                                                        type="text"
                                                        placeholder="İş Başlangıcı"
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
                                                        value={
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
                                                        Başlangıç Saat:
                                                    </Label>
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
                                                                values.workStartTime
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
                                                    Tren Kalkış ve Varış
                                                </AccordionTitle>
                                                <AccordionContent>
                                                    <Label>
                                                        Tren Kalkış Yeri
                                                    </Label>
                                                    <input
                                                        id="trainStartPlace"
                                                        name="trainStartPlace"
                                                        type="text"
                                                        placeholder="Tren Kalkış Yeri"
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
                                                        value={
                                                            values.trainStartPlace
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
                                                        Tren Kalkış Saati:
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
                                                                values.trainStartTime
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
                                                    <Label>
                                                        Tren Varış Yeri
                                                    </Label>
                                                    <input
                                                        id="trainEndPlace"
                                                        name="trainEndPlace"
                                                        type="text"
                                                        placeholder="Tren Varış Yeri"
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
                                                        value={
                                                            values.trainEndPlace
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
                                                        Tren Varış Saati:
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
                                                                values.trainEndTime
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
                                                    Mola
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
                                                                {values.breaks && values.breaks
                                                                    .length >
                                                                    0 &&
                                                                    values.breaks.map(
                                                                        (
                                                                            breakItem,
                                                                            index
                                                                        ) => {
                                                                            return  (
                                                                            
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
                                                                                    <Select
                                                                        name={`breaks.${index}.start`}
                                                                        type="time"
                                                                        value={breakItem.start}
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
                                                                                        Break
                                                                                        End
                                                                                    </label>
                                                                                    <Select
                                                                        name={`breaks.${index}.end`}
                                                                        type="time"
                                                                        value={breakItem.end}
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
                                                                                    Sil
                                                                                </button>
                                                                            </div>
                                                                        )}
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
                                                    İş Bitişi
                                                </AccordionTitle>
                                                <AccordionContent>
                                                    <Label>İş Bitiş Yeri</Label>
                                                    <input
                                                        id="workEndPlace"
                                                        type="text"
                                                        placeholder="İş Başlangıcı"
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
                                                        value={
                                                            values.workEndPlace
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
                                                        İş Bitiş Saat:
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
                                                                values.workEndTime
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
                                                    Misafir Eve Dnş
                                                </AccordionTitle>
                                                <AccordionContent>
                                                    <Label>
                                                        Nereden Gittiği
                                                    </Label>
                                                    <input
                                                        id="guestEndPlace"
                                                        type="text"
                                                        placeholder="Şehir"
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
                                                            values.guestEndPlace
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

                                                    <Label>Gidiş Saat:</Label>
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
                                                                values.guestEndTime
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
                                                    <Label>Varış Yeri</Label>
                                                    <input
                                                        id="guestEndEndPlace"
                                                        type="text"
                                                        placeholder="Varış Şehri"
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
                                                            values.guestEndEndPlace
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

                                                    <Label>Gidiş Saat:</Label>
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
                                                                values.guestEndEndTime
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
                                                İptal
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="ml-4"
                                            >
                                                Kaydet
                                            </Button>
                                        </div>
                                    </Form>)
                                }
                                }
                            </Formik>
                        </div>
                    )}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
