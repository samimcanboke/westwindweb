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


export default function EditPrograms({ auth,id }) {
    const [program, setProgram] = useState({});
    const [initialValues, setInitialValues] = useState({
        id: "",
        name: "",
    });

    useEffect(() => {
        axios.get(route('programs.show',{id:id}))
        .then(res => {
            console.log(res.data);
            setProgram(res.data);
            setInitialValues({
                id: res.data.id,
                name: res.data.name,
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
                    Programm Bearbeiten
                </h2>
            }
        >
            <Head title="Programm Bearbeiten" />

            <div className="container mx-auto mt-10">
                {   program && (
                <Formik
                    initialValues={initialValues}
                    enableReinitialize={true}
                    validationSchema={validationSchema}
                    onSubmit={(values, { setSubmitting, resetForm  }) => {
                        axios.put(route('programs.update',{id:values.id}), values)
                        .then(res => {
                            if (res.data.success) {
                                resetForm();
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Erfolgreich',
                                    text: 'Programm erfolgreich bearbeitet!',
                                });
                                window.location.href = '/admin/programs';
                            } else {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Hata',
                                    text: data.data.message || 'Programm konnte nicht bearbeitet werden!',
                                });
                            }
                            setSubmitting(false);
                        })
                        .catch((error) => {
                            console.log("error",error);
                            Swal.fire({
                                icon: 'error',
                                title: 'Hata',
                                text: error.response.data.message || 'Programm konnte nicht aktualisiert werden!',
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
