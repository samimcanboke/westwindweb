import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect,useState} from 'react';
import { Accordion, AccordionContent, AccordionPanel, AccordionTitle,Label,Datepicker,Textarea,ToggleSwitch,Select, Button, Table } from "flowbite-react";
import Swal from 'sweetalert2';


export default function ConfirmedToClient({ auth }) {

    const [filterView,setFilterView] = useState(true);
    const [filter,setFilter] = useState({});
    const [weekSelectable, setWeekSelectable] = useState(false);
    const [monthSelectable, setMonthSelectable] = useState(false);
    const [filterSources,setFilterSources] = useState({
        user: "",
        client: "",
        month: "",
        year: "",
        week: "",
    });
    const [excelUrl, setExcelUrl] = useState("");
    const [errors,setErrors] = useState({});

    const convertPDF = async () => {
        axios.post("/finalized-jobs/export-client-pdf",{user_id: filter.user,client_id: filter.client,week: filter.week,month: filter.month,year: filter.year})
        .then(res => {
            window.open("/download-pdf/" + res.data.file + ".pdf", '_blank');
        })
    }
    
    useEffect(()=>{
        axios.get("finalized-filter").then((res)=>{
            if(res.status == 200){
                res.data.year.sort((a,b)=>{
                    return b - a;
                })
                setFilterSources({
                    user: res.data.users,
                    client: res.data.clients,
                    month: res.data.months,
                    year: res.data.year,
                    week: Array.from({ length: 52 }, (_, i) => i + 1)
                })
            }
        })
    },[])

    const handleChange = (e) => {
        let key = e.target.id;
        let value = e.target.value;
        if (key == "week") {
            if (value != "Suchen...") {
                setMonthSelectable(true);
            } else {
                setMonthSelectable(false);
            }
        }
        if (key == "month") {
            if (value != "Suchen...") {
                setWeekSelectable(true);
            } else {
                setWeekSelectable(false);
            }
        }
        setFilter((filter) => ({
            ...filter,
            [key]: value,
        }));
    };
  

    const filterAction = () => {
        setExcelUrl("");
        axios.post("/finalized-jobs/export-client", {user_id: filter.user,client_id: filter.client,week: filter.week,month: filter.month,year: filter.year})
        .then(res => {
            if(res.data.status){
                setExcelUrl("/download-pdf/" + res.data.file + ".xlsx");
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Hata',
                    text: 'Onaylanan İş Bulunamadı',
                })
            }
        })
        .catch(err => {
            Swal.fire({
                icon: 'error',
                title: 'Hata',
                text: err.response.data.message,
            })
            setErrors(err.response.data.errors);
        })
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Kunden Excel Bericht</h2>}
        >
            <Head title="Kunden Excel Bericht" />

            {filterView && (
            <div className='flex justify-center flex-row p-5 mx-auto'>
                <div className="max-w-md w-1/6 mx-5">
                    <div className="mb-2 block">
                        <Label htmlFor="client" value="Kunden" />
                    </div>
                    <Select id="client" onChange={handleChange}>
                        <option >Suchen...</option>
                        {filterSources.client && (filterSources.client.map((client)=>(
                            <option key={client.id} value={client.id}>{client.name}</option>
                        )))}
                    </Select>
                    {errors && errors.client_id && <p className="text-red-500">{errors.client_id}</p>}
                </div>
                <br/>
                <div className="max-w-md w-1/6 mx-5">
                    <div className="mb-2 block">
                        <Label htmlFor="id" value="Mitarbeiten" />
                    </div>
                    <Select id="user" onChange={handleChange}>
                        <option >Suchen...</option>
                        {filterSources.user && (filterSources.user.map((user)=>(
                            <option key={user.id} value={user.id}>{user.name}</option>
                        )))}
                    </Select>
                    {errors && errors.user_id && <p className="text-red-500">{errors.user_id}</p>}
                </div>
                <br/>
                <div className="max-w-md w-1/6 mx-5">
                    <div className="mb-2 block">
                        <Label htmlFor="id" value="Woche" />
                    </div>
                    <Select id="week" onChange={handleChange} disabled={weekSelectable}>
                        <option id="" >Suchen...</option>
                        {filterSources.week && (filterSources.week.map((week,index)=>(
                            <option key={index} value={week}>{week.toString().padStart(2, '0')}</option>
                        )))}
                    </Select>
                    {errors && errors.week && <p className="text-red-500">{errors.week}</p>}
                </div>
                <br/>
                <div className="max-w-md w-1/6 mx-5">
                    <div className="mb-2 block">
                        <Label htmlFor="id" value="Monat" />
                    </div>
                    <Select id="month" onChange={handleChange} disabled={monthSelectable}>
                        <option id="" >Suchen...</option>
                        {filterSources.month && (filterSources.month.map((month,index)=>(
                            <option key={index} value={index + 1}>{month}</option>
                        )))}
                    </Select>
                    {errors && errors.month && <p className="text-red-500">{errors.month}</p>}
                </div>
                <br/>
                <div className="max-w-md w-1/6 mx-5">
                    <div className="mb-2 block">
                        <Label htmlFor="id" value="Jahr" />
                    </div>
                    <Select id="year" onChange={handleChange}>
                        <option>Suchen...</option>
                        {filterSources.year && (filterSources.year.map((year,index)=>(
                            <option key={index} value={year}>{year}</option>
                        )))}
                    </Select>
                    {errors && errors.year && <p className="text-red-500">{errors.year}</p>}
                </div>
                
                <br/>
                <div className="max-w-md flex justify-end p-5">
                    <div className="mb-2 block">
                        <Button  onClick={filterAction}>Datei Abrufen</Button>
                    </div>
                    
                </div>

              
            

            </div>)}


            {excelUrl && (
                <div className='flex justify-center p-5'>
                
                        
                    <div className='flex justify-center p-5'>
                        <a href={excelUrl} target="_blank">
                            <Button>Excel Download</Button>
                        </a>
                    </div>
                    <div className='flex justify-center p-5'>
                 
                        <Button className='bg-green-500' onClick={convertPDF}>PDF Download</Button>
                        
                    </div>
                </div>
            )}

            

            
                

        </AuthenticatedLayout>
    );
}
