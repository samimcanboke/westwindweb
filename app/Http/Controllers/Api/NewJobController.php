<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\DraftJobs;
use Illuminate\Support\Str;
use App\Models\JobPlans;
use App\Models\Client;
class NewJobController extends Controller
{
    public function index(Request $request)
    {
        $user = JWTAuth::user();
        $draftJobs = DraftJobs::where('user_id', $user->id)->get();
        return response()->json($draftJobs);
    }

    public function save(Request $request)
    {
        $user = JWTAuth::user();
        $jobPlan = JobPlans::find($request->job_plan_id);
        if(!$jobPlan){
            $jobPlanId = null;
            if($request->client_id == null){
                return response()->json(['message' => 'Client ID is required'], 400);
            } else {
                $client = Client::where('id', $request->client_id)->first();
                if(!$client){
                    return response()->json(['message' => 'Client not found'], 404);
                }
            }
        }else{
            $jobPlanId = $jobPlan->id;
            $client = $jobPlan->client;
        }

        dd($jobPlanId,$client);
        try{
            $draftJob = new DraftJobs();
            $draftJob->user_id = $user->id;
            $draftJob->job_plan_id = $jobPlanId;
            $draftJob->client_id = $client->id;
            $draftJob->tour_id = Str::uuid();
            $draftJob->save();
        }catch(\Exception $e){
            return response()->json(['message' => 'Failed to create draft job', 'error' => $e->getMessage()], 500);
        }
        return response()->json(['message' => 'Draft job created successfully', 'draft_job' => $draftJob]);
    }

    public function update(Request $request, $id)
    {
        $draftJob = DraftJobs::where('tour_id', $id)->first();
        
        if (!$draftJob) {
            return response()->json(['message' => 'Draft job not found'], 404);
        }

        try{
            $draftJob->initial_date = $request->initial_date;
            $draftJob->zug_nummer = $request->zug_nummer;
            $draftJob->tour_name = $request->tour_name;
            $draftJob->locomotive_number = $request->locomotive_number;
            $draftJob->cancel = $request->cancel;
            $draftJob->accomodation = $request->accomodation;
            $draftJob->bereitschaft = $request->bereitschaft;
            $draftJob->comment = $request->comment;
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
            $draftJob->breaks = $request->breaks;
            $draftJob->work_end_place = $request->work_end_place;
            $draftJob->work_end_time = $request->work_end_time;
            $draftJob->guest_end_place = $request->guest_end_place;
            $draftJob->guest_end_time = $request->guest_end_time;
            $draftJob->guest_end_end_place = $request->guest_end_end_place;
            $draftJob->guest_end_end_time = $request->guest_end_end_time;
            $draftJob->learning = $request->learning;
            $draftJob->files = json_encode($request->files); // Convert files to JSON string
            $draftJob->ausland = $request->ausland;
            $draftJob->country = $request->country;
            $draftJob->early_exit = $request->early_exit;
            $draftJob->late_enter = $request->late_enter;
            $draftJob->ausbilder = $request->ausbilder;
            $draftJob->ausbildung = $request->ausbildung;
            $draftJob->guest = $request->guest;
            $draftJob->gf_start_status = $request->gf_start_status;
            $draftJob->gf_end_status = $request->gf_end_status;
            $draftJob->save();
        }catch(\Exception $e){
            return response()->json(['message' => 'Failed to update draft job', 'error' => $e->getMessage()], 500);
        }
        return response()->json(['message' => 'Draft job updated successfully', 'draft_job' => $draftJob]);
    }

    public function destroy($id)
    {
        $draftJob = DraftJobs::where('tour_id', $id)->first();
        if (!$draftJob) {
            return response()->json(['message' => 'Draft job not found'], 404);
        }
        $draftJob->delete();
        return response()->json(['message' => 'Draft job deleted successfully']);
    }
}
