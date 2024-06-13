<?php

namespace App\Http\Controllers;

use App\Models\JobPlans;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class JobPlansController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $draftJobs = JobPlans::get();
        return response()->json($draftJobs);
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
        $jobPlan = new JobPlans();
        $jobPlan->start_date = Carbon::createFromTimeString($request->start_date)->format('Y-m-d');
        $jobPlan->end_date = Carbon::createFromTimeString($request->end_date)->format('Y-m-d');
        $jobPlan->start_time = $request->start_time;
        $jobPlan->end_time = $request->end_time;
        $jobPlan->zug_nummer = $request->zug_nummer;
        $jobPlan->locomotive_nummer = $request->locomotive_nummer;
        $jobPlan->tour_name = $request->tour_name;
        $jobPlan->description = $request->description;
        $jobPlan->to = $request->to;
        $jobPlan->from = $request->from;
        $jobPlan->save();

        return response()->json(["status" => true]);

    }

    /**
     * Display the specified resource.
     */
    public function show(JobPlans $client)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(JobPlans $client)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, JobPlans $client)
    {
        $jobPlan = JobPlans::find($request->id);
        
        $jobPlan->save();
    }
        /**
     * Update the specified resource in storage.
     */    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        $draft_id = $request->id;
        $deleted =JobPlans::where('id',$draft_id)->delete();
        return response()->json(["status" => $deleted]);
    }
}
