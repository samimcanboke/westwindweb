<?php

namespace App\Http\Controllers;

use App\Models\FinalizedJobs;
use App\Models\User;
use DateTime;
use Illuminate\Http\Request;
use App\Models\Client;
use App\Exports\UsersExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Http;
use GuzzleHttp\Psr7\Response;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use DateInterval;

class FinalizedJobsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
    }

    private function convertTimeToDatetime($initial_date, $time)
    {
        $initial_datetime = new DateTime($initial_date, new \DateTimeZone('UTC'));

        list($hour, $minute) = explode(':', $time);

        $new_datetime = clone $initial_datetime;
        $new_datetime->setTime($hour, $minute, 0);
        if ($new_datetime < $initial_datetime) {
            $new_datetime->modify('+1 day');
        }
        return $new_datetime;
    }

    private function hour_diffrence($start_time, $end_time)
    {
        $diff = $end_time->diff($start_time);
        return $diff->format('%H:%I');
    }

    private function hour_diffrence_sum($guest_start_end_time, $guest_start_start_time, $guest_end_end_time, $guest_end_start_time)
    {
        $start_time = Carbon::createFromDate($guest_start_start_time);
        $end_time = Carbon::createFromDate($guest_start_end_time);
        $end_end_time = Carbon::createFromDate($guest_end_end_time);
        $start_end_time = Carbon::createFromDate($guest_end_start_time);
        $diff1 = $end_time->diffInMinutes($start_time);
        $diff2 = $start_end_time->diffInMinutes($end_end_time);
        $total_diff = $diff1 + $diff2;
        $total_diff_hours = gmdate('H:i', $total_diff * 60);
        return $total_diff_hours;
    }
    public function get_finalized(Request $request)
    {
        $data = [
            "year" => "2024",
            "month" => "04",
            "name" => "Samimcan BÖKE",
            "id" => "001",
            "mail" => "samimcanboke@hotmail.com",
            "phone" => "+358468001631",
            "admin_extra" => 0,
            "left_admin_extra" => 0,
            "done_hours" => 33,
            "current_sick" => 10,
            "rights_sick" => 30,
            "used_annual" => 5,
            "total_annual" => 30,
            "left_annual" => 25,
            "total_hours_req" => 160.00,
            "total_worked_time" => 30.00,
            "left_work_time" => 130.00,
            "rows" => [],
            "totals" => [
                "dates" => 3,
                "workhours" => 27.00,
                "guests" => 6.00,
                "breaks" => 3.0,
                "public_holidays" => 0.00,
                "sunday_holidays" => 0.00,
                "midnight_shift" => 0.00,
                "night_shift" => 0.00,
                "accomodations" => 64.00
            ]

        ];

        $month = $request->month;
        $year = $request->year;
        $user_id = $request->user()->id;
        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = Carbon::create($year, $month, 1)->endOfMonth();
        $data['year'] = $year;
        $data['month'] = $month;
        $user = User::find($user_id)->first();
        $data['id'] = sprintf('%03d', $user->id);
        $data['name'] = $user->name ?? "";
        $data['mail'] = $user->email ?? "";
        $data['phone'] = $user->phone ?? "";

        $query = FinalizedJobs::where('user_id', $user->id)->where('confirmation', 1)->whereBetween('created_at', [$startDate->toDateString(), $endDate->toDateString()]);
        $finalized_jobs = $query->get();
        $data['totals']['dates'] = $finalized_jobs->count();




        foreach ($finalized_jobs as $finalized_job) {
            $initial_date = $finalized_job->initial_date;
            $work_sum = $this->hour_diffrence($this->convertTimeToDatetime($initial_date, $finalized_job->work_start_time), $this->convertTimeToDatetime($initial_date, $finalized_job->work_end_time));
            $guest_total = $this->hour_diffrence_sum($this->convertTimeToDatetime($initial_date, $finalized_job->guest_start_end_time), $this->convertTimeToDatetime($initial_date, $finalized_job->guest_start_time), $this->convertTimeToDatetime($initial_date, $finalized_job->guest_end_end_time), $this->convertTimeToDatetime($initial_date, $finalized_job->guest_end_time));
            $break_total = new DateInterval('PT0S');
            foreach (json_decode($finalized_job->breaks) as $break) {
                $start = $this->convertTimeToDatetime($initial_date, $break->start);
                $end = $this->convertTimeToDatetime($initial_date, $break->end);
                $diff = $end->diff($start);
                $break_total->h += $diff->h;
                $break_total->i += $diff->i;
                $break_total->s += $diff->s;
            }

            if ($break_total->s >= 60) {
                $break_total->i += floor($break_total->s / 60);
                $break_total->s %= 60;
            }
            
            if ($break_total->i >= 60) {
                $break_total->h += floor($break_total->i / 60);
                $break_total->i %= 60;
            }

            $total_break_time = sprintf('%02d:%02d', $break_total->h, $break_total->i);
            $data['totals']['breaks'] = $total_break_time;
            $data['totals']['workhours'] = $work_sum;
            $data['totals']['guests'] = $guest_total;
            $data['rows'][] = [
                "date" => (new DateTime($finalized_job->initial_date))->format('d/m/Y'),
                "times" => $finalized_job->work_start_time . " - " . $finalized_job->work_end_time,
                "work_sum" => $work_sum,
                "guest_start_times" => $finalized_job->guest_start_time . " - " . $finalized_job->guest_start_end_time,
                "guest_end_times" => $finalized_job->guest_end_time . " - " . $finalized_job->guest_end_end_time,
                "guest_total" => $guest_total,
                "break_total" => $total_break_time,
                "public_holiday" => $finalized_job->public_holiday,
                "sunday_holiday" => $finalized_job->sunday_holiday,
                "midnight_shift" => $finalized_job->midnight_shift,
                "night_shift" => $finalized_job->night_shift,
                "accommodation" => (($finalized_job->accomodation  == 32) ? "Hotel" : (($finalized_job->accomodation  == 16) ? "Heim" : "")),
                "comment" => $finalized_job->comment,
                "places" => $finalized_job->work_start_place . " - " . $finalized_job->work_end_place,
                "client" => $finalized_job->client->name
            ];
        }

        if ($data && $finalized_jobs->count() > 0) {
            try {
                $file_req = Http::withHeaders([
                    'Content-Type' => 'application/json'
                ])->post('http://excel:8000/create-excel', json_encode($data));
            } catch (\Exception $ex) {
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
        $unconfirmeds = FinalizedJobs::where("confirmation", false)->get();
        return response()->json($unconfirmeds);
    }

    public function confirmed_jobs()
    {
        $unconfirmeds = FinalizedJobs::where("confirmation", true)->get();
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
    public function edit(Request $request, FinalizedJobs $finalizedJobs)
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

    public function confirm_jobs(Request $request, FinalizedJobs $finalizedJobs)
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
            "months" => ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
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
