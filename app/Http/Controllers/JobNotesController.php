<?php

namespace App\Http\Controllers;

use App\Models\JobNotes;
use Illuminate\Http\Request;

class JobNotesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $jobNotes = JobNotes::all();
        return response()->json($jobNotes);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $jobNotes = JobNotes::create($request->all());
        return response()->json($jobNotes); 
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required',
            'start_date' => 'required',
            'end_date' => 'required',
            'start_time' => 'required',
            'end_time' => 'required',
            'notes' => 'required',
        ]);
        $jobNotes = JobNotes::create($request->all());
        return response()->json($jobNotes); 
    }

    /**
     * Display the specified resource.
     */
    public function show(JobNotes $jobNotes, $id)
    {   
        $jobNotes = JobNotes::where('id', $id)->get();
        return response()->json($jobNotes);
    }

    /**
     * Show the form for editing the specified resource.
     */
        public function edit(JobNotes $jobNotes, $id)
    {
        $jobNotes = JobNotes::find($id);
        return response()->json($jobNotes); 
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, JobNotes $jobNotes, $id)
    {
        $jobNotes = JobNotes::find($id);
        $jobNotes->update($request->all());
        return response()->json($jobNotes); 
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(JobNotes $jobNotes, $id)
    {
        $jobNotes = JobNotes::where('id', $id)->delete();
        return response()->json($jobNotes); 
    }
}
