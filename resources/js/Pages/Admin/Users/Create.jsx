import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head,usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
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
                    User Add
                </h2>
            }
        >
            <Head title="User List" />

            <div className="container mx-auto mt-10">
                <Formik
                    initialValues={{ email: "", password: "", driver_id: "", name: "", birth_date: "", }}
                    validate={(values) => {
                        const errors = {};
                        if (!values.driver_id) {
                            errors.driverId = "Sürücü ID gerekli";
                        }

                        if (!values.name) {
                            errors.fullName = "İsim Soyisim gerekli";
                        }

                        if (!values.birth_date) {
                            errors.birthDate = "Doğum Tarihi gerekli";
                        }
                        if (!values.email) {
                            errors.email = "Required";
                        } else if (
                            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
                                values.email
                            )
                        ) {
                            errors.email = "Invalid email address";
                        }
                        return errors;
                    }}
                    onSubmit={(values, { setSubmitting, resetForm }) => {
                        axios.post(route('registered'), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                
                            },
                            body: JSON.stringify(values)
                        })
                        .then(data => {
                            console.log("data",data);
                            if (data.success) {
                                resetForm();
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Başarılı',
                                    text: 'Kullanıcı başarıyla kaydedildi!',
                                });
                            } else {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Hata',
                                    text: data.data || 'Kullanıcı kaydedilemedi!',
                                });
                            }
                            setSubmitting(false);
                        })
                        .catch((error) => {
                            console.log("error",error);
                            Swal.fire({
                                icon: 'error',
                                title: 'Hata',
                                text: error.message || 'Bir hata oluştu!',
                            });
                            setSubmitting(false);
                        });
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <div className="mb-4 mx-4">
                                <label htmlFor="driverId" className="block text-sm font-medium text-gray-700">Sürücü ID</label>
                                <Field type="text" name="driver_id" className="mt-1 block w-full" />
                                <ErrorMessage name="driverId" component="div" className="text-red-500 text-xs mt-1" />
                            </div>
                            <div className="mb-4 mx-4">
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">İsim Soyisim</label>
                                <Field type="text" name="name" className="mt-1 block w-full" />
                                <ErrorMessage name="fullName" component="div" className="text-red-500 text-xs mt-1" />
                            </div>
                            <div className="mb-4 mx-4">
                                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">Doğum Tarihi</label>
                                <Field type="date" name="birth_date" className="mt-1 block w-full" />
                                <ErrorMessage name="birthDate" component="div" className="text-red-500 text-xs mt-1" />
                            </div>
                            <div className="mb-4 mx-4">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <Field type="email" name="email" className="mt-1 block w-full" />
                                <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
                            </div>
                            <div className="mb-4 mx-4">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <div className="relative">
                                    <Field type="password" name="password" id="password" className="mt-1 block w-full pr-10" />
                                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => {
                                        const passwordField = document.getElementById('password');
                                        if (passwordField.type === 'password') {
                                            passwordField.type = 'text';
                                        } else {
                                            passwordField.type = 'password';
                                        }
                                    }}>
                                        <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zm0 12a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z" />
                                        </svg>
                                    </span>
                                </div>
                                <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
                            </div>
                            <div className="flex items-center justify-end mt-4 mx-4">
                                <button type="submit" disabled={isSubmitting} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                    Submit
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </AuthenticatedLayout>
    );
}
