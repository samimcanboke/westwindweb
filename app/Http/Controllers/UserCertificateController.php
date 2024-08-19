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
        //
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
    public function destroy(UserCertificate $userCertificate)
    {
        //
    }
}
