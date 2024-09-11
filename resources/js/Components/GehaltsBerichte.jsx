import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button, Select, ToggleSwitch } from "flowbite-react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import moment from "moment";

function GehaltsBerichte({user}) {
    const [showModal, setShowModal] = useState(false);
    const [reports, setReports] = useState([]);
    const [report, setReport] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [userInfo, setUserInfo] = useState({});
    const [selectedYear, setSelectedYear] = useState("");

    const uploadFiles = async (acceptedFiles,agreement,userInfo) => {
        const formData = new FormData();
        acceptedFiles.forEach((file) => {
            formData.append("files[]", file);
            formData.append("date", moment(agreement.date).format("YYYY-MM-DD"));
            formData.append("user_id", userInfo.name);
        });

        try {
            const response = await axios.post("/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setReport((prevAgreement) => ({
                ...prevAgreement,
                file: response.data[0].url.replace("http://localhost", ""),
            }));
        } catch (error) {
            console.error("Fehler beim Hochladen der Datei:", error);
        }

    };

    const onDrop = useCallback((acceptedFiles) => {
        uploadFiles(acceptedFiles,report,userInfo);
        setIsLoading(true);
    }, [report, userInfo]);

    const {
        getRootProps,
        getInputProps,
    } = useDropzone({
        onDrop,
        accept: {
            "image/jpeg": [".jpeg", ".jpg"],
            "image/png": [".png"],
            "image/gif": [".gif"],
            "image/heif": [".heif"],
            "image/heic": [".heic"],
            "application/pdf": [".pdf"],
        },
    });

    const getUser = async () => {
        const {data: userI} = await axios.get(route("user.show", user.id));
        setUserInfo(userI);

    }

    const getReports = async () => {
        const {data: reports} = await axios.get(route("user.salary.show", user.id));
        setReports(reports);
    }

    const saveReport = async () => {
        report.user_id = user.id;
        let response = await axios.post(
            route("user.salary.store"),
            report
        );
        console.log(response.data);
        if (response.data.status === "success") {
            setReport({});
            setShowModal(false);
        }
    };

    const addNewReport = (report_new) => {
        setReport({
            report_id: report_new.id,
            name: report_new.name,
            user_id: user.id,
        });
        setShowModal(true);
    };

    const deleteReport = async (report) => {
        setReport({
            ...report,
            file: null,
            user_id: null,
        });
        if(report.id){
            axios.delete(route("user.salary.destroy", report.id));
        }
        getReports()
    }


    useEffect(() => {
        getUser();
        getReports();
    }, []);

    return (
        <>
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <Modal.Header>Gehaltsabrechnung Hinzufügen</Modal.Header>
                <Modal.Body>

                    <div className="mt-2">
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                            Gehaltsabrechnung
                        </p>

                        <input
                            type="month"
                            value={report.date}
                            onChange={(e) => setReport({ ...report, date: e.target.value })}
                            placeholder="Monat und Jahr auswählen"
                        />

                    </div>


                    {!report.file && (
                        <div className="mt-2">
                            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                                Datei Hochladen
                            </p>
                            <div
                                {...getRootProps({
                                    className:
                                        "border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer py-10",
                                })}
                            >
                                <input {...getInputProps()} />
                                {isLoading ? (
                                    <p>Lädt...</p>
                                ) : (
                                    <p>Datei hierher ziehen oder auswählen</p>
                                )}
                            </div>
                        </div>
                    )}

                    {report.file && (
                        <div className="mt-2 mb-2">
                            <div className="flex space-x-2">
                                <Button
                                    onClick={() => {
                                        window.open(report.file, "_blank");
                                    }}
                                >
                                    Anzeigen
                                </Button>
                                <Button
                                    onClick={() => {
                                        deleteReport();
                                    }}
                                >
                                    Datei Entfernen
                                </Button>
                            </div>
                        </div>
                    )}

                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={saveReport}>Zuweisen</Button>
                    <Button color="gray" onClick={() => setShowModal(false)}>
                        Abbrechen
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className="overflow-x-auto">
                <div className="flex justify-between mb-4">
                    <Button
                        onClick={() => {
                           setShowModal(true);
                        }}
                    >
                        Neu hinzufügen
                    </Button>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="border border-gray-300 rounded-md p-2"
                    >
                        <option value="">Alle Jahre</option>
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">
                                Gehaltsdatum
                            </th>
                            <th className="py-2 px-4 border-b">Datei</th>
                            <th className="py-2 px-4 border-b">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.length > 0 &&
                            reports
                                .filter((report) => selectedYear === "" || moment(report.date).year() === parseInt(selectedYear))
                                .map((report, index) => (
                                    <tr key={index} className={ index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                                        {report.user_id ? (
                                            <>
                                                <td className="py-2 px-4 border-b border-gray-300 border-l-2 border-r-2 min-w-[250px]">
                                                    {moment(report.date).format("MMMM YYYY")}
                                                </td>
                                                <td className="py-2 px-4 border-b border-gray-300 border-l-2 border-r-2 justify-center items-center">
                                                    {report.file ? (
                                                        <>
                                                        <a
                                                            href={report.file}
                                                            className="text-blue-500 border-2 border-blue-500 rounded-md p-1 hover:bg-blue-500 hover:text-white px-5 py-2"
                                                            target="_blank"
                                                        >
                                                            Anzeigen
                                                        </a>
                                                        <a
                                                            className="text-green-500 mx-2 border-2 border-green-500  rounded-md p-1 hover:bg-green-500 hover:text-white px-5 py-2"
                                                            download
                                                            href={report.file}
                                                        >
                                                            Download
                                                        </a>
                                                        </>
                                                    ) : (
                                                        "Keine Datei"
                                                    )}
                                                </td>
                                                <td className="py-2 px-4 border-b border-gray-300 border-l-2 border-r-2 ">
                                                    <Button
                                                        color="gray"
                                                        className="px-5  text-red-500 border-2  border-red-500 rounded-md hover:bg-red-500 hover:text-white hover:border-red-500 hover:bg-red-500"
                                                        onClick={() => {
                                                            deleteReport(report);
                                                        }}
                                                    >
                                                        Löschen
                                                    </Button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="py-2 px-4 border-b border-l-2 border-r-2 border-gray-300">
                                                    {report.name}
                                                </td>
                                                <td
                                                    colSpan="8"
                                                    className="py-2 px-4 border-b border-l-2 border-r-2 border-gray-300 text-end"
                                                >
                                                    <button
                                                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700"
                                                        onClick={() => {
                                                            addNewReport(
                                                                report
                                                            )
                                                        }
                                                        }
                                                    >
                                                        Hinzufügen
                                                    </button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default GehaltsBerichte;
