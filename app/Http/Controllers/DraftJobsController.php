<?php

namespace App\Http\Controllers;

use App\Models\DraftJobs;
use App\Models\FinalizedJobs;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DraftJobsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $id = Auth::id();
        $draftJobs = DraftJobs::where('user_id', $id)->get();
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
   
        $draftJob = new DraftJobs();
        $draftJob->user_id = $request->user()->id;
        $draftJob->client_id = $request->client;
        $draftJob->initial_date = $request->initialDate;
        $draftJob->zug_nummer = $request->zugNummer;
        $draftJob->tour_name = $request->tourName;
        $draftJob->locomotive_number = $request->locomotiveNumber;
        $draftJob->cancel = $request->cancel;
        $draftJob->accomodation = $request->accomodation;
        $draftJob->bereitschaft = $request->bereitschaft;
        $draftJob->comment = $request->comment;
        $draftJob->learning = $request->learning;
        $draftJob->feeding_fee = $request->feedingFee;
        $draftJob->guest_start_place = $request->guestStartPlace;
        $draftJob->guest_start_time = $request->guestStartTime;
        $draftJob->guest_start_end_place = $request->guestStartEndPlace;
        $draftJob->guest_start_end_time = $request->guestStartEndTime;
        $draftJob->work_start_place = $request->workStartPlace;
        $draftJob->work_start_time = $request->workStartTime;
        $draftJob->train_start_place = $request->trainStartPlace;
        $draftJob->train_start_time = $request->trainStartTime;
        $draftJob->train_end_place = $request->trainEndPlace;
        $draftJob->train_end_time = $request->trainEndTime;
        $draftJob->breaks = json_encode($request->breaks);
        $draftJob->work_end_place = $request->workEndPlace;
        $draftJob->work_end_time = $request->workEndTime;
        $draftJob->guest_end_place = $request->guestEndPlace;
        $draftJob->guest_end_time = $request->guestEndTime;
        $draftJob->guest_end_end_place = $request->guestEndEndPlace;
        $draftJob->guest_end_end_time = $request->guestEndEndTime;
        $draftJob->files = is_string($request->images) ? $request->images : json_encode($request->images);
        $draftJob->save();

        return response()->json(["status" => true]);

    }

    /**
     * Display the specified resource.
     */
    public function show(DraftJobs $client)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(DraftJobs $client)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DraftJobs $client)
    {
        $draftJob = DraftJobs::find($request->id);
        $draftJob->user_id = $request->user()->id;
        $draftJob->client_id = $request->client_id;
        $draftJob->initial_date = $request->initial_date;
        $draftJob->zug_nummer = $request->zug_nummer;
        $draftJob->tour_name = $request->tour_name;
        $draftJob->locomotive_number = $request->locomotive_number;
        $draftJob->cancel = $request->cancel;
        $draftJob->accomodation = $request->accomodation;
        $draftJob->bereitschaft = $request->bereitschaft;
        $draftJob->comment = $request->comment;
        $draftJob->learning = $request->learning;
        $draftJob->feeding_fee = $request->feeding_fee;
        $draftJob->guest_start_place = $request->guest_start_place;
        $draftJob->guest_start_time = $request->guest_start_time;
        $draftJob->guest_start_end_place = $request->guest_start_end_place;
        $draftJob->guest_start_end_time = $request->guest_start_end_time;
        $draftJob->work_start_place = $request->work_start_place;
        $draftJob->work_start_time = $request->work_start_time;
        $draftJob->train_start_place = $request->train_start_place;
        $draftJob->train_start_time = $request->train_start_time;
        $draftJob->train_end_place = $request->train_end_place;
        $draftJob->train_end_time = $request->train_end_time;
        $draftJob->breaks = json_encode($request->breaks);
        $draftJob->work_end_place = $request->work_end_place;
        $draftJob->work_end_time = $request->work_end_time;
        $draftJob->guest_end_place = $request->guest_end_place;
        $draftJob->guest_end_time = $request->guest_end_time;
        $draftJob->guest_end_end_place = $request->guest_end_end_place;
        $draftJob->guest_end_end_time = $request->guest_end_end_time;
        if($request->images && json_encode($request->images) !== $draftJob->files){
            $draftJob->files = is_string($request->images) ? $request->images : json_encode($request->images);
        }
        $draftJob->save();
    }
        /**
     * Update the specified resource in storage.
     */
    public function send_submit(Request $request, DraftJobs $client)
    {
        $draft_id = $request->draft_id;
        $user_id = Auth::user()->id;
        $draft = DraftJobs::where('id',$draft_id)->first();
        $finalized = new FinalizedJobs;
        $finalized->user_id = $user_id;
        $finalized->client_id = $draft->client_id;
        $finalized->initial_date = $draft->initial_date;
        $finalized->zug_nummer = $draft->zug_nummer;
        $finalized->tour_name = $draft->tour_name;
        $finalized->locomotive_number = $draft->locomotive_number;
        $finalized->cancel = $draft->cancel;
        $finalized->learning = $draft->learning;
        $finalized->accomodation = $draft->accomodation;
        $finalized->bereitschaft = $draft->bereitschaft;
        $finalized->comment = $draft->comment;
        $finalized->feeding_fee = $draft->feeding_fee;
        $finalized->guest_start_place = $draft->guest_start_place;
        $finalized->guest_start_time = $draft->guest_start_time;
        $finalized->guest_start_end_place = $draft->guest_start_end_place;
        $finalized->guest_start_end_time = $draft->guest_start_end_time;
        $finalized->work_start_place = $draft->work_start_place;
        $finalized->work_start_time = $draft->work_start_time;
        $finalized->train_start_place = $draft->train_start_place;
        $finalized->train_start_time = $draft->train_start_time;
        $finalized->train_end_place = $draft->train_end_place;
        $finalized->train_end_time = $draft->train_end_time;
        $finalized->breaks = json_encode($draft->breaks);
        $finalized->work_end_place = $draft->work_end_place;
        $finalized->work_end_time = $draft->work_end_time;
        $finalized->guest_end_place = $draft->guest_end_place;
        $finalized->guest_end_time = $draft->guest_end_time;
        $finalized->guest_end_end_place = $draft->guest_end_end_place;
        $finalized->guest_end_end_time = $draft->guest_end_end_time;  
        if($draft->files){
            $finalized->files = is_string($draft->files) ? $draft->files : json_encode($draft->files);
        }
        $finalized->save();
        $draft->delete();
        return response()->json(["status" => $finalized]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        $draft_id = $request->draft_id;
        $deleted =DraftJobs::where('id',$draft_id)->delete();
        return response()->json(["status" => $deleted]);
    }
}
