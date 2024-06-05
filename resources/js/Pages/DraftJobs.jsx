import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import {useEffect,useState} from 'react';
import { Head } from '@inertiajs/react';
import { Accordion, AccordionContent, AccordionPanel, AccordionTitle,Label,Datepicker,Textarea,ToggleSwitch,Select, Button, Table } from "flowbite-react";

export default function DraftJobs({ auth }) {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEdit, setShowEdit] = useState(false);
    const [values,setValues] =useState({});
    const [breakStart,setBreakStart] = useState("");
    const [breakEnd,setBreakEnd] = useState("");


    //TODO: gönderince listeyi yenile.
    const addBreaks = () => {
    setBreakStart("");
    setBreakEnd("");
    setValues(values => ({
        ...values,
        breaks: [...values.breaks, {startTime: breakStart, endTime: breakEnd}], 
    }))
    }

    const edit = (draft) => {
        let editingDraft = draft;
        editingDraft.breaks = JSON.parse(draft.breaks);
        setValues(editingDraft);
        setShowEdit(true);
    }

    const removeBreak=(break_index) =>{
    let array = [...values.breaks]; // make a separate copy of the array
    if (break_index !== -1) {
        array.splice(break_index, 1);
        setValues(values => ({
            ...values,
            breaks: array, 
        }))
        
    }
    }
    const deleteDraft = (draft_id) => {
        axios.post('/delete-draft-jobs',{draft_id: draft_id}).then(res => {
            let deletedDraft = data.findIndex((draft)=>{
                return draft.id === draft_id
            })
            let newArr = data.splice(deletedDraft,1);
            setData(newArr);
        })
    }
    const sendSubmit = (draft_id) => {
        axios.post('/send-submit-draft-jobs',{draft_id: draft_id}).then(res => {
            let sendedDrafts = data.findIndex((draft)=>{
                return draft.id === draft_id
            })
            let newArr = data.splice(sendedDrafts,1);
            setData(newArr);
        })
    }

    useEffect(()=>{
        axios.get('/data-draft-jobs').then(res => {            
            setData(res.data);
            setLoading(false);
        })
    },[]);

    function handleChange(e) {
        const key = e.target.id;
        const value = e.target.value
        setValues(values => ({
            ...values,
            [key]: value,
        }))
    }

    function handleSubmit(e) {
        e.preventDefault()
        setLoading(true);
        axios.post('/update-draft-jobs', values).then((res) => {
            if(res.status){
                axios.get('/data-draft-jobs').then(res => {            
                    setData(res.data);
                    setLoading(false);
                    setShowEdit(false);
                })
            }
        });
    }


    /**
     * Misafir Gidişinde Varış saati ile iş başlangıç saati aynı olacak. 
     * 
     *         // Yorum satırı max 160 karakter

     */


    
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">DraftJobs</h2>}
        >
            <Head title="DraftJobs" />

            {data.length == 0 && (<div className='flex justify-center items-center h-48'>
                Hiç veri bulunamadı.
            </div>)}

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
                        
                        {!showEdit && !loading && data.map((draft,index) => (
                            <Table.Row key={index} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                {draft.initial_date}
                                </Table.Cell>
                                <Table.Cell>{draft.tour_name}</Table.Cell>
                                <Table.Cell className=' text-center '>
                                <a href="#" className="font-medium text-cyan-600 hover:underline dark:text-cyan-500" onClick={()=>{
                                    deleteDraft(draft.id);
                                }}>
                                    Delete
                                </a> <br /> <br /> <br />
                                <a href="#" className="font-medium text-cyan-600 hover:underline dark:text-cyan-500" onClick={()=>{
                                    edit(draft);
                                }}>
                                    Edit
                                </a> <br /> <br /> <br />
                                <a href="#" className="font-medium text-cyan-600 hover:underline dark:text-cyan-500" onClick={()=>{
                                    sendSubmit(draft.id);
                                }}>
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
                    <div className='flex justify-center items-center flex-column h-24 font-bold '>
                        <p>Edit Information</p></div>
                        <Accordion>
                
                        <AccordionPanel>
                            <AccordionTitle>General Information</AccordionTitle>
                            <AccordionContent>
                        
                                <Label>Start Date</Label>
                                <Datepicker language="de-DE" labelTodayButton="Heute" labelClearButton="Löschen" value={values.initial_date} onSelectedDateChanged={(date)=>{
                                        setValues(values => ({
                                        ...values,
                                        initialDate: date,
                                    }))
                                    console.log("selected",date.getTime());
                                }} />
                                    <br />
                                <Label>Zug Nummer</Label>
                                <input id="zugNummer" type='text' placeholder="Zug Nummer" onChange={handleChange} value={values.zug_nummer} className='placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm' />
        
                                <br />
                                <Label>Tour Name</Label>
                                <input id="tourName" type='text' placeholder="T-123" onChange={handleChange} value={values.tour_name} className='placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm' />
                                
                                <br />
                                <Label>Locomotive Number</Label>
                                <input id="locomotiveNumber" type='text' placeholder="L123123" onChange={handleChange} value={values.locomotive_number} className='placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm' />
        
                                <br />
                            
                                <ToggleSwitch  checked={values.cancel} label="Cancel" onChange={(value)=>{
                                        setValues(values => ({
                                        ...values,
                                        cancel: value,
                                    }))
                                }} />
                    
        
                                <br />
                            
                                <ToggleSwitch  checked={values.accomodation} label="Accomodation" onChange={(value)=>{
                                        setValues(values => ({
                                        ...values,
                                        accomodation: value,
                                    }))
                                }} />

                                <br />
                                        
                                        <ToggleSwitch  checked={values.bereitschaft} label="Bereitschaft" onChange={(value)=>{
                                                setValues(values => ({
                                                ...values,
                                                bereitschaft: value,
                                            }))
                                        }} />
                                
                            
                            
                                <Label>Comment</Label>
                                <Textarea id="comment" placeholder="Leave a comment..." onChange={handleChange} value={values.comment} required rows={4} />
        
                                <br />
                                <div className="max-w-md">
                                    <div className="mb-2 block">
                                        <Label htmlFor="client" value="Select your client" />
                                    </div>
                                    <Select id="client" onChange={handleChange} required>
                                        <option selected={values.client_id == 0}>Seçiniz...</option>
                                        <option selected={values.client_id == 1}>LTE Niederlande</option>
                                        <option selected={values.client_id == 2}>Westwind Eissenbahnservice</option>
                                    </Select>
                                </div>
                                <br />
                                
                                <div className="max-w-md">
                                    <div className="mb-2 block">
                                        <Label htmlFor="feedingFee" value="Select your feeding Fee" />
                                    </div>
                                    <Select id="feedingFee" onChange={handleChange} required>
                                        <option selected={values.feeding_fee == "0€"}>0€</option>
                                        <option selected={values.feeding_fee == "16€"}>16€</option>
                                        <option selected={values.feeding_fee == "32€"}>32€</option>
                                    </Select>
                                </div>
        
                            </AccordionContent>
                        </AccordionPanel>
                        <AccordionPanel>
                            <AccordionTitle>Misafir Gidişi</AccordionTitle>
                            <AccordionContent>
                            <Label>Nereden Gittiği</Label>
                            <input id="guestStartPlace" type='text' placeholder="Zug Nummer" onChange={handleChange} className='placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm' value={values.guest_start_place} />
        
                            <br />
        
                            <Label>Gidiş Saat:</Label>
                            <div className="flex">
                                <input type="time" id="guestStartTime" className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"value={values.guest_start_time} 
                                onChange={handleChange}  />
                                <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-s-0 border-s-0 border-gray-300 rounded-e-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                        <path  d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"/>
                                    </svg>
                                </span>
                            </div>
                                <br />
                                <Label>Nereye Vardığı</Label>
                            <input id="guestStartEndPlace" type='text' placeholder="Varış Yeri" onChange={handleChange} className='placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm' value={values.guest_start_end_place} />
        
                            <br />
        
                            <Label>Varış Saati:</Label>
                            <div className="flex">
                                <input type="time" id="guestStartEndTime" className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={values.guest_start_end_time} 
                                onChange={handleChange}  />
                                <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-s-0 border-s-0 border-gray-300 rounded-e-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                        <path  d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"/>
                                    </svg>
                                </span>
                            </div>
                                <br />
                            </AccordionContent>
                        </AccordionPanel>
                        <AccordionPanel>
                            <AccordionTitle>İş Başlangıcı</AccordionTitle>
                            <AccordionContent>
                            <Label>Başlangıç Yeri {JSON.stringify(values)}</Label>
                            <input id="workStartPlace" type='text' placeholder="İş Başlangıcı" onChange={handleChange} className='placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm' value={values.work_start_place} />
        
                            <br />
        
                            <Label>Başlangıç Saat:</Label>
                            <div className="flex">
                                <input type="time" id="workStartTime" className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" min="09:00" max="18:00" value={values.work_start_time != "" ? values.work_start_time : values.guest_start_end_time} 
                                onChange={handleChange}  />
                                <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-s-0 border-s-0 border-gray-300 rounded-e-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                        <path  d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"/>
                                    </svg>
                                </span>
                            </div>
                            </AccordionContent>
                        </AccordionPanel>
                        <AccordionPanel>
                            <AccordionTitle>Tren Kalkış ve Varış</AccordionTitle>
                            <AccordionContent>
                            <Label>Tren Kalkış Yeri</Label>
                            <input id="trainStartPlace" type='text' placeholder="Tren Kalkış Yeri" onChange={handleChange} className='placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm' value={values.train_start_place} />
        
                            <br />
        
                            <Label>Tren Kalkış Saati:</Label>
                            <div className="flex">
                                <input type="time" id="trainStartTime" className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={values.train_start_time} 
                                onChange={handleChange}  />
                                <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-s-0 border-s-0 border-gray-300 rounded-e-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                        <path  d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"/>
                                    </svg>
                                </span>
                            </div>
                            <Label>Tren Varış Yeri</Label>
                            <input id="trainEndPlace" type='text' placeholder="Tren Varış Yeri" onChange={handleChange} className='placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm' value={values.train_end_place} />
        
                            <br />
        
                            <Label>Tren Varış Saati:</Label>
                            <div className="flex">
                                <input type="time" id="trainEndTime" className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"  value={values.train_end_time} 
                                onChange={handleChange}  />
                                <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-s-0 border-s-0 border-gray-300 rounded-e-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                        <path  d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"/>
                                    </svg>
                                </span>
                            </div>
                            </AccordionContent>
                        </AccordionPanel>
                        <AccordionPanel>
                            <AccordionTitle>Mola</AccordionTitle>
                            <AccordionContent>
                                <br />
                            <div className='flex justify-around items-center '>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Mola Başlangıç Saati:</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                                <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" clipRule="evenodd"/>
                                            </svg>
                                        </div>
                                        <input type="time" id="breakStartTime" className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" min="09:00" max="18:00" value={breakStart} 
                                        onChange={(e)=>{
                                            setBreakStart(e.target.value)
                                        }}/>
                                    </div>
                                </div>
                                <div>
                                    <label  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Mola Bitiş Saati:</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                                <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" clipRule="evenodd"/>
                                            </svg>
                                        </div>
                                        <input type="time" id="breakEndTime" className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" min="09:00" max="18:00" value={breakEnd} 
                                        onChange={(e)=>{
                                            setBreakEnd(e.target.value)
                                        }} />
                                    </div>
                                </div>
                                <div>
                                    <Button title="Ekle" onClick={addBreaks}>Ekle</Button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <br/>
                                <Table striped>
                                    <Table.Head>
                                    <Table.HeadCell>Başlangıç Saati</Table.HeadCell>
                                    <Table.HeadCell>Bitiş Saati</Table.HeadCell>
                                    <Table.HeadCell>
                                        <span className="sr-only">Sil</span>
                                    </Table.HeadCell>
                                    </Table.Head>
                                    <Table.Body className="divide-y">
                                    
                                    {values.breaks.length > 0 && values.breaks.map((brk,key)=>(
                                        <Table.Row key={key} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                            {brk.startTime}
                                            </Table.Cell>
                                            <Table.Cell>{brk.endTime}</Table.Cell>
                                            
                                            <Table.Cell>
                                            <Button href="#" className="font-medium text-cyan-600 hover:underline dark:text-white-200" onClick={()=>{
                                                removeBreak(key);
                                            }}>
                                                Sil
                                            </Button>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                       
                                     </Table.Body>
                                </Table>
                            </div>
        
                            
                            </AccordionContent>
                        </AccordionPanel>
                        <AccordionPanel>
                            <AccordionTitle>İş Bitişi</AccordionTitle>
                            <AccordionContent>
                            <Label>İş Bitiş Yeri</Label>
                            <input id="workEndPlace" type='text' placeholder="İş Başlangıcı" onChange={handleChange} className='placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm' value={values.work_end_place} />
        
                            <br />
        
                            <Label>İş Bitiş Saat:</Label>
                            <div className="flex">
                                <input type="time" id="workEndTime" className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" min="09:00" max="18:00" value={values.work_end_time} 
                                onChange={handleChange}  />
                                <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-s-0 border-s-0 border-gray-300 rounded-e-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                        <path  d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"/>
                                    </svg>
                                </span>
                            </div>
                            </AccordionContent>
                        </AccordionPanel>
                        <AccordionPanel>
                            <AccordionTitle>Misafir Eve Dönüşü</AccordionTitle>
                            <AccordionContent>
                            <Label>Nereden Gittiği</Label>
                            <input id="guestEndPlace" type='text' placeholder="Şehir" onChange={handleChange} className='placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm' value={values.guest_end_place} />
        
                            <br />
        
                            <Label>Gidiş Saat:</Label>
                            <div className="flex">
                                <input type="time" id="guestEndTime" className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" min="09:00" max="18:00" value={values.guest_end_time} 
                                onChange={handleChange}  />
                                <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-s-0 border-s-0 border-gray-300 rounded-e-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                        <path  d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"/>
                                    </svg>
                                </span>
                            </div>
                                <br />
                                <Label>Varış Yeri</Label>
                            <input id="guestEndEndPlace" type='text' placeholder="Varış Şehri" onChange={handleChange} className='placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm' value={values.guest_end_end_place} />
        
                            <br />
        
                            <Label>Gidiş Saat:</Label>
                            <div className="flex">
                                <input type="time" id="guestEndEndTime" className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" min="09:00" max="18:00" value={values.guest_end_end_time} 
                                onChange={handleChange}  />
                                <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-s-0 border-s-0 border-gray-300 rounded-e-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                        <path  d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"/>
                                    </svg>
                                </span>
                            </div>
                                <br />
                            </AccordionContent>
                        </AccordionPanel>
                    </Accordion>
                    <div className='flex justify-evenly items-center my-10 pb-20'>
                        <Button className=' bg-red-500 '
                        onClick={()=>{
                            setShowEdit(false);
                        }}
                        >İptal</Button> 
                        <Button onClick={handleSubmit}>Kaydet</Button>
                    </div>

                    </div>
            )}
                </div>
            )}
            
            
        </AuthenticatedLayout>
    );
}
