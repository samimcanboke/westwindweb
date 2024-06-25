<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\AnnualLeaves;
use App\Models\User;

class AnnualLeavesController extends Controller
{
    public function index()
    {
        $annualLeaves = AnnualLeaves::all();
        foreach ($annualLeaves as $annualLeave) {
            $annualLeave->user = User::find($annualLeave->user_id);
        }
        return response()->json(['annualLeaves' => $annualLeaves]);
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

        $annualLeaves = new AnnualLeaves();
        $annualLeaves->start_date = $request->start_date;
        $annualLeaves->start_time = $request->start_time;
        $annualLeaves->end_date = $request->end_date;
        $annualLeaves->end_time = $request->end_time;
        $annualLeaves->user_id = $request->user_id;
        $annualLeaves->save();
        return response()->json(['message' => 'Annual leave created successfully', 'annualLeaves' => $annualLeaves]);
    }
    public function destroy($id)
    {
        $annualLeave = AnnualLeaves::find($id);
        $annualLeave->delete();
        return response()->json(['annualLeave' => $annualLeave]);
    }
}
