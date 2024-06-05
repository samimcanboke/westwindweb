import { useEffect, useState } from 'react'
import axios from 'axios'; 
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Accordion, AccordionContent, AccordionPanel, AccordionTitle,Label,Datepicker,Checkbox,Textarea,ToggleSwitch,Select, Button,
Table } from "flowbite-react";


export default function NewJobs({ auth }) {
    const initialValues = {
        initialDate: "",
        zugNummer: "",
        tourName: "",
        locomotiveNumber: "",
        cancel: false,
        accomodation: false,
        bereitschaft: false,
        comment: "",
        client: [],
        feedingFee: "",
        guestStartPlace: "",
        guestStartTime: "",
        guestStartEndPlace:"",
        guestStartEndTime: "",
        workStartPlace:"",
        workStartTime:"", 
        trainStartPlace: "",
        trainStartTime: "",
        trainEndPlace:"",
        trainEndTime: "",
        breaks: [],
        workEndPlace:"",
        workEndTime:"", 
        guestEndPlace:"",
        guestEndTime: "",
        guestEndEndPlace:"",
        guestEndEndTime: "",

      }

      const [values, setValues] = useState(initialValues)
      const [breakStart,setBreakStart] = useState("");
      const [breakEnd,setBreakEnd] = useState("");

      const addBreaks = () => {
        setBreakStart("");
        setBreakEnd("");
        setValues(values => ({
            ...values,
            breaks: [...values.breaks, {startTime: breakStart, endTime: breakEnd}], 
        }))
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
    
      function handleChange(e) {
        const key = e.target.id;
        const value = e.target.value
        switch(key){
            case "guestStartEndPlace":
                setValues(values => ({
                    ...values,
                    workStartPlace: values.workStartPlace  == "" ? value : values.workStartPlace,
                    trainStartPlace: values.trainStartPlace == "" ? value : values.trainStartPlace,
                    [key]: value,
                    
                }))
                break;
            case "guestStartEndTime":
                setValues(values => ({
                    ...values,
                    workStartTime: values.workStartTime  == "" ? value : values.workStartTime,
                    [key]: value,
                    
                }))
                break;
            case "trainEndPlace": 
                setValues(values => ({
                    ...values,
                    workEndPlace: values.workEndPlace  == "" ? value : values.workEndPlace,
                    [key]: value,
                    
                }))
                break;
            default: 
                setValues(values => ({
                    ...values,
                    [key]: value,
                }))
                break;
        }
      }
    
    function handleSubmit(e) {
        e.preventDefault()
        if(values.initialDate == "" || values.zugNummer == "" || values.tourName == "" || values.locomotiveNumber == "" || values.workStartPlace == ""  || values.workStartTime == "" || values. workEndPlace == "" || values.workEndTime == ""){
            alert("Lütfen Gerekli alanları doldurunuz.");
        } else {
            axios.post('/save-draft-jobs', values).then((res) => {
                if(res.status){
                    setValues(initialValues);
                }
            });
        }
    }



       
        //TODO: Finalized Jobs kısmında kullanıcı geriye dönük tüm kayıtlarını görebilecek. Bunun için bir ay ve yıl filtresi koyacağız. bu filtre sonrasında seçtiği ay ve yıl için veritabanında bulunan tüm onaylanmış işler excel formatına dönüştürülecek ve ekranda pdf olarak açılacak.
        // TODO : Pdf yazdırılabilecek ya da whatsapp dan paylaşılabilecek. 

    
        //TODO: 3 tane admin kullanıcısı olacak. bu kullanıcılar diğer kullanıcılara turları işleyecek. 
        
        // Tur işlerken gereken alanlar :  Whatsapp dan atılan bilgiler, tarih, müşteri adı, tren başlangıç saati ve bitiş saati , tur adı, gece gündüz bağlantısı evet hayır.
        
        // Finalize olan işler için bir ekran olacak adminin gördüğü bu ek

        // 10 - 12 arası çalıştıysa 

        // Resmi tatil günlerini girebileceğimiz bir ekran olsun. oradan tarihleri ve saatleri girelim admin olarak örn : 01.01.2025 00:00 dan başlayıp 02.01.2025 23:59 a kadar.

        // İş kaydedilirken eğer resmi tatil, gece mesai saatleri grubu ya da pazar gününe denk gelen saatler ayrıca ayrıştırılıp veri tabanına yazılacak. 

        // admin panelde onaya gelen işlerde değişiklik yapılmalı ve bu değişiklik sonrası onaylanmalı. 


        // saadettin abi den gelen verilere göre güncelleme yapılacak. 

        // Kullanıcılara her tur girildiğinde plannung mailinden mail iletilecek. Bu mailin taslağı : saadettin abi gönderiyor. (whatsapp dan ) 3 taslak hazırlanacak. konusu ile ilgili taslak gönderilecek. içerikler otomatik olacak. 
        // yeni olan wpden atıldı. düzenlemede değişen alan kırmızı ve üstü çizili şekilde yazacak yenisi yanına yeşil yazılacak. iptal se bütün içerik kırmızı yazılacak ve kullanıcının planlamasından silinecek.

        // İşin başlangıcına 24 saat kala iş iptal edilemez. (makinist basabilir ama admin cancel edemez.)  


        // admin e güzergah ile ilgili not ekleme bölümü konulacak. ( en son iş ) 

        // Yorum satırı max 160 karakter


        // 7 gün boyunca  0 - 24 bir skala olacak.  

        
    

        
     
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">New Jobs</h2>}
        >
            <Head title="NewJobs" />
            <Label className='p-3 flex justify-center '> Evden Çıkıldığı andan geri dönüşe kadar tüm plan bu kısma yazılacak. </Label>
            <Accordion>
          
                <AccordionPanel>
                    <AccordionTitle>General Information</AccordionTitle>
                    <AccordionContent>
             
                        <Label>Start Date</Label>
                        <Datepicker language="de-DE" labelTodayButton="Heute" labelClearButton="Löschen" value={values.initialDate} onSelectedDateChanged={(date)=>{
                             setValues(values => ({
                                ...values,
                                initialDate: date,
                            }));
                        }} />
                         <br />
                        <Label>Zug Nummer</Label>
                        <input id="zugNummer" type='text' placeholder="Zug Nummer" onChange={handleChange} className='placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm' />

                        <br />
                        <Label>Tour Name</Label>
                        <input id="tourName" type='text' placeholder="T-123" onChange={handleChange} className='placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm' />
                        
                        <br />
                        <Label>Locomotive Number</Label>
                        <input id="locomotiveNumber" type='text' placeholder="L123123" onChange={handleChange} className='placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm' />

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
                                feedingFee: 32,
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
                        
                        
                        <br />
                     
                    
                    
                        <Label>Comment</Label>
                        <Textarea id="comment" placeholder="Leave a comment..." onChange={handleChange} value={values.comment} required rows={4} />

                        <br />
                        <div className="max-w-md">
                            <div className="mb-2 block">
                                <Label htmlFor="client" value="Select your client" />
                            </div>
                            <Select id="client" onChange={handleChange} required>
                                <option>Seçiniz...</option>
                                <option>LTE Niederlande</option>
                                <option>Westwind Eissenbahnservice</option>
                            </Select>
                        </div>
                        <br />
                     
                        <div className="max-w-md">
                         <div className="mb-2 block">
                             <Label htmlFor="feedingFee" value="Select your feeding Fee" />
                         </div>
                         <Select id="feedingFee" onChange={handleChange} required value={values.feedingFee}>
                             <option value={0}>0€</option>
                             <option value={16}>16€</option>
                             <option value={32}>32€</option>
                         </Select>

                         {/*//TODO: Bu alana bir buton koyulacak. Bu buton eğer bu güzergah ile ilgili bir not alınmışsa görünecek. Tıklanınca ilgili notlar görünecek. (en son iş)*/}
                     </div>

                    </AccordionContent>
                </AccordionPanel>
                <AccordionPanel>
                    <AccordionTitle>Misafir Gidişi</AccordionTitle>
                    <AccordionContent>
                    <Label>Nereden Gittiği</Label>
                    <input id="guestStartPlace" type='text' placeholder="Zug Nummer" onChange={handleChange} className='placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm' value={values.guestStartPlace} />

                    <br />

                    <Label>Gidiş Saat:</Label>
                    <div className="flex">
                        <input type="time" id="guestStartTime" className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" min="09:00" max="18:00" value={values.guestStartTime} 
                        onChange={handleChange}  />
                        <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-s-0 border-s-0 border-gray-300 rounded-e-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                <path  d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"/>
                            </svg>
                        </span>
                    </div>
                        <br />
                        <Label>Varış Yeri</Label>
                    <input id="guestStartEndPlace" type='text' placeholder="Varış Yeri" onChange={handleChange} className='placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm' value={values.guestStartEndPlace} />

                    <br />

                    <Label>Varış Saati:</Label>
                    <div className="flex">
                        <input type="time" id="guestStartEndTime" className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" min="09:00" max="18:00" value={values.guestStartEndTime} 
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
                    <Label>Başlangıç Yeri</Label>
                    <input id="workStartPlace" type='text' placeholder="İş Başlangıcı" onChange={handleChange} className='placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm' value={values.workStartPlace == "" ? values.guestStartEndPlace : values.workStartPlace} />

                    <br />

                    <Label>Başlangıç Saat:</Label>
                    <div className="flex">
                        <input type="time" id="workStartTime" className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" min="09:00" max="18:00" value={values.workStartTime != "" ?  values.workStartTime : values.guestStartEndTime } 
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
                    <input id="trainStartPlace" type='text' placeholder="Tren Kalkış Yeri" onChange={handleChange} className='placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm' value={values.trainStartPlace == "" ? values.guestStartEndPlace : values.trainStartPlace} />

                    <br />

                    <Label>Tren Kalkış Saati:</Label>
                    <div className="flex">
                        <input type="time" id="trainStartTime" className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" min="09:00" max="18:00" value={values.trainStartTime} 
                        onChange={handleChange}  />
                        <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-s-0 border-s-0 border-gray-300 rounded-e-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                <path  d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"/>
                            </svg>
                        </span>
                    </div>
                    <Label>Tren Varış Yeri</Label>
                    <input id="trainEndPlace" type='text' placeholder="Tren Varış Yeri" onChange={handleChange} className='placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm' value={values.trainEndPlace} />

                    <br />

                    <Label>Tren Varış Saati:</Label>
                    <div className="flex">
                        <input type="time" id="trainEndTime" className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" min="09:00" max="18:00" value={values.trainEndTime} 
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
                           
                                {values.breaks.map((brk,key)=>(
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
                    <input id="workEndPlace" type='text' placeholder="İş Başlangıcı" onChange={handleChange} className='placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm' value={values.workEndPlace == "" ? values.trainEndPlace : values.workEndPlace } />

                    <br />

                    <Label>İş Bitiş Saat:</Label>
                    <div className="flex">
                        <input type="time" id="workEndTime" className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" min="09:00" max="18:00" value={values.workEndTime} 
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
                    <input id="guestEndPlace" type='text' placeholder="Şehir" onChange={handleChange} className='placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm' value={values.guestEndPlace == "" ? values.trainEndPlace : values.guestEndPlace} />

                    <br />

                    <Label>Gidiş Saat:</Label>
                    <div className="flex">
                        <input type="time" id="guestEndTime" className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" min="09:00" max="18:00" value={values.guestEndTime} 
                        onChange={handleChange}  />
                        <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-s-0 border-s-0 border-gray-300 rounded-e-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                <path  d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"/>
                            </svg>
                        </span>
                    </div>
                        <br />
                        <Label>Varış Yeri</Label>
                    <input id="guestEndEndPlace" type='text' placeholder="Varış Şehri" onChange={handleChange} className='placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm' value={values.guestEndEndPlace} />

                    <br />

                    <Label>Gidiş Saat:</Label>
                    <div className="flex">
                        <input type="time" id="guestEndEndTime" className="rounded-none rounded-s-lg bg-gray-50 border text-gray-900 leading-none focus:ring-blue-500 focus:border-blue-500 block flex-1 w-full text-sm border-gray-300 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" min="09:00" max="18:00" value={values.guestEndEndTime} 
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
            <br/>
            <div className='flex justify-center items-center'>
                <Button className='mb-5' onClick={handleSubmit}>Kaydet</Button>
            </div>
            
        </AuthenticatedLayout>
    );
}
