import { useEffect, useState } from "react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import NavLink from "@/Components/NavLink";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link } from "@inertiajs/react";

export default function Authenticated({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);
    const [waitConfirmedCount, setWaitConfirmedCount] = useState(0);
    const [weeklyTodos, setWeeklyTodos] = useState(0);
    const getWaitConfirmedCount = async () => {
        // Axios'un tanımlı olduğu varsayılıyor
        const response = await axios.get(route("wait-confirmed-jobs-count"));
        setWaitConfirmedCount(response.data.count);
    };

    const getWeeklyTodos = async () => {
        // Axios'un tanımlı olduğu varsayılıyor
        const response = await axios.get(route("get-weekly-todos"));
        setWeeklyTodos(response.data.count);
    };

    window.userId = user.id;

    if (user.is_admin || user.accountant) {
        useEffect(() => {
            getWaitConfirmedCount();
            getWeeklyTodos();
            let id = setInterval(getWaitConfirmedCount, 60000);
            let id2 = setInterval(getWeeklyTodos, 60000);
            return () => {
                clearInterval(id);
                clearInterval(id2);
            };
        }, []);
    }

    return (
        // Arka planı hafifçe gri yaparak navbardan ayırıyoruz
        <div className="min-h-screen bg-indigo-100">
            {user.id && (
                <span id="user-id" style={{ display: "none" }}>
                    {user.id}
                </span>
            )}
            {/* Navbar'ı koyu indigo, kalın gölge ve yapışkan hale getiriyoruz */}
            <nav className="bg-indigo-700 shadow-2xl border-b border-indigo-500 sticky top-0 z-40">
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="shrink-0 flex items-center">
                                <Link href="/dashboard">
                                    {/* Logo rengini yüksek kontrastlı beyaz yapıyoruz */}
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-white" />
                                </Link>
                            </div>

                            {/* Büyük ekran navigasyon linkleri - Beyaz metin, Cyan vurgu */}
                            <div className="hidden xl:flex space-x-2 sm:-my-px sm:ms-8 text-sm font-medium justcontent-center items-center">
                                <NavLink
                                    href={route("dashboard")}
                                    active={route().current("dashboard")}
                                    className="px-3 text-white hover:text-cyan-400 active:text-cyan-400 active:border-cyan-400 transition-colors duration-200"
                                >
                                    Dashboard
                                </NavLink>
                                <NavLink
                                    href={route("new-jobs")}
                                    active={route().current("new-jobs")}
                                    className="px-3 text-white hover:text-cyan-400 active:text-cyan-400 active:border-cyan-400 transition-colors duration-200"
                                >
                                    Neue Berichte
                                </NavLink>
                                <NavLink
                                    href={route("draft-jobs")}
                                    active={route().current("draft-jobs")}
                                    className="px-3 text-white hover:text-cyan-400 active:text-cyan-400 active:border-cyan-400 transition-colors duration-200"
                                >
                                    Bericht Entwürfe
                                </NavLink>
                                <NavLink
                                    href={route("finalized-jobs")}
                                    active={route().current("finalized-jobs")}
                                    className="px-3 text-white hover:text-cyan-400 active:text-cyan-400 active:border-cyan-400 transition-colors duration-200"
                                >
                                    Eingereichte Berichte
                                </NavLink>
                                <NavLink
                                    href={route("planner")}
                                    active={route().current("planner")}
                                    className="px-3 text-white hover:text-cyan-400 active:text-cyan-400 active:border-cyan-400 transition-colors duration-200"
                                >
                                    Planung
                                </NavLink>

                                {(user.is_admin || user.accountant) && (
                                    <Dropdown className="hidden xl:flex">
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-bold rounded-full text-indigo-700 bg-white hover:bg-gray-200 focus:outline-none transition duration-150 ease-in-out shadow-lg" // Beyaz buton, koyu metin
                                            >
                                                Admin-Menü
                                                {waitConfirmedCount > 0 && (
                                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full ring-2 ring-indigo-700">
                                                        {" "}
                                                        {/* Kırmızı rozet, koyu halka */}
                                                        {waitConfirmedCount}
                                                    </span>
                                                )}
                                                <svg
                                                    className="ms-2 -me-0.5 h-4 w-4 text-indigo-700"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content className="mt-2 rounded-xl shadow-2xl bg-white border border-gray-100">
                                            <Dropdown.Link
                                                href={route("users.index")}
                                                className="hover:bg-indigo-50 text-gray-700"
                                            >
                                                Benutzer
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                                href={route("clients-index")}
                                                className="hover:bg-indigo-50 text-gray-700"
                                            >
                                                Kunden
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                                href={route("confirmed-jobs")}
                                                className="hover:bg-indigo-50 text-gray-700"
                                            >
                                                Bestätigte Berichte
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                                href={route(
                                                    "wait-confirmed-jobs"
                                                )}
                                                className="hover:bg-indigo-50 text-gray-700"
                                            >
                                                Unbestätigte Berichte
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                                href={route(
                                                    "confirmed-jobs-to-edit"
                                                )}
                                                className="hover:bg-indigo-50 text-gray-700"
                                            >
                                                Bearbeiten Bestätigte Berichte
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                                href={route("admin-planner")}
                                                className="hover:bg-indigo-50 text-gray-700"
                                            >
                                                Planung
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                                href={route("clients.new-job")}
                                                className="hover:bg-indigo-50 text-gray-700"
                                            >
                                                Kundenaufträge
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                                href={route(
                                                    "confirmed-jobs-to-client"
                                                )}
                                                className="hover:bg-indigo-50 text-gray-700"
                                            >
                                                Kunden Berichte
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                                href={route("bahn-cards")}
                                                className="hover:bg-indigo-50 text-gray-700"
                                            >
                                                Bahnkarten
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                                href={route("aggreements.view")}
                                                className="hover:bg-indigo-50 text-gray-700"
                                            >
                                                Vertrag
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                                href={route("certificates")}
                                                className="hover:bg-indigo-50 text-gray-700"
                                            >
                                                Zertifikate
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                                href={route("programs.view")}
                                                className="hover:bg-indigo-50 text-gray-700"
                                            >
                                                Programme
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                                href={route("todo.view")}
                                                className="flex justify-between items-center hover:bg-indigo-50 text-gray-700"
                                            >
                                                ToDo Liste
                                                {weeklyTodos > 0 && (
                                                    <span className="bg-cyan-500 text-white px-2 py-0.5 text-xs font-bold rounded-full ms-2">
                                                        {" "}
                                                        {/* ToDo badge'i Cyan yaptık */}
                                                        {weeklyTodos}
                                                    </span>
                                                )}
                                            </Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                )}
                            </div>

                            {/* Admin Menü Dropdown - Yüksek Kontrastlı Beyaz Buton */}
                        </div>

                        {/* Kullanıcı Menüsü - Yüksek Kontrastlı Buton */}
                        <div className="hidden xl:flex xl:items-center">
                            <div className=" relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-4 py-2 border border-white text-sm leading-4 font-semibold rounded-full text-indigo-600 bg-white hover:bg-gray-300 hover:border-gray-300  focus:outline-none transition duration-150 ease-in-out shadow-md"
                                            >
                                                {user.name}

                                                <svg
                                                    className="ms-2 -me-0.5 h-4 w-4 text-indigo-600"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content className="mt-2 rounded-xl shadow-2xl bg-white border border-gray-100">
                                        <Dropdown.Link
                                            href={route("new-jobs")}
                                            className="hover:bg-indigo-50 text-gray-700"
                                        >
                                            Neue Berichte
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route("draft-jobs")}
                                            className="hover:bg-indigo-50 text-gray-700"
                                        >
                                            Bericht Entwürfe
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route("finalized-jobs")}
                                            className="hover:bg-indigo-50 text-gray-700"
                                        >
                                            Eingereichte Berichte{" "}
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route("planner")}
                                            className="hover:bg-indigo-50 text-gray-700"
                                        >
                                            Planung
                                        </Dropdown.Link>
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <Dropdown.Link
                                            href={route("profile.edit")}
                                            className="hover:bg-indigo-50 text-gray-700"
                                        >
                                            Profil
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                            className="hover:bg-red-50 hover:text-red-600 text-gray-700" // Çıkış butonu için hafif kırmızı hover
                                        >
                                            Abmelden
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Mobil Menü Butonu - Koyu arka plana uyumlu */}
                        <div className="-me-2 flex items-center xl:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState
                                    )
                                }
                                className="inline-flex items-center justify-center p-2 rounded-lg text-indigo-200 hover:text-white hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600 focus:text-white transition duration-150 ease-in-out" // Koyu arka plana uyumlu ikon ve hover
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? "inline-flex"
                                                : "hidden"
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? "inline-flex"
                                                : "hidden"
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobil Navigasyon İçeriği - Koyu temaya uygun */}
                <div
                    className={
                        (showingNavigationDropdown ? "block" : "hidden") +
                        " xl:hidden bg-indigo-800 border-t border-indigo-600"
                    }
                >
                    <div className="pt-2 pb-3 space-y-1">
                        <ResponsiveNavLink
                            href={route("dashboard")}
                            active={route().current("dashboard")}
                            className="text-indigo-200 hover:bg-indigo-700 hover:text-white"
                        >
                            Armaturenbrett
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route("new-jobs")}
                            className="text-indigo-200 hover:bg-indigo-700 hover:text-white"
                        >
                            Neue Berichte
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route("draft-jobs")}
                            className="text-indigo-200 hover:bg-indigo-700 hover:text-white"
                        >
                            Bericht Entwürfe
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route("finalized-jobs")}
                            className="text-indigo-200 hover:bg-indigo-700 hover:text-white"
                        >
                            Eingereichte Berichte
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route("planner")}
                            className="text-indigo-200 hover:bg-indigo-700 hover:text-white"
                        >
                            Planung
                        </ResponsiveNavLink>
                    </div>

                    {/* Mobil Admin Dropdown - Koyu temaya uygun */}
                    <div className="pt-2 pb-3 space-y-1 px-4">
                        {(user.is_admin || user.accountant) && (
                            <div className="border border-indigo-600 bg-indigo-700 rounded-lg p-2">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className="w-full text-left inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none transition ease-in-out duration-150 relative"
                                        >
                                            Admin-Menü
                                            {waitConfirmedCount > 0 && (
                                                <span className="absolute right-4 bg-red-500 text-white w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full ring-2 ring-indigo-700">
                                                    {waitConfirmedCount}
                                                </span>
                                            )}
                                            <svg
                                                className="ms-2 -me-0.5 h-4 w-4 absolute right-1 top-1/2 transform -translate-y-1/2 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content className="mt-2 w-full shadow-lg rounded-lg bg-indigo-700">
                                        <ResponsiveNavLink
                                            href={route("users.index")}
                                            className="text-indigo-800 hover:bg-indigo-600 hover:text-white"
                                        >
                                            Benutzer
                                        </ResponsiveNavLink>
                                        <ResponsiveNavLink
                                            href={route("clients-index")}
                                            className="text-indigo-800 hover:bg-indigo-600 hover:text-white"
                                        >
                                            Kunden
                                        </ResponsiveNavLink>
                                        <ResponsiveNavLink
                                            href={route("confirmed-jobs")}
                                            className="text-indigo-800 hover:bg-indigo-600 hover:text-white"
                                        >
                                            Bestätigte Berichte
                                        </ResponsiveNavLink>
                                        <ResponsiveNavLink
                                            href={route("wait-confirmed-jobs")}
                                            className="text-indigo-800 hover:bg-indigo-600 hover:text-white"
                                        >
                                            Unbestätigte Berichte
                                        </ResponsiveNavLink>
                                        <ResponsiveNavLink
                                            href={route(
                                                "confirmed-jobs-to-edit"
                                            )}
                                            className="text-indigo-800 hover:bg-indigo-600 hover:text-white"
                                        >
                                            Bearbeiten Bestätigte Berichte
                                        </ResponsiveNavLink>
                                        <ResponsiveNavLink
                                            href={route("admin-planner")}
                                            className="text-indigo-800 hover:bg-indigo-600 hover:text-white"
                                        >
                                            Planung
                                        </ResponsiveNavLink>
                                        <ResponsiveNavLink
                                            href={route("clients.new-job")}
                                            className="text-indigo-800 hover:bg-indigo-600 hover:text-white"
                                        >
                                            Kundenaufträge
                                        </ResponsiveNavLink>
                                        <ResponsiveNavLink
                                            href={route(
                                                "confirmed-jobs-to-client"
                                            )}
                                            className="text-indigo-800 hover:bg-indigo-600 hover:text-white"
                                        >
                                            Kunden Berichte
                                        </ResponsiveNavLink>
                                        <ResponsiveNavLink
                                            href={route("aggreements.view")}
                                            className="text-indigo-800 hover:bg-indigo-600 hover:text-white"
                                        >
                                            Vertrag
                                        </ResponsiveNavLink>
                                        <ResponsiveNavLink
                                            href={route("certificates")}
                                            className="text-indigo-800 hover:bg-indigo-600 hover:text-white"
                                        >
                                            Zertifikate
                                        </ResponsiveNavLink>
                                        <ResponsiveNavLink
                                            href={route("programs.view")}
                                            className="text-indigo-800 hover:bg-indigo-600 hover:text-white"
                                        >
                                            Programme
                                        </ResponsiveNavLink>
                                        <ResponsiveNavLink
                                            href={route("todo.view")}
                                            className="flex justify-between items-center text-indigo-800 hover:bg-indigo-600 hover:text-white"
                                        >
                                            ToDo Liste
                                            {weeklyTodos > 0 && (
                                                <span className="bg-cyan-500 text-white px-2 py-0.5 text-xs font-bold rounded-full ms-2">
                                                    {weeklyTodos}
                                                </span>
                                            )}
                                        </ResponsiveNavLink>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        )}
                    </div>

                    {/* Mobil Kullanıcı Bilgileri ve Çıkış */}
                    <div className="pt-4 pb-1 border-t border-indigo-600">
                        <div className="px-4">
                            <div className="font-semibold text-base text-white">
                                {user.name}
                            </div>
                            <div className="font-normal text-sm text-indigo-200">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink
                                href={route("profile.edit")}
                                className="text-indigo-200 hover:bg-indigo-700 hover:text-white"
                            >
                                Profil
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route("logout")}
                                as="button"
                                className="text-red-400 hover:bg-red-900 hover:text-white" // Koyu tema için kırmızı çıkış butonu
                            >
                                Abmelden
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>
            {header && (
                <header className="bg-indigo-100">
                    {" "}
                    {/* Header'ı beyaz ve belirgin gölgeli tuttuk */}
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}
            <main className="container mx-auto py-4">{children}</main>{" "}
            {/* Ana içerik alanına dikey boşluk ekledik */}
        </div>
    );
}
