import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import "react-calendar-timeline/lib/Timeline.css";
import moment from "moment";
import { useState, useEffect } from "react";
import { Accordion, AccordionPanel, AccordionTitle, AccordionContent, Label } from "flowbite-react";

export default function Planner({ auth }) {
    const [jobs, setJobs] = useState([]);
    const getJobs = async () => {
        await axios.get(route("get-user-job-plans")).then((response) => {
            console.log(response.data);
            setJobs(response.data);
        });
    };
    useEffect(() => {
        let id = setInterval(() => {
            getJobs();
        }, 50000);
        getJobs();
        return () => clearInterval(id);
    }, []);
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
                        {/*<Timeline
                            groups={groups}
                            items={items}
                            defaultTimeStart={moment().add(-256, "hour")}
                            defaultTimeEnd={moment().add(256, "hour")}
        />*/}           
                        { jobs && jobs.map((job) => (
                            <div key={job.id}>
                                                        <Accordion>
                                                            <AccordionPanel></AccordionPanel>
                            <AccordionPanel isOpen={false}>
                                <AccordionTitle>
                                {moment(job.start_date + " " + job.start_time).format("DD-MM-YYYY HH:mm")} - {moment(job.end_date + " " + job.end_time).format("HH:mm")} : {job.from} - {job.to}
                                </AccordionTitle>
                                <AccordionContent>
                                    <Label>Dates : </Label>
                                    {moment(job.start_date + " " + job.start_time).format("DD-MM-YYYY HH:mm")} - {moment(job.end_date + " " + job.end_time).format("DD-MM-YYYY HH:mm")}
                                    <br/>
                                    <Label>Route : </Label>
                                    {job.from} - {job.to}
                                    <br/>
                                    <Label>Locomotive : </Label>
                                    {job.locomotive_nummer}
                                    <br/>
                                    <Label>Tour : </Label>
                                    {job.tour_name}
                                    <br/>
                                    <Label>Zug : </Label>
                                    {job.zug_nummer}
                                    <br/>
                                    <Label>Comment : </Label>
                                    {job.description}
                                </AccordionContent>
                            </AccordionPanel>
                        </Accordion>
                                
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
