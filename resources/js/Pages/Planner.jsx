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
            try {
                console.log(response.data);
                if(response.data.length > 0) {
                    response.data.sort((a, b) => {
                        return new Date(a.start_date + " " + a.start_time) - new Date(b.start_date + " " + b.start_time);
                });
                setJobs(response.data);
                } 
            } catch (error) {
                console.log(error);
            }
            
        }).catch((error) => {
            console.log(error);
        });
    };
    useEffect(() => {
        let id = setInterval(() => {
            getJobs();
        }, 5000);
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
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg px-4 py-4">
                        {/*<Timeline
                            groups={groups}
                            items={items}
                            defaultTimeStart={moment().add(-256, "hour")}
                            defaultTimeEnd={moment().add(256, "hour")}
        />*/}           
                        { jobs && jobs.map((job) => (
                            <div key={job.id} style={{marginTop: "1rem", marginBottom: "1rem"}}>
                                                        <Accordion>
                                                            <AccordionPanel></AccordionPanel>
                            <AccordionPanel isOpen={false}>
                                <AccordionTitle>
                                {moment(job.start_date + " " + job.start_time).format("DD.MM.YYYY HH:mm")} - {moment(job.end_date + " " + job.end_time).format("HH:mm")} : {job.from} - {job.to}
                                </AccordionTitle>
                                <AccordionContent>
                                    <Label>Datum : </Label>
                                    {moment(job.start_date + " " + job.start_time).format("DD.MM.YYYY HH:mm")} - {moment(job.end_date + " " + job.end_time).format("DD.MM.YYYY HH:mm")}
                                    <br/>
                                    <Label>Route : </Label>
                                    {job.from} - {job.to}
                                    <br/>
                                    <Label>Loknummer : </Label>
                                    {job.locomotive_nummer}
                                    <br/>
                                    <Label>Tour : </Label>
                                    {job.tour_name}
                                    <br/>
                                    <Label>Zugnummer : </Label>
                                    {job.zug_nummer}
                                    <br/>
                                    <Label>Kommentar : </Label>
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
