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
    const [userJobs, setUserJobs] = useState([
        {
            id: 1,
            group: 1,
            title: 'item 1',
            start_time: moment(),
            end_time: moment().add(1, 'hour')
          },
          {
            id: 2,
            group: 2,
            title: 'item 2',
            start_time: moment().add(-0.5, 'hour'),
            end_time: moment().add(0.5, 'hour')
          },
          {
            id: 3,
            group: 1,
            title: 'item 3',
            start_time: moment().add(2, 'hour'),
            end_time: moment().add(3, 'hour')
          }
    ]);

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
    const [usersForTime, setUsersForTime] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [visibleTimeStart, setVisibleTimeStart] = useState(null);
    const [visibleTimeEnd, setVisibleTimeEnd] = useState(null);
    const [thisWeek, setThisWeek] = useState(false);
    const [nextWeek, setNextWeek] = useState(false);

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
                    getPlansWithoutUser();
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
                    getPlansWithoutUser();
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


    const groups = [{ id: 1, title: 'group 1' }, { id: 2, title: 'group 2' }]

const items = [
  {
    id: 1,
    group: 4,
    title: 'item 1',
    start_time: moment(),
    end_time: moment().add(1, 'hour')
  },
  {
    id: 2,
    group: 3,
    title: 'item 2',
    start_time: moment().add(-0.5, 'hour'),
    end_time: moment().add(0.5, 'hour')
  },
  {
    id: 3,
    group:4,
    title: 'item 3',
    start_time: moment().add(2, 'hour'),
    end_time: moment().add(3, 'hour')
  }
]

    useEffect(() => {
        setUserJobs(items);
    }, []);

    useEffect(() => {
        getUsers();
        moment.locale("de");
        /*setUserJobs([
            {
                id: 1,
                group: 3,
                title: "ASDASDASD",
                start: moment().startOf("day"),
                end: moment().endOf("day"),
                className: "jobs",
                canMove: true,
                canResize: false,
                itemProps: {
                    type: "job",
                    dataId: 1,
                    "aria-hidden": true,
                    onContextMenu: async (itemId) => {
                        try {
                            let id =
                                itemId.target.parentElement.getAttribute(
                                    "dataitemid"
                                );
                            console.log(id);
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

                            console.log(id);
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
                            console.log(id);
                        } catch (e) {
                            console.log(e);
                        }

                    },
                    onItemMove: async (itemId, newStart, newEnd) => {
                        console.log(itemId, newStart, newEnd);
                    },
                    onItemDrag: async (itemId, newStart, newEnd) => {
                        console.log(itemId, newStart, newEnd);
                    },
                    className: "jobs",
                    style: {
                        background: "gray",
                        border: "2px solid black",
                        zIndex: 50,
                        minHeight: 40,
                    },
                    itemIdKey: "id",
                    itemDivIdKey: "id",
                    itemTitleKey: "title",
                    itemDivTitleKey: "id",
                }
            },

        ]);*/
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Urlaubsplanung
                </h2>
            }
        >
            <Head></Head>

            <Head title="Holiday Planner" />

            <div className={window.innerWidth > 3000 ? "w-full" : "py-12"}>
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
                        <Timeline
                            groups={users}
                            items={userJobs}
                            defaultTimeStart={moment().add(-256, "hour")}
                            defaultTimeEnd={moment().add(256, "hour")}


                        />

                        {
                        /*
                        <Timeline
                            groups={
                                selectedUsers.length > 0 ? selectedUsers : users
                            }
                            items={userJobs}

                            unit="day"
                            defaultTimeStart={moment().add(-256, "hour")}
                            defaultTimeEnd={moment().add(256, "hour")}
                            minZoom={86400000} // Maksimum yakınlaştırma gün kadar
                            onZoom={(event, timelineInfo) => {
                                console.log(event, timelineInfo);
                            }}
                            traditionalZoom={true}
                            sidebarWidth={250}
                            visibleTimeStart={visibleTimeStart}
                            visibleTimeEnd={visibleTimeEnd}
                            timeSteps={{
                                second: 0,
                                minute: 0,
                                hour: 0,
                                day: 1,
                                month: 1,
                                year: 1,
                            }}
                            onCanvasClick={(event, timestamp, timelineInfo) => {
                                const startOfDay = moment(timestamp)
                                    .startOf("day")
                                    .format("YYYY-MM-DD HH:mm:ss");
                                const endOfDay = moment(timestamp)
                                    .endOf("day")
                                    .format("YYYY-MM-DD HH:mm:ss");
                                const newUserJob = {
                                    id: userJobs.length + 1,
                                    group: event,
                                    title: "U",
                                    start: moment(startOfDay).valueOf(),
                                    end: moment(endOfDay).valueOf(),
                                    className: "jobs",
                                    style: {
                                        background: "gray",
                                        border: "2px solid black",
                                        zIndex: 50,
                                        minHeight: 40,
                                    },
                                    itemIdKey: "id",
                                    itemDivIdKey: "id",
                                    itemTitleKey: "title",
                                    itemDivTitleKey: "id",
                                };
                                setUserJobs((prevUserJobs) => {
                                    const isDuplicate = prevUserJobs.some(
                                        (job) =>
                                            job.group === newUserJob.group &&
                                            job.start === newUserJob.start &&
                                            job.end === newUserJob.end
                                    );
                                    if (!isDuplicate) {
                                        return [...prevUserJobs, newUserJob];
                                    }
                                    return prevUserJobs;
                                });

                            }}
                        >
                            <TimelineHeaders>
                                <CustomHeader unit="year">
                                    {({
                                        headerContext: { intervals },
                                        getRootProps,
                                        getIntervalProps,
                                        showPeriod,
                                        data,
                                    }) => {
                                        return (
                                            <div {...getRootProps()}>
                                                {intervals.map((interval) => {
                                                    const displayNone = {
                                                        display: "none",
                                                        height: "0px",
                                                    };
                                                    const intervalStyle = {
                                                        lineHeight: "30px",
                                                        textAlign: "center",
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
                                                                    "YYYY"
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    }}
                                </CustomHeader>
                                <CustomHeader unit="month">
                                    {({
                                        headerContext: { intervals },
                                        getRootProps,
                                        getIntervalProps,
                                        showPeriod,
                                        data,
                                    }) => {
                                        return (
                                            <div {...getRootProps()}>
                                                {intervals.map((interval) => {
                                                    const displayNone = {
                                                        display: "none",
                                                        height: "0px",
                                                    };
                                                    const intervalStyle = {
                                                        lineHeight: "30px",
                                                        textAlign: "center",
                                                        borderLeft:
                                                            "1px solid black",
                                                        cursor: "pointer",
                                                        backgroundColor:
                                                            moment(
                                                                interval.startTime
                                                            ).week() %
                                                                2 >
                                                            0
                                                                ? "blue"
                                                                : "pink",
                                                        color:
                                                            moment(
                                                                interval.startTime
                                                            ).week() %
                                                                2 >
                                                            0
                                                                ? "pink"
                                                                : "blue",
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
                                                                KW{" "}
                                                                {interval.startTime.format(
                                                                    "w"
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
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
                                        headerContext: { intervals },
                                        getRootProps,
                                        getIntervalProps,
                                        showPeriod,
                                        data,
                                    }) => {
                                        return (
                                            <div {...getRootProps()}>
                                                {intervals.map((interval) => {
                                                    const intervalStyle = {
                                                        lineHeight: "30px",
                                                        textAlign: "center",
                                                        borderLeft:
                                                            "1px solid black",
                                                        cursor: "pointer",
                                                        backgroundColor:
                                                            moment(
                                                                interval.startTime
                                                            ).day() === 0
                                                                ? "gray"
                                                                : moment(
                                                                      interval.startTime
                                                                  ).day() === 1
                                                                ? "red"
                                                                : moment(
                                                                      interval.startTime
                                                                  ).day() === 2
                                                                ? "green"
                                                                : moment(
                                                                      interval.startTime
                                                                  ).day() === 3
                                                                ? "red"
                                                                : moment(
                                                                      interval.startTime
                                                                  ).day() === 4
                                                                ? "green"
                                                                : moment(
                                                                      interval.startTime
                                                                  ).day() === 5
                                                                ? "red"
                                                                : moment(
                                                                      interval.startTime
                                                                  ).day() === 6
                                                                ? "green"
                                                                : "black",
                                                        color:
                                                            moment(
                                                                interval.startTime
                                                            ).day() === 0
                                                                ? "black"
                                                                : "white",
                                                        border: "1px solid #bababa",
                                                    };
                                                    return (
                                                        <div
                                                            onClick={() => {
                                                                alert(
                                                                    `Seçilen tarih: ${interval.startTime.format(
                                                                        "YYYY-MM-DD"
                                                                    )}`
                                                                );
                                                                intervalStyle.backgroundColor =
                                                                    "yellow";
                                                                intervalStyle.color =
                                                                    "black";
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
                                                })}
                                            </div>
                                        );
                                    }}
                                </CustomHeader>
                            </TimelineHeaders>
                        </Timeline>
                        */}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
