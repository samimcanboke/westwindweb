import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import Timeline from "react-calendar-timeline";
import "react-calendar-timeline/lib/Timeline.css";
import moment from "moment";

const groups = [
    { id: 1, title: "Hüseyin Eroğlu" },
    { id: 2, title: "Saadettin Gkçen" },
    { id: 3, title: "Src 1" },
    { id: 4, title: "Src 2" },
    { id: 5, title: "Src 3" },
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
        id: 2,
        group: 2,
        title: "item 2",
        start_time: moment().add(-0.5, "hour"),
        end_time: moment().add(0.5, "hour"),
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
    return (
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
                        <Timeline
                            groups={groups}
                            items={items}
                            defaultTimeStart={moment().add(-256, "hour")}
                            defaultTimeEnd={moment().add(256, "hour")}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
