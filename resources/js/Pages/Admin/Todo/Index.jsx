import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Button, Modal, Select, Datepicker, ToggleSwitch } from "flowbite-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Calendar from 'react-awesome-calendar';
import moment from "moment";
export default function Programs({ auth }) {
    const [openEventModal, setOpenEventModal] = useState(false);
    const [openEditEventModal, setOpenEditEventModal] = useState(false);
    const [event, setEvent] = useState({
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        title: "",
    });
    const [events, setEvents] = useState([]);

    const getToDos = async () => {
        const response = await axios.get(route('todo'));
        const users = await axios.get(route('users.show'));
        const lastEvents = [];
        for (const todo of response.data) {
            let user = "Unbekannt";
            if(users.data.find(user => user.id === todo.user_id)){
                user = users.data.find(user => user.id === todo.user_id).name;
            } else {
                if(todo.user_id === 21){
                    user = "Anett Pätz";
                } else if(todo.user_id === 16){
                    user = "Samimcan BÖKE";
                }
            }
            lastEvents.push({
                id: todo.id,
                color: todo.is_done ? 'gray' : todo.is_important ? '#fd3153' : '#1ccb9e',
                title: todo.title + " - " + user,
                from: moment(todo.from).format("YYYY-MM-DDTHH:mm:00+00:00"),
                to: moment(todo.to).format("YYYY-MM-DDTHH:mm:00+00:00"),
                isDone: todo.is_done,
                isImportant: todo.is_important,
            });
        }
        setEvents(lastEvents);
    }

    const editEvent = async () => {
        await axios.put(route('todo.update', event.id), {
            from: moment(event.startDate).format("YYYY-MM-DD") + "T" + event.startTime + ":00+00:00",
            to: moment(event.endDate).format("YYYY-MM-DD") + "T" + event.endTime + ":00+00:00",
            title: event.title.split(" - ")[0],
            is_important: event.isImportant,
            is_done: event.isDone,
        });
        setOpenEditEventModal(false);
        setEvent({});
        getToDos();
    }


    const handleSelectDate = (date) => {
        let hour = Math.floor(date.hour).toString().padStart(2, '0');
        let minute = (date.hour % 1 === 0.5) ? '30' : '00';
        let selectedDate = new Date(date.year + "-" + (date.month + 1) + "-" + date.day + " " + hour + ":" + minute);
        let newHour = (parseInt(hour) + 1).toString().padStart(2, '0');
        setEvent({...event, startDate: selectedDate, endDate: selectedDate, startTime: hour + ":" + minute, endTime: newHour + ":" + minute});
    
        setOpenEventModal(true);
    }

    const handleDeleteEvent = async (eventId) => {
        await axios.delete(route('todo.destroy', eventId));
        getToDos();
        setOpenEditEventModal(false);
    }

    const addEvent = async () => {
        if(event.startDate && event.endDate && event.startTime && event.endTime && event.title){
            await axios.post(route('todo.store'), {
                from: moment(event.startDate).format("YYYY-MM-DD") + "T" + event.startTime + ":00+00:00",
                to: moment(event.endDate).format("YYYY-MM-DD") + "T" + event.endTime + ":00+00:00",
                title: event.title,
                is_important: event.isImportant,
                is_done: event.isDone,
                user_id: auth.user.id
            });
        } else {
            Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Bitte füllen Sie alle Felder aus!',
            });
        }
        
        setEvent({});
        setOpenEventModal(false);
        getToDos();
    }

    const handleEditEvent = (eventId) => {
        const event = events.find(event => event.id === eventId);
        setEvent({id: event.id, title: event.title, startDate: new Date(event.from), endDate:new Date(event.to), startTime: moment(event.from).utc().format("HH:mm"), endTime: moment(event.to).utc().format("HH:mm"), isImportant: event.isImportant, isDone: event.isDone});
        setOpenEditEventModal(true);
    }

    

    useEffect(() => {
        getToDos();

    }, []);

    useEffect(() => {
        let interval =  setInterval(() => {
            getToDos();
        }, 5000);
        return () => clearInterval(interval);
    }, []);
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    ToDo Liste
                </h2>
            }
        >
            <Head title="ToDo Liste" />

            <Modal
                show={openEventModal}
                size={"5xl"}
                onClose={() => setOpenEventModal(false)}
            >
                <Modal.Header>Neuer Task</Modal.Header>
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
                                id="notesStartDate"
                                name="notesStartDate"
                                type="date"
                                defaultDate={event.startDate}
                                value={event.startDate}
                                onSelectedDateChanged={(date) => {
                                    let datenew = new Date(date);
                                    console.log(datenew);
                                    setEvent({...event, startDate: datenew})
                                }}
                            />

                            <div
                                className="flex flex-row gap-2 justify-center"
                                style={{ maxHeight: 50 }}
                            >
                                <input
                                    type="time"
                                    id="notesStartTime"
                                    name="notesStartTime"
                                    className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    value={event.startTime}
                                    onChange={(e) => {
                                       setEvent({...event, startTime: e.target.value})
                                    }}
                                />
                                <p className="justify-self-center">bis</p>
                                <input
                                    type="time"
                                    id="notesEndTime"
                                    name="notesEndTime"
                                    className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-6000 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    value={event.endTime}
                                    onChange={(e) => {
                                        setEvent({...event, endTime: e.target.value})
                                    }}
                                />
                            </div>

                            <Datepicker
                                inline
                                language="de-DE"
                                id="notesEndDate"
                                name="notesEndDate"
                                defaultDate={event.endDate}
                                selectedDate={event.endDate}
                                showTodayButton={false}
                                showClearButton={false}
                                value={event.endDate}
                                type="date"
                                onSelectedDateChanged={(date) => {
                                    let datenew = new Date(date)
                                    setEvent({...event, endDate: datenew})
                                }}
                            />
                        </div>
                        <br />
                      
                        <textarea type="text" className="w-full" placeholder="Task Title" onChange={(e) => setEvent({...event, title: e.target.value})} >{event.title}</textarea>

                        <ToggleSwitch
                            label="Wichtig?"
                            id="isImportant"
                            name="isImportant"
                            checked={event.isImportant}
                            onChange={(e) => setEvent({...event, isImportant: e})}
                        />
                        <br/>
                        <ToggleSwitch
                            label="Erledigt?"
                            id="isDone"
                            name="isDone"
                            checked={event.isDone}
                            onChange={(e) => setEvent({...event, isDone: e})}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={addEvent}>
                        Task Hinzufügen
                    </Button>
                    <Button
                        color="gray"
                        onClick={() => setOpenEventModal(false)}
                    >
                        Abbrechen
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={openEditEventModal}
                size={"5xl"}
                onClose={() => setOpenEditEventModal(false)}
            >
                <Modal.Header>Task bearbeiten</Modal.Header>
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
                                id="eventStartDate"
                                name="eventStartDate"
                                type="date"
                                defaultDate={event.startDate}
                                value={event.startDate}
                                onSelectedDateChanged={(date) => {
                                    let datenew = new Date(date);
                                    setEvent({...event, startDate: datenew})
                                }}
                            />

                            <div
                                className="flex flex-row gap-2 justify-center"
                                style={{ maxHeight: 50 }}
                            >
                                <input
                                    type="time"
                                    id="eventStartTime"
                                    name="eventStartTime"
                                    className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    value={event.startTime}
                                    onChange={(e) => {
                                       setEvent({...event, startTime: e.target.value})
                                    }}
                                />
                                <p className="justify-self-center">bis</p>
                                <input
                                    type="time"
                                    id="eventEndTime"
                                    name="eventEndTime"
                                    className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-6000 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    value={event.endTime}
                                    onChange={(e) => {
                                        setEvent({...event, endTime: e.target.value})
                                    }}
                                />
                            </div>

                            <Datepicker
                                inline
                                language="de-DE"
                                id="eventEndDate"
                                name="eventEndDate"
                                defaultDate={event.endDate}
                                selectedDate={event.endDate}
                                showTodayButton={false}
                                showClearButton={false}
                                value={event.endDate}
                                type="date"
                                onSelectedDateChanged={(date) => {
                                    let datenew = new Date(date)
                                    setEvent({...event, endDate: datenew})
                                }}
                            />
                        </div>
                        <br />
                      
                        <textarea type="text" className="w-full" placeholder="Task Title" onChange={(e) => setEvent({...event, title: e.target.value})}  defaultValue={event.title}></textarea>

                        <ToggleSwitch
                            label="Wichtig?"
                            id="isImportant"
                            name="isImportant"
                            checked={event.isImportant}
                            onChange={(e) => setEvent({...event, isImportant: e})}
                        />
                        <br/>
                        <ToggleSwitch
                            label="Erledigt?"
                            id="isDone"
                            name="isDone"
                            checked={event.isDone}
                            onChange={(e) => setEvent({...event, isDone: e})}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={editEvent}>
                        Task bearbeiten
                    </Button>
                    <Button
                        color="gray"
                        onClick={() => setOpenEventModal(false)}
                    >
                        Abbrechen
                    </Button>

                    <Button
                        color="red"
                        onClick={() => {
                            Swal.fire({
                                title: 'Bist du sicher?',
                                text: "Möchten Sie diesen Task wirklich löschen?",
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: '#3085d6',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'Ja, löschen!',
                                cancelButtonText: 'Abbrechen'
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    handleDeleteEvent(event.id);
                                }
                            });
                        }}
                    >
                        Task löschen
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className="container mx-auto mt-10">
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                    <Calendar
                        
                        onClickEvent={(event) => {
                            handleEditEvent(event);
                        }}
                        onClickTimeLine={(event) => {
                            handleSelectDate(event);
                        }}
                        events={events}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
