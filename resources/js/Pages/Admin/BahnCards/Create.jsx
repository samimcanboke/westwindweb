import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head,usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Datepicker, ToggleSwitch } from "flowbite-react";
import moment from "moment";
import Swal from "sweetalert2";
import axios from "axios";
import { values } from "pdf-lib";
import * as yup from "yup";


const validationSchema = yup.object().shape({
    number: yup.string().required("Bahn Karte Nummer erforderlich").transform(value => value.replace(/\s+/g, '')).matches(/^\d{16}$/, "Bahn Karte Nummer muss genau 16 rakamdan oluşmalıdır"),
    valid_from: yup.date().required("Gültig ab erforderlich").min(moment().startOf('day').add(-1, 'day').toDate(), "Gültig ab darf nicht in der Vergangenheit liegen"),
    valid_to: yup.date().required("Gültig bis erforderlich").min(new Date(), "Gültig bis darf nicht in der Vergangenheit liegen"),
    class: yup.string().oneOf(["1", "2"], "Bahn Karte Klasse muss entweder 1 oder 2 sein").required("Bahn Karte Klasse erforderlich"),
});


export default function CreateBahnCards({ auth }) {
    useEffect(() => {
        console.log(auth);
    }, []);
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Bahn Karte Hinzufügen
                </h2>
            }
        >
            <Head title="User List" />

            <div className="container mx-auto mt-10">
                <Formik
                    initialValues={{ number: "", valid_from: "", valid_to: "", class: "" }}
                    validationSchema={validationSchema}
                    onSubmit={(values, { setSubmitting, resetForm  }) => {
                        axios.post(route('bahn-cards-store'), values)
                        .then(res => {
                            console.log(res.data);
                            if (res.data.success) {
                                resetForm();
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Başarılı',
                                    text: 'Bahnkarte erfolgreich hinzugefügt!',
                                });
                                window.location.href = '/admin/bahn-cards';
                            } else {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Hata',
                                    text: data.data.message || 'Bahnkarte konnte nicht hinzugefügt werden!',
                                });
                            }
                            setSubmitting(false);
                        })
                        .catch((error) => {
                            console.log("error",error);
                            Swal.fire({
                                icon: 'error',
                                title: 'Hata',
                                text: error.response.data.message || 'Ein Fehler ist aufgetreten!',
                            });
                            setSubmitting(false);
                        });
                    }}
                >
                    {({ values, isSubmitting, setFieldValue,errors, touched }) => (
                        <Form>
                            <div className="mb-4 mx-4">
                                <label htmlFor="number" className="block text-sm font-medium text-gray-700">Bahn Karte Nummer</label>
                                <Field
                                    type="text"
                                    name="number"
                                    id="number"
                                    placeholder="1234 5678 9012 3456"
                                    onKeyDown={(e) => {
                                        const value = e.target.value.replace(/\s+/g, '');
                                        if (e.keyCode !== 8 && value.length >= 16) {
                                            e.preventDefault();
                                        } else if (e.keyCode !== 8 && (value.length === 4 || value.length === 8 || value.length === 12)) {
                                            e.target.value = e.target.value + ' ';
                                        }
                                    }}
                                    className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                />
                                {errors.number && touched.number && (
                                        <p className="text-red-500">
                                            *{errors.number}
                                        </p>
                                    )}
                            </div>
                            <div className="mb-4 mx-4">
                                <label htmlFor="valid_from" className="block text-sm font-medium text-gray-700">Gültig ab</label>
                                <Field type="date" name="valid_from" id="valid_from" className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm" />
                                {errors.valid_from && touched.valid_from && (
                                        <p className="text-red-500">
                                            *{errors.valid_from}
                                        </p>
                                    )}
                                    </div>
                            <div className="mb-4 mx-4">
                                <label htmlFor="valid_to" className="block text-sm font-medium text-gray-700">Gültig bis</label>
                                <Field type="date" name="valid_to" id="valid_to" className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm" />
                                {errors.valid_to && touched.valid_to && (
                                        <p className="text-red-500">
                                            *{errors.valid_to}
                                        </p>
                                    )}
                            </div>
                            <div className="mb-4 mx-4">
                                <label htmlFor="class" className="block text-sm font-medium text-gray-700">Bahn Karte Klasse</label>
                                <select type="select" name="class" id="class" onChange={(e) => setFieldValue("class", e.target.value)} className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm" >
                                    <option value="">Wähle eine Klasse</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                </select>
                                {errors.class && touched.class && (
                                        <p className="text-red-500">
                                            *{errors.class}
                                        </p>
                                    )}
                            </div>


                            <div className="flex items-center justify-end mt-4 mx-4">
                                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
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
