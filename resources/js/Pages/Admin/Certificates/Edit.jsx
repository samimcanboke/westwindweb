import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import Swal from "sweetalert2";
import { Button, Spinner, ToggleSwitch } from "flowbite-react";
import axios from "axios";
import * as yup from "yup";


const validationSchema = yup.object().shape({
    name: yup.string().required("Name erforderlich"),
});


export default function editCertificate({ auth,id }) {
    const [certificate, setCertificate] = useState({});
    const [initialValues, setInitialValues] = useState({
        id: "",
        name: "",
        sort: "",
        is_mandatory: "",
    });

    useEffect(() => {
        axios.get(route('certificates.show',{id:id}))
        .then(res => {
            console.log(res.data);
            setCertificate(res.data);
            setInitialValues({
                id: res.data.id,
                name: res.data.name,
                sort: res.data.sort,
                is_mandatory: res.data.is_mandatory,
            });
        })
        .catch(error => {
            alert(error);
        });
    }, [id]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Zertifikat Bearbeiten
                </h2>
            }
        >
            <Head title="Zertifikat Bearbeiten" />

            <div className="container mx-auto mt-10">
                {   certificate && (
                <Formik
                    initialValues={initialValues}
                    enableReinitialize={true}
                    validationSchema={validationSchema}
                    onSubmit={(values, { setSubmitting, resetForm  }) => {
                        axios.put(route('certificates.update',{id:values.id}), values)
                        .then(res => {
                            if (res.data.success) {
                                resetForm();
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Erfolgreich',
                                    text: 'Zertifikat erfolgreich bearbeitet!',
                                });
                                window.location.href = '/certificates';
                            } else {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Hata',
                                    text: data.data.message || 'Zertifikat konnte nicht bearbeitet werden!',
                                });
                            }
                            setSubmitting(false);
                        })
                        .catch((error) => {
                            console.log("error",error);
                            Swal.fire({
                                icon: 'error',
                                title: 'Hata',
                                text: error.response.data.message || 'Zertifikat konnte nicht aktualisiert werden!',
                            });
                            setSubmitting(false);
                        });
                    }}
                >
                    {({ values, isSubmitting, setFieldValue, errors, touched }) => (
                        <Form>
                            <div className="mb-4 mx-4">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                                <Field
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={values.name}
                                    onChange={(e) => setFieldValue("name", e.target.value)}
                                    className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                />
                                {errors.name && touched.name && (
                                        <p className="text-red-500">
                                            *{errors.name}
                                        </p>
                                )}
                            </div>
                            <div className="mb-4 mx-4">
                                <label htmlFor="reminder_period_days" className="block text-sm font-medium text-gray-700"> Zertifikat Nr. </label>
                                <Field type="number" name="sort" id="sort" value={values.sort} className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm" />
                                {errors.reminder_period_days && touched.reminder_period_days && (
                                        <p className="text-red-500">
                                            *{errors.sort}
                                        </p>
                                )}
                            </div>

                            <div className="mb-4 mx-4">
                                <label htmlFor="is_mandatory" className="block text-sm font-medium text-gray-700">Ist verpflichtend </label>
                                <ToggleSwitch
                                    label="Verpflichtend ?"
                                    id="is_mandatory"
                                    name="is_mandatory"
                                    checked={values.is_mandatory}
                                    onChange={(e)=>{setFieldValue('is_mandatory',e)}}
                                />
                                {errors.is_mandatory && touched.is_mandatory && (
                                        <p className="text-red-500">
                                            *{errors.is_mandatory}
                                        </p>
                                    )}
                            </div>



                            <div className="flex items-center justify-end mt-4 mx-4">
                                {isSubmitting && (
                                    <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded">
                                        <Spinner
                                            aria-label="Spinner button example"
                                            size="sm"
                                        />
                                        <span className="pl-3">Loading...</span>
                                    </Button>
                                )}
                                {!isSubmitting && (
                                    <Button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded">
                                        Einreichen
                                    </Button>
                                )}
                            </div>
                        </Form>
                    )}
                </Formik>
                )}
            </div>

        </AuthenticatedLayout>
    );
}
