import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect,useState} from 'react';
import { Accordion, AccordionContent, AccordionPanel, AccordionTitle,Label,Datepicker,Textarea,ToggleSwitch,Select, Button, Table } from "flowbite-react";
import Swal from 'sweetalert2';


export default function Dashboard({ auth }) {

    const [filterView,setFilterView] = useState(false);
    const [confirmedJobs,setConfirmedJobs] = useState([]);
    const [filter,setFilter] = useState({});
    const [filterSources,setFilterSources] = useState({
        user: "",
        client: "",
        month: "",
        year: "",
    });
    

    useEffect(()=>{
        axios.get("finalized-filter").then((res)=>{
            if(res.status == 200){
                setFilterSources({
                    user: res.data.users,
                    client: res.data.clients,
                    month: res.data.months,
                    year: res.data.year
                })
            }
        })
    },[])



    const handleChange = (e)=> {
        let key = e.target.id;
        let value = e.target.value;        
        setFilter(filter => ({
            ...filter,
            [key]: value,
        }))
        
    }
  

    const filterAction = () => {
        setFilterView(false);
        axios.post("/finalized-jobs/export",{filter}).then(res => {
            if(res.data.status){
                let url = "/download-pdf/" + res.data.file + ".pdf";
                window.open(url, "_blank", "noreferrer");
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Hata',
                    text: 'Onaylanan İş Bulunamadı',
                })
            }
        })
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Confirmed Jobs</h2>}
        >
            <Head title="Confirmed Jobs" />

            {filterView && (<div className='flex justify-start flex-col p-5'>
                <div className="max-w-md">
                    <div className="mb-2 block">
                        <Label htmlFor="client" value="Select client" />
                    </div>
                    <Select id="client" onChange={handleChange}>
                        <option >Seçiniz...</option>
                        {filterSources.client && (filterSources.client.map((client)=>(
                            <option key={client.id} value={client.id}>{client.name}</option>
                        )))}
                    </Select>
                </div>
                <br/>
                <div className="max-w-md">
                    <div className="mb-2 block">
                        <Label htmlFor="id" value="Select user id" />
                    </div>
                    <Select id="user" onChange={handleChange}>
                        <option >Seçiniz...</option>
                        {filterSources.user && (filterSources.user.map((user)=>(
                            <option key={user.id} value={user.id}>{user.name}</option>
                        )))}
                    </Select>
                </div>
                <br/>
                <div className="max-w-md">
                    <div className="mb-2 block">
                        <Label htmlFor="id" value="Month" />
                    </div>
                    <Select id="month" onChange={handleChange}>
                        <option id="" >Seçiniz...</option>
                        {filterSources.month && (filterSources.month.map((month,index)=>(
                            <option key={index} value={index + 1}>{month}</option>
                        )))}
                    </Select>
                </div>
                <br/>
                <div className="max-w-md">
                    <div className="mb-2 block">
                        <Label htmlFor="id" value="Year" />
                    </div>
                    <Select id="year" onChange={handleChange}>
                        <option>Seçiniz...</option>
                        {filterSources.year && (filterSources.year.map((year,index)=>(
                            <option key={index} value={year}>{year}</option>
                        )))}
                    </Select>
                </div>
                
                <br/>
                <div className="max-w-md flex justify-end p-5">
                    <div className="mb-2 block">
                        <Button  onClick={filterAction}>Dosyayı Getir</Button>
                    </div>
                    
                </div>

              
            

            </div>)}

            {!filterView && (
                <div className='flex justify-end p-5'>
                    <Button onClick={()=>{
                    setFilterView(true);

                    }}>Filtreleri Göster</Button>
                </div>
            )}

            
                

        </AuthenticatedLayout>
    );
}
