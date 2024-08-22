<?php

namespace App\Http\Controllers;

use App\Models\UserCertificate;
use Illuminate\Http\Request;

class UserCertificateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($user_id)
    {
        $userCertificates = UserCertificate::where('user_id', $user_id)->get();
        return response()->json($userCertificates);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {


        $request->validate([
            'certificate_id' => 'required',
            'user_id' => 'required',
            'certificate_date' => 'required',
            'validity_date' => 'required',
            'file' => 'required',
            'reminder_day' => 'required',
            'creator'=> 'required',
            'confirmer'=> 'required',
            'file' => 'required',
        ]);

        $userCertificate = UserCertificate::create($request->all());
        return response()->json(["success" => true, "message" => "Sertifika başarıyla eklendi."], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(UserCertificate $userCertificate)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(UserCertificate $userCertificate)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, UserCertificate $userCertificate)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $userCertificate = UserCertificate::where('id', $id)->first();
        $userCertificate->delete();
        return response()->json(["success" => true, "message" => "Sertifika başarıyla kaldırıldı."], 200);
    }
}
