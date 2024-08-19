<?php

namespace App\Http\Controllers;

use App\Models\Aggreement;
use Illuminate\Http\Request;

class AggreementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $aggreements = Aggreement::all();

        return response()->json($aggreements);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
        ]);

        $aggreement = Aggreement::create($request->all());

        return response()->json(["success"=>true,"data"=>$aggreement], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request)
    {
        $aggreement = Aggreement::where('id',$request->id)->first();
        return response()->json($aggreement);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Aggreement $aggreement)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Aggreement $aggreement)
    {
        $request->validate([
            'name' => 'required',
        ]);

        $aggreement = Aggreement::where('id',$request->id)->first();
        $aggreement->update($request->all());

        return response()->json(["success"=>true,"data"=>$aggreement]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        $aggreement = Aggreement::where('id',$request->id)->first();
        $aggreement->delete();

        return response()->json(["success"=>true,"data"=>null], 204);
    }
}
