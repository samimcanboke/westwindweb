<?php

namespace App\Http\Controllers;

use App\Models\UserSalaryReport;
use Illuminate\Http\Request;

class UserSalaryReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($user_id)
    {
        $reports = UserSalaryReport::where('user_id', $user_id)->get();
        return response()->json($reports);
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
            'user_id' => 'required',
            'file' => 'required',
            'date' => 'required|date',
        ]);

        $report = UserSalaryReport::create([
            'user_id' => $request->user_id,
            'file' => $request->file,
            'date' => $request->date,
        ]);

        return response()->json(['status' => 'success', 'report' => $report]);
    }

    /**
     * Display the specified resource.
     */
    public function show(UserSalaryReport $userSalaryReport)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(UserSalaryReport $userSalaryReport)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, UserSalaryReport $userSalaryReport)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $userSalaryReport = UserSalaryReport::where('id', $id)->first();
        $userSalaryReport->delete();
        return response()->json(['message' => 'Report deleted successfully']);
    }
}
