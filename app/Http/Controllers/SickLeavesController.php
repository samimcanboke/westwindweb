<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SickLeaves;
use App\Models\User;

class SickLeavesController extends Controller
{
    public function index()
    {
        $sickLeaves = SickLeaves::all();
        foreach ($sickLeaves as $sickLeave) {
            $sickLeave->user = User::find($sickLeave->user_id);
        }
        return response()->json(['sickLeaves' => $sickLeaves]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'start_time' => 'required',
            'end_date' => 'required|date',
            'end_time' => 'required',
            'user_id' => 'required|exists:users,id',
        ]);

        $sickLeaves = new SickLeaves();
        $sickLeaves->start_date = $request->start_date;
        $sickLeaves->start_time = $request->start_time;
        $sickLeaves->end_date = $request->end_date;
        $sickLeaves->end_time = $request->end_time;
        $sickLeaves->user_id = $request->user_id;
        $sickLeaves->save();
        return response()->json(['message' => 'Sick leave created successfully', 'sickLeaves' => $sickLeaves]);
    }
}
