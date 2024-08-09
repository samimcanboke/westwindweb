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
    Spinner,
} from "flowbite-react";

import * as Yup from "yup";
import moment from "moment";
import Swal from "sweetalert2";

export default function Dashboard({ auth }) {
    const [filterActive, setFilterActive] = useState(true);
    const [values, setValues] = useState({});
    const [drivers, setDrivers] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [filter, setFilter] = useState({});
    const [gesamt, setGesamt] = useState(false);
    const [filterSources, setFilterSources] = useState({
        user: "",
        client: "",
        month: "",
        year: "",
    });
    const [data, setData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

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



    useEffect(() => {
        axios.get("finalized-filter").then((res) => {
            if (res.status == 200) {
                setFilterSources({
                    user: res.data.users,
                    client: res.data.clients,
                    month: res.data.months,
                    year: res.data.year,
                });
            }
        });
        axios.get(route("users.show")).then((res) => {
            setDrivers(res.data);
            //console.log(res.data);
        });
        axios.get("/clients").then((res) => {
            setClients(res.data);
            //console.log(res.data);
        });
    }, []);

    const edit = async (job) => {
        let editingDraft = job;
        console.log(job);
        try {
            editingDraft.breaks = JSON.parse(job.breaks);
        } catch (e) {
            console.log(e);
        }
        setValues(camelCase(editingDraft));
        setShowEdit(true);
    };

    const handleChange = (e) => {
        let key = e.target.id;
        let value = e.target.value;
        setFilter((filter) => ({
            ...filter,
            [key]: value,
        }));
    };

    const filterAction = () => {
        setLoading(true);
        if (filter.client == "") {
            Swal.fire({
                icon: "error",
                title: "Hata",
                text: "Bitte wählen Sie einen Kunden",
            });
            return;
        }
        if (filter.year == "") {
            Swal.fire({
                icon: "error",
                title: "Hata",
                text: "Bitte wählen Sie ein Jahr",
            });
            return;
        }
        if (filter.month == "") {
            Swal.fire({
                icon: "error",
                title: "Hata",
                text: "Bitte wählen Sie einen Monat",
            });
            return;
        }
        setIsSubmitting(true);
        axios.post(route("get-confirmed-jobs"), filter).then((res) => {
            if (res.data.status) {
                setLoading(false);
                setFilterActive(false);
                setIsSubmitting(false);
                setData(res.data.data);
            }
        });
    };

    const excelAction = () => {
        setIsSubmitting(true);
        if (gesamt) {

            axios
                .post("/finalized-jobs/get-total-report", {
                    month: filter.month,
                    year: filter.year,
                    total: gesamt,
                })
                .then((res) => {
                    setIsSubmitting(false);
                    if (res.data.status) {
                        let url = "/download-pdf/" + res.data.file + ".pdf";
                        window.open(url, "_blank", "noreferrer");
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "Hata",
                            text: "Onaylanan İş Bulunamadı",
                        });
                    }
                });
        } else {
            axios
                .post("/finalized-jobs/export", {
                    user_id: filter.user,
                    client_id: filter.client,
                    month: filter.month,
                    year: filter.year,
                    total: gesamt,
                })
                .then((res) => {
                    setIsSubmitting(false);
                    if (res.data.status) {
                        let url = "/download-pdf/" + res.data.file + ".pdf";
                        window.open(url, "_blank", "noreferrer");
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "Hata",
                            text: "Onaylanan İş Bulunamadı",
                        });
                    }
                });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Monats Berichte
                </h2>
            }
        >
            <Head title="Confirmed Jobs" />
            <div className="container mx-auto">
                <div className="flex justify-between flex-row p-5">
                    <div className="max-w-full">
                        <div className="mb-2 block">
                            <Label htmlFor="id" value="Gesamt Report" />
                        </div>
                        <ToggleSwitch
                            checked={gesamt}
                            label=""
                            disabled={!filterActive}
                            id="gesamt"
                            name="gesamt"
                            className="mt-4 ml-4"
                            onChange={(value) => {
                                setGesamt(value);
                            }}
                        />
                    </div>
                    {!gesamt && (
                        <div className="max-w-full">
                            <div className="mb-2 block">
                                <Label htmlFor="client" value="Kunden" />
                            </div>
                            <Select
                                id="client"
                                onChange={handleChange}
                                disabled={!filterActive}
                            >
                                <option>Suchen...</option>
                                {filterSources.client &&
                                    filterSources.client.map((client) => (
                                        <option
                                            key={client.id}
                                            value={client.id}
                                        >
                                            {client.name}
                                        </option>
                                    ))}
                            </Select>
                        </div>
                    )}
                    {!gesamt && (
                        <div className="max-w-full">
                            <div className="mb-2 block">
                                <Label htmlFor="id" value="Mitarbeiten" />
                            </div>
                            <Select
                                id="user"
                                onChange={handleChange}
                                disabled={!filterActive}
                            >
                                <option>Seçiniz...</option>
                                {filterSources.user &&
                                    filterSources.user.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name}
                                        </option>
                                    ))}
                            </Select>
                        </div>
                    )}

                    <div className="max-w-full">
                        <div className="mb-2 block">
                            <Label htmlFor="id" value="Monat" />
                        </div>
                        <Select
                            id="month"
                            onChange={handleChange}
                            disabled={!filterActive}
                        >
                            <option id="">Seçiniz...</option>
                            {filterSources.month &&
                                filterSources.month.map((month, index) => (
                                    <option key={index} value={index + 1}>
                                        {month}
                                    </option>
                                ))}
                        </Select>
                    </div>
                    <br />
                    <div className="max-w-full">
                        <div className="mb-2 block">
                            <Label htmlFor="id" value="Jahr" />
                        </div>
                        <Select
                            id="year"
                            onChange={handleChange}
                            disabled={!filterActive}
                        >
                            <option>Seçiniz...</option>
                            {filterSources.year &&
                                filterSources.year.map((year, index) => (
                                    <option key={index} value={year}>
                                        {year}
                                    </option>
                                ))}
                        </Select>
                    </div>

                    <br />

                    {!gesamt && (
                        <div className="max-w-full flex mt-8">
                            <div className="mb-2 block">
                                {filterActive ? (
                                    isSubmitting ? (
                                        <Button disabled>
                                            <Spinner
                                                aria-label="Spinner button example"
                                                size="sm"
                                            />
                                            <span className="pl-3">
                                                Loading...
                                            </span>
                                        </Button>
                                    ) : (
                                        <Button onClick={filterAction}>
                                            Datei Abrufen
                                        </Button>
                                    )
                                ) : isSubmitting ? (
                                    <Button disabled>
                                        <Spinner
                                            aria-label="Spinner button example"
                                            size="sm"
                                        />
                                        <span className="pl-3">Loading...</span>
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => {
                                            setFilterActive(true);
                                            setValues({});
                                            setData([]);
                                        }}
                                    >
                                        Filter zurücksetzen
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {gesamt && (
                        <div className="mt-8 block">
                            {isSubmitting ? (
                                <Button disabled>
                                    <Spinner
                                        aria-label="Spinner button example"
                                        size="sm"
                                    />
                                    <span className="pl-3">Loading...</span>
                                </Button>
                            ) : (
                                <Button onClick={excelAction}>
                                    Gesamt Report
                                </Button>
                            )}
                        </div>
                    )}

                    {!filterActive && (
                        <div className="max-w-full flex mt-8">
                            <div className="mb-2 block">
                                {isSubmitting ? (
                                    <Button disabled className="bg-red-500">
                                        <Spinner
                                            aria-label="Spinner button example"
                                            size="sm"
                                        />
                                        <span className="pl-3">Loading...</span>
                                    </Button>
                                ) : (
                                    <Button
                                        className="bg-red-500"
                                        onClick={excelAction}
                                    >
                                        Excel Export
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="container mx-auto">
                {data.length > 0 && (
                    <div>
                        <div className="overflow-x-auto">
                            <Table striped>
                                <Table.Head>
                                    <Table.HeadCell>
                                        Anfangsdatum
                                    </Table.HeadCell>
                                    <Table.HeadCell>Tour Name</Table.HeadCell>
                                    <Table.HeadCell>Fahrer ID</Table.HeadCell>
                                    <Table.HeadCell>Fahrer Name</Table.HeadCell>
                                    <Table.HeadCell>
                                        <span className="sr-only">
                                            Anzeigen
                                        </span>
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
                                <form>
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
                                                    )
                                                        .utc()
                                                        .startOf("00:00")
                                                        .format("DD.MM.YYYY")}
                                                />

                                                <br />
                                                <Label>Zug Nummer</Label>
                                                <input
                                                    id="zugNummer"
                                                    type="text"
                                                    placeholder="Zug Nummer"
                                                    name="zugNummer"
                                                    className={
                                                        "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border  rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                    }
                                                    onChange={(e) => {
                                                        setinputValue(
                                                            "zugNummer",
                                                            e.target.value
                                                        );
                                                    }}
                                                    value={values.zugNummer}
                                                />

                                                <br />
                                                <Label>Tour Name</Label>
                                                <input
                                                    id="tourName"
                                                    name="tourName"
                                                    type="text"
                                                    placeholder="T-123"
                                                    onChange={(e) => {
                                                        setinputValue(
                                                            "tourName",
                                                            e.target.value
                                                        );
                                                    }}
                                                    className={
                                                        "placeholder:italic placeholder:text-slate-400 block bg-white w-full border  rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                    }
                                                />

                                                <br />
                                                <Label>Lok Nummer</Label>
                                                <input
                                                    id="locomotiveNumber"
                                                    name="locomotiveNumber"
                                                    type="text"
                                                    placeholder="L123123"
                                                    onChange={(e) => {
                                                        setinputValue(
                                                            "locomotiveNumber",
                                                            e.target.value
                                                        );
                                                    }}
                                                    className={
                                                        "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border  rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                    }
                                                />

                                                <br />

                                                <ToggleSwitch
                                                    checked={values.cancel}
                                                    label="Storniert"
                                                    id="cancel"
                                                    name="cancel"
                                                    onChange={(value) => {
                                                        setinputValue(
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
                                                    label="Unterkunft"
                                                    id="accomodation"
                                                    name="accomodation"
                                                    onChange={(value) => {
                                                        if (value) {
                                                            setinputValue(
                                                                "feedingFee",
                                                                32
                                                            );
                                                        }
                                                        setinputValue(
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
                                                        setinputValue(
                                                            "bereitschaft",
                                                            value
                                                        );
                                                    }}
                                                />
                                                <br />
                                                <ToggleSwitch
                                                    checked={values.learning}
                                                    label="Streckenkunde"
                                                    id="learning"
                                                    name="learning"
                                                    onChange={(value) => {
                                                        setinputValue(
                                                            "learning",
                                                            value
                                                        );
                                                    }}
                                                />
                                                <br />
                                                <ToggleSwitch
                                                    checked={values.extra}
                                                    label="Extra"
                                                    id="extra"
                                                    name="extra"
                                                    onChange={(value) => {
                                                        setinputValue(
                                                            "extra",
                                                            value
                                                        );
                                                    }}
                                                />
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
                                                        "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border  rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                    }
                                                    onChange={(e) => {
                                                        setinputValue(
                                                            "comment",
                                                            e.target.value
                                                        );
                                                    }}
                                                />
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
                                                            setinputValue(
                                                                "clientId",
                                                                e.target.value
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
                                                                (client) => (
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
                                                            setinputValue(
                                                                "feedingFee",
                                                                e.target.value
                                                            );
                                                        }}
                                                        required
                                                        value={
                                                            values.feedingFee ??
                                                            ""
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
                                                Gastfahrt
                                            </AccordionTitle>
                                            <AccordionContent>
                                                <Label>Gastfahrt Beginn</Label>
                                                <input
                                                    id="guestStartPlace"
                                                    name="guestStartPlace"
                                                    type="text"
                                                    placeholder="Gastfahrt Beginn"
                                                    onChange={(e) => {
                                                        setinputValue(
                                                            "guestStartPlace",
                                                            e.target.value
                                                        );
                                                    }}
                                                    className={
                                                        "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border  rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                    }
                                                    value={
                                                        values.guestStartPlace ??
                                                        undefined
                                                    }
                                                />
                                                <br />

                                                <Label>Gastfahrt Start</Label>
                                                <div className="flex">
                                                    <input
                                                        type="time"
                                                        id="guestStartTime"
                                                        name="guestStartTime"
                                                        className={
                                                            "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        }
                                                        value={
                                                            values.guestStartTime ??
                                                            undefined
                                                        }
                                                        onChange={(e) => {
                                                            setinputValue(
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
                                                <br />
                                                <Label>Gastfahrt Ende</Label>
                                                <input
                                                    id="guestStartEndPlace"
                                                    name="guestStartEndPlace"
                                                    type="text"
                                                    placeholder="Gastfahrt Ende"
                                                    onChange={(e) => {
                                                        setinputValue(
                                                            "guestStartEndPlace",
                                                            e.target.value
                                                        );
                                                    }}
                                                    className={
                                                        "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border  rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                    }
                                                    value={
                                                        values.guestStartEndPlace ??
                                                        undefined
                                                    }
                                                />
                                                <br />

                                                <Label>Gastfahrt Ende</Label>
                                                <div className="flex">
                                                    <input
                                                        type="time"
                                                        id="guestStartEndTime"
                                                        name="guestStartEndTime"
                                                        className={
                                                            "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        }
                                                        value={
                                                            values.guestStartEndTime ??
                                                            undefined
                                                        }
                                                        onChange={(e) => {
                                                            setinputValue(
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
                                                <Label>Startort</Label>
                                                <input
                                                    id="workStartPlace"
                                                    name="workStartPlace"
                                                    type="text"
                                                    placeholder="Startort"
                                                    onChange={(e) => {
                                                        setinputValue(
                                                            "workStartPlace",
                                                            e.target.value
                                                        );
                                                    }}
                                                    className={
                                                        "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border  rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                    }
                                                    value={
                                                        values.workStartPlace ??
                                                        undefined
                                                    }
                                                />
                                                <br />

                                                <Label>Anfangszeit:</Label>
                                                <div className="flex">
                                                    <input
                                                        type="time"
                                                        name="workStartTime"
                                                        id="workStartTime"
                                                        className={
                                                            "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        }
                                                        value={
                                                            values.workStartTime ??
                                                            undefined
                                                        }
                                                        onChange={(e) => {
                                                            setinputValue(
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
                                                        setinputValue(
                                                            "trainStartPlace",
                                                            e.target.value
                                                        );
                                                    }}
                                                    className={
                                                        "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border  rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                    }
                                                    value={
                                                        values.trainStartPlace ??
                                                        undefined
                                                    }
                                                />
                                                <br />

                                                <Label>Zug Abfahrtszeit:</Label>
                                                <div className="flex">
                                                    <input
                                                        type="time"
                                                        id="trainStartTime"
                                                        name="trainStartTime"
                                                        className={
                                                            "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        }
                                                        value={
                                                            values.trainStartTime ??
                                                            undefined
                                                        }
                                                        onChange={(e) => {
                                                            setinputValue(
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
                                                <Label>Zug Ankunftsort</Label>
                                                <input
                                                    id="trainEndPlace"
                                                    name="trainEndPlace"
                                                    type="text"
                                                    placeholder="Zug Ankunftsort"
                                                    onChange={(e) => {
                                                        setinputValue(
                                                            "trainEndPlace",
                                                            e.target.value
                                                        );
                                                    }}
                                                    className={
                                                        "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border  rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                    }
                                                    value={
                                                        values.trainEndPlace ??
                                                        undefined
                                                    }
                                                />
                                                <br />

                                                <Label>Zug Ankunftszeit:</Label>
                                                <div className="flex">
                                                    <input
                                                        type="time"
                                                        id="trainEndTime"
                                                        name="trainEndTime"
                                                        className={
                                                            "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        }
                                                        value={
                                                            values.trainEndTime ??
                                                            undefined
                                                        }
                                                        onChange={(e) => {
                                                            setinputValue(
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
                                                <inputArray name="breaks">
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
                                                                                <input
                                                                                    name={`breaks.${index}.start`}
                                                                                    type="time"
                                                                                    className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                                                    onChange={(
                                                                                        e
                                                                                    ) => {
                                                                                        setinputValue(
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
                                                                                <input
                                                                                    name={`breaks.${index}.end`}
                                                                                    type="time"
                                                                                    className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                                                    onChange={(
                                                                                        e
                                                                                    ) => {
                                                                                        setinputValue(
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
                                                                                <input
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
                                                                                        setinputValue(
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
                                                                                <input
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
                                                                                        setinputValue(
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
                                                </inputArray>
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
                                                <Label>Arbeitsende Ort</Label>
                                                <input
                                                    id="workEndPlace"
                                                    type="text"
                                                    placeholder="Arbeitsende Ort"
                                                    onChange={(e) => {
                                                        setinputValue(
                                                            "workEndPlace",
                                                            e.target.value
                                                        );
                                                    }}
                                                    className={
                                                        "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border  rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                    }
                                                    value={
                                                        values.workEndPlace ??
                                                        undefined
                                                    }
                                                />

                                                <br />

                                                <Label>Arbeitsende Zeit:</Label>
                                                <div className="flex">
                                                    <input
                                                        type="time"
                                                        id="workEndTime"
                                                        className={
                                                            "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        }
                                                        value={
                                                            values.workEndTime ??
                                                            undefined
                                                        }
                                                        onChange={(e) => {
                                                            setinputValue(
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
                                                </div>
                                            </AccordionContent>
                                        </AccordionPanel>
                                    </Accordion>
                                    <Accordion>
                                        <AccordionPanel />
                                        <AccordionPanel isOpen={false}>
                                            <AccordionTitle>
                                                Rückkehr des Gastes nach Hause
                                            </AccordionTitle>
                                            <AccordionContent>
                                                <Label>
                                                    Gastfahrt Start Ort
                                                </Label>
                                                <input
                                                    id="guestEndPlace"
                                                    type="text"
                                                    placeholder="Gastfahrt Start Ort"
                                                    onChange={(e) => {
                                                        setinputValue(
                                                            "guestEndPlace",
                                                            e.target.value
                                                        );
                                                    }}
                                                    className={
                                                        "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border  rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                    }
                                                    value={
                                                        values.guestEndPlace ??
                                                        undefined
                                                    }
                                                />

                                                <br />

                                                <Label>
                                                    Gastfahrt Start Zeit
                                                </Label>
                                                <div className="flex">
                                                    <input
                                                        type="time"
                                                        id="guestEndTime"
                                                        className={
                                                            "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        }
                                                        value={
                                                            values.guestEndTime ??
                                                            undefined
                                                        }
                                                        onChange={(e) => {
                                                            setinputValue(
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
                                                </div>
                                                <br />
                                                <Label>Gastfahrt End Ort</Label>
                                                <input
                                                    id="guestEndEndPlace"
                                                    type="text"
                                                    placeholder="Gastfahrt End Ort"
                                                    onChange={(e) => {
                                                        setinputValue(
                                                            "guestEndEndPlace",
                                                            e.target.value
                                                        );
                                                    }}
                                                    className={
                                                        "placeholder:italic placeholder:text-slate-4000 block bg-white w-full border  rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                                    }
                                                    value={
                                                        values.guestEndEndPlace ??
                                                        undefined
                                                    }
                                                />

                                                <br />

                                                <Label>
                                                    Gastfahrt End Zeit :
                                                </Label>
                                                <div className="flex">
                                                    <input
                                                        type="time"
                                                        id="guestEndEndTime"
                                                        className={
                                                            "rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        }
                                                        value={
                                                            values.guestEndEndTime ??
                                                            undefined
                                                        }
                                                        onChange={(e) => {
                                                            setinputValue(
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
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
