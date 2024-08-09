import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head,usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Button, Spinner } from "flowbite-react";
import Swal from "sweetalert2";
import axios from "axios";


export default function CreateUsers({ auth }) {


    useEffect(() => {
        console.log(auth);
    }, []);


    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(e);
    };
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Kunde Hinzufügen
                </h2>
            }
        >
            <Head title="User List" />

            <div className="container mx-auto mt-10">
                <Formik
                    initialValues={{ name: ""}}
                    validate={(values) => {
                        const errors = {};
                        if (!values.name) {
                            errors.name = "Required";
                        }
                        return errors;
                    }}
                    onSubmit={(values, { setSubmitting, resetForm }) => {
                        axios.post('/admin/clients', values)
                        .then(res => {
                            if (res.data.success) {
                                resetForm();
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Erfolgreich',
                                    text: 'Kunde erfolgreich gespeichert!',
                                });
                            } else {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Error',
                                    text: res.data.message || 'Kunde konnte nicht gespeichert werden!',
                                });
                            }
                            setSubmitting(false);
                        })
                        .catch((error) => {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: error.message || 'Ein Fehler ist aufgetreten!',
                            });
                            setSubmitting(false);
                        });
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <div className="mb-4 mx-4">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-7000">Kundenname</label>
                                <Field type="text" name="name" id="name" className="mt-1 block w-full" />
                                <ErrorMessage name="name" component="div" className="text-red-500 text-xs mt-1" />
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
            </div>
        </AuthenticatedLayout>
    );
}
