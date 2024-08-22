<?php

namespace App\Http\Controllers;

use App\Models\UsersAggreements;
use Illuminate\Http\Request;

class UsersAggreementsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($user_id)
    {
        $userAgreements = UsersAggreements::where('user_id', $user_id)->get();
        return response()->json($userAgreements);
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

        $userAgreement = new UsersAggreements();
        $userAgreement->user_id = $request->user_id;
        $userAgreement->agreement_id = $request->agreement_id ;
        $userAgreement->agreement_file = $request->file;
        $userAgreement->agreement_type = $request->name;
        $userAgreement->save();
        return response()->json(["success" => true, "message" => "User agreement created successfully", "data" => $userAgreement]);
    }

    /**
     * Display the specified resource.
     */
    public function show(UsersAggreements $usersAggreements)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(UsersAggreements $usersAggreements)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, UsersAggreements $usersAggreements)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $userAgreement = UsersAggreements::where('id', $id)->first();
        $userAgreement->delete();
        return response()->json(["success" => true, "message" => "User agreement deleted successfully"]);
    }
}
