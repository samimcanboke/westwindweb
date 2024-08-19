import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Button, Spinner,ToggleSwitch } from "flowbite-react";
import Swal from "sweetalert2";
import axios from "axios";
import * as yup from "yup";

const validationSchema = yup.object().shape({
    name: yup.string().required("Name ist erforderlich"),
    sort: yup.number().required("Sort ist erforderlich"),
});

export default function CreateAggreements({ auth }) {

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Zertifikat Hinzufügen
                </h2>
            }
        >
            <Head title="Zertifikat Hinzufügen" />

            <div className="container mx-auto mt-10">
                <Formik
                    initialValues={{
                        name: "",
                        sort: "",
                    }}
                    validationSchema={validationSchema}
                    onSubmit={(values, { setSubmitting, resetForm }) => {
                        axios
                            .post(route("certificates.store"), values)
                            .then((res) => {
                                if (res.data.success) {
                                    resetForm();
                                    Swal.fire({
                                        icon: "success",
                                        title: "Erfolgreich",
                                        text: "Zertifikat erfolgreich hinzugefügt!",
                                    });
                                    setSubmitting(false);
                                    window.location.href = route("certificates");
                                } else {
                                    Swal.fire({
                                        icon: "error",
                                        title: "Fehler",
                                        text:
                                            res.data.message ||
                                            "Zertifikat konnte nicht hinzugefügt werden!",
                                    });
                                }
                                setSubmitting(false);
                            })
                            .catch((error) => {
                                console.log("error", error);
                                Swal.fire({
                                    icon: "error",
                                    title: "Fehler",
                                    text:
                                        error.response.data.message ||
                                        "Ein Fehler ist aufgetreten!",
                                });
                                setSubmitting(false);
                            });
                    }}
                >
                    {({
                        values,
                        isSubmitting,
                        setFieldValue,
                        errors,
                        touched,
                    }) => (
                        <Form>
                            <div className="mb-4 mx-4">
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Name
                                </label>
                                <Field
                                    type="text"
                                    name="name"
                                    id="name"
                                    placeholder="Name"
                                    value={values.name}
                                    onChange={(e) =>
                                        setFieldValue("name", e.target.value)
                                    }
                                    className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                />
                                {errors.name && touched.name && (
                                    <p className="text-red-500">
                                        *{errors.name}
                                    </p>
                                )}
                            </div>
                            <div className="mb-4 mx-4">
                                <label
                                    htmlFor="sort"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Erinnerungszeitraum
                                </label>
                                <Field
                                    type="number"
                                    name="sort"
                                    id="sort"
                                    className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                />
                                {errors.sort &&
                                    touched.sort && (
                                    <p className="text-red-500">
                                        *{errors.sort}
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
                                    <Button
                                        type="submit"
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Submit
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
