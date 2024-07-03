import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import Timeline, {
    TimelineMarkers,
    CustomMarker,
    TodayMarker,
    CursorMarker,
    TimelineHeaders,
    SidebarHeader,
    DateHeader,
    CustomHeader,
} from "react-calendar-timeline";
import "react-calendar-timeline/lib/Timeline.css";
import moment from "moment";
import { useState, useEffect } from "react";
import axios from "axios";
import {
    Button,
    Modal,
    Select,
    Datepicker,
    ToggleSwitch,
} from "flowbite-react";
import Swal from "sweetalert2";
import interact from "interactjs";
import { MultiSelect } from "react-multi-select-component";
import "moment/locale/de";
import BorderStyle from "pdf-lib/cjs/core/annotation/BorderStyle";

export default function Planner({ auth }) {
    const [jobs, setJobs] = useState([]);
    const [withoutUserJobs, setWithoutUserJobs] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [driver, setDriver] = useState(null);
    const [job, setJob] = useState(null);
    const [editingJob, setEditingJob] = useState({});
    const [users, setUsers] = useState([]);
    const [userJobs, setUserJobs] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [openSickModal, setOpenSickModal] = useState(false);
    const [openAnnualLeaveModal, setOpenAnnualLeaveModal] = useState(false);
    const [openAdminExtraModal, setOpenAdminExtraModal] = useState(false);
    const [sickStartDate, setSickStartDate] = useState("");
    const [sickStartTime, setSickStartTime] = useState("");
    const [sickEndDate, setSickEndDate] = useState("");
    const [sickEndTime, setSickEndTime] = useState("");
    const [sickDriver, setSickDriver] = useState(0);
    const [annualLeaveStartDate, setAnnualLeaveStartDate] = useState("");
    const [annualLeaveStartTime, setAnnualLeaveStartTime] = useState("");
    const [annualLeaveEndDate, setAnnualLeaveEndDate] = useState("");
    const [annualLeaveEndTime, setAnnualLeaveEndTime] = useState("");
    const [annualLeaveDriver, setAnnualLeaveDriver] = useState(0);
    const [adminExtraStartDate, setAdminExtraStartDate] = useState("");
    const [adminExtraStartTime, setAdminExtraStartTime] = useState("");
    const [adminExtraEndDate, setAdminExtraEndDate] = useState("");
    const [adminExtraEndTime, setAdminExtraEndTime] = useState("");
    const [adminExtraDriver, setAdminExtraDriver] = useState(0);
    const [selectedUsersForTime, setSelectedUsersForTime] = useState([]);
    const [usersForTime, setUsersForTime] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [visibleTimeStart, setVisibleTimeStart] = useState(null);
    const [visibleTimeEnd, setVisibleTimeEnd] = useState(null);
    const [thisWeek, setThisWeek] = useState(false);
    const [nextWeek, setNextWeek] = useState(false);

    const format = {
        year: {
            long: "",
            mediumLong: "",
            medium: "",
            short: "",
        },
        month: {
            long: "MMMM",
            mediumLong: "MMMM",
            medium: "MMMM",
            short: "MM",
        },
        week: {
            long: "w",
            mediumLong: "w",
            medium: "w",
            short: "w",
        },
        day: {
            long: "dddd, LL",
            mediumLong: "dddd, LL",
            medium: "dd D",
            short: "D",
        },
        hour: {
            long: "dddd, LL, HH:00",
            mediumLong: "L, HH:00",
            medium: "HH:00",
            short: "HH",
        },
        minute: {
            long: "HH:mm",
            mediumLong: "HH:mm",
            medium: "HH:mm",
            short: "mm",
        },
        second: {
            long: "mm:ss",
            mediumLong: "mm:ss",
            medium: "mm:ss",
            short: "ss",
        },
    };

    const deleteFromuser = async (id) => {
        let oldJob = jobs.find((job) => job.id === id);
        await axios
            .put(route("planner-jobs-leave", { id: id }), {
                ...oldJob,
                user_id: null,
            })
            .then((response) => {
                getPlans();
                getPlansWithoutUser();
                getUsersJobs();
                if (openDetailModal) {
                    setOpenDetailModal(false);
                }
            });
    };

    const getPlans = async () => {
        await axios.get("/planner/jobs/").then((response) => {
            setJobs(response.data);
        });
    };

    const showCurrentWeek = () => {
        setVisibleTimeStart(moment().startOf("week"));
        setVisibleTimeEnd(moment().endOf("week"));
    };

    const getPlansWithoutUser = async () => {
        await axios.get("/planner/jobs/without-user").then((response) => {
            setWithoutUserJobs(response.data);
        });
    };

    const showModal = (type) => {
        switch (type) {
            case "sick":
                setOpenSickModal(true);
                break;
            case "annualLeave":
                setOpenAnnualLeaveModal(true);
                break;
            case "adminExtra":
                setOpenAdminExtraModal(true);
                break;
            default:
                console.log(type);
        }
    };

    const getUsersJobs = async () => {
        let newJobList = [];
        let newSickList = [];
        let newAnnualLeaveList = [];
        let newAdminExtraList = [];
        let userFinalizedJobs = [];
        await axios
            .get("/planner/jobs/get-users-jobs")
            .then(async (response) => {
                for (const job of response.data) {
                    if (job.user_id !== null) {
                        let newJobs = {
                            id: job.id,
                            group: job.user_id,
                            start_time: moment(
                                job.start_date + " " + job.start_time
                            ),
                            end_time: moment(job.end_date + " " + job.end_time),
                            title: job.from + " - " + job.to,
                            canMove: false,
                            canResize: false,
                            itemProps: {
                                type: "job",
                                dataId: job.id,
                                "aria-hidden": true,
                                onContextMenu: async (itemId) => {
                                    try {
                                        let id =
                                            itemId.target.parentElement.getAttribute(
                                                "dataitemid"
                                            );                                        
                                        let job = await axios.get(
                                            "/planner/jobs/show/" + id
                                        );
                                        if (job.status === 200) {
                                            setOpenDetailModal(true);
                                            setEditingJob(job.data);
                                        }
                                    } catch (e) {
                                        console.log(e);
                                    }
                                },
                                onClick: async (itemId) => {
                                    try {
                                        let id =
                                            itemId.target.parentElement.getAttribute(
                                                "dataitemid"
                                            );

                                        let job = await axios.get(
                                            "/planner/jobs/show/" + id
                                        );

                                        if (job.status === 200) {
                                            setOpenDetailModal(true);
                                            setEditingJob(job.data);
                                        }
                                    } catch (e) {
                                        console.log(e);
                                    }
                                },
                                onDoubleClick: async (itemId) => {
                                    try {
                                        let id =
                                            itemId.target.parentElement.getAttribute(
                                                "dataitemid"
                                            );
                                        let job = await axios.get(
                                            "/planner/jobs/show/" + id
                                        );
                                        if (job.status === 200) {
                                            setOpenDetailModal(true);
                                            setEditingJob(job.data);
                                        }
                                    } catch (e) {
                                        console.log(e);
                                    }
                                },
                                className: "jobs",
                                style: {
                                    background: "green",
                                    zIndex: 50,
                                    minHeight: 40,
                                },
                                itemIdKey: "id",
                                itemDivIdKey: "id",
                                itemTitleKey: "title",
                                itemDivTitleKey: "id",
                            },
                        };
                        newJobList.push(newJobs);
                    }
                }
            });

        await axios.get("/sick-leaves").then(async (response) => {
            for (const sick of response.data.sickLeaves) {
                let newSick = {
                    id: sick.id,
                    group: sick.user_id,
                    start_time: moment(sick.start_date).set({
                        hour: sick.start_time.split(":")[0],
                        minute: sick.start_time.split(":")[1],
                    }),
                    end_time: moment(sick.end_date).set({
                        hour: sick.end_time.split(":")[0],
                        minute: sick.end_time.split(":")[1],
                    }),
                    title: sick.user.name,
                    canMove: false,
                    canResize: false,
                    itemProps: {
                        onContextMenu: async (itemId) => {
                            try {
                                let id =
                                    itemId.target.parentElement.getAttribute(
                                        "dataitemid"
                                    );

                                Swal.fire({
                                    title: "Eminmisin?",
                                    text: "Silmek istediğinize eminmisiniz?",
                                    icon: "warning",
                                    showCancelButton: true,
                                    cancelButtonText: "İptal",
                                    showConfirmButton: true,
                                    confirmButtonText: "Sil",
                                    dangerMode: true,
                                }).then(async (willDelete) => {
                                    if (willDelete.isConfirmed) {
                                        await axios.delete(
                                            "/sick-leaves/" + id
                                        );
                                        getPlans();
                                        getPlansWithoutUser();
                                        getUsersJobs();
                                        Swal.fire({
                                            title: "Tamam!",
                                            text: "Kayıt Silindi",
                                            icon: "success",
                                            timer: 1000,
                                            button: false,
                                        });
                                    }
                                });
                            } catch (e) {
                                console.log(e);
                            }
                        },
                        type: "sick",
                        className: "weekend",
                        style: {
                            background: "red",
                            zIndex: 49,
                        },
                        itemIdKey: "id",
                        itemTitleKey: "title",
                    },
                };
                newSickList.push(newSick);
            }
        });
        await axios.get("/annual-leaves").then(async (response) => {
            for (const annualLeave of response.data.annualLeaves) {
                let newAnnualLeave = {
                    id: "a" + annualLeave.id,
                    group: annualLeave.user_id,
                    start_time: moment(annualLeave.start_date).set({
                        hour: annualLeave.start_time.split(":")[0],
                        minute: annualLeave.start_time.split(":")[1],
                    }),
                    end_time: moment(annualLeave.end_date).set({
                        hour: annualLeave.end_time.split(":")[0],
                        minute: annualLeave.end_time.split(":")[1],
                    }),
                    title: annualLeave.user.name,
                    canMove: false,
                    canResize: false,
                    itemProps: {
                        onContextMenu: async (itemId) => {
                            try {
                                let id =
                                    itemId.target.parentElement.getAttribute(
                                        "dataitemid"
                                    );

                                Swal.fire({
                                    title: "Eminmisin?",
                                    text: "Silmek istediğinize eminmisiniz?",
                                    icon: "warning",
                                    showCancelButton: true,
                                    cancelButtonText: "İptal",
                                    showConfirmButton: true,
                                    confirmButtonText: "Sil",
                                    dangerMode: true,
                                }).then(async (willDelete) => {
                                    if (willDelete.isConfirmed) {
                                        await axios.delete(
                                            "/annual-leaves/" + id
                                        );
                                        getPlans();
                                        getPlansWithoutUser();
                                        getUsersJobs();
                                        Swal.fire({
                                            title: "Tamam!",
                                            text: "Kayıt Silindi",
                                            icon: "success",
                                            timer: 1000,
                                            button: false,
                                        });
                                    }
                                });
                            } catch (e) {
                                console.log(e);
                            }
                        },
                        type: "annualLeave",
                        className: "weekend",
                        style: {
                            background: "blue",
                            zIndex: 49,
                        },
                    },
                };
                newAnnualLeaveList.push(newAnnualLeave);
            }
        });

        await axios.get("/admin-extras").then(async (response) => {
            for (const adminExtra of response.data.adminExtras) {
                let newAdminExtra = {
                    id: "e" + adminExtra.id,
                    group: adminExtra.user_id,
                    start_time: moment(adminExtra.start_date).set({
                        hour: adminExtra.start_time.split(":")[0],
                        minute: adminExtra.start_time.split(":")[1],
                    }),
                    end_time: moment(adminExtra.end_date).set({
                        hour: adminExtra.end_time.split(":")[0],
                        minute: adminExtra.end_time.split(":")[1],
                    }),
                    title: adminExtra.user.name,
                    canMove: false,
                    canResize: false,
                    itemProps: {
                        onContextMenu: async (itemId) => {
                            try {
                                let id =
                                    itemId.target.parentElement.getAttribute(
                                        "dataitemid"
                                    );

                                Swal.fire({
                                    title: "Eminmisin?",
                                    text: "Silmek istediğinize eminmisiniz?",
                                    icon: "warning",
                                    showCancelButton: true,
                                    cancelButtonText: "İptal",
                                    showConfirmButton: true,
                                    confirmButtonText: "Sil",
                                    dangerMode: true,
                                }).then(async (willDelete) => {
                                    if (willDelete.isConfirmed) {
                                        await axios.delete(
                                            "/admin-extras/" + id
                                        );
                                        getPlans();
                                        getPlansWithoutUser();
                                        getUsersJobs();
                                        Swal.fire({
                                            title: "Tamam!",
                                            text: "Kayıt Silindi",
                                            icon: "success",
                                            timer: 1000,
                                            button: false,
                                        });
                                    }
                                });
                            } catch (e) {
                                console.log(e);
                            }
                        },
                        type: "adminExtra",
                        className: "weekend",
                        style: {
                            background: "purple",
                            zIndex: 49,
                        },
                    },
                };
                newAdminExtraList.push(newAdminExtra);
            }
        });
        await axios.get("/user-confirmed-jobs").then(async (response) => {
            for (const job of response.data) {
                let workStartTime = job.work_start_time.split(":");
                let workEndTime = job.work_end_time.split(":");
                let startDate = moment(job.initial_date);
                let endDate = moment(job.initial_date);
                if (workStartTime[0] < workEndTime[0]) {
                    endDate.add(1, "day");
                }
                let newUserFinalizedJob = {
                    id: "u" + job.id,
                    group: job.user_id,
                    start_time: startDate.set({
                        hour: workStartTime[0],
                        minute: workStartTime[1],
                    }),
                    end_time: endDate.set({
                        hour: workEndTime[0],
                        minute: workEndTime[1],
                    }),
                    title: job.from + " - " + job.to,
                    canMove: false,
                    canResize: false,
                    itemProps: {
                        type: "userFinalizedJob",
                        className: "weekend",
                        style: {
                            background: "gray",
                            zIndex: 49,
                        },
                    },
                };
                userFinalizedJobs.push(newUserFinalizedJob);
            }
        });

        let plan = [
            ...newJobList,
            ...newSickList,
            ...newAnnualLeaveList,
            ...newAdminExtraList,
            ...userFinalizedJobs,
        ];

        if (plan) {
            let filledPlan = plan.filter((item) => {
                return item.itemProps.type === "job";
            });
            let groupedPlans = {};

            filledPlan.forEach((item) => {
                if (!groupedPlans[item.group]) {
                    groupedPlans[item.group] = [];
                }
                groupedPlans[item.group].push(item);
            });

            let newFilledPlan = [];

            Object.keys(groupedPlans).forEach((group) => {
                groupedPlans[group].sort((a, b) => a.end_time - b.end_time);

                for (let i = 0; i < groupedPlans[group].length - 1; i++) {
                    if (groupedPlans[group][i + 1]) {
                        let title =
                            moment
                                .duration(
                                    groupedPlans[group][i + 1].start_time.diff(
                                        groupedPlans[group][i].end_time
                                    )
                                )
                                .days() > 0
                                ? moment
                                      .duration(
                                          groupedPlans[group][
                                              i + 1
                                          ].start_time.diff(
                                              groupedPlans[group][i].end_time
                                          )
                                      )
                                      .days() *
                                      24 +
                                  moment
                                      .duration(
                                          groupedPlans[group][
                                              i + 1
                                          ].start_time.diff(
                                              groupedPlans[group][i].end_time
                                          )
                                      )
                                      .hours() +
                                  ":" +
                                  moment
                                      .duration(
                                          groupedPlans[group][
                                              i + 1
                                          ].start_time.diff(
                                              groupedPlans[group][i].end_time
                                          )
                                      )
                                      .minutes()
                                      .toString()
                                      .padStart(2, "0")
                                : moment
                                      .duration(
                                          groupedPlans[group][
                                              i + 1
                                          ].start_time.diff(
                                              groupedPlans[group][i].end_time
                                          )
                                      )
                                      .hours() +
                                  ":" +
                                  moment
                                      .duration(
                                          groupedPlans[group][
                                              i + 1
                                          ].start_time.diff(
                                              groupedPlans[group][i].end_time
                                          )
                                      )
                                      .minutes()
                                      .toString()
                                      .padStart(2, "0");
                        let newPlan = {
                            id: `${group}-${i}`,
                            group: groupedPlans[group][i].group,
                            start_time: groupedPlans[group][i].end_time,
                            end_time: groupedPlans[group][i + 1].start_time,
                            title: title,
                            canMove: false,
                            canResize: false,
                            onClick: (e) => {
                                console.log(e);
                                return null;
                            },
                            onItemSelect: (e) => {
                                console.log(e);
                            },
                            itemProps: {
                                className: "relaxing",
                                style: {
                                    background: "transparent",
                                    color: "black",
                                    borderTopWidth: "0",
                                    borderRightWidth: "0",
                                    borderBottomWidth: "1px",
                                    borderLeftWidth: "0",
                                    borderTopStyle: "none",
                                    borderRightStyle: "none",
                                    borderBottomStyle: "solid",
                                    borderLeftStyle: "none",
                                    borderTopColor: "none",
                                    borderRightColor: "none",
                                    borderBottomColor: "black",
                                    borderLeftColor: "none",
                                    borderImageSource: "initial",
                                    borderImageSlice: "initial",
                                    borderImageWidth: "initial",
                                    borderImageOutset: "initial",
                                    borderImageRepeat: "initial",
                                    textAlign: "center",
                                    zIndex: 49,
                                    fontWeight: "bolder",
                                    fontSize: "14px",
                                    cursor: "pointer",
                                    pointerEvents: "none", // Seçilemez hale getirmek için
                                }
                                
                            },
                        };
                        if (
                            moment
                                .duration(
                                    groupedPlans[group][i + 1].start_time.diff(
                                        groupedPlans[group][i].end_time
                                    )
                                )
                                .hours() > 0
                        ) {
                            newFilledPlan.push(newPlan);
                        }
                    }
                }
            });

            let lastPlan = [
                ...newJobList,
                ...newSickList,
                ...newAnnualLeaveList,
                ...newAdminExtraList,
                ...userFinalizedJobs,
                ...newFilledPlan,
            ];
            setUserJobs(lastPlan);
        } else {
            setUserJobs([]);
        }
    };

    const getUsers = async () => {
        await axios.get(route("users.show")).then((response) => {
            let newUserList = [];
            let newUserListForTime = [];
            response.data.sort((a, b) =>
                a.driver_id.localeCompare(b.driver_id)
            );
            response.data.map((user) => {
                newUserList.push({ id: user.id, title: user.name, height: 50 });
                newUserListForTime.push({
                    value: user.id,
                    label: user.name,
                    height: 50,
                });
            });
            setUsers(newUserList);
            setUsersForTime(newUserListForTime);
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
                getPlans();
                getPlansWithoutUser();
                getUsersJobs();
                setOpenModal(false);
            });
    };
    const setSick = async () => {
        await axios
            .post("/sick-leaves", {
                start_date: sickStartDate,
                start_time: sickStartTime,
                end_date: sickEndDate,
                end_time: sickEndTime,
                user_id: sickDriver,
                confirmed: true,
            })
            .then((response) => {
                if (response.status === 200) {
                    setOpenSickModal(false);
                    getPlans();
                    getPlansWithoutUser();
                    getUsersJobs();
                    setSickStartDate("");
                    setSickStartTime("");
                    setSickEndDate("");
                    setSickEndTime("");
                    setSickDriver(0);
                    Swal.fire({
                        icon: "success",
                        title: "Hastalık İzni Ekleme",
                        text: "Hastalık İzni Ekleme Başarılı",
                    });
                }
            })
            .catch((error) => {
                console.log(error);
                Swal.fire({
                    icon: "error",
                    title: "Hastalık İzni Ekleme Hatası",
                    text: error.response.data.message,
                });
            });
    };
    const setAnnualLeave = async () => {
        await axios
            .post("/annual-leaves", {
                start_date: annualLeaveStartDate,
                start_time: annualLeaveStartTime,
                end_date: annualLeaveEndDate,
                end_time: annualLeaveEndTime,
                user_id: annualLeaveDriver,
                confirmed: true,
            })
            .then((response) => {
                if (response.status === 200) {
                    setOpenAnnualLeaveModal(false);
                    getPlans();
                    getPlansWithoutUser();
                    getUsersJobs();
                    setAnnualLeaveStartDate("");
                    setAnnualLeaveStartTime("");
                    setAnnualLeaveEndDate("");
                    setAnnualLeaveEndTime("");
                    setAnnualLeaveDriver(0);
                    Swal.fire({
                        icon: "success",
                        title: "Yıllık İzni Ekleme",
                        text: "Yıllık İzni Ekleme Başarılı",
                    });
                }
            })
            .catch((error) => {
                console.log(error);
                Swal.fire({
                    icon: "error",
                    title: "Yıllık İzni Ekleme Hatası",
                    text: error.response.data.message,
                });
            });
    };
    const setAdminExtra = async () => {
        await axios
            .post("/admin-extras", {
                start_date: adminExtraStartDate,
                start_time: adminExtraStartTime,
                end_date: adminExtraEndDate,
                end_time: adminExtraEndTime,
                user_id: adminExtraDriver,
                confirmed: true,
            })
            .then((response) => {
                if (response.status === 200) {
                    setOpenAdminExtraModal(false);
                    getPlans();
                    getPlansWithoutUser();
                    getUsersJobs();
                    setAdminExtraStartDate("");
                    setAdminExtraStartTime("");
                    setAdminExtraEndDate("");
                    setAdminExtraEndTime("");
                    setAdminExtraDriver(0);
                    Swal.fire({
                        icon: "success",
                        title: "Admin İzni Ekleme",
                        text: "Admin İzni Ekleme Başarılı",
                    });
                }
            })
            .catch((error) => {
                console.log(error);
                Swal.fire({
                    icon: "error",
                    title: "Admin İzni Ekleme Hatası",
                    text: error.response.data.message,
                });
            });
    };

    useEffect(() => {
        getPlans();
        getPlansWithoutUser();
        getUsers();
        getUsersJobs();
        moment.locale("de");

        axios.get(route("users.show")).then((response) => {
            setDrivers(response.data);
        });
    }, []);

    useEffect(() => {
        const id = setInterval(() => {
            getPlans();
            getPlansWithoutUser();
            getUsersJobs();
        }, 25000);
        return () => clearInterval(id);
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
            <Head>
                <style>
                    {`
    #\\:ra\\:-flowbite-toggleswitch > div:after {
        top: 11px;
    }
    #\\:rb\\:-flowbite-toggleswitch > div:after {
        top: 11px;
    }
    #\\:rm\\:-flowbite-toggleswitch > div:after {
        top: 11px;
    }
    `}
                </style>
            </Head>

            <Modal show={openModal} onClose={() => setOpenModal(false)}>
                <Modal.Header>Lokführer Wählen</Modal.Header>
                <Modal.Body>
                    <div className="space-y-6">
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-4000">
                            Verfügbare Lokführer
                        </p>
                        <Select
                            className="w-full"
                            onChange={(e) => setDriver(e.target.value)}
                        >
                            <option>Wählen</option>
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
                    <Button onClick={setMachinist}>Zuweisen</Button>
                    <Button color="gray" onClick={() => setOpenModal(false)}>
                        Abbrechen
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={openDetailModal}
                onClose={() => setOpenDetailModal(false)}
            >
                <Modal.Header>Details</Modal.Header>
                <Modal.Body>
                    <div className="space-y-6">
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-4000">
                            Startdatum :{" "}
                            {moment(editingJob.start_date).format("DD.MM.YYYY")}
                            <br />
                            Startzeit : {editingJob.start_time}
                            <br />
                            Enddatum :{" "}
                            {moment(editingJob.end_date).format("DD.MM.YYYY")}
                            <br />
                            Endzeit : {editingJob.end_time}
                            <br />
                            Zug Nr : {editingJob.zug_nummer}
                            <br />
                            Lokomotive Nr : {editingJob.locomotive_nummer}
                            <br />
                            Tourname : {editingJob.tour_name}
                            <br />
                            Von - Bis : {editingJob.from} - {editingJob.to}
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        color="green"
                        onClick={() => routeToEdit(editingJob.id)}
                    >
                        Bearbeiten
                    </Button>
                    <Button
                        color="red"
                        onClick={() => deleteFromuser(editingJob.id)}
                    >
                        Löschen
                    </Button>
                    <Button
                        color="gray"
                        onClick={() => setOpenDetailModal(false)}
                    >
                        Abbrechen
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={openSickModal}
                size={"5xl"}
                onClose={() => setOpenSickModal(false)}
            >
                <Modal.Header>Krankheitsurlaub Hinzufügen</Modal.Header>
                <Modal.Body>
                    <div className="space-y-2">
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-4000">
                            Datum
                        </p>
                        <div className="flex justify-between">
                            <Datepicker
                                inline
                                language="de-DE"
                                showTodayButton={false}
                                showClearButton={false}
                                id="sickStartDate"
                                name="sickStartDate"
                                type="date"
                                value={sickStartDate}
                                onSelectedDateChanged={(date) => {
                                    let datenew = new Date(date)
                                        .toLocaleDateString()
                                        .split(".");
                                    datenew[0] = datenew[0].padStart(2, "0");
                                    datenew[1] = datenew[1].padStart(2, "0");
                                    setSickStartDate(
                                        datenew.reverse().join("-")
                                    );
                                    setSickEndDate(datenew.reverse().join("-"));
                                    setSickEndTime("00:00");
                                    setSickStartTime("00:00");
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
                                    value={sickStartTime}
                                    onChange={(e) => {
                                        setSickStartTime(e.target.value);
                                    }}
                                />
                                <p className="justify-self-center">bis</p>
                                <input
                                    type="time"
                                    id="sickEndTime"
                                    name="sickEndTime"
                                    className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-6000 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    value={sickEndTime}
                                    onChange={(e) => {
                                        setSickEndTime(e.target.value);
                                    }}
                                />
                            </div>

                            <Datepicker
                                inline
                                language="de-DE"
                                id="sickEndDate"
                                name="sickEndDate"
                                showTodayButton={false}
                                showClearButton={false}
                                value={sickEndDate}
                                type="date"
                                onSelectedDateChanged={(date) => {
                                    let datenew = new Date(date)
                                        .toLocaleDateString()
                                        .split(".");
                                    datenew[0] = datenew[0].padStart(2, "0");
                                    datenew[1] = datenew[1].padStart(2, "0");
                                    setSickEndDate(datenew.reverse().join("-"));
                                }}
                            />
                        </div>
                        <br />
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-4000">
                            Lokführer
                        </p>
                        <Select
                            className="w-full mb-10"
                            onChange={(e) => setSickDriver(e.target.value)}
                            value={sickDriver}
                        >
                            <option>Wählen Sie</option>
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
                    <Button onClick={setSick}>
                        Krankheitsurlaub Hinzufügen
                    </Button>
                    <Button
                        color="gray"
                        onClick={() => setOpenSickModal(false)}
                    >
                        Abbrechen
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={openAdminExtraModal}
                size={"5xl"}
                onClose={() => setOpenAdminExtraModal(false)}
            >
                <Modal.Header>Ruhe Tag</Modal.Header>
                <Modal.Body>
                    <div className="space-y-2">
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-4000">
                            Datum
                        </p>
                        <div className="flex justify-between">
                            <Datepicker
                                inline
                                language="de-DE"
                                showTodayButton={false}
                                showClearButton={false}
                                id="adminExtraDate"
                                name="adminExtraDate"
                                type="date"
                                value={adminExtraStartDate}
                                onSelectedDateChanged={(date) => {
                                    let datenew = new Date(date)
                                        .toLocaleDateString()
                                        .split(".");
                                    datenew[0] = datenew[0].padStart(2, "0");
                                    datenew[1] = datenew[1].padStart(2, "0");
                                    setAdminExtraStartDate(
                                        datenew.reverse().join("-")
                                    );
                                    setAdminExtraEndDate(
                                        datenew.reverse().join("-")
                                    );
                                    setAdminExtraEndTime("00:00");
                                    setAdminExtraStartTime("00:00");
                                }}
                            />

                            <div
                                className="flex flex-row gap-2 justify-center"
                                style={{ maxHeight: 50 }}
                            >
                                <input
                                    type="time"
                                    id="adminExtraStartTime"
                                    name="adminExtraStartTime"
                                    className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-3000 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-4000 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    value={adminExtraStartTime}
                                    onChange={(e) => {
                                        setAdminExtraStartTime(e.target.value);
                                    }}
                                />
                                <p className="justify-self-center">bis</p>
                                <input
                                    type="time"
                                    id="adminExtraEndTime"
                                    name="adminExtraEndTime"
                                    className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-6000 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    value={adminExtraEndTime}
                                    onChange={(e) => {
                                        setAdminExtraEndTime(e.target.value);
                                    }}
                                />
                            </div>

                            <Datepicker
                                inline
                                language="de-DE"
                                id="adminExtraDate"
                                name="adminExtraDate"
                                showTodayButton={false}
                                showClearButton={false}
                                value={adminExtraEndDate}
                                type="date"
                                onSelectedDateChanged={(date) => {
                                    let datenew = new Date(date)
                                        .toLocaleDateString()
                                        .split(".");
                                    datenew[0] = datenew[0].padStart(2, "0");
                                    datenew[1] = datenew[1].padStart(2, "0");
                                    setAdminExtraEndDate(
                                        datenew.reverse().join("-")
                                    );
                                }}
                            />
                        </div>
                        <br />
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-4000">
                            Lokführer
                        </p>
                        <Select
                            className="w-full mb-10"
                            onChange={(e) =>
                                setAdminExtraDriver(e.target.value)
                            }
                            value={adminExtraDriver}
                        >
                            <option>Wählen Sie</option>
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
                    <Button onClick={setAdminExtra}>Ruhe Tag Hinzufügen</Button>
                    <Button
                        color="gray"
                        onClick={() => setOpenAdminExtraModal(false)}
                    >
                        Abbrechen
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={openAnnualLeaveModal}
                size={"5xl"}
                onClose={() => setOpenAnnualLeaveModal(false)}
            >
                <Modal.Header>Yıllık İzni Ekle</Modal.Header>
                <Modal.Body>
                    <div className="space-y-2">
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-4000">
                            Tarih
                        </p>
                        <div className="flex justify-between">
                            <Datepicker
                                inline
                                language="de-DE"
                                showTodayButton={false}
                                showClearButton={false}
                                id="annualLeaveDate"
                                name="annualLeaveDate"
                                type="date"
                                value={annualLeaveStartDate}
                                onSelectedDateChanged={(date) => {
                                    let datenew = new Date(date)
                                        .toLocaleDateString()
                                        .split(".");
                                    datenew[0] = datenew[0].padStart(2, "0");
                                    datenew[1] = datenew[1].padStart(2, "0");
                                    setAnnualLeaveStartDate(
                                        datenew.reverse().join("-")
                                    );
                                    setAnnualLeaveEndDate(
                                        datenew.reverse().join("-")
                                    );
                                    setAnnualLeaveEndTime("00:00");
                                    setAnnualLeaveStartTime("00:00");
                                }}
                            />

                            <div
                                className="flex flex-row gap-2 justify-center"
                                style={{ maxHeight: 50 }}
                            >
                                <input
                                    type="time"
                                    id="annualLeaveStartTime"
                                    name="annualLeaveStartTime"
                                    className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-4000 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    value={annualLeaveStartTime}
                                    onChange={(e) => {
                                        setAnnualLeaveStartTime(e.target.value);
                                    }}
                                />
                                <p className="justify-self-center">bis</p>
                                <input
                                    type="time"
                                    id="annualLeaveEndTime"
                                    name="annualLeaveEndTime"
                                    className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-6000 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    value={annualLeaveEndTime}
                                    onChange={(e) => {
                                        setAnnualLeaveEndTime(e.target.value);
                                    }}
                                />
                            </div>

                            <Datepicker
                                inline
                                language="de-DE"
                                id="annualLeaveEndDate"
                                name="annualLeaveEndDate"
                                showTodayButton={false}
                                showClearButton={false}
                                value={annualLeaveEndDate}
                                type="date"
                                onSelectedDateChanged={(date) => {
                                    let datenew = new Date(date)
                                        .toLocaleDateString()
                                        .split(".");
                                    datenew[0] = datenew[0].padStart(2, "0");
                                    datenew[1] = datenew[1].padStart(2, "0");
                                    setAnnualLeaveEndDate(
                                        datenew.reverse().join("-")
                                    );
                                }}
                            />
                        </div>
                        <br />
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-4000">
                            Makinist
                        </p>
                        <Select
                            className="w-full mb-10"
                            onChange={(e) =>
                                setAnnualLeaveDriver(e.target.value)
                            }
                            value={annualLeaveDriver}
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
                    <Button onClick={setAnnualLeave}>Yıllık İzni Ekle</Button>
                    <Button
                        color="gray"
                        onClick={() => setOpenAnnualLeaveModal(false)}
                    >
                        İptal
                    </Button>
                </Modal.Footer>
            </Modal>
            <Head title="Planner" />

            <div
                className="py-12"
                style={window.innerWidth > 3000 ? { display: "none" } : {}}
            >
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
                                            Lokführer
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Zuweisung
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Bearbeiten
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Löschen
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {withoutUserJobs &&
                                        withoutUserJobs.length > 0 &&
                                        withoutUserJobs.map((job) => (
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
                                                            Verlassen
                                                        </button>
                                                    )}
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => {
                                                            window.location.href =
                                                                route(
                                                                    "planner-jobs-edit",
                                                                    {
                                                                        id: job.id,
                                                                    }
                                                                );
                                                        }}
                                                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline text-center"
                                                    >
                                                        Bearbeiten
                                                    </button>
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => {
                                                            Swal.fire({
                                                                title: "Wirklich löschen?",
                                                                text: "Wenn Sie diesen Job löschen, können Sie ihn nicht wiederherstellen.",
                                                                icon: "warning",
                                                                showCancelButton: true,
                                                                cancelButtonText:
                                                                    "Abbrechen",
                                                                showConfirmButton: true,
                                                                confirmButtonText:
                                                                    "Löschen",
                                                                dangerMode: true,
                                                            }).then(
                                                                async (
                                                                    willDelete
                                                                ) => {
                                                                    if (
                                                                        willDelete.isConfirmed
                                                                    ) {
                                                                        await axios.delete(
                                                                            route(
                                                                                "planner-jobs-delete",
                                                                                {
                                                                                    id: job.id,
                                                                                }
                                                                            )
                                                                        );
                                                                        getPlans();
                                                                        getPlansWithoutUser();
                                                                        getUsersJobs();
                                                                        Swal.fire(
                                                                            {
                                                                                title: "Fertig!",
                                                                                text: "Eintrag gelöscht",
                                                                                icon: "success",
                                                                                timer: 1000,
                                                                                button: false,
                                                                            }
                                                                        );
                                                                    }
                                                                }
                                                            );
                                                        }}
                                                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline text-center"
                                                    >
                                                        Löschen
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

            <div className={window.innerWidth > 3000 ? "" : "py-12"}>
                <div
                    className={
                        window.innerWidth > 3000
                            ? "w-full mx-auto sm:px-6 lg:px-8"
                            : "max-w-7xl mx-auto sm:px-6 lg:px-8"
                    }
                >
                    <div
                        className="bg-white overflow-hidden shadow-sm sm:rounded-lg "
                        style={{ minHeight: "40rem" }}
                    >
                        {userJobs &&
                            users &&
                            userJobs.length > 0 &&
                            users.length > 0 && (
                                <>
                                    <div className="flex justify-between mx-5 my-5">
                                        <Button
                                            className="bg-red-500"
                                            onClick={() => showModal("sick")}
                                        >
                                            Krank
                                        </Button>
                                        <Button
                                            className="bg-blue-500"
                                            onClick={() =>
                                                showModal("annualLeave")
                                            }
                                        >
                                            Urlaub
                                        </Button>
                                        <Button
                                            className="bg-purple-500"
                                            onClick={() =>
                                                showModal("adminExtra")
                                            }
                                        >
                                            Ruhe Tag
                                        </Button>
                                        <ToggleSwitch
                                            label="Diese Woche anzeigen"
                                            checked={thisWeek}
                                            onChange={(e) => {
                                                setThisWeek(e);
                                                if (e) {
                                                    setNextWeek(false);
                                                    setVisibleTimeStart(
                                                        moment()
                                                            .startOf("week")
                                                            .add(1, "day")
                                                    );
                                                    setVisibleTimeEnd(
                                                        moment()
                                                            .endOf("week")
                                                            .add(1, "day")
                                                    );
                                                } else {
                                                    setVisibleTimeStart(null);
                                                    setVisibleTimeEnd(null);
                                                }
                                            }}
                                        />
                                        <ToggleSwitch
                                            label="Nächste Woche anzeigen"
                                            checked={nextWeek}
                                            onChange={(e) => {
                                                setNextWeek(e);
                                                if (e) {
                                                    setThisWeek(false);
                                                    setVisibleTimeStart(
                                                        moment()
                                                            .add(7, "day")
                                                            .startOf("week")
                                                            .add(1, "day")
                                                    );
                                                    setVisibleTimeEnd(
                                                        moment()
                                                            .add(7, "day")
                                                            .endOf("week")
                                                            .add(1, "day")
                                                    );
                                                } else {
                                                    setVisibleTimeStart(null);
                                                    setVisibleTimeEnd(null);
                                                }
                                            }}
                                        />
                                    </div>

                                    <div className="relative">
                                        <div
                                            className="absolute"
                                            style={{
                                                left: 20,
                                                top: 10,
                                                minWidth: 220,
                                                maxWidth: 220,
                                            }}
                                        >
                                            <MultiSelect
                                                options={usersForTime}
                                                value={selectedUsersForTime}
                                                onChange={(e) => {
                                                    let newUserList =
                                                        users.filter((user) => {
                                                            if (
                                                                e.some(
                                                                    (
                                                                        selectedUser
                                                                    ) =>
                                                                        selectedUser.value ===
                                                                        user.id
                                                                )
                                                            ) {
                                                                return user;
                                                            }
                                                        });
                                                    setSelectedUsers(
                                                        newUserList
                                                    );
                                                    setSelectedUsersForTime(e);
                                                }}
                                                labelledBy="Auswählen"
                                                style={{
                                                    width: "15%",
                                                    position: "absolute",
                                                    zIndex: 1000,
                                                    maxWidth: 220,
                                                }}
                                            />
                                        </div>
                                    </div>
                                    {userJobs && (
                                        <Timeline
                                            groups={
                                                selectedUsers.length > 0
                                                    ? selectedUsers
                                                    : users
                                            }
                                            items={userJobs}
                                            itemRenderer={({
                                                item,
                                                itemContext,
                                                getItemProps,
                                                getResizeProps
                                              }) => {
                                                const { left: leftResizeProps, right: rightResizeProps } = getResizeProps()
                                                

                                                return (
                                                  <div {...getItemProps(item.itemProps)} key={item.id} dataitemid={item.id} >
                                                    {itemContext.useResizeHandle ? <div {...leftResizeProps} /> : ''}
                                              
                                                    <div
                                                      className="rct-item-content"
                                                      style={{ maxHeight: `${itemContext.dimensions.height}` }}
                                                    >
                                                      {itemContext.title}
                                                    </div>
                                              
                                                    {itemContext.useResizeHandle ? <div {...rightResizeProps} /> : ''}
                                                  </div>
                                                )}
                                              
                                              }
                                            unit="day"
                                            defaultTimeStart={moment().add(
                                                -256,
                                                "hour"
                                            )}
                                            defaultTimeEnd={moment().add(
                                                256,
                                                "hour"
                                            )}
                                            maxZoom={3000000000}
                                            traditionalZoom={true}
                                            sidebarWidth={250}
                                            visibleTimeStart={visibleTimeStart}
                                            visibleTimeEnd={visibleTimeEnd}
                                            timeSteps={{
                                                second: 60,
                                                minute: 60,
                                                hour: 1,
                                                day: 1,
                                                month: 1,
                                                year: 1,
                                            }}
                                        >
                                            <TimelineHeaders>
                                                <CustomHeader unit="month">
                                                    {({
                                                        headerContext: {
                                                            intervals,
                                                        },
                                                        getRootProps,
                                                        getIntervalProps,
                                                        showPeriod,
                                                        data,
                                                    }) => {
                                                        return (
                                                            <div
                                                                {...getRootProps()}
                                                            >
                                                                {intervals.map(
                                                                    (
                                                                        interval
                                                                    ) => {
                                                                        const displayNone =
                                                                            {
                                                                                display:
                                                                                    "none",
                                                                                height: "0px",
                                                                            };
                                                                        const intervalStyle =
                                                                            {
                                                                                lineHeight:
                                                                                    "30px",
                                                                                textAlign:
                                                                                    "center",
                                                                                borderLeft:
                                                                                    "1px solid black",
                                                                                cursor: "pointer",
                                                                                backgroundColor:
                                                                                    "#c51f21",
                                                                                color: "white",
                                                                                border: "1px solid #bababa",
                                                                            };
                                                                        return (
                                                                            <div
                                                                                onClick={() => {
                                                                                    showPeriod(
                                                                                        interval.startTime,
                                                                                        interval.endTime
                                                                                    );
                                                                                }}
                                                                                {...getIntervalProps(
                                                                                    {
                                                                                        interval,
                                                                                        style:
                                                                                            interval.labelWidth <=
                                                                                            19
                                                                                                ? displayNone
                                                                                                : intervalStyle,
                                                                                    }
                                                                                )}
                                                                            >
                                                                                <div className="sticky">
                                                                                    {interval.startTime.format(
                                                                                        "MMMM"
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    }
                                                                )}
                                                            </div>
                                                        );
                                                    }}
                                                </CustomHeader>
                                                <CustomHeader unit="week">
                                                    {({
                                                        headerContext: {
                                                            intervals,
                                                        },
                                                        getRootProps,
                                                        getIntervalProps,
                                                        showPeriod,
                                                        data,
                                                    }) => {
                                                        return (
                                                            <div
                                                                {...getRootProps()}
                                                            >
                                                                {intervals.map(
                                                                    (
                                                                        interval
                                                                    ) => {
                                                                        const displayNone =
                                                                            {
                                                                                display:
                                                                                    "none",
                                                                                height: "0px",
                                                                            };
                                                                        const intervalStyle =
                                                                            {
                                                                                lineHeight:
                                                                                    "30px",
                                                                                textAlign:
                                                                                    "center",
                                                                                borderLeft:
                                                                                    "1px solid black",
                                                                                cursor: "pointer",
                                                                                backgroundColor:
                                                                                    "#c51f21",
                                                                                color: "white",
                                                                                border: "1px solid #bababa",
                                                                            };
                                                                        return (
                                                                            <div
                                                                                onClick={() => {
                                                                                    showPeriod(
                                                                                        interval.startTime,
                                                                                        interval.endTime
                                                                                    );
                                                                                }}
                                                                                {...getIntervalProps(
                                                                                    {
                                                                                        interval,
                                                                                        style:
                                                                                            interval.labelWidth <=
                                                                                            19
                                                                                                ? displayNone
                                                                                                : intervalStyle,
                                                                                    }
                                                                                )}
                                                                            >
                                                                                <div className="sticky">
                                                                                    {interval.startTime.format(
                                                                                        "w"
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    }
                                                                )}
                                                            </div>
                                                        );
                                                    }}
                                                </CustomHeader>
                                                <CustomHeader
                                                    height={30}
                                                    headerData={{
                                                        someData: "data",
                                                    }}
                                                    unit="day"
                                                >
                                                    {({
                                                        headerContext: {
                                                            intervals,
                                                        },
                                                        getRootProps,
                                                        getIntervalProps,
                                                        showPeriod,
                                                        data,
                                                    }) => {
                                                        return (
                                                            <div
                                                                {...getRootProps()}
                                                            >
                                                                {intervals.map(
                                                                    (
                                                                        interval
                                                                    ) => {
                                                                        const intervalStyle =
                                                                            {
                                                                                lineHeight:
                                                                                    "30px",
                                                                                textAlign:
                                                                                    "center",
                                                                                borderLeft:
                                                                                    "1px solid black",
                                                                                cursor: "pointer",
                                                                                backgroundColor:
                                                                                    "#c51f21",
                                                                                color: "white",
                                                                                border: "1px solid #bababa",
                                                                            };
                                                                        return (
                                                                            <div
                                                                                onClick={() => {
                                                                                    showPeriod(
                                                                                        interval.startTime,
                                                                                        interval.endTime
                                                                                    );
                                                                                }}
                                                                                {...getIntervalProps(
                                                                                    {
                                                                                        interval,
                                                                                        style: intervalStyle,
                                                                                    }
                                                                                )}
                                                                            >
                                                                                <div className="sticky">
                                                                                    {interval.startTime.format(
                                                                                        interval.labelWidth <
                                                                                            150
                                                                                            ? "DD"
                                                                                            : "dddd DD.MM"
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    }
                                                                )}
                                                            </div>
                                                        );
                                                    }}
                                                </CustomHeader>
                                                <CustomHeader
                                                    height={30}
                                                    headerData={{
                                                        someData: "data",
                                                    }}
                                                    unit="hour"
                                                >
                                                    {({
                                                        headerContext: {
                                                            intervals,
                                                        },
                                                        getRootProps,
                                                        getIntervalProps,
                                                        showPeriod,
                                                        data,
                                                    }) => {
                                                        return (
                                                            <div
                                                                {...getRootProps()}
                                                            >
                                                                {intervals.map(
                                                                    (
                                                                        interval
                                                                    ) => {
                                                                        const displayNone =
                                                                            {
                                                                                display:
                                                                                    "none",
                                                                                height: "0px",
                                                                            };
                                                                        const intervalStyle =
                                                                            {
                                                                                lineHeight:
                                                                                    "30px",
                                                                                textAlign:
                                                                                    "center",
                                                                                borderLeft:
                                                                                    "1px solid black",
                                                                                cursor: "pointer",
                                                                                backgroundColor:
                                                                                    "#c51f21",
                                                                                color: "white",
                                                                                border: "1px solid #bababa",
                                                                            };
                                                                        return (
                                                                            <div
                                                                                onClick={() => {
                                                                                    showPeriod(
                                                                                        interval.startTime,
                                                                                        interval.endTime
                                                                                    );
                                                                                }}
                                                                                {...getIntervalProps(
                                                                                    {
                                                                                        interval,
                                                                                        style:
                                                                                            interval.labelWidth <=
                                                                                            19
                                                                                                ? displayNone
                                                                                                : intervalStyle,
                                                                                    }
                                                                                )}
                                                                            >
                                                                                <div className="sticky">
                                                                                    {interval.startTime.format(
                                                                                        "HH"
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    }
                                                                )}
                                                            </div>
                                                        );
                                                    }}
                                                </CustomHeader>
                                            </TimelineHeaders>
                                        </Timeline>
                                    )}
                                </>
                            )}
                        {!userJobs ||
                            (userJobs.length === 0 && (
                                <div className="text-center">No jobs found</div>
                            ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
