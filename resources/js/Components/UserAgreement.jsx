import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button, Select, ToggleSwitch } from "flowbite-react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import moment from "moment";

function UserAgreement({user}) {
    const [mergedAgreements, setMergedAgreements] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [agreement, setAgreement] = useState({});
    const [agreements, setAgreements] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userInfo, setUserInfo] = useState({});

    const uploadFiles = async (acceptedFiles,agreement,userInfo) => {
        const formData = new FormData();
        acceptedFiles.forEach((file) => {
            formData.append("files[]", file);
        });

        try {
            const response = await axios.post("/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setAgreement((prevAgreement) => ({
                ...prevAgreement,
                file: response.data[0].url.replace("http://localhost", ""),
            }));
        } catch (error) {
            console.error("Fehler beim Hochladen der Datei:", error);
        }

    };

    const onDrop = useCallback((acceptedFiles) => {
        uploadFiles(acceptedFiles,agreement,userInfo);
        setIsLoading(true);
    }, [agreement, userInfo]);

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

    const saveAgreement = async () => {
        let response = await axios.post(
            route("user.agreement.store"),
            agreement
        );
        if (response.data.success) {
            setAgreement({});
            setShowModal(false);
            mergeAgreements();

        }
    };

    const addNewAgreement = (agreement_new) => {
        setAgreement({
            agreement_id: agreement_new.id,
            name: agreement_new.name,
            user_id: user.id,
        });
        setShowModal(true);
    };

    const deleteAgreement = async (agreement) => {
        setAgreement({
            ...agreement,
            file: null,
            user_id: null,
        });
        mergeAgreements();
        if(agreement.id){
            axios.delete(route("user.agreement.destroy", agreement.id));
        }
    }

    const mergeAgreements = async () => {
        const mergedAgreements = [];
        const {data: agreements} = await axios.get(route("aggreements"));
        const {data: userAgreements} = await axios.get(route("get-user-agreements", user.id));
        setAgreements(agreements);
        console.log(userAgreements);
        for (const agreement of agreements) {
            const userAgreement = userAgreements.find(
                (userAgreement) => userAgreement.agreement_id === agreement.id
            );
            if (!userAgreement) {
                mergedAgreements.push(agreement);
            } else {
                mergedAgreements.push({
                    ...agreement,
                    ...userAgreement,
                });
            }
        }
        console.log(mergedAgreements);
        setMergedAgreements(mergedAgreements);
    };

    useEffect(() => {
        mergeAgreements();
        getUser();
    }, []);

    return (
        <>
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <Modal.Header>Vertrag Hinzufügen</Modal.Header>
                <Modal.Body>

                    <div className="mt-2">
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                            Vertrag
                        </p>
                        <Select
                            className="w-full "
                            value={agreement.agreement_id}
                            onChange={(e) =>
                                setAgreement({
                                    ...agreement,
                                    agreement_id: e.target.value,
                                })
                            }
                            disabled={true}
                        >
                            <option>Wählen</option>
                            {agreements &&
                                agreements.map((agreement) => (
                                    <option
                                        key={agreement.id}
                                        value={agreement.id}
                                    >
                                        {agreement.name}
                                    </option>
                                ))}
                        </Select>
                    </div>


                    {!agreement.file && (
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

                    {agreement.file && (
                        <div className="mt-2 mb-2">
                            <div className="flex space-x-2">
                                <Button
                                    onClick={() => {
                                        window.open(agreement.file, "_blank");
                                    }}
                                >
                                    Anzeigen
                                </Button>
                                <Button
                                    onClick={() => {
                                        deleteAgreement();
                                    }}
                                >
                                    Datei Entfernen
                                </Button>
                            </div>
                        </div>
                    )}

                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={saveAgreement}>Zuweisen</Button>
                    <Button color="gray" onClick={() => setShowModal(false)}>
                        Abbrechen
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">
                                Vertrag Name
                            </th>
                            <th className="py-2 px-4 border-b">Datei</th>
                            <th className="py-2 px-4 border-b">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mergedAgreements.length > 0 &&
                            mergedAgreements.map((agreement, index) => (
                                <tr key={index} className={ index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                                    {agreement.user_id ? (
                                        <>
                                            <td className="py-2 px-4 border-b border-gray-300 border-l-2 border-r-2 min-w-[250px]">
                                                {agreement.name}
                                            </td>
                                            <td className="py-2 px-4 border-b border-gray-300 border-l-2 border-r-2">
                                                {agreement.agreement_file ? (
                                                    <>
                                                    <a
                                                        href={agreement.agreement_file}
                                                        className="text-blue-500 border-2 border-blue-500 rounded-md p-1 hover:bg-blue-500 hover:text-white px-5 py-2"
                                                        target="_blank"
                                                    >
                                                        Anzeigen
                                                    </a>
                                                    <a
                                                        className="text-green-500 mx-2 border-2 border-green-500  rounded-md p-1 hover:bg-green-500 hover:text-white px-5 py-2"
                                                        download
                                                        href={agreement.agreement_file}
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
                                                        deleteAgreement(agreement);
                                                    }}
                                                >
                                                    Löschen
                                                </Button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="py-2 px-4 border-b border-l-2 border-r-2 border-gray-300">
                                                {agreement.name}
                                            </td>
                                            <td
                                                colSpan="8"
                                                className="py-2 px-4 border-b border-l-2 border-r-2 border-gray-300 text-end"
                                            >
                                                <button
                                                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700"
                                                    onClick={() => {
                                                        addNewAgreement(
                                                            agreement
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

export default UserAgreement;
