import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Datepicker, ToggleSwitch, Tabs } from "flowbite-react";
import Swal from "sweetalert2";
import axios from "axios";
import moment from "moment";

import { HiAdjustments, HiClipboardList, HiUserCircle,HiShieldCheck } from "react-icons/hi";
import { MdDashboard,MdOutlineWorkOutline } from "react-icons/md";

export default function EditUser({ auth, user_id }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        axios
            .get(route("user.show", user_id))
            .then((res) => {
                res.data.start_working_date = moment(
                    res.data.start_working_date
                ).format("YYYY-MM-DD");
                setUser(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    User Edit
                </h2>
            }
        >
            <Head title="User Edit" />

            <div className="container mx-auto mt-10">
                {user && (
                    <Formik
                        initialValues={{
                            ...user,
                            is_admin:
                                user.is_admin != null && user.is_admin == 1
                                    ? true
                                    : false,
                        }}
                        validate={(values) => {
                            const errors = {};
                            if (!values.driver_id) {
                                errors.driver_id = "Sürücü ID gerekli";
                            }

                            if (!values.name) {
                                errors.name = "İsim Soyisim gerekli";
                            }

                            if (!values.birth_date) {
                                errors.birth_date = "Doğum Tarihi gerekli";
                            }
                            if (!values.phone) {
                                errors.phone = "Doğum Tarihi gerekli";
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
                            axios
                                .post(route("edit.inside"), values)
                                .then((res) => {
                                    if (res.data.success) {
                                        Swal.fire({
                                            icon: "success",
                                            title: "Başarılı",
                                            text: "Kullanıcı başarıyla kaydedildi!",
                                        });
                                        window.location.href =
                                            route("users.index");
                                    } else {
                                        Swal.fire({
                                            icon: "error",
                                            title: "Hata",
                                            text:
                                                data.data.message ||
                                                "Kullanıcı kaydedilemedi!",
                                        });
                                    }
                                    setSubmitting(false);
                                })
                                .catch((error) => {
                                    console.log("error", error);
                                    Swal.fire({
                                        icon: "error",
                                        title: "Hata",
                                        text:
                                            error.response.data.message ||
                                            "Bir hata oluştu!",
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
                            <div>
                                <Tabs
                                    aria-label="Tabs with icons"
                                    variant="underline"
                                >
                                    <Tabs.Item
                                        active
                                        title="Profile"
                                        icon={HiUserCircle}
                                    >
                                        <div className="mb-4 mx-4 flex space-x-4">
                                        <div className="w-1/3">
                                            <label
                                                htmlFor="driver_id"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Sürücü ID
                                            </label>
                                            <Field
                                                type="text"
                                                name="driver_id"
                                                id="driver_id"
                                                className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                            />
                                            {errors.driver_id &&
                                                touched.driver_id && (
                                                    <p className="text-red-500">
                                                        *{errors.driver_id}
                                                    </p>
                                                )}
                                        </div>

                                        <div className="w-1/3">
                                            <label
                                                htmlFor="name"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                İsim Soyisim
                                            </label>
                                            <Field
                                                type="text"
                                                name="name"
                                                id="name"
                                                className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                            />
                                            {errors.name && touched.name && (
                                                <p className="text-red-500">
                                                    *{errors.name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="w-1/3">
                                            <label
                                                htmlFor="identity_number"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Kimlik Numarası
                                            </label>
                                            <Field
                                                type="text"
                                                name="identity_number"
                                                id="identity_number"
                                                className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                            />
                                            {errors.identity_number &&
                                                touched.identity_number && (
                                                    <p className="text-red-500">
                                                        *
                                                        {errors.identity_number}
                                                    </p>
                                                )}
                                        </div>
                                    </div>


                                    <div className="flex space-x-4 mb-4 mx-4">
                                        <div className="w-1/3">
                                            <label
                                                htmlFor="phone"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Phone
                                            </label>
                                            <Field
                                                type="text"
                                                name="phone"
                                                id="phone"
                                                className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                            />
                                            {errors.phone && touched.phone && (
                                                <p className="text-red-500">
                                                    *{errors.phone}
                                                </p>
                                            )}
                                        </div>
                                        <div className="w-1/3">
                                            <label
                                                htmlFor="birth_date"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Doğum Tarihi
                                            </label>
                                            <Field
                                                type="date"
                                                name="birth_date"
                                                id="birth_date"
                                                className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                            />
                                            {errors.birth_date &&
                                                touched.birth_date && (
                                                    <p className="text-red-500">
                                                        *{errors.birth_date}
                                                    </p>
                                                )}
                                        </div>
                                        <div className="w-1/3">
                                            <label
                                                htmlFor="start_working_date"
                                                className="block text-sm font-medium text-gray-7000"
                                            >
                                                İşe Başlama Tarihi
                                            </label>
                                            <Datepicker
                                                name="start_working_date"
                                                id="start_working_date"
                                                onSelectedDateChanged={(e) => {
                                                    setFieldValue(
                                                        "start_working_date",
                                                        new Date(
                                                            e
                                                        ).toDateString()
                                                    );
                                                }}
                                                value={
                                                    values.start_working_date
                                                }
                                                className=""
                                            />
                                            {errors.start_working_date &&
                                                touched.start_working_date && (
                                                    <p className="text-red-500">
                                                        *
                                                        {
                                                            errors.start_working_date
                                                        }
                                                    </p>
                                                )}
                                        </div>
                                    </div>

                                    <div className="flex">
                                        <div className="mb-4 mx-4 w-1/3">
                                            <label
                                                htmlFor="nationality"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Milliyet
                                            </label>
                                            <Field
                                                type="text"
                                                name="nationality"
                                                id="nationality"
                                                className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                            />
                                            {errors.nationality &&
                                                touched.nationality && (
                                                    <p className="text-red-500">
                                                        *{errors.nationality}
                                                    </p>
                                                )}
                                        </div>

                                        <div className="mb-4 mx-4 w-1/3">
                                            <label
                                                htmlFor="kinder"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Çocuk Sayısı
                                            </label>
                                            <Field
                                                type="number"
                                                name="kinder"
                                                id="kinder"
                                                className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                            />
                                            {errors.kinder &&
                                                touched.kinder && (
                                                    <p className="text-red-500">
                                                        *{errors.kinder}
                                                    </p>
                                                )}
                                        </div>

                                        <div className="mb-4 mx-4 w-1/3">
                                            <label
                                                htmlFor="is_retired"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Emekli mi?
                                            </label>
                                            <ToggleSwitch
                                                label=""
                                                id="is_retired"
                                                name="is_retired"
                                                className="mb-4 mx-4"
                                                checked={
                                                    values.is_retired
                                                        ? true
                                                        : false
                                                }
                                                onChange={(e) => {
                                                    setFieldValue(
                                                        "is_retired",
                                                        e
                                                    );
                                                }}
                                            />

                                            {errors.is_retired &&
                                                touched.is_retired && (
                                                    <p className="text-red-500">
                                                        *{errors.is_retired}
                                                    </p>
                                                )}
                                        </div>
                                    </div>

                                    <div className="mb-4 mx-4">
                                        <label
                                            htmlFor="address"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Adres
                                        </label>
                                        <Field
                                            type="text"
                                            name="address"
                                            id="address"
                                            className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        />
                                        {errors.address && touched.address && (
                                            <p className="text-red-500">
                                                *{errors.address}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mb-4 mx-4">
                                        <label
                                            htmlFor="urgency_contact_name"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Acil Durum İletişim Adı
                                        </label>
                                        <Field
                                            type="text"
                                            name="urgency_contact_name"
                                            id="urgency_contact_name"
                                            className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        />
                                        {errors.urgency_contact_name &&
                                            touched.urgency_contact_name && (
                                                <p className="text-red-500">
                                                    *
                                                    {
                                                        errors.urgency_contact_name
                                                    }
                                                </p>
                                            )}
                                    </div>
                                    <div className="mb-4 mx-4">
                                        <label
                                            htmlFor="urgency_contact_phone"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Acil Durum İletişim Telefonu
                                        </label>
                                        <Field
                                            type="text"
                                            name="urgency_contact_phone"
                                            id="urgency_contact_phone"
                                            className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        />
                                        {errors.urgency_contact_phone &&
                                            touched.urgency_contact_phone && (
                                                <p className="text-red-500">
                                                    *
                                                    {
                                                        errors.urgency_contact_phone
                                                    }
                                                </p>
                                            )}
                                    </div>
                                    <div className="w-1/3">
                                            <label
                                                htmlFor="private_phone"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Özel Telefon
                                            </label>
                                            <Field
                                                type="text"
                                                name="private_phone"
                                                id="private_phone"
                                                className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                            />
                                            {errors.private_phone &&
                                                touched.private_phone && (
                                                    <p className="text-red-500">
                                                        *{errors.private_phone}
                                                    </p>
                                                )}
                                        </div>

                                    </Tabs.Item>
                                    <Tabs.Item
                                        title="Banka Bilgileri"
                                        icon={MdOutlineWorkOutline}
                                    >
                                        <div className="mb-4 mx-4">
                                        <label
                                            htmlFor="bank_name"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Banka Adı
                                        </label>
                                        <Field
                                            type="text"
                                            name="bank_name"
                                            id="bank_name"
                                            className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        />
                                        {errors.bank_name &&
                                            touched.bank_name && (
                                                <p className="text-red-500">
                                                    *{errors.bank_name}
                                                </p>
                                            )}
                                    </div>
                                    <div className="mb-4 mx-4">
                                        <label
                                            htmlFor="bank_account_number"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Banka Hesap Numarası
                                        </label>
                                        <Field
                                            type="text"
                                            name="bank_account_number"
                                            id="bank_account_number"
                                            className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        />
                                        {errors.bank_account_number &&
                                            touched.bank_account_number && (
                                                <p className="text-red-500">
                                                    *
                                                    {errors.bank_account_number}
                                                </p>
                                            )}
                                    </div>
                                    <div className="mb-4 mx-4">
                                        <label
                                            htmlFor="bank_iban"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Banka IBAN
                                        </label>
                                        <Field
                                            type="text"
                                            name="bank_iban"
                                            id="bank_iban"
                                            className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        />
                                        {errors.bank_iban &&
                                            touched.bank_iban && (
                                                <p className="text-red-500">
                                                    *{errors.bank_iban}
                                                </p>
                                            )}
                                    </div>
                                    <div className="mb-4 mx-4">
                                        <label
                                            htmlFor="bank_bic"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Banka BIC
                                        </label>
                                        <Field
                                            type="text"
                                            name="bank_bic"
                                            id="bank_bic"
                                            className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        />
                                        {errors.bank_bic &&
                                            touched.bank_bic && (
                                                <p className="text-red-500">
                                                    *{errors.bank_bic}
                                                </p>
                                            )}
                                    </div>
                                    <div className="mb-4 mx-4">
                                        <label
                                            htmlFor="bank_account_holder"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Banka Hesap Sahibi
                                        </label>
                                        <Field
                                            type="text"
                                            name="bank_account_holder"
                                            id="bank_account_holder"
                                            className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        />
                                        {errors.bank_account_holder &&
                                            touched.bank_account_holder && (
                                                <p className="text-red-500">
                                                    *
                                                    {errors.bank_account_holder}
                                                </p>
                                            )}
                                    </div>
                                    </Tabs.Item>
                                    <Tabs.Item
                                        title="Sigorta Bilgileri"
                                        icon={HiShieldCheck}
                                    >
                                       <div className="mb-4 mx-4">
                                        <label
                                            htmlFor="insurance_number"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Sigorta Numarası
                                        </label>
                                        <Field
                                            type="text"
                                            name="insurance_number"
                                            id="insurance_number"
                                            className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        />
                                        {errors.insurance_number &&
                                            touched.insurance_number && (
                                                <p className="text-red-500">
                                                    *{errors.insurance_number}
                                                </p>
                                            )}
                                    </div>
                                    <div className="mb-4 mx-4">
                                        <label
                                            htmlFor="social_security_number"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Sosyal Güvenlik Numarası
                                        </label>
                                        <Field
                                            type="text"
                                            name="social_security_number"
                                            id="social_security_number"
                                            className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        />
                                        {errors.social_security_number &&
                                            touched.social_security_number && (
                                                <p className="text-red-500">
                                                    *
                                                    {
                                                        errors.social_security_number
                                                    }
                                                </p>
                                            )}
                                    </div>
                                    <div className="mb-4 mx-4">
                                        <label
                                            htmlFor="social_security_name"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Sosyal Güvenlik Adı
                                        </label>
                                        <Field
                                            type="text"
                                            name="social_security_name"
                                            id="social_security_name"
                                            className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        />
                                        {errors.social_security_name &&
                                            touched.social_security_name && (
                                                <p className="text-red-500">
                                                    *
                                                    {
                                                        errors.social_security_name
                                                    }
                                                </p>
                                            )}
                                    </div>

                                    <div className="mb-4 mx-4">
                                        <label
                                            htmlFor="tax_class"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Vergi Sınıfı
                                        </label>
                                        <Field
                                            type="number"
                                            name="tax_class"
                                            id="tax_class"
                                            className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        />
                                        {errors.tax_class &&
                                            touched.tax_class && (
                                                <p className="text-red-500">
                                                    *{errors.tax_class}
                                                </p>
                                            )}
                                    </div>
                                    </Tabs.Item>
                                    <Tabs.Item
                                        title="Bonuslar"
                                        icon={HiClipboardList}
                                    >
                                        Test
                                    </Tabs.Item>
                                    <Tabs.Item
                                        title="Avanslar"
                                        icon={HiUserCircle}
                                    >
                                        Test
                                    </Tabs.Item>
                                    <Tabs.Item
                                        title="Saat Bankası"
                                        icon={HiClipboardList}
                                    >
                                        Test
                                    </Tabs.Item>
                                    <Tabs.Item
                                        title="Sertifikalar"
                                        icon={HiShieldCheck}
                                    >
                                        Test
                                    </Tabs.Item>
                                    <Tabs.Item
                                        title="Sözleşmeler"
                                        icon={HiClipboardList}
                                    >
                                        Test
                                    </Tabs.Item>
                                    <Tabs.Item
                                        title="Programlar"
                                        icon={MdDashboard}
                                    >
                                        Test
                                    </Tabs.Item>
                                    <Tabs.Item
                                        title="Ayarlar"
                                        icon={HiAdjustments}
                                    >
                                       <div className="mb-4 mx-4">
                                        <label
                                            htmlFor="email"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Email
                                        </label>
                                        <Field
                                            type="email"
                                            name="email"
                                            id="email"
                                            className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                        />
                                        {errors.email && touched.email && (
                                            <p className="text-red-500">
                                                *{errors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mb-4 mx-4">
                                        <label
                                            htmlFor="password"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Password
                                        </label>
                                        <div className="relative">
                                            <Field
                                                type="password"
                                                name="password"
                                                id="password"
                                                className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                            />
                                            <span
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                                onClick={() => {
                                                    const passwordField =
                                                        document.getElementById(
                                                            "password"
                                                        );
                                                    if (
                                                        passwordField.type ===
                                                        "password"
                                                    ) {
                                                        passwordField.type =
                                                            "text";
                                                    } else {
                                                        passwordField.type =
                                                            "password";
                                                    }
                                                }}
                                            >
                                                <svg
                                                    className="h-5 w-5 text-gray-500"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zm0 12a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z" />
                                                </svg>
                                            </span>
                                        </div>
                                        {errors.password &&
                                            touched.password && (
                                                <p className="text-red-500">
                                                    *{errors.password}
                                                </p>
                                            )}
                                    </div>
                                    <div className="flex">
                                        <div className="mb-4 mx-4 ">
                                            <label
                                                htmlFor="working_hours"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Çalışma Saati
                                            </label>
                                            <Field
                                                type="number"
                                                name="working_hours"
                                                id="working_hours"
                                                className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                            />
                                            {errors.working_hours &&
                                                touched.working_hours && (
                                                    <p className="text-red-500">
                                                        *{errors.working_hours}
                                                    </p>
                                                )}
                                        </div>
                                        <div className="mb-4 mx-4">
                                            <label
                                                htmlFor="annual_leave_rights"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Yıllık İzin Hakkı (Saat)
                                            </label>
                                            <Field
                                                type="text"
                                                name="annual_leave_rights"
                                                id="annual_leave_rights"
                                                className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                            />
                                            {errors.annual_leave_rights &&
                                                touched.annual_leave_rights && (
                                                    <p className="text-red-500">
                                                        *
                                                        {
                                                            errors.annual_leave_rights
                                                        }
                                                    </p>
                                                )}
                                        </div>

                                        <div className="mb-4 mx-4">
                                            <label
                                                htmlFor="salary"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Maaş (Saat)
                                            </label>
                                            <Field
                                                type="text"
                                                name="salary"
                                                id="salary"
                                                className="placeholder:italic placeholder:text-slate-4000 block bg-white w-full border border-slate-500 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                                            />
                                            {errors.salary &&
                                                touched.salary && (
                                                    <p className="text-red-500">
                                                        *{errors.salary}
                                                    </p>
                                                )}
                                        </div>
                                    </div>

                                    <ToggleSwitch
                                        label="Admin ?"
                                        id="is_admin"
                                        name="is_admin"
                                        checked={values.is_admin ? true : false}
                                        onChange={(e) => {
                                            setFieldValue("is_admin", e);
                                        }}
                                    />
                                    </Tabs.Item>
                                </Tabs>
                                <Form>







                                    <div className="flex items-center justify-end mt-4 mx-4">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </Form>
                            </div>
                        )}
                    </Formik>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
