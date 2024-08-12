<?php

namespace App\Http\Controllers;

use App\Models\HourBank;
use Illuminate\Http\Request;

class HourBankController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($user_id)
    {
        $hourBanks = HourBank::where('user_id', $user_id)->get();
        return response()->json($hourBanks);
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
    public function store(Request $request, $user_id)
    {
        $request->validate([
            'hours' => 'required|numeric',
            'type' => 'required|in:deposit,withdraw',
            'date' => 'required|date',
        ]);
        $hourBank = HourBank::create([
            'user_id' => $user_id,
            'hours' => $request->hours,
            'type' => $request->type,
            'date' => $request->date,
        ]);
        return response()->json($hourBank);
    }

    /**
     * Display the specified resource.
     */
    public function show(HourBank $hourBank)
    {
        return response()->json($hourBank);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(HourBank $hourBank)
    {
        return response()->json($hourBank);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, HourBank $hourBank)
    {
        $request->validate([
            'hours' => 'required|numeric',
            'type' => 'required|in:deposit,withdraw',
            'date' => 'required|date',
        ]);
        $hourBank->update($request->all());
        return response()->json($hourBank);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $hourBank = HourBank::find($id);
        $hourBank->delete();
        return response()->json($hourBank);
    }
}
