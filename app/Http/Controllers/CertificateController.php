<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CertificateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $certificates = Certificate::orderBy('sort')->get();

        return Inertia::render('Admin/Certificates/Index', [
            'certificates' => $certificates,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Certificates/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'sort' => 'required|integer',
        ]);

        $certificate = Certificate::create($request->all());

        return response()->json(["success" => true, "message" => "Zertifikat erfolgreich erstellt."]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request)
    {
        $certificate = Certificate::where('id', $request->id)->first();

        return response()->json($certificate);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Certificate $certificate)
    {
        return Inertia::render('Admin/Certificates/Edit', [
            'certificate' => $certificate,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Certificate $certificate)
    {
        $request->validate([
            'name' => 'required',
            'certificate_date' => 'required|date',
            'creator' => 'required|string|max:255',
            'confirmer' => 'required|string|max:255',
            'validity' => 'required|date',
            'sort' => 'required|integer',
        ]);

        $certificate = Certificate::where('id', $request->id)->first();
        $certificate->update($request->all());

        return response()->json(["success" => true, "message" => "Zertifikat erfolgreich aktualisiert."]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        $certificate = Certificate::where('id', $request->id)->first();
        $certificate->delete();

        return response()->json(["success" => true, "message" => "Zertifikat erfolgreich gelöscht."]);
    }
}
