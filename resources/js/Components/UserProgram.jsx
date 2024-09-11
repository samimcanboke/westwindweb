import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button, Select, ToggleSwitch, } from "flowbite-react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import moment from "moment";
import { Field,ErrorMessage } from "formik";

function UserProgram({user}) {
    const [mergedPrograms, setMergedPrograms] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [program, setProgram] = useState({});
    const [programs, setPrograms] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userInfo, setUserInfo] = useState({});



    const saveProgram = async () => {
        let response = await axios.post(
            route("user.programs.store", user.id),
            program
        );
        if (response.data.success) {
            setProgram({});
            setShowModal(false);

        }
        mergePrograms();
    };

    const addNewProgram = (program_new) => {
        setProgram({
            program_id: program_new.id,
            username: program_new.username,
            password: program_new.password,
            user_id: user.id,
        });
        setShowModal(true);
        mergePrograms();
    };

    const deleteProgram = async (program) => {
        setProgram({
            ...program,
            file: null,
            user_id: null,
        });
        if(program.id){
            axios.delete(route("user.programs.destroy", program.id));
        }
        mergePrograms();
    }

    const mergePrograms = async () => {
        const mergedPrograms = [];
        const {data: programs} = await axios.get(route("programs"));
        const {data: userPrograms} = await axios.get(route("user.programs", user.id));
        setPrograms(programs);
        for (const program of programs) {
            const userProgram = userPrograms.find(
                (userProgram) => userProgram.program_id === program.id
            );
            if (!userProgram) {
                mergedPrograms.push(program);
            } else {
                mergedPrograms.push({
                    ...program,
                    ...userProgram,
                    name: program.name,
                });
            }
        }
        setMergedPrograms(mergedPrograms);
    };

    useEffect(() => {
        mergePrograms();

    }, []);

    return (
        <>
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <Modal.Header>Programm Hinzufügen</Modal.Header>
                <Modal.Body>

                    <div className="mt-2">
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                            Programm
                        </p>
                        <Select
                            className="w-full"
                            value={program.program_id}
                            onChange={(e) =>
                                setProgram({
                                    ...program,
                                    program_id: e.target.value,
                                })
                            }
                            disabled={true}
                        >
                            <option>Wählen</option>
                            {programs &&
                                programs.map((program) => (
                                    <option
                                        key={program.id}
                                        value={program.id}
                                    >
                                        {program.name}
                                    </option>
                                ))}
                        </Select>

                        <div className="mt-2">
                            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                                Benutzername
                            </p>
                            <Field
                                className="w-full border-2 border-gray-300 rounded-md p-2"
                                type="text"
                                placeholder="Benutzername"
                                name="username"
                                onChange={(e) => setProgram({
                                    ...program,
                                    username: e.target.value,
                                })}
                            />
                            <ErrorMessage name="username" component="div" className="text-red-500" />
                        </div>

                        <div className="mt-2">
                            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                                Passwort
                            </p>
                            <Field
                                className="w-full border-2 border-gray-300 rounded-md p-2"
                                type="text"
                                name="password"
                                onChange={(e) => setProgram({
                                    ...program,
                                    password: e.target.value,
                                })}
                            />
                            <ErrorMessage name="password" component="div" className="text-red-500" />
                        </div>
                    </div>




                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={saveProgram}>Zuweisen</Button>
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
                                Programm Name
                            </th>
                            <th className="py-2 px-4 border-b">Username</th>
                            <th className="py-2 px-4 border-b">Password</th>
                            <th className="py-2 px-4 border-b">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mergedPrograms.length > 0 &&
                            mergedPrograms.map((program, index) => (
                                <tr key={index} className={ index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                                    {program.user_id ? (
                                        <>
                                            <td className="py-2 px-4 border-b border-gray-300 border-l-2 border-r-2 min-w-[250px]">
                                                {program.name}
                                            </td>
                                            <td className="py-2 px-4 border-b border-gray-300 border-l-2 border-r-2">
                                                {program.username}
                                            </td>
                                            <td className="py-2 px-4 border-b border-gray-300 border-l-2 border-r-2">
                                                {program.password}
                                            </td>
                                            <td className="py-2 px-4 border-b border-gray-300 border-l-2 border-r-2 ">
                                                <Button
                                                    color="gray"
                                                    className="px-5  text-red-500 border-2  border-red-500 rounded-md hover:bg-red-500 hover:text-white hover:border-red-500 hover:bg-red-500"
                                                    onClick={() => {
                                                        deleteProgram(program);
                                                    }}
                                                >
                                                    Löschen
                                                </Button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="py-2 px-4 border-b border-l-2 border-r-2 border-gray-300">
                                                {program.name}
                                            </td>
                                            <td
                                                colSpan="8"
                                                className="py-2 px-4 border-b border-l-2 border-r-2 border-gray-300 text-end"
                                            >
                                                <button
                                                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700"
                                                    onClick={() => {
                                                        addNewProgram(
                                                            program
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

export default UserProgram;
