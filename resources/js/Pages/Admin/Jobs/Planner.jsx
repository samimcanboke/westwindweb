import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import Timeline from "react-calendar-timeline";
import "react-calendar-timeline/lib/Timeline.css";
import moment from "moment";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button, Modal, Select, Datepicker } from "flowbite-react";
import interact from "interactjs";

export default function Planner({ auth }) {
    const [jobs, setJobs] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [driver, setDriver] = useState(null);
    const [job, setJob] = useState(null);
    const [editingJob, setEditingJob] = useState({});
    const [users, setUsers] = useState([]);
    const [userJobs, setUserJobs] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [openSickModal, setOpenSickModal] = useState(false);
    const [sickDate, setSickDate] = useState("");
    const [sickDriver, setSickDriver] = useState(0);

    const deleteFromuser = async (id) => {
        let job = jobs.find((job) => job.id === id);
        console.log(job);
        await axios
            .put(route("planner-jobs-leave", { id: id }), {
                ...job,
                user_id: null,
            })
            .then((response) => {
                console.log(response.data);
                getPlans();
                getUsersJobs();
                if (openDetailModal) {
                    setOpenDetailModal(false);
                }
            });
    };

    const getPlans = async () => {
        await axios.get("/planner/jobs").then((response) => {
            setJobs(response.data);
        });
    };

    const showModal = (type) => {
        switch (type) {
            case "sick":
                setOpenSickModal(true);
                break;
            case "holiday":
                break;
            default:
                console.log(type);
        }
    };

    const getUsersJobs = async () => {
        await axios.get("/planner/jobs/get-users-jobs").then((response) => {
            let newJobList = [];
            response.data.map((job) => {
                let newJobs = {
                    id: job.id,
                    group: job.user_id,
                    start_time: moment(job.start_date + " " + job.start_time),
                    end_time: moment(job.end_date + " " + job.end_time),
                    title: job.from + " - " + job.to + "|" + job.id,
                    itemProps: {
                        "data-custom-attribute": "Random content",
                        "aria-hidden": true,
                        onDoubleClick: async (itemId) => {
                            try {
                                let item =
                                    itemId.target.parentElement.getAttribute(
                                        "title"
                                    );
                                let id = item.split("|")[1];
                                let job = await axios.get(
                                    "/planner/jobs/show/" + id
                                );
                                console.log(job.data);
                                if (job.status === 200) {
                                    setOpenDetailModal(true);
                                    setEditingJob(job.data);
                                }
                            } catch (e) {
                                console.log(e);
                            }
                        },
                        className: "weekend",
                        style: {
                            background: "fuchsia",
                            zIndex: 49,
                        },
                        itemIdKey: "id",
                        itemTitleKey: "title",
                    },
                };
                newJobList.push(newJobs);
            });
            setUserJobs(newJobList);
            console.log(userJobs);
        });
    };

    const getUsers = async () => {
        await axios.get(route("users.show")).then((response) => {
            let newUserList = [];
            response.data.map((user) => {
                newUserList.push({ id: user.id, title: user.name });
            });
            setUsers(newUserList);
        });
    };

    const routeToEdit = (id) => {
        window.location.href = route("planner-jobs-edit", { id: id });
    };
    const setMachinist = async () => {
        setDriver(driver);
        await axios
            .put("/planner/jobs/" + driver, {
                ...job,
                user_id: driver,
            })
            .then((response) => {
                console.log(response);
                getPlans();
                getUsersJobs();
                setOpenModal(false);
            });
    };

    useEffect(() => {
        getPlans();
        getUsers();
        getUsersJobs();

        axios.get(route("users.show")).then((response) => {
            setDrivers(response.data);
        });
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Planung
                </h2>
            }
        >
            <Modal show={openModal} onClose={() => setOpenModal(false)}>
                <Modal.Header>Makinist Seç</Modal.Header>
                <Modal.Body>
                    <div className="space-y-6">
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-4000">
                            Müsait Makinistler
                        </p>
                        <Select
                            className="w-full"
                            onChange={(e) => setDriver(e.target.value)}
                        >
                            <option>Seçiniz</option>
                            {drivers &&
                                drivers.map((driver) => (
                                    <option key={driver.id} value={driver.id}>
                                        {driver.name}
                                    </option>
                                ))}
                        </Select>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={setMachinist}>Atama Yap</Button>
                    <Button color="gray" onClick={() => setOpenModal(false)}>
                        İptal
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={openDetailModal}
                onClose={() => setOpenDetailModal(false)}
            >
                <Modal.Header>İş Detayları</Modal.Header>
                <Modal.Body>
                    <div className="space-y-6">
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-4000">
                            Start Date : {editingJob.start_date}
                            <br />
                            Start Time : {editingJob.start_time}
                            <br />
                            End Date : {editingJob.end_date}
                            <br />
                            End Time : {editingJob.end_time}
                            <br />
                            Zug Nr : {editingJob.zug_nummer}
                            <br />
                            Lokomotive Nr : {editingJob.locomotive_nummer}
                            <br />
                            Tour Name : {editingJob.tour_name}
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        color="green"
                        onClick={() => routeToEdit(editingJob.id)}
                    >
                        Düzenle
                    </Button>
                    <Button
                        color="red"
                        onClick={() => deleteFromuser(editingJob.user_id)}
                    >
                        İşten Çıkar
                    </Button>
                    <Button
                        color="gray"
                        onClick={() => setOpenDetailModal(false)}
                    >
                        İptal
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={openSickModal}
                size={"5xl"}
                style={{ zIndex: 9999999 }}
                onClose={() => setOpenSickModal(false)}
            >
                <Modal.Header>Hastalık İzni Ekle</Modal.Header>
                <Modal.Body>
                    <div className="space-y-2">
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-4000">
                            Tarih
                        </p>
                        <div className="flex justify-between">
                            <Datepicker
                                inline
                                language="de-DE"
                                labelTodayButton="Heute"
                                labelClearButton="Löschen"
                                id="sickDate"
                                name="sickDate"
                                value={sickDate}
                                onSelectedDateChanged={(date) => {
                                    setSickDate(date);
                                }}
                            />

                            <div
                                className="flex flex-row gap-2 justify-center"
                                style={{ maxHeight: 50 }}
                            >
                                <input
                                    type="time"
                                    id="sickStartTime"
                                    name="sickStartTime"
                                    className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    value={""}
                                    onChange={(e) => {
                                        console.log(e);
                                    }}
                                />
                                <p className="justify-self-center">bis</p>
                                <input
                                    type="time"
                                    id="sickEndTime"
                                    name="sickEndTime"
                                    className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    value={""}
                                    onChange={(e) => {
                                        console.log(e);
                                    }}
                                />
                            </div>

                            <Datepicker
                                inline
                                language="de-DE"
                                labelTodayButton="Heute"
                                labelClearButton="Löschen"
                                id="sickDate"
                                name="sickDate"
                                value={sickDate}
                                onSelectedDateChanged={(date) => {
                                    setSickDate(date);
                                }}
                            />
                        </div>
                        <br />
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-4000">
                            Makinist
                        </p>
                        <Select
                            className="w-full mb-10"
                            onChange={(e) => setSickDriver(e.target.value)}
                        >
                            <option>Seçiniz</option>
                            {drivers &&
                                drivers.map((driver) => (
                                    <option key={driver.id} value={driver.id}>
                                        {driver.name}
                                    </option>
                                ))}
                        </Select>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={setMachinist}>Atama Yap</Button>
                    <Button color="gray" onClick={() => setOpenModal(false)}>
                        İptal
                    </Button>
                </Modal.Footer>
            </Modal>
            <Head title="Planner" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 table-responsive">
                                <caption className="p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-white dark:bg-gray-800">
                                    <div className="flex justify-between align-middle">
                                        <div>
                                            {" "}
                                            Arbeitsliste
                                            <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                                                Die Aufgabenliste wird unten
                                                aufgeführt.
                                            </p>
                                        </div>
                                        <div>
                                            <a
                                                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                                href={route("clients.new-job")}
                                            >
                                                Neu Hinzufügen
                                            </a>
                                        </div>
                                    </div>
                                </caption>

                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">
                                            Startdatum - Enddatum
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Anfangszeit - Endzeit
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Von - Nach
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Lokomotive Nr - Zug Nr - Tour Name
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Makinist
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                        
                                                Zuweisung
                                        
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                        
                                                Edit
                                        
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jobs &&
                                        jobs.length > 0 &&
                                        jobs.map((job) => (
                                            <tr
                                                key={job.id}
                                                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                            >
                                                <th
                                                    scope="row"
                                                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                                >
                                                    {job.start_date} -{" "}
                                                    {job.end_date}
                                                </th>
                                                <td className="px-6 py-4">
                                                    {job.start_time} -{" "}
                                                    {job.end_time}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {job.from} - {job.to}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {job.locomotive_nummer} -{" "}
                                                    {job.zug_nummer} -{" "}
                                                    {job.tour_name}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {job.user_id}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {job.user_id == null ? (
                                                        <button
                                                            onClick={() => {
                                                                setJob(job);
                                                                setOpenModal(
                                                                    true
                                                                );
                                                            }}
                                                            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                                        >
                                                            Zuweisung
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                deleteFromuser(
                                                                    job.id
                                                                );
                                                            }}
                                                            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                                        >
                                                            Leave
                                                        </button>
                                                    )}
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => {
                                                            window.location.href = route("planner-jobs-edit", { id: job.id });
                                                        }}
                                                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline text-center"

                                                    >
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}

                                    {!jobs ||
                                        (jobs.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan="5"
                                                    style={{ height: "100px" }}
                                                    className="text-center"
                                                >
                                                    No jobs found
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        {userJobs &&
                            users &&
                            userJobs.length > 0 &&
                            users.length > 0 && (
                                <>
                                    <div className="flex justify-between mx-5 my-5">
                                        <Button
                                            onClick={() => showModal("sick")}
                                        >
                                            Hastalık
                                        </Button>
                                        <Button
                                            onClick={() => showModal("holiday")}
                                        >
                                            İzin
                                        </Button>
                                        <Button
                                            onClick={() =>
                                                showModal("relaxing")
                                            }
                                        >
                                            Dinlenme
                                        </Button>
                                    </div>
                                    <Timeline
                                        groups={users}
                                        items={userJobs}
                                        defaultTimeStart={moment().add(
                                            -256,
                                            "hour"
                                        )}
                                        defaultTimeEnd={moment().add(
                                            256,
                                            "hour"
                                        )}
                                        //visibleTimeStart={moment().add(-7,"day").for}
                                        //visibleTimeEnd={moment().add(+7,"day")}
                                    />
                                </>
                            )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
