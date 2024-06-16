import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import Timeline from "react-calendar-timeline";
import "@react-calendar-timeline/lib/Timeline.css";
import moment from "moment";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button, Modal, Select } from "flowbite-react";
import interact from 'interactjs';

const groups = [
    { id: 1, title: "Hüseyin Eroğlu" },

];

const items = [
    {
        id: 1,
        group: 1,
        title: "item 1",
        start_time: moment(),
        end_time: moment().add(1, "hour"),
    },
    {
        id: 3,
        group: 1,
        title: "item 3",
        start_time: moment().add(2, "hour"),
        end_time: moment().add(3, "hour"),
    },
];

export default function Planner({ auth }) {
    const [jobs, setJobs] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [driver, setDriver] = useState(null);
    const [job, setJob] = useState(null);
    const [users, setUsers] = useState([]);
    const [userJobs, setUserJobs] = useState([]);
    const [openModal, setOpenModal] = useState(false);

    const getPlans = async () => {
        await axios.get("/planner/jobs").then((response) => {
            setJobs(response.data);
        });
    };

    const getUsersJobs = async () => {
        await axios.get("/planner/jobs/get-users-jobs").then((response) => {
            let newJobList = [];
            response.data.map((job) => {
                let newJobs = {
                    id: job.id, 
                    group: job.user_id, 
                    start_time: moment(job.start_date + " " + job.start_time), 
                    end_time: moment(job.end_date + " " + job.end_time,), 
                    title: job.from + " - " + job.to,
                    itemProps: {
                        'data-custom-attribute': 'Random content',
                        'aria-hidden': true,
                        onDoubleClick: (itemId, e, time) => { console.log('You clicked double!',itemId, e, time) },
                        className: 'weekend',
                        style: {
                          background: 'fuchsia'
                        }
                    }
                }
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
                newUserList.push({id: user.id, title: user.name});
            });
            setUsers(newUserList);
        });
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
                setOpenModal(false);
            });
    };

    useEffect(() => {
        getPlans();
        getUsers();
        getUsersJobs();
        console.log(users, userJobs)
        axios.get(route("users.show")).then((response) => {
            setDrivers(response.data);
        });
    }, []);

    return (
        <>
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
            <AuthenticatedLayout
                user={auth.user}
                header={
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Planner
                    </h2>
                }
            >
                <Head title="Planner" />

                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                     

                            <div class="relative overflow-x-auto">
                                
                                
                                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 table-responsive">
                                    <caption className="p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-white dark:bg-gray-800">
                                        <div className="flex justify-between align-middle">
                                            <div>
                                                {" "}
                                                Jobs List
                                                <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                                                    İş Listesi aşağıda
                                                    listelenecektir.
                                                </p>
                                            </div>
                                            <div>
                                                <a
                                                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                                    href={route(
                                                        "clients.new-job"
                                                    )}
                                                >
                                                    Yeni Ekle
                                                </a>
                                            </div>
                                        </div>
                                    </caption>

                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-6 py-3"
                                            >
                                                Start Date - End Date
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3"
                                            >
                                                Başlangıç - Bitiş Saati
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3"
                                            >
                                                Nereden - Nereye
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3"
                                            >
                                                Lokomotif No - Tren No - Tur Adı
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3"
                                            >
                                                <span className="sr-only">
                                                    Atama
                                                </span>
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
                                                        {job.locomotive_nummer}{" "}
                                                        - {job.zug_nummer} -{" "}
                                                        {job.tour_name}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => {
                                                                setJob(job);
                                                                setOpenModal(
                                                                    true
                                                                );
                                                            }}
                                                            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                                        >
                                                            Atama
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}

                                            {!jobs || jobs.length === 0 && <tr><td colSpan="5" style={{height: "100px"}} className="text-center">No jobs found</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">

                        {userJobs && users && userJobs.length > 0 && users.length > 0 &&
                            <Timeline
                            groups={users}
                            items={userJobs}
                            defaultTimeStart={moment().add(-256, "hour")}
                            defaultTimeEnd={moment().add(256, "hour")}
                            //visibleTimeStart={moment().add(-7,"day").for}
                            //visibleTimeEnd={moment().add(+7,"day")}
                        />
                        }


                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    );
}
