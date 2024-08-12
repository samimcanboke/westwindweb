import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import SignatureCanvas from "react-signature-canvas";
import { useState } from "react";

export default function TestSign({ auth }) {
    const [position, setPosition] = useState({
        latitude: null,
        longitude: null,
    });
    const [error, setError] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(false);

    const startTracking = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                () => {
                    setPermissionGranted(true);
                    setIsTracking(true);
                    trackPosition();
                },
                (error) => {
                    setError(error.message);
                    setPermissionGranted(false);
                }
            );
        } else {
            setError("Geolocation is not supported by this browser.");
        }
    };

    const trackPosition = () => {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (position) => {
                    setPosition({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error) => {
                    setError(error.message);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0,
                }
            );
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Test Sign
                </h2>
            }
        >
            <Head title="Test Sign" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <SignatureCanvas
                                penColor="blue"
                                canvasProps={{
                                    width: 500,
                                    height: 200,
                                    className: "sigCanvas",
                                }}
                            />

                            <h1>Geolocation Tracker</h1>
                            {!permissionGranted ? (
                                <div>
                                    <p>
                                        Konumunuzu izlemek için izninizi
                                        istiyoruz. Lütfen devam etmek için "İzin
                                        Ver" düğmesine tıklayın.
                                    </p>
                                    <button onClick={startTracking}>
                                        İzin Ver
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    {isTracking ? (
                                        <p>
                                            Latitude: {position.latitude} <br />
                                            Longitude: {position.longitude}
                                        </p>
                                    ) : (
                                        <p>Konum izleme başlatılıyor...</p>
                                    )}
                                </div>
                            )}
                            {error && <p>Error: {error}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
