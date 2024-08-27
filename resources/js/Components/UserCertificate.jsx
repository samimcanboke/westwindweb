import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button, Select, ToggleSwitch } from "flowbite-react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import moment from "moment";
import Swal from "sweetalert2";

function UserCertificate({user}) {
    const [mergedCertificates, setMergedCertificates] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [certificate, setCertificate] = useState({});
    const [certificates, setCertificates] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userInfo, setUserInfo] = useState({});
    const [selectedCertificates, setSelectedCertificates] = useState([]);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [email, setEmail] = useState("");
    const [recipient, setRecipient] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    const uploadFiles = async (acceptedFiles,certificate,userInfo) => {
        const formData = new FormData();
        acceptedFiles.forEach((file) => {
            formData.append("files[]", file);
            formData.append("user_id", user.id);
            formData.append("user_name", userInfo.name);
            formData.append("sort", certificate.sort || "default_sort");
            if (certificate.certificate_date) {
                formData.append("certificate_date", certificate.certificate_date);
            }
            formData.append("certificate_id", certificate.name);
        });

        try {
            const response = await axios.post("/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setCertificate((prevCertificate) => ({
                ...prevCertificate,
                file: response.data[0].url.replace("http://localhost", ""),
            }));
        } catch (error) {
            console.error("Fehler beim Hochladen der Datei:", error);
        }

    };

    const onDrop = useCallback((acceptedFiles) => {
        console.log(certificate);
        uploadFiles(acceptedFiles,certificate,userInfo);
        setIsLoading(true);
    }, [certificate, userInfo]);


    useEffect(() => {
        console.log(selectedCertificates);
    }, [selectedCertificates]);
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

    const saveCertificate = async () => {
        let response = await axios.post(
            route("user.certificate.store"),
            certificate
        );
        if (response.data.success) {
            setCertificate({});
            setShowModal(false);
            mergeCertificates();

        }
    };

    const addNewCertificate = (certificate_new) => {
        setCertificate({
            certificate_id: certificate_new.id,
            sort: certificate_new.sort,
            name: certificate_new.name,
            user_id: user.id,
        });
        setShowModal(true);
    };

    const deleteCertificate = async (certificate) => {
        setCertificate({
            ...certificate,
            file: null,
            user_id: null,
        });
        mergeCertificates();
        if(certificate.id){
            axios.delete(route("user.certificate.destroy", certificate.id));
        }
    }

    const mergeCertificates = async () => {
        const mergedCertificates = [];
        const {data: certificates} = await axios.get(route("certificates-get"));
        const {data: userCertificates} = await axios.get(route("get-user-certificates", user.id));
        setCertificates(certificates);
        for (const certificate of certificates) {
            const userCertificate = userCertificates.find(
                (userCert) => userCert.certificate_id === certificate.id
            );
            if (!userCertificate) {
                mergedCertificates.push(certificate);
            } else {
                mergedCertificates.push({
                    ...certificate,
                    ...userCertificate,
                });
            }
        }
        setMergedCertificates(mergedCertificates);
    };

    const handleCertificateSelect = (certificateId) => {
        setSelectedCertificates((prevSelected) =>
            prevSelected.some((id) => id === certificateId)
                ? prevSelected.filter((id) => id !== certificateId)
                : [...prevSelected, certificateId]
        );
    };

    const sendEmail = async () => {

        const selectedFiles = mergedCertificates
            .filter((cert) => selectedCertificates.includes(cert.id))
            .map((cert) => cert.file);

        try {
            await axios.post("/send-email", {
                email,
                recipient,
                subject,
                message,
                files: selectedFiles,
            });
            setShowEmailModal(false);
            setSelectedCertificates([]);
            setEmail("");
            setRecipient("");
            setSubject("");
            setMessage("");
        } catch (error) {
            console.error("Email gönderme hatası:", error);
        }
    };

    useEffect(() => {
        mergeCertificates();
        getUser();
    }, []);

    return (
        <>
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <Modal.Header>Zertifikat Hinzufügen</Modal.Header>
                <Modal.Body>

                    <div className="mt-2">
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                            Zertifikat
                        </p>
                        <Select
                            className="w-full "
                            value={certificate.certificate_id}
                            onChange={(e) =>
                                setCertificate({
                                    ...certificate,
                                    certificate_id: e.target.value,
                                })
                            }
                            disabled={certificate.certificate_id}
                        >
                            <option>Wählen</option>
                            {certificates &&
                                certificates.map((certificate) => (
                                    <option
                                        key={certificate.id}
                                        value={certificate.id}
                                    >
                                        {certificate.name}
                                    </option>
                                ))}
                        </Select>
                    </div>
                    <div className="mt-2 flex space-x-4">
                        <div className="w-1/2">
                            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                                Datum
                            </p>
                            <input
                                className="w-full border-2 border-gray-300 rounded-md p-2"
                                type="date"
                                value={certificate.certificate_date}
                                onChange={(e) =>
                                    setCertificate({
                                        ...certificate,
                                        certificate_date: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="w-1/2">
                            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                                Gültigkeitsdatum
                            </p>
                            <input
                                className="w-full border-2 border-gray-300 rounded-md p-2"
                                type="date"
                                value={certificate.validity_date}
                                onChange={(e) =>
                                    setCertificate({
                                        ...certificate,
                                        validity_date: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                    <div className="mt-2 flex space-x-4">
                        <div className="w-1/2">
                            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                                Ausbildungsinstitut
                            </p>
                            <input
                                className="w-full border-2 border-gray-300 rounded-md p-2"
                                type="text"
                                value={certificate.creator}
                                onChange={(e) =>
                                    setCertificate({
                                        ...certificate,
                                        creator: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="w-1/2">
                            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                                Bestätigende Person
                            </p>
                            <input
                                className="w-full border-2 border-gray-300 rounded-md p-2"
                                type="text"
                                value={certificate.confirmer}
                                onChange={(e) =>
                                    setCertificate({
                                        ...certificate,
                                        confirmer: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                    <div className="mt-2 flex space-x-4">
                        <div className="w-1/2">
                            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                                Erinnerungstage
                            </p>
                            <input
                                className="w-full border-2 border-gray-300 rounded-md p-2"
                                type="number"
                                value={certificate.reminder_days}
                                onChange={(e) =>
                                    setCertificate({
                                        ...certificate,
                                        reminder_day: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="w-1/2">
                            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                                Sichtbar?
                            </p>
                            <div className="flex items-center">
                                <ToggleSwitch
                                    id="visible"
                                    name="visible"
                                    checked={certificate.visible}
                                    onChange={(e) =>
                                        setCertificate({
                                            ...certificate,
                                            visible: e,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {!certificate.file && (
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

                    {certificate.file && (
                        <div className="mt-2 mb-2">
                            <div className="flex space-x-2">
                                <Button
                                    onClick={() => {
                                        window.open(certificate.file, "_blank");
                                    }}
                                >
                                    Anzeigen
                                </Button>
                                <Button
                                    onClick={() => {
                                        deleteCertificate();
                                    }}
                                >
                                    Datei Entfernen
                                </Button>
                            </div>
                        </div>
                    )}

                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={saveCertificate}>Zuweisen</Button>
                    <Button color="gray" onClick={() => setShowModal(false)}>
                        Abbrechen
                    </Button>
                </Modal.Footer>
            </Modal>

            <Button
                className="mb-4"
                onClick={() => {
                    const selectedFiles = mergedCertificates
                    .filter((cert) => selectedCertificates.includes(cert.id))
                    .map((cert) => cert.file);

                    if(selectedCertificates.length === 0){
                        Swal.fire(
                            "Hata",
                            "Lütfen önce bir sertifika seçiniz.",
                            "error"
                        );
                        return;
                    } else {
                        if(selectedFiles.filter(file => file === null || file === undefined).length > 0 ){
                            Swal.fire(
                                "Hata",
                                "Seçtiklerinizden birinde dosya bulunmuyor.",
                                "error"
                            );
                            return;
                        }
                    }
                    setShowEmailModal(true);
                }}
            >
                Seçilen Sertifikaları Mail At
            </Button>

            <Modal show={showEmailModal} onClose={() => setShowEmailModal(false)}>
                <Modal.Header>Seçilen Sertifikaları Mail At</Modal.Header>
                <Modal.Body>
                    <div className="mt-2">
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                            Email Adresi
                        </p>
                        <input
                            className="w-full border-2 border-gray-300 rounded-md p-2"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="mt-2">
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                            Kime
                        </p>
                        <input
                            className="w-full border-2 border-gray-300 rounded-md p-2"
                            type="text"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                        />
                    </div>
                    <div className="mt-2">
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                            Konu
                        </p>
                        <input
                            className="w-full border-2 border-gray-300 rounded-md p-2"
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>
                    <div className="mt-2">
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                            Mesaj İçeriği
                        </p>
                        <textarea
                            className="w-full border-2 border-gray-300 rounded-md p-2"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={sendEmail}>Gönder</Button>
                    <Button color="gray" onClick={() => setShowEmailModal(false)}>
                        İptal
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">
                                Seç
                            </th>
                            <th className="py-2 px-4 border-b">
                                Zertifikat Name
                            </th>
                            <th className="py-2 px-4 border-b">Datei</th>
                            <th className="py-2 px-4 border-b max-w-[100px]">Austeller</th>
                            <th className="py-2 px-4 border-b min-w-[200px]">Prüfer</th>
                            <th className="py-2 px-4 border-b">
                                Zertifikatsdatum
                            </th>
                            <th className="py-2 px-4 border-b">
                                Gültigkeitsdatum
                            </th>
                            <th className="py-2 px-4 border-b">
                                WV
                            </th>

                            <th className="py-2 px-4 border-b">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mergedCertificates.length > 0 &&
                            mergedCertificates.map((certificate, index) => (
                                <tr key={index} className={ index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                                    <td className="py-2 px-4 border-b border-gray-300 border-l-2 border-r-2">
                                        <input
                                            type="checkbox"
                                            disabled={!certificate.file}
                                            checked={certificate.file && selectedCertificates.includes(certificate.id)}
                                            onChange={() => handleCertificateSelect(certificate.id)}
                                        />
                                    </td>
                                    {certificate.user_id ? (
                                        <>
                                            <td className="py-2 px-4 border-b border-gray-300 border-l-2 border-r-2 min-w-[250px]">
                                                {certificate.name}
                                            </td>
                                            <td className="py-2 px-4 border-b border-gray-300 border-l-2 border-r-2">
                                                {certificate.file ? (
                                                    <>
                                                    <a
                                                        href={certificate.file}
                                                        className="text-blue-500 border-2 border-blue-500 rounded-md p-1 hover:bg-blue-500 hover:text-white px-5 py-2"
                                                        target="_blank"
                                                    >
                                                        Anzeigen
                                                    </a>
                                                    <a
                                                        className="text-green-500 mx-2 border-2 border-green-500  rounded-md p-1 hover:bg-green-500 hover:text-white px-5 py-2"
                                                        download
                                                        href={certificate.file}
                                                    >
                                                        Download
                                                    </a>
                                                    </>
                                                ) : (
                                                    "Keine Datei"
                                                )}
                                            </td>
                                            <td className="py-2 px-4 border-b border-gray-300 border-l-2 border-r-2 max-w-[180px] ">
                                                {certificate.creator}
                                            </td>
                                            <td className="py-2 px-4 border-b border-gray-300 border-l-2 border-r-2 max-w-[200px]">
                                                {certificate.confirmer}
                                            </td>
                                            <td className="py-2 px-4 border-b border-gray-300 border-l-2 border-r-2">
                                                { certificate.certificate_date ? moment(
                                                    certificate.certificate_date
                                                ).format("DD.MM.YYYY") : ""}
                                            </td>
                                            <td className={`py-2 px-4 border-b border-gray-300 border-l-2 border-r-2 ${moment(certificate.validity_date).subtract(certificate.reminder_day, 'days') <= moment() ? 'text-red-500' : ''}`}>
                                                {certificate.validity_date ? moment(
                                                    certificate.validity_date
                                                ).format("DD.MM.YYYY") : ""}





                                            </td>

                                            <td className="py-2 px-4 border-b border-gray-300 border-l-2 border-r-2">
                                                {certificate.reminder_day}
                                            </td>

                                            <td className="py-2 px-4 border-b border-gray-300 border-l-2 border-r-2 ">
                                                <Button
                                                    color="gray"
                                                    className="px-5  text-red-500 border-2  border-red-500 rounded-md hover:bg-red-500 hover:text-white hover:border-red-500 hover:bg-red-500"
                                                    onClick={() => {
                                                        deleteCertificate(certificate);
                                                    }}
                                                >
                                                    Löschen
                                                </Button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="py-2 px-4 border-b border-l-2 border-r-2 border-gray-300">
                                                {certificate.name}
                                            </td>
                                            <td
                                                colSpan="8"
                                                className="py-2 px-4 border-b border-l-2 border-r-2 border-gray-300 text-end"
                                            >
                                                <button
                                                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700"
                                                    onClick={() => {
                                                        addNewCertificate(
                                                            certificate
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

export default UserCertificate;
