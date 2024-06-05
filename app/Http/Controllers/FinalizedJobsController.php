<?php

namespace App\Http\Controllers;

use App\Models\FinalizedJobs;
use App\Models\User;
use Illuminate\Http\Request;
use App\Models\Client;
use App\Exports\UsersExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Http;
use GuzzleHttp\Psr7\Response;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;



class FinalizedJobsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        
    }

    public function get_finalized(Request $request)
    {
        $data = [
            "year" => "2024",
            "month" => "04",
            "name"=> "Samimcan BÖKE",
            "id"=> "001",
            "mail"=> "samimcanboke@hotmail.com",
            "phone"=> "+358468001631",
            "admin_extra"=>0,
            "left_admin_extra"=>0,
            "done_hours"=> 33,
            "current_sick"=> 10,
            "rights_sick"=> 30,
            "used_annual"=> 5,
            "total_annual"=> 30,
            "left_annual"=> 25,
            "total_hours_req"=> 160.00,
            "total_worked_time"=> 30.00,
            "left_work_time"=> 130.00,
            "rows"=> [
                [
                    "date"=> "07/04/2024",
                    "times"=> "09:00 - 19:00",
                    "work_sum"=> "9,00",
                    "guest_start_times"=> "08:00 - 09:00",
                    "guest_end_times"=> "19:00 - 20:00",
                    "guest_total"=> "2,00",
                    "break_total"=> "1,00",
                    "public_holiday"=> "0,00",
                    "sunday_holiday"=> "0,00",
                    "midnight_shift"=> "0,00",
                    "night_shift"=> "0,00",
                    "accommodation"=> "Heim",
                    "comment"=> "asdkasşlkdasşlkdaşsldikidiasdlşkasidaksdilaskidşlaskdiş",
                    "places"=> "AB99-BC22",
                    "client"=> "Lte Niederlande"
                ],
                [
                    "date"=> "08/04/2024",
                    "times"=> "09:00 - 19:00",
                    "work_sum"=> "9,00",
                    "guest_start_times"=> "08:00 - 09:00",
                    "guest_end_times"=> "19:00 - 20:00",
                    "guest_total"=> "2,00",
                    "break_total"=> "1,00",
                    "public_holiday"=> "0,00",
                    "sunday_holiday"=> "0,00",
                    "midnight_shift"=> "0,00",
                    "night_shift"=> "0,00",
                    "accommodation"=> "Hotel",
                    "comment"=> "asdkasşlkdasşlkdaşsldikidiasdlşkasidaksdilaskidşlaskdiş",
                    "places"=> "AB99-BC22",
                    "client"=> "Lte Niederlande"
                ],
                [
                    "date"=> "09/04/2024",
                    "times"=> "09:00 - 19:00",
                    "work_sum"=> "9,00",
                    "guest_start_times"=> "08:00 - 09:00",
                    "guest_end_times"=> "19:00 - 20:00",
                    "guest_total"=> "2,00",
                    "break_total"=> "1,00",
                    "public_holiday"=> "0,00",
                    "sunday_holiday"=> "0,00",
                    "midnight_shift"=> "0,00",
                    "night_shift"=> "0,00",
                    "accommodation"=> "Heim",
                    "comment"=> "asdkasşlkdasşlkdaşsldikidiasdlşkasidaksdilaskidşlaskdiş",
                    "places"=> "AB99-BC22",
                    "client"=> "Lte Niederlande"
                ]
            ],
            "totals"=> [
                "dates"=> 3,
                "workhours"=> 27.00,
                "guests"=> 6.00,
                "breaks"=> 3.0,
                "public_holidays"=> 0.00,
                "sunday_holidays"=> 0.00,
                "midnight_shift"=> 0.00,
                "night_shift"=> 0.00,
                "accomodations"=> 64.00
            ]

        ]; 
        /*
        $data = [
            "year": "2024",
            "month": "04",
            "name": "Samimcan BÖKE",
            "id": "001",
            "mail": "samimcanboke@hotmail.com",
            "phone": "+358468001631",
            "admin_extra":0,
            "left_admin_extra":0,
            "done_hours": 33,
            "current_sick": 10,
            "rights_sick": 30,
            "used_annual": 5,
            "total_annual": 30,
            "left_annual": 25,
            "total_hours_req": 160.00,
            "total_worked_time": 30.00,
            "left_work_time": 130.00,
            "rows": [
                {
                    "date": "07/04/2024",
                    "times": "09:00 - 19:00",
                    "work_sum": "9,00",
                    "guest_start_times": "08:00 - 09:00",
                    "guest_end_times": "19:00 - 20:00",
                    "guest_total": "2,00",
                    "break_total": "1,00",
                    "public_holiday": "0,00",
                    "sunday_holiday": "0,00",
                    "midnight_shift": "0,00",
                    "night_shift": "0,00",
                    "accommodation": "Heim",
                    "comment": "asdkasşlkdasşlkdaşsldikidiasdlşkasidaksdilaskidşlaskdiş",
                    "places": "AB99-BC22",
                    "client": "Lte Niederlande"
                },
                {
                    "date": "08/04/2024",
                    "times": "09:00 - 19:00",
                    "work_sum": "9,00",
                    "guest_start_times": "08:00 - 09:00",
                    "guest_end_times": "19:00 - 20:00",
                    "guest_total": "2,00",
                    "break_total": "1,00",
                    "public_holiday": "0,00",
                    "sunday_holiday": "0,00",
                    "midnight_shift": "0,00",
                    "night_shift": "0,00",
                    "accommodation": "Hotel",
                    "comment": "asdkasşlkdasşlkdaşsldikidiasdlşkasidaksdilaskidşlaskdiş",
                    "places": "AB99-BC22",
                    "client": "Lte Niederlande"
                },
                {
                    "date": "09/04/2024",
                    "times": "09:00 - 19:00",
                    "work_sum": "9,00",
                    "guest_start_times": "08:00 - 09:00",
                    "guest_end_times": "19:00 - 20:00",
                    "guest_total": "2,00",
                    "break_total": "1,00",
                    "public_holiday": "0,00",
                    "sunday_holiday": "0,00",
                    "midnight_shift": "0,00",
                    "night_shift": "0,00",
                    "accommodation": "Heim",
                    "comment": "asdkasşlkdasşlkdaşsldikidiasdlşkasidaksdilaskidşlaskdiş",
                    "places": "AB99-BC22",
                    "client": "Lte Niederlande"
                }
            ],
            "totals": {
                "dates": 3,
                "workhours": 27.00,
                "guests": 6.00,
                "breaks": 3.00,
                "public_holidays": 0.00,
                "sunday_holidays": 0.00,
                "midnight_shift": 0.00,
                "night_shift": 0.00,
                "accomodations": 64.00
            }
        };
        */
        

        $client_id = $request->filter['client'];
        $user_id = $request->filter['user'];
      
        $month = $request->filter['month'];
        $year = $request->filter['year'];
        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = Carbon::create($year, $month, 1)->endOfMonth();
        $user = User::where("id",$user_id)->get();
        
        $data['year'] = $year;
        $data['month'] = $month;
        $user = User::find($user_id)->get();
        $client = Client::find($client_id)->get();
        if ($user->isEmpty()) {
            return response()->json(['error' => 'Kullanıcı bulunamadı'], 404);
        }
        $user = $user->first();
        $client = $client->first();
        
        $data['id'] = sprintf('%03d', $user->id);
        $data['name'] = $user->name ?? "";
        $data['mail'] = $user->email ?? "";
        $data['phone'] = $user->phone ?? "";
        
        $query = FinalizedJobs::where('user_id', $user->id)->where('client_id', $client->id)->where('confirmation', 1)->whereBetween('created_at', [$startDate->toDateString(), $endDate->toDateString()]);
        $finalized_jobs = $query->get();
   
        //return response()->json($data);
        if($data){
            try{
                $file_req = Http::withHeaders([
                    'Content-Type' => 'application/json'
                ])->post('http://excel:8000/create-excel',json_encode($data));
            } catch(Exception $ex) {
                dd($ex);
            }
            
            $uniq_id = uniqid();
            $filePath = 'pdfs/' . $uniq_id . '.pdf'; // Dosya yolunu ve adını belirleyin
            Storage::put($filePath, $file_req->body());
            return response()->json(["status" => true, "file" => $uniq_id]);
            
        } else {
            return response()->json(["status" => false]);
        }
        
        

    }

    public function export() 
    {
        return Excel::download(new UsersExport, 'users.xlsx');
    }

    public function unconfirmed_jobs()
    {
        $unconfirmeds = FinalizedJobs::where("confirmation",false)->get();
        return response()->json($unconfirmeds);
    }
   
    public function confirmed_jobs()
    {
        $unconfirmeds = FinalizedJobs::where("confirmation",true)->get();
        return response()->json($unconfirmeds);
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(FinalizedJobs $finalizedJobs)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request,FinalizedJobs $finalizedJobs)
    {
        $finalizedJob = FinalizedJobs::find($request->id);
        $finalizedJob->user_id = $request->user()->id;
        $finalizedJob->client_id = $request->client_id;
        $finalizedJob->initial_date = $request->initial_date;
        $finalizedJob->zug_nummer = $request->zug_nummer;
        $finalizedJob->tour_name = $request->tour_name;
        $finalizedJob->locomotive_number = $request->locomotive_number;
        $finalizedJob->cancel = $request->cancel;
        $finalizedJob->accomodation = $request->accomodation;
        $finalizedJob->bereitschaft = $request->bereitschaft;
        $finalizedJob->comment = $request->comment;
        $finalizedJob->feeding_fee = $request->feeding_fee;
        $finalizedJob->guest_start_place = $request->guest_start_place;
        $finalizedJob->guest_start_time = $request->guest_start_time;
        $finalizedJob->guest_start_end_place = $request->guest_start_end_place;
        $finalizedJob->guest_start_end_time = $request->guest_start_end_time;
        $finalizedJob->work_start_place = $request->work_start_place;
        $finalizedJob->work_start_time = $request->work_start_time;
        $finalizedJob->train_start_place = $request->train_start_place;
        $finalizedJob->train_start_time = $request->train_start_time;
        $finalizedJob->train_end_place = $request->train_end_place;
        $finalizedJob->train_end_time = $request->train_end_time;
        $finalizedJob->breaks = json_encode($request->breaks);
        $finalizedJob->work_end_place = $request->work_end_place;
        $finalizedJob->work_end_time = $request->work_end_time;
        $finalizedJob->guest_end_place = $request->guest_end_place;
        $finalizedJob->guest_end_time = $request->guest_end_time;
        $finalizedJob->guest_end_end_place = $request->guest_end_end_place;
        $finalizedJob->guest_end_end_time = $request->guest_end_end_time;
        $finalizedJob->save();
        return response()->json(["status" => $finalizedJob]);
    }

    public function confirm_jobs(Request $request,FinalizedJobs $finalizedJobs)
    {
        $finalizedJob = FinalizedJobs::find($request->id);
        $finalizedJob->client_id = $request->client_id;
        $finalizedJob->initial_date = $request->initial_date;
        $finalizedJob->zug_nummer = $request->zug_nummer;
        $finalizedJob->tour_name = $request->tour_name;
        $finalizedJob->locomotive_number = $request->locomotive_number;
        $finalizedJob->cancel = $request->cancel;
        $finalizedJob->accomodation = $request->accomodation;
        $finalizedJob->bereitschaft = $request->bereitschaft;
        $finalizedJob->comment = $request->comment;
        $finalizedJob->feeding_fee = $request->feeding_fee;
        $finalizedJob->guest_start_place = $request->guest_start_place;
        $finalizedJob->guest_start_time = $request->guest_start_time;
        $finalizedJob->guest_start_end_place = $request->guest_start_end_place;
        $finalizedJob->guest_start_end_time = $request->guest_start_end_time;
        $finalizedJob->work_start_place = $request->work_start_place;
        $finalizedJob->work_start_time = $request->work_start_time;
        $finalizedJob->train_start_place = $request->train_start_place;
        $finalizedJob->train_start_time = $request->train_start_time;
        $finalizedJob->train_end_place = $request->train_end_place;
        $finalizedJob->train_end_time = $request->train_end_time;
        $finalizedJob->breaks = json_encode($request->breaks);
        $finalizedJob->work_end_place = $request->work_end_place;
        $finalizedJob->work_end_time = $request->work_end_time;
        $finalizedJob->guest_end_place = $request->guest_end_place;
        $finalizedJob->guest_end_time = $request->guest_end_time;
        $finalizedJob->guest_end_end_place = $request->guest_end_end_place;
        $finalizedJob->guest_end_end_time = $request->guest_end_end_time;
        $finalizedJob->confirmation = true;
        $finalizedJob->save();
        return response()->json(["status" => true]);
    }


    public function get_filters() 
    {

        $users = User::get();
        $clients = Client::get();

        return response()->json([
            "months" => ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August","September", "Oktober","November","Dezember"],
            "year" => ["2020", "2021", "2022", "2023", "2024"],
            "users" => $users,
            "clients" => $clients
        ]);
        
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, FinalizedJobs $finalizedJobs)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FinalizedJobs $finalizedJobs)
    {
        //
    }
}
