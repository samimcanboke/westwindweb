<?php

namespace App\Http\Controllers;

use App\Exports\UsersExport;
use App\Models\Client;
use App\Models\FinalizedJobs;
use App\Models\User;
use Carbon\Carbon;
use DateInterval;
use DateTime;
use GuzzleHttp\Psr7\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\Station;
use DateTimeZone;
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
        $initial_datetime = new DateTime($initial_date);
        $initial_datetime->setTimezone(new DateTimeZone('Europe/Berlin'));
        list($hour, $minute) = explode(':', $time);
        $new_datetime = clone $initial_datetime;
        if ($hour == "00" && $minute == "00") {
            $new_datetime->modify('+1 day');
        }
        if (gettype($hour) == "string" || gettype($minute) == "string") {
            $hour = (int) $hour;
            $minute = (int) $minute;
        }
        $new_datetime->setTime($hour, $minute, 0);
        return $new_datetime;
    }

    private function hour_diffrence($start_time, $end_time)
    {
        if ($end_time < $start_time) {
            $end_time->modify('+1 day');
        }
        $diff = $end_time->diff($start_time);
        return $diff->format('%H:%I');
    }

    private function hour_diffrence_sum($guest_start_start_time, $guest_start_end_time, $guest_end_end_time, $guest_end_start_time)
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

    private function guest_diffrence($guest_start_time, $guest_end_time, $initial_date)
    {
        $start_time = Carbon::parse($this->convertTimeToDatetime($initial_date, $guest_start_time));
        $end_time = Carbon::parse($this->convertTimeToDatetime($initial_date, $guest_end_time));
        if ($end_time < $start_time) {
            $end_time->modify('+1 day');
        }

        $diff = $end_time->diffInMinutes($start_time);

        return gmdate('H:i', abs($diff) * 60);
    }

    private function calculateMidNightHours($work_start_time, $work_end_time, $initial_date)
    {
        // %40 gece 0 dan 4 e kadar

        $nightStart = $this->convertTimeToDatetime($initial_date, "00:00")->modify('-1 day');
        $nightEnd = $this->convertTimeToDatetime($initial_date, "04:00");
        if ($work_start_time == "00:00") {
            $startTime = $this->convertTimeToDatetime($initial_date, $work_start_time)->modify('-1 day');
        } else {
            $startTime = $this->convertTimeToDatetime($initial_date, $work_start_time);
        }
        $endTime = $this->convertTimeToDatetime($initial_date, $work_end_time);

        if ($work_start_time > $work_end_time) {
            $endTime->modify('+1 day');
            $nightEnd->modify('+1 day');
            $nightStart->modify('+1 day');
        }

        //dd($work_start_time, $work_end_time, $initial_date,$nightStart,$nightEnd,$startTime,$endTime);
        $nightHours = 0;
        if ($startTime < $endTime) {
            $overlapStart = max($startTime, $nightStart);
            $overlapEnd = min($endTime, $nightEnd);

            if ($overlapStart < $overlapEnd) {
                $interval = $overlapEnd->diff($overlapStart);
                $nightHours = sprintf('%02d:%02d', $interval->h, $interval->i);
            }
        }
        return $nightHours;
    }

    private function calculateNightHours($work_start_time, $work_end_time, $initial_date)
    {
        //TODO => Bu kısmı admin panelden saat olarak al.
        $nightStart = $this->convertTimeToDatetime($initial_date, "20:00");
        $nightEnd = $this->convertTimeToDatetime($initial_date, "00:00");
        $startTime = $this->convertTimeToDatetime($initial_date, $work_start_time);
        $endTime = $this->convertTimeToDatetime($initial_date, $work_end_time);
        if ($work_start_time > $work_end_time) {
            $endTime->modify('+1 day');
        }
        $nightHours = 0;
        if ($startTime < $nightEnd) {
            $overlapStart = max($startTime, $nightStart);
            $overlapEnd = min($endTime, $nightEnd);
            if ($overlapStart < $overlapEnd) {
                $interval = $overlapEnd->diff($overlapStart);
                $nightHours = sprintf('%02d:%02d', $interval->h, $interval->i);
            }
        }
        return $nightHours;
    }

    private function calculateDeepMorningHours($work_start_time, $work_end_time, $initial_date)
    {
        $nightStart = $this->convertTimeToDatetime($initial_date, "04:00");
        $nightEnd = $this->convertTimeToDatetime($initial_date, "06:00");

        if ($work_start_time == "00:00") {
            $startTime = $this->convertTimeToDatetime($initial_date, $work_start_time)->modify('-1 day');
        } else {
            $startTime = $this->convertTimeToDatetime($initial_date, $work_start_time);
        }
        $endTime = $this->convertTimeToDatetime($initial_date, $work_end_time);

        if ($work_end_time < $work_start_time) {
            $endTime->modify('+1 day');
            $nightStart->modify('+1 day');
            $nightEnd->modify('+1 day');
        }
        //dd($work_start_time, $work_end_time, $initial_date,$nightStart,$nightEnd,$startTime,$endTime);
        $nightHours = 0;
        if ($startTime < $nightEnd) {
            $overlapStart = max($startTime, $nightStart);
            $overlapEnd = min($endTime, $nightEnd);
            if ($overlapStart < $overlapEnd) {
                $interval = $overlapEnd->diff($overlapStart);
                $nightHours = sprintf('%02d:%02d', $interval->h, $interval->i);
            }
        }
        return $nightHours;
    }

    private function calculateSundayHours($work_times, $initial_date)
    {
        list($startTimeStr, $endTimeStr) = explode(" - ", $work_times);

        $startTime = $this->convertTimeToDatetime($initial_date, $startTimeStr);
        $endTime = $this->convertTimeToDatetime($initial_date, $endTimeStr);
        $workDate = $this->convertTimeToDatetime($initial_date, "00:01");
        $nightStart = $this->convertTimeToDatetime($initial_date, "00:01");
        $nightStart->modify('-1 minutes');
        $nightEnd = $this->convertTimeToDatetime($initial_date, "23:59");
        $nightEnd->modify('+1 minutes');
        if ($workDate->format('w') == 6 && $endTime < $startTime) {
            $workDate->modify('+1 day');
            $nightStart->modify('+1 day');
            $nightEnd->modify('+1 day');
        }

        if ($endTime < $startTime) {
            $endTime->modify('+1 day');
        }
        $dayOfWeek = $workDate->format('w');
        if ($dayOfWeek == 0) {
            $overlapStart = max($startTime, $nightStart);
            $overlapEnd = min($endTime, $nightEnd);
            if ($overlapStart < $overlapEnd) {
                $interval = $overlapEnd->diff($overlapStart);
                $nightHours = sprintf('%02d:%02d', $interval->h, $interval->i);
                return $nightHours;
            }

            return "00:00";
        }
        return "00:00";
    }

    private function getPublicHolidayDate($work_times, $publicHolidays, $initial_date)
    {
        list($startTimeStr, $endTimeStr) = explode(" - ", $work_times);
        $startTime = $this->convertTimeToDatetime($initial_date, $startTimeStr);
        $endTime = $this->convertTimeToDatetime($initial_date, $endTimeStr);
        if ($endTime < $startTime) {
            $endTime->modify('+1 day');
        }

        $publicHolidayDates = [];
        foreach ($publicHolidays as $holiday) {
            $date_holiday = Carbon::createFromFormat('d/m/Y H:i:s', $holiday . " 00:00:00");
            $end_holiday = Carbon::createFromFormat('d/m/Y H:i:s', $holiday . " 00:00:00");
            $end_holiday->addDay();
            $overlapStart = max($startTime, $date_holiday);
            $overlapEnd = min($endTime, $end_holiday);
            if ($overlapStart < $overlapEnd) {
                $publicHolidayDates["publicStart"] = $overlapStart->format('d/m/Y H:i:s');
                $publicHolidayDates["publicEnd"] = $overlapEnd->format('d/m/Y H:i:s');
            }
        }
        return $publicHolidayDates;
    }

    private function calculatePublicHolidayHours($work_times, $publicHolidays, $initial_date)
    {
        list($startTimeStr, $endTimeStr) = explode(" - ", $work_times);
        $startTime = $this->convertTimeToDatetime($initial_date, $startTimeStr);
        $endTime = $this->convertTimeToDatetime($initial_date, $endTimeStr);
        if ($endTime < $startTime) {
            $endTime->modify('+1 day');
        }
        $publicHolidayHours = new DateInterval('PT0H0M');
        foreach ($publicHolidays as $holiday) {
            $date_holiday = Carbon::createFromFormat('d/m/Y H:i:s', $holiday . " 00:00:00");
            $end_holiday = Carbon::createFromFormat('d/m/Y H:i:s', $holiday . " 00:00:00");
            $end_holiday->addDay();

            $overlapStart = max($startTime, $date_holiday);
            $overlapEnd = min($endTime, $end_holiday);
            if ($overlapStart < $overlapEnd) {
                $interval = $overlapEnd->diff($overlapStart);
                $publicHolidayHours->h += $interval->h;
                $publicHolidayHours->i += $interval->i;
            }
        }
        return sprintf('%02d:%02d', $publicHolidayHours->h, $publicHolidayHours->i);
    }

    private function calculateTotalSum($work_sum, $total_work_sum)
    {
        list($hours, $minutes) = explode(':', $work_sum);
        $interval = new DateInterval("PT{$hours}H{$minutes}M");
        $total_work_sum->h += $interval->h;
        $total_work_sum->i += $interval->i;
        if ($total_work_sum->i >= 60) {
            $total_work_sum->h += intdiv($total_work_sum->i, 60);
            $total_work_sum->i = $total_work_sum->i % 60;
        }
        return $total_work_sum;
    }

    private function calculateTotalTimesSum($time1, $time2)
    {

        list($hours, $minutes) = explode(':', $time1);
        list($hours2, $minutes2) = explode(':', $time2);
        $interval = new DateInterval("PT{$hours}H{$minutes}M");
        $interval2 = new DateInterval("PT{$hours2}H{$minutes2}M");
        $interval->h += $interval2->h;
        $interval->i += $interval2->i;
        if ($interval->i >= 60) {
            $interval->h += intdiv($interval->i, 60);
            $interval->i = $interval->i % 60;
        }
        return $interval;
    }

    private function calculateTotalExtract($work_sum, $total_breaks)
    {
        list($hours, $minutes) = explode(':', $total_breaks);
        list($wrkhrs, $wrkmin) = explode(':', $work_sum);
        $break_date = new DateInterval("PT{$hours}H{$minutes}M");
        $worksum_date = new DateInterval("PT{$wrkhrs}H{$wrkmin}M");

        $worksum_date->h -= $break_date->h;
        $worksum_date->i -= $break_date->i;
        if ($worksum_date->i < 0) {
            $worksum_date->h -= 1;
            $worksum_date->i += 60;
        }
        return sprintf('%02d:%02d', $worksum_date->h, $worksum_date->i);
    }

    private function totalNightSum($night_hours, $deep_morning_hours)
    {
        $total_night_shift = new DateInterval('PT0H0M');
        list($hours, $minutes) = explode(':', $night_hours);
        list($hours2, $minutes2) = explode(':', $deep_morning_hours);
        $total_night_shift->h += $hours + $hours2;
        $total_night_shift->i += $minutes + $minutes2;
        if ($total_night_shift->i >= 60) {
            $total_night_shift->h += intdiv($total_night_shift->i, 60);
            $total_night_shift->i = $total_night_shift->i % 60;
        }
        return $total_night_shift;
    }

    public function get_finalized_client_pdf(Request $request)
    {
        $request->validate([
            'user_id' => 'nullable',
            'client_id' => 'required',
            'week' => 'required_without:month',
            'month' => 'required_without:week',
            'year' => 'required',
        ]);

        $data = [
            "driver" => "",
            "year" => "",
            "client" => "",
            "month" => "",
            "rows" => [],
            "totals" => [
                "total_day" => "",
                "work_total" => "",
                "guest_total" => "",
                "guest_back_total" => "",
            ],
        ];

        $user_query = false;
        $weekly_query = false;

        if ($request->month && $request->month != "Suchen...") {
            if ($request->user_id) {
                $data['month'] = $request->month;
                $user_query = true;
            } else {
                $data['month'] = $request->month;
            }
        } else {
            if ($request->user_id) {
                $user_query = true;
                $weekly_query = true;
            } else {
                $weekly_query = true;
                $data['month'] = $request->week . ". Woche";
            }
        }

        $data['year'] = $request->year;
        $data['client'] = Client::where('id', $request->client_id)->first()->name;

        if ($weekly_query) {
            $startDate = Carbon::now()->setISODate($request->year, $request->week)->startOfWeek();
            $endDate = Carbon::now()->setISODate($request->year, $request->week)->endOfWeek()->addMinute();
        } else {
            $startDate = Carbon::create($request->year, $request->month, 1)->startOfMonth();
            $endDate = Carbon::create($request->year, $request->month, 1)->endOfMonth()->addMinute();
        }
        $query = FinalizedJobs::where('confirmation', 1);
        if ($request->client_id) {
            $query->where('client_id', $request->client_id);
        }
        if ($user_query) {
            $query->where('user_id', $request->user_id);
        }
        $query->whereBetween('initial_date', [$startDate->toDateString(), $endDate->toDateString()]);

        $finalized_jobs = $query->orderBy('initial_date', 'asc')->get();

        if ($user_query) {
            $data['driver'] = $finalized_jobs->first()->user->name;
        }
        $data['totals']['total_day'] = $finalized_jobs->count();
        $data['totals']['work_total'] = "00:00";
        $data['totals']['guest_total'] = "00:00";
        $data['totals']['guest_back_total'] = "00:00";
        foreach ($finalized_jobs as $finalized_job) {
            try {
                $initial_date = $finalized_job->initial_date;
                if ($finalized_job->guest) {
                    $work_sum = "00:00";
                } else {
                    $work_sum = $this->hour_diffrence($this->convertTimeToDatetime($initial_date, $finalized_job->work_start_time), $this->convertTimeToDatetime($initial_date, $finalized_job->work_end_time));
                }
                if ($finalized_job->guest_start_time && $finalized_job->guest_start_end_time) {
                    $guest_start_sum = $this->hour_diffrence($this->convertTimeToDatetime($initial_date, $finalized_job->guest_start_time), $this->convertTimeToDatetime($initial_date, $finalized_job->guest_start_end_time));
                } else {
                    $guest_start_sum = "00:00";
                }

                if ($finalized_job->guest_end_time && $finalized_job->guest_end_end_time) {
                    $guest_back_sum = $this->hour_diffrence($this->convertTimeToDatetime($initial_date, $finalized_job->guest_end_time), $this->convertTimeToDatetime($initial_date, $finalized_job->guest_end_end_time));
                } else {
                    $guest_back_sum = "00:00";
                }
                $start_station = Station::where('id', $finalized_job->work_start_place) ? Station::where('id', $finalized_job->work_start_place)->first()->short_name : $finalized_job->work_start_place;
                $end_station = Station::where('id', $finalized_job->work_end_place) ? Station::where('id', $finalized_job->work_end_place)->first()->short_name : $finalized_job->work_end_place;
                $gf_start_status = $finalized_job->gf_start_status ? $finalized_job->gf_start_status == 1 ? "Hotel" : "Heim" : " ";
                $gf_end_status = $finalized_job->gf_end_status ? $finalized_job->gf_end_status == 1 ? "Hotel" : "Heim" : " ";
                $data['rows'][] = [
                    "date" => Carbon::parse($finalized_job->initial_date)->format('d.m.Y'),
                    "driver" => $finalized_job->user->name,
                    "work_start_end_time" => $finalized_job->guest ? "GF Tour" : $finalized_job->work_start_time . " - " . $finalized_job->work_end_time,
                    "work_total" => $work_sum,
                    "guest_start_end_time" => $finalized_job->guest_start_time . " - " . $finalized_job->guest_start_end_time . " " . $gf_start_status,
                    "guest_total_time" => $guest_start_sum,
                    "guest_back_start_end_time" => $finalized_job->guest_end_time . " - " . $finalized_job->guest_end_end_time . " " . $gf_end_status,
                    "guest_back_total_time" => $guest_back_sum,
                    "accomodation" => ($finalized_job->feeding_fee == 32  ? "X" : "") . ($finalized_job->ausland ? $finalized_job->country : ""),
                    "extra" => $finalized_job->extra . (strtotime($guest_start_sum) > strtotime('04:00') ? "-X" : "") . (strtotime($guest_back_sum) > strtotime('04:00') ? "-X" : ""),
                    "train_number" => $finalized_job->zug_nummer,
                    "from_to" => $start_station . " - " . $end_station,
                    "client" => $finalized_job->client->name,
                    "learning" => $finalized_job->learning,
                    "fill" => (strtotime($guest_start_sum) > strtotime('04:00')) || (strtotime($guest_back_sum) > strtotime('04:00')) ? "true" : "false",
                ];

                $work_sum_total = gettype($work_sum) == "object" ? sprintf('%02d:%02d', $work_sum->h, $work_sum->i) : $work_sum;
                $last_work_sum = gettype($data['totals']['work_total']) == "object" ? sprintf('%02d:%02d', $data['totals']['work_total']->h, $data['totals']['work_total']->i) : $data['totals']['work_total'];
                $guest_start_sum_total = gettype($data['totals']['guest_total']) == "object" ? sprintf('%02d:%02d', $data['totals']['guest_total']->h, $data['totals']['guest_total']->i) : $data['totals']['guest_total'];
                $guest_back_sum_total = gettype($data['totals']['guest_back_total']) == "object" ? sprintf('%02d:%02d', $data['totals']['guest_back_total']->h, $data['totals']['guest_back_total']->i) : $data['totals']['guest_back_total'];
                $data['totals']['work_total'] = sprintf('%02d:%02d', $this->calculateTotalTimesSum($last_work_sum, $work_sum_total)->h, $this->calculateTotalTimesSum($last_work_sum, $work_sum_total)->i);
                $data['totals']['guest_total'] = sprintf('%02d:%02d', $this->calculateTotalTimesSum($guest_start_sum_total, $guest_start_sum)->h, $this->calculateTotalTimesSum($guest_start_sum_total, $guest_start_sum)->i);
                $data['totals']['guest_back_total'] = sprintf('%02d:%02d', $this->calculateTotalTimesSum($guest_back_sum_total, $guest_back_sum)->h, $this->calculateTotalTimesSum($guest_back_sum_total, $guest_back_sum)->i);
            } catch (\Throwable $th) {
                dd($th);
            }
        }
        if ($data && $finalized_jobs->count() > 0) {
            try {
                $file_req = Http::withHeaders([
                    'Content-Type' => 'application/json',
                ])->post('http://excel:8000/create-excel-client-multiple-pdf', json_encode($data));
            } catch (\Exception $ex) {
                dd($ex);
            }
            $uniq_id = uniqid();
            $filename = $user_query ? $data['driver'] . '-' : '';
            $filename .= $weekly_query ? 'KW' . $request->week . ' ' . $request->year . '-' : '';
            $filename .= !$weekly_query ? $request->month . '-' . $request->year . '-' : '';
            $filename .= $uniq_id;
            $filePath = 'pdfs/' . $filename . '.pdf';
            Storage::put($filePath, $file_req->body());
            return response()->json(["status" => true, "file" => $filename]);
        } else {
            return response()->json(["status" => false]);
        }
    }

    public function get_confirmed_jobs(Request $request)
    {
        $request->validate([
            'user' => 'nullable',
            'client' => 'nullable',
            'month' => 'required',
            'year' => 'required',
        ]);

        $startDate = Carbon::create($request->year, $request->month, 1)->startOfMonth();
        $endDate = Carbon::create($request->year, $request->month, 1)->endOfMonth()->addMinute();
        $query = FinalizedJobs::where('confirmation', 1);
        if ($request->client && $request->client != "Suchen...") {
            $query->where('client_id', $request->client);
        }
        if ($request->user) {
            $query->where('user_id', $request->user);
        }

        $query->whereBetween('initial_date', [$startDate->toDateString(), $endDate->toDateString()]);
        $finalized_jobs = $query->orderBy('initial_date', 'asc')->get();
        return response()->json(["status" => true, "data" => $finalized_jobs]);
    }

    public function get_finalized_client(Request $request)
    {

        $request->validate([
            'user_id' => 'nullable',
            'client_id' => 'required',
            'week' => 'required_without:month',
            'month' => 'required_without:week',
            'year' => 'required',
        ]);

        $data = [
            "driver" => "",
            "year" => "",
            "client" => "",
            "month" => "",
            "rows" => [],
            "totals" => [
                "total_day" => "",
                "work_total" => "",
                "guest_total" => "",
                "guest_back_total" => "",
            ],
        ];

        $user_query = false;
        $weekly_query = false;

        if ($request->month && $request->month != "Suchen...") {
            if ($request->user_id) {
                $data['month'] = $request->month;
                $user_query = true;
            } else {
                $data['month'] = $request->month;
            }
        } else {
            if ($request->user_id) {
                $user_query = true;
                $weekly_query = true;
            } else {
                $weekly_query = true;
                $data['month'] = $request->week . ". Woche";
            }
        }

        $data['year'] = $request->year;
        $data['client'] = Client::where('id', $request->client_id)->first()->name;

        if ($weekly_query) {
            $startDate = Carbon::now()->setISODate($request->year, $request->week)->startOfWeek();
            $endDate = Carbon::now()->setISODate($request->year, $request->week)->endOfWeek()->addMinute();
        } else {
            $startDate = Carbon::create($request->year, $request->month, 1)->startOfMonth();
            $endDate = Carbon::create($request->year, $request->month, 1)->endOfMonth()->addMinute();
        }
        $query = FinalizedJobs::where('confirmation', 1);
        if ($request->client_id) {
            $query->where('client_id', $request->client_id);
        }

        if ($user_query) {
            $query->where('user_id', $request->user_id);
        }
        $query->whereBetween('initial_date', [$startDate->toDateString(), $endDate->toDateString()]);

        $finalized_jobs = $query->orderBy('initial_date', 'asc')->get();

        if ($user_query && $finalized_jobs->count() > 0) {
            $data['driver'] = $finalized_jobs->first()->user->name;
        }
        $data['totals']['total_day'] = $finalized_jobs->count();
        $data['totals']['work_total'] = "00:00";
        $data['totals']['guest_total'] = "00:00";
        $data['totals']['guest_back_total'] = "00:00";
        foreach ($finalized_jobs as $finalized_job) {
            try {
                $initial_date = $finalized_job->initial_date;
                if ($finalized_job->guest) {
                    $work_sum = $this->hour_diffrence($this->convertTimeToDatetime($initial_date, $finalized_job->work_start_time), $this->convertTimeToDatetime($initial_date, $finalized_job->work_end_time));
                } else {
                    $work_sum = "00:00";
                }
                if ($work_sum == "00:00" && !$finalized_job->guest) {
                    $work_sum = "24:00";
                }
                if ($finalized_job->guest_start_time && $finalized_job->guest_start_end_time) {
                    $guest_start_sum = $this->hour_diffrence($this->convertTimeToDatetime($initial_date, $finalized_job->guest_start_time), $this->convertTimeToDatetime($initial_date, $finalized_job->guest_start_end_time));
                } else {
                    $guest_start_sum = "00:00";
                }

                if ($finalized_job->guest_end_time && $finalized_job->guest_end_end_time) {
                    $guest_back_sum = $this->hour_diffrence($this->convertTimeToDatetime($initial_date, $finalized_job->guest_end_time), $this->convertTimeToDatetime($initial_date, $finalized_job->guest_end_end_time));
                } else {
                    $guest_back_sum = "00:00";
                }

                $start_station = Station::where('id', $finalized_job->work_start_place) ? Station::where('id', $finalized_job->work_start_place)->first()->short_name : $finalized_job->work_start_place;
                $end_station = Station::where('id', $finalized_job->work_end_place) ? Station::where('id', $finalized_job->work_end_place)->first()->short_name : $finalized_job->work_end_place;
                $gf_start_status = $finalized_job->gf_start_status ? $finalized_job->gf_start_status == 1 ? "Hotel" : "Heim" : " ";
                $gf_end_status = $finalized_job->gf_end_status ? $finalized_job->gf_end_status == 1 ? "Hotel" : "Heim" : " ";
                $data['rows'][] = [
                    "date" => Carbon::parse($finalized_job->initial_date)->format('d.m.Y'),
                    "driver" => $finalized_job->user->name,
                    "work_start_end_time" => $finalized_job->guest ? "GF Tour" : $finalized_job->work_start_time . " - " . $finalized_job->work_end_time,
                    "work_total" => $work_sum,
                    "guest_start_end_time" => $finalized_job->guest_start_time . " - " . $finalized_job->guest_start_end_time . " " . $gf_start_status,
                    "guest_total_time" => $guest_start_sum,
                    "guest_back_start_end_time" => $finalized_job->guest_end_time . " - " . $finalized_job->guest_end_end_time . " " . $gf_end_status,
                    "guest_back_total_time" => $guest_back_sum,
                    "accomodation" => ($finalized_job->feeding_fee == 32 ? "X" : "") . ($finalized_job->ausland ? $finalized_job->country : ""),
                    "extra" => $finalized_job->extra . (strtotime($guest_start_sum) > strtotime('04:00') ? "-X" : "") . (strtotime($guest_back_sum) > strtotime('04:00') ? "-X" : ""),
                    "train_number" => $finalized_job->zug_nummer,
                    "from_to" => $start_station . " - " . $end_station,
                    "client" => $finalized_job->client->name,
                    "learning" => $finalized_job->learning,
                    "fill" => (strtotime($guest_start_sum) > strtotime('04:00')) || (strtotime($guest_back_sum) > strtotime('04:00')) ? "true" : "false",
                ];

                $work_sum_total = gettype($work_sum) == "object" ? sprintf('%02d:%02d', $work_sum->h, $work_sum->i) : $work_sum;
                $last_work_sum = gettype($data['totals']['work_total']) == "object" ? sprintf('%02d:%02d', $data['totals']['work_total']->h, $data['totals']['work_total']->i) : $data['totals']['work_total'];
                $guest_start_sum_total = gettype($data['totals']['guest_total']) == "object" ? sprintf('%02d:%02d', $data['totals']['guest_total']->h, $data['totals']['guest_total']->i) : $data['totals']['guest_total'];
                $guest_back_sum_total = gettype($data['totals']['guest_back_total']) == "object" ? sprintf('%02d:%02d', $data['totals']['guest_back_total']->h, $data['totals']['guest_back_total']->i) : $data['totals']['guest_back_total'];
                $data['totals']['work_total'] = sprintf('%02d:%02d', $this->calculateTotalTimesSum($last_work_sum, $work_sum_total)->h, $this->calculateTotalTimesSum($last_work_sum, $work_sum_total)->i);
                $data['totals']['guest_total'] = sprintf('%02d:%02d', $this->calculateTotalTimesSum($guest_start_sum_total, $guest_start_sum)->h, $this->calculateTotalTimesSum($guest_start_sum_total, $guest_start_sum)->i);
                $data['totals']['guest_back_total'] = sprintf('%02d:%02d', $this->calculateTotalTimesSum($guest_back_sum_total, $guest_back_sum)->h, $this->calculateTotalTimesSum($guest_back_sum_total, $guest_back_sum)->i);
            } catch (\Throwable $th) {
                dd($th);
            }
        }
        if ($data && $finalized_jobs->count() > 0) {
            try {
                $file_req = Http::withHeaders([
                    'Content-Type' => 'application/json',
                ])->post('http://excel:8000/create-excel-client-multiple', json_encode($data));
            } catch (\Exception $ex) {
                dd($ex);
            }

            $uniq_id = uniqid();
            $filename = $user_query ? $data['driver'] . '-' : '';
            $filename .= $weekly_query ? 'KW' . $request->week . ' ' . $request->year . '-' : '';
            $filename .= !$weekly_query ? $request->month . '-' . $request->year . '-' : '';
            $filename .= $uniq_id;
            $filePath = 'excels/' . $filename . '.xlsx';
            Storage::put($filePath, $file_req->body());
            return response()->json(["status" => true, "file" => $filename]);
        } else {
            return response()->json(["status" => false]);
        }
    }

    public function get_total_report(Request $request)
    {
        $data = [
            "year" => "",
            "month" => "",
        ];
        $month = $request->month;
        $year = $request->year;

        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = Carbon::create($year, $month, 1)->endOfMonth()->addMinute();

        $data['year'] = $year;
        switch ($month) {
            case 1:
                $data['month'] = "Januar";
                break;
            case 2:
                $data['month'] = "Februar";
                break;
            case 3:
                $data['month'] = "März";
                break;
            case 4:
                $data['month'] = "April";
                break;
            case 5:
                $data['month'] = "Mai";
                break;
            case 6:
                $data['month'] = "Juni";
                break;
            case 7:
                $data['month'] = "Juli";
                break;
            case 8:
                $data['month'] = "August";
                break;
            case 9:
                $data['month'] = "September";
                break;
            case 10:
                $data['month'] = "Oktober";
                break;
            case 11:
                $data['month'] = "November";
                break;
            case 12:
                $data['month'] = "Dezember";
                break;
            default:
                $data['month'] = $month;
                break;
        }


        $users = User::where('is_active', 1)->orderBy('driver_id', 'asc')->get();
        foreach ($users as $user) {
            $query = FinalizedJobs::where('confirmation', 1)->where('user_id', $user->id)
                ->whereBetween('initial_date', [$startDate->toDateString(), $endDate->toDateString()]);
            $finalized_jobs = $query->orderBy('initial_date', 'asc')->orderBy('user_id', 'asc')->get();
            $public_holidays = ["29/03/2024", "01/04/2024", "01/05/2024", "09/05/2024", "20/05/2024", "03/10/2024", "25/12/2024", "26/12/2024","01/01/2025","01/05/2025","18/04/2025","21/04/2025","29/05/2025","09/06/2025","03/10/2025","25/12/2025","26/12/2025"];
            $total_public_holiday_hours = new DateInterval('PT0H0M');
            $total_work_sum = new DateInterval('PT0H0M');
            $total_guest_sum = new DateInterval('PT0H0M');
            $total_break_time = new DateInterval('PT0H0M');
            $total_midnight_shift = new DateInterval('PT0H0M');
            $total_night_shift = new DateInterval('PT0H0M');
            $total_deep_morning_shift = new DateInterval('PT0H0M');
            $total_sunday_holiday_hours = new DateInterval('PT0H0M');
            $i = 0;
            $y = 0;
            $feeding_fee = 0;

            $ausbildung_hours = 0;
            foreach ($finalized_jobs as $index => $finalized_job) {
                try {

                    $initial_date = $finalized_job->initial_date;

                    if($finalized_job->shift_count){
                        $y++;
                    }
                    if($finalized_job->ausbildung){
                        $ausbildung_hours += 1;
                    }

                    $work_sum = $finalized_job->guest ? "00:00" : $this->hour_diffrence($this->convertTimeToDatetime($initial_date, $finalized_job->work_start_time), $this->convertTimeToDatetime($initial_date, $finalized_job->work_end_time));
                    if ($work_sum == "00:00" && !$finalized_job->guest) {
                        $work_sum = "24:00";
                    }
                    $guest_start_total = "00:00";

                    if ($finalized_job->guest_start_time && $finalized_job->guest_start_end_time) {
                        $guest_start_total = $this->guest_diffrence($finalized_job->guest_start_time, $finalized_job->guest_start_end_time, $initial_date);
                        if ($guest_start_total != "00:00") {
                            $total_guest_sum = $this->calculateTotalSum($guest_start_total, $total_guest_sum);
                        }
                    }
                    $guest_end_total = "00:00";
                    if ($finalized_job->guest_end_time && $finalized_job->guest_end_end_time) {
                        $guest_end_total = $this->guest_diffrence($finalized_job->guest_end_time, $finalized_job->guest_end_end_time, $initial_date);
                        if ($guest_end_total != "00:00") {
                            $total_guest_sum = $this->calculateTotalSum($guest_end_total, $total_guest_sum);
                        }
                    }

                    $guest_total_tmp = $this->calculateTotalTimesSum($guest_start_total, $guest_end_total);
                    $guest_total = sprintf('%02d:%02d', $guest_total_tmp->h, $guest_total_tmp->i);

                    $break_total = new DateInterval('PT0S');
                    $breaks = json_decode($finalized_job->breaks);
                    if (gettype($breaks) == "string") {
                        $breaks = json_decode($breaks);
                    }
                    if ($breaks) {
                        foreach ($breaks as $break) {
                            if(!empty($break->start)){
                                $start = $this->convertTimeToDatetime($initial_date, $break->start);
                            }else{
                                continue;
                            }
                            if(!empty($break->end)){
                                $end = $this->convertTimeToDatetime($initial_date, $break->end);
                            }else{
                                continue;
                            }
                            if($start > $end){
                                $end->modify('+1 day');
                            }

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

                        $total_breaks = sprintf('%02d:%02d', $break_total->h, $break_total->i);
                    } else {
                        $total_breaks = "00:00";
                    }

                    $work_sum = $this->calculateTotalExtract($work_sum, $total_breaks);
                    $total_break_time = $this->calculateTotalSum($total_breaks, $total_break_time);

                    $total_work_sum = $this->calculateTotalSum($work_sum, $total_work_sum);
               



                $feeding_fee += $finalized_job->feeding_fee;
                if (!$finalized_job->bereitschaft && !$finalized_job->learning && !$finalized_job->cancel && !$finalized_job->guest) {
                    $public_holiday_hours = $this->calculatePublicHolidayHours($finalized_job->work_start_time . " - " . $finalized_job->work_end_time, $public_holidays, $initial_date);
                    $total_public_holiday_hours = $this->calculateTotalSum($public_holiday_hours, $total_public_holiday_hours);

                    list($pblhrs, $pblmnt) = explode(':', $public_holiday_hours);
                    $test_public_holiday = new DateInterval("PT{$pblhrs}H{$pblmnt}M");
                    if ($test_public_holiday->h == 0 && $test_public_holiday->i == 0 && $test_public_holiday->s == 0) {

                        $midnight_hours = $this->calculateMidNightHours($finalized_job->work_start_time, $finalized_job->work_end_time, $initial_date);
                        //dd($midnight_hours);
                        if ($midnight_hours != 0) {
                            $total_midnight_shift = $this->calculateTotalSum($midnight_hours, $total_midnight_shift);
                        } else {
                            $total_midnight_shift = $this->calculateTotalSum("00:00", $total_midnight_shift);
                            $midnight_hours = "00:00";
                        }

                        $night_hours = $this->calculateNightHours($finalized_job->work_start_time, $finalized_job->work_end_time, $initial_date);
                        if ($night_hours != 0) {
                            $total_night_shift = $this->calculateTotalSum($night_hours, $total_night_shift);
                        } else {
                            $total_night_shift = $this->calculateTotalSum("00:00", $total_night_shift);
                            $night_hours = "00:00";
                        }

                        $deep_morning_hours = $this->calculateDeepMorningHours($finalized_job->work_start_time, $finalized_job->work_end_time, $initial_date);

                        if ($deep_morning_hours != 0) {
                            $total_deep_morning_shift = $this->calculateTotalSum($deep_morning_hours, $total_deep_morning_shift);
                        } else {
                            $total_deep_morning_shift = $this->calculateTotalSum("00:00", $total_deep_morning_shift);
                            $deep_morning_hours = "00:00";
                        }

                        $sunday_hours = $this->calculateSundayHours($finalized_job->work_start_time . " - " . $finalized_job->work_end_time, $initial_date);

                        $total_sunday_holiday_hours = $this->calculateTotalSum($sunday_hours, $total_sunday_holiday_hours);

                        $total_night_hours = $this->totalNightSum($night_hours, $deep_morning_hours);
                        $self_night_hours = sprintf('%02d:%02d', $total_night_hours->h, $total_night_hours->i);
                    } else {
                        $publicHolidayDates = $this->getPublicHolidayDate($finalized_job->work_start_time . " - " . $finalized_job->work_end_time, $public_holidays, $initial_date);
                        $publicStart = DateTime::createFromFormat('d/m/Y H:i:s', $publicHolidayDates['publicStart']);
                        $publicEnd = DateTime::createFromFormat('d/m/Y H:i:s', $publicHolidayDates['publicEnd']);
                        $workStart = $this->convertTimeToDatetime($initial_date, $finalized_job->work_start_time);
                        $workEnd = $this->convertTimeToDatetime($initial_date, $finalized_job->work_end_time);

                        if ($workEnd < $workStart) {
                            $workEnd->modify('+1 day');
                        }
                        if ($workStart < $publicStart) {
                            try {
                                $pbltmpStrt = Carbon::parse($publicStart)->toDateTimeString();
                                $night_hrs_tmpp = $this->calculateNightHours($finalized_job->work_start_time, "00:00", $initial_date);
                                $night_hours_tmp = $night_hrs_tmpp == 0 ? "00:00" : $night_hrs_tmpp;
                            } catch (\Exception $ex) {

                                dd($pbltmpStrt, $ex);
                            }
                        } else {
                            $night_hours_tmp = "00:00";
                        }

                        if ($workEnd > $publicEnd) {
                            $wrktmpStrt = Carbon::parse($this->convertTimeToDatetime(Carbon::parse($initial_date)->addDay(), $finalized_job->work_start_time))->toDateTimeString();
                            $pbltmpStrt = Carbon::parse($publicStart)->toDateTimeString();

                            $midnight_hours = $this->calculateMidNightHours($finalized_job->work_start_time, $finalized_job->work_end_time, $initial_date);
                            $deep_morning_hours_tmp = $this->calculateDeepMorningHours($finalized_job->work_start_time, $finalized_job->work_end_time, $initial_date);
                        } else {
                            $midnight_hours = "00:00";
                            $deep_morning_hours_tmp = "00:00";
                        }

                        $sunday_hours = $this->calculateSundayHours($finalized_job->work_start_time . " - " . $finalized_job->work_end_time, $initial_date);
                        $total_sunday_holiday_hours = $this->calculateTotalSum($sunday_hours, $total_sunday_holiday_hours);
                        if($deep_morning_hours_tmp == 0){
                            $deep_morning_hours_tmp = "00:00";
                        }
                        $night_hours = $this->calculateTotalTimesSum($deep_morning_hours_tmp, $night_hours_tmp);
                        $self_night_hours = sprintf('%02d:%02d', $night_hours->h, $night_hours->i);
                        $total_night_shift = $this->calculateTotalSum($self_night_hours, $total_night_shift);
                        $total_midnight_shift = $this->calculateTotalSum($midnight_hours, $total_midnight_shift);
                    }
                } else {
                    if (($finalized_job->bereitschaft || $finalized_job->cancel) && !$finalized_job->learning) {
                        $public_holiday_hours = "00:00";
                        $midnight_hours = "00:00";
                        $self_night_hours = "00:00";
                        $sunday_hours = "00:00";
                        $total_breaks = "00:00";
                    } else if ($finalized_job->learning && (!$finalized_job->bereitschaft || $finalized_job->cancel)) {
                        $public_holiday_hours = "00:00";
                        $midnight_hours = "00:00";
                        $self_night_hours = "00:00";
                        $sunday_hours = "00:00";
                    } else {
                        $finalized_job->guest_start_time = "";
                        $finalized_job->guest_start_end_time = "";
                        $finalized_job->guest_end_time = "";
                        $finalized_job->guest_end_end_time = "";
                        $guest_total = "00:00";
                        $public_holiday_hours = "00:00";
                        $midnight_hours = "00:00";
                        $self_night_hours = "00:00";
                        $sunday_hours = "00:00";
                        $total_breaks = "00:00";
                    }
                }

                $i++;
                } catch (\Exception $ex) {
                    dd($finalized_job,$ex);
                }
            }


            if($finalized_jobs->count() > 0 && $finalized_jobs[0]->client_id){
                $client = Client::where('id', $finalized_jobs[0]->client_id)->first();
            }else{
                $client = new Client();
                $client->name = "Lte Niederlande";
            }

            $user_bahn_card = $user->bahnCard;
            if($user_bahn_card){
                $bahnCard = $user_bahn_card->class;
            }else{
                $bahnCard = 0;
            }


            $total_annual_leave_hours = 0;
            foreach ($user->annualLeaves as $annualLeave) {
                $start_date = \Carbon\Carbon::parse($annualLeave->start_date);
                $end_date = \Carbon\Carbon::parse($annualLeave->end_date);
                if ($start_date < $endDate && $end_date > $startDate) {
                    $overlap_start = max($start_date, $startDate);
                    $overlap_end = min($end_date, $endDate);
                    $interval = $overlap_start->diff($overlap_end);
                    $days = $interval->d + ($interval->h / 24) + ($interval->i / 1440) + ($interval->s / 86400);
                    $total_annual_leave_hours += $days * 8;
                }
            }
            $data['rows'][$user->id]['annual_leave_hours'] = floor($total_annual_leave_hours) == 0 ? "-" : floor($total_annual_leave_hours);

            /*$total_sick_leave_hours = 0;
            foreach ($user->sickLeaves as $sickLeave) {
                $start_date = \Carbon\Carbon::parse($sickLeave->start_date);
                $end_date = \Carbon\Carbon::parse($sickLeave->end_date);
                if ($start_date < $endDate && $end_date > $startDate) {
                    $overlap_start = max($start_date, $startDate);
                    $overlap_end = min($end_date, $endDate);
                    $interval = $overlap_start->diff($overlap_end);
                    $days = $interval->d + ($interval->h / 24) + ($interval->i / 1440) + ($interval->s / 86400);
                    $total_sick_leave_hours += $days * 8;
                }
            }*/
            $total_sick_leave_hours = 0;
            $sickDays = $user->sickLeaves()->whereBetween('start_date', [$startDate->toDateString(), $endDate->toDateString()])->get();
            foreach($sickDays as $sickDay){
                $total_sick_leave_hours += $sickDay->start_date->diffInDays($sickDay->end_date) * 8;
            }
            $data['rows'][$user->id]['sick_leave_hours'] = floor($total_sick_leave_hours) == 0 ? "-" : floor($total_sick_leave_hours);
            $data['rows'][$user->id]['total_day'] = $finalized_jobs->count();
            $data['rows'][$user->id]['name'] = $user->name;
            $data['rows'][$user->id]['id'] = sprintf('%03d', $user->driver_id);
            $data['rows'][$user->id]['total_day'] = $i;
            if ($bahnCard == 1) {
                $total_work_sum->h -= 10;
            }



            $hour_banks = $user->hourBanks()->whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])->get();
            $total_hours =$hour_banks->where('type', 'withdraw')->sum('hours') - $hour_banks->where('type', 'deposit')->sum('hours') ;

            
            $total_work_hours = $total_work_sum->h * 60 + $total_work_sum->i + $total_break_time->h * 60 + $total_break_time->i + floor($total_annual_leave_hours * 60) + floor($total_sick_leave_hours * 60);
            
            $total_work_hours += $total_hours * 60;

            
    
            $remaining_hours = 160 - (floor($total_annual_leave_hours) + floor($total_sick_leave_hours) );
            $hours = floor($remaining_hours);
            $minutes = ($remaining_hours * 60) % 60;
            $data['rows'][$user->id]['workhours'] = number_format($hours + ($minutes / 60), 2, ',', '');
    
            $data['rows'][$user->id]['salary'] = $user->salary . " €" ;

            $extra_work_hours = $total_work_hours - (160 * 60);
            if ($extra_work_hours > 0) {
                $extra_work_hours_h = floor($extra_work_hours / 60);
                $extra_work_hours_i = $extra_work_hours % 60;
                $extra_work_hours_decimal = $extra_work_hours_h + ($extra_work_hours_i / 60);
                $data['rows'][$user->id]['extra_work'] = number_format($extra_work_hours_decimal, 2, ',', '');
            } else {
                $data['rows'][$user->id]['extra_work'] = "-";

            }

            $data['rows'][$user->id]['normal_guests'] = $total_guest_sum != "00:00" ? sprintf('%02d:%02d', $total_guest_sum->h, $total_guest_sum->i) : "00:00";

            if ($total_guest_sum != "00:00") {
                $hours = $total_guest_sum->h;
                $minutes = $total_guest_sum->i;
                $decimal_hours = $hours + ($minutes / 60);
                $data['rows'][$user->id]['guests'] = number_format($decimal_hours, 2, ',', '');
            } else {
                $data['rows'][$user->id]['guests'] = "00:00";
            }
            if (sprintf('%02d:%02d', $total_break_time->h, $total_break_time->i) != "00:00") {
                $hours = $total_break_time->h;
                $minutes = $total_break_time->i;
                $decimal_hours = $hours + ($minutes / 60);
                $data['rows'][$user->id]['breaks'] = number_format($decimal_hours, 2, ',', '');
            } else {
                $data['rows'][$user->id]['breaks'] = "-";
            }
            $hours = $total_midnight_shift->h;
            $minutes = $total_midnight_shift->i;
            $decimal_hours = $hours + ($minutes / 60);
            $data['rows'][$user->id]['midnight_shift'] = $decimal_hours != 0 ? number_format($decimal_hours, 2, ',', '') : "-";
            $total_night_shift_hours = $total_night_shift->h + $total_deep_morning_shift->h;
            $total_night_shift_minutes = $total_night_shift->i + $total_deep_morning_shift->i;
            $total_night_shift_decimal = $total_night_shift_hours + ($total_night_shift_minutes / 60);
            $data['rows'][$user->id]['night_shift'] = $total_night_shift_decimal != 0 ? number_format($total_night_shift_decimal, 2, ',', '') : "-";
            try{
                if($total_break_time->h != 0 && $total_break_time->i != 0){
                    $total_hours = $this->calculateTotalTimesSum(sprintf('%02d:%02d', $total_work_sum->h, $total_work_sum->i), sprintf('%02d:%02d', $total_break_time->h, $total_break_time->i));
                } else {
                    $total_hours = $this->calculateTotalTimesSum(sprintf('%02d:%02d', $total_work_sum->h, $total_work_sum->i), sprintf('%02d:%02d', 0, 0));
                }
            } catch (\Exception $ex) {
                dd($total_work_sum,$total_break_time,$startDate,$endDate,$ex);
            }
            $decimal_hours = $total_hours->h + ($total_hours->i / 60);
            $data['rows'][$user->id]['sub_total'] = number_format($decimal_hours, 2, ',', '');
            if (sprintf('%02d:%02d', $total_public_holiday_hours->h, $total_public_holiday_hours->i) != "00:00") {
                $hours = $total_public_holiday_hours->h;
                $minutes = $total_public_holiday_hours->i;
                $decimal_hours = $hours + ($minutes / 60);
                $data['rows'][$user->id]['public_holidays'] = number_format($decimal_hours, 2, ',', '');
            } else {
                $data['rows'][$user->id]['public_holidays'] = "-";
            }
            if (sprintf('%02d:%02d', $total_sunday_holiday_hours->h, $total_sunday_holiday_hours->i) != "00:00") {
                $hours = $total_sunday_holiday_hours->h;
                $minutes = $total_sunday_holiday_hours->i;
                $decimal_hours = $hours + ($minutes / 60);
                $data['rows'][$user->id]['sunday_holidays'] = number_format($decimal_hours, 2, ',', '');
            } else {
                $data['rows'][$user->id]['sunday_holidays'] = "-";
            }
            $data['rows'][$user->id]['accomodations'] = $feeding_fee == 0 ? "-" : $feeding_fee . " €" ;
            $data['rows'][$user->id]['total_work_day_amount'] = ($y >= 20 ? 20 * $y : $y * 6) . " €";

            $total_user_advance = 0;
            foreach ($user->usersAdvance as $advance) {
                $transaction_date = \Carbon\Carbon::parse($advance->transaction_date);
                if ($transaction_date >= $startDate && $transaction_date <= $endDate) {
                    $total_user_advance += $advance->amount;
                }
            }
            $data['rows'][$user->id]['ausbildung_hours'] = $ausbildung_hours != 0 ? $ausbildung_hours * 22 . " €" : "-";
            $data['rows'][$user->id]['user_advance'] = $total_user_advance ? $total_user_advance : null;

            $total_user_bonus = 0;
            foreach ($user->usersBonus as $bonus) {
                $transaction_date = \Carbon\Carbon::parse($bonus->transaction_date);
                if ($transaction_date >= $startDate && $transaction_date <= $endDate) {
                    $total_user_bonus += $bonus->amount;
                }
            }
            $data['rows'][$user->id]['user_bonus'] =$total_user_bonus ? $total_user_bonus : null;
            if($user->id == 4 || $user->id == 9){
                $data['rows'][$user->id]['workhours'] = "160,00";
                $data['rows'][$user->id]['annual_leave_hours'] = $total_annual_leave_hours > 0 ? number_format($total_annual_leave_hours, 2, ',', '') : "-";
                $data['rows'][$user->id]['sick_leave_hours'] = $total_sick_leave_hours > 0 ? number_format($total_sick_leave_hours, 2, ',', '') : "-";
                $data['rows'][$user->id]['total_day'] = 0;
                $data['rows'][$user->id]['ausbildung_hours'] = "-";
                $data['rows'][$user->id]['name'] = $user->name;
                $data['rows'][$user->id]['id'] = sprintf('%03d', $user->driver_id);
                $data['rows'][$user->id]['total_day'] = 0;
                $data['rows'][$user->id]['extra_work'] = "-";
                $data['rows'][$user->id]['guests'] = $user->id == 9 ? "-" : "-";
                $data['rows'][$user->id]['breaks'] = "-";
                $data['rows'][$user->id]['midnight_shift'] = "80,00";
                $data['rows'][$user->id]['night_shift'] = "80,00";
                $data['rows'][$user->id]['sub_total'] = "160,00";
                $data['rows'][$user->id]['public_holidays'] = $user->id == 9 ? "-" : "10,00";;
                $data['rows'][$user->id]['sunday_holidays'] = "40,00";
                $data['rows'][$user->id]['accomodations'] = "-";
            } else if( $user->id == 17){
                $data['rows'][$user->id]['workhours'] = "Gehalt";
                $data['rows'][$user->id]['total_work_day_amount'] = "-";
                $data['rows'][$user->id]['guests'] = "-";
                $data['rows'][$user->id]['breaks'] = "-";
                $data['rows'][$user->id]['ausbildung_hours'] = "-";
                $data['rows'][$user->id]['midnight_shift'] = "-";
                $data['rows'][$user->id]['night_shift'] = "-";
                $data['rows'][$user->id]['sub_total'] = "-";
                $data['rows'][$user->id]['sick_leave_hours'] = "-";
                $data['rows'][$user->id]['annual_leave_hours'] = "-";
                $data['rows'][$user->id]['accomodations'] = "-";
                $data['rows'][$user->id]['extra_work'] = "-";
            } else if($user->id == 14 || $user->id == 15 || $user->id == 21){
                $data['rows'][$user->id]['workhours'] = "Aushilfe";
                $data['rows'][$user->id]['total_work_day_amount'] = "-";
                $data['rows'][$user->id]['guests'] = "-";
                $data['rows'][$user->id]['ausbildung_hours'] = "-";
                $data['rows'][$user->id]['breaks'] = "-";
                $data['rows'][$user->id]['midnight_shift'] = "-";
                $data['rows'][$user->id]['night_shift'] = "-";
                $data['rows'][$user->id]['sub_total'] = "-";
                $data['rows'][$user->id]['sick_leave_hours'] = "-";
                $data['rows'][$user->id]['annual_leave_hours'] = "-";
                $data['rows'][$user->id]['accomodations'] = "-";
                $data['rows'][$user->id]['extra_work'] = "-";
            } else if($user->id == 2){
                $data['rows'][$user->id]['salary'] = "28,13 €";
                $data['rows'][$user->id]['workhours'] = "160,00";
                $data['rows'][$user->id]['total_work_day_amount'] = "-";
                $data['rows'][$user->id]['guests'] = "-";
                $data['rows'][$user->id]['breaks'] = "-";
                $data['rows'][$user->id]['ausbildung_hours'] = "-";
                $data['rows'][$user->id]['midnight_shift'] = "24,00";
                $data['rows'][$user->id]['night_shift'] = "20,00";
                $data['rows'][$user->id]['sub_total'] = "-";
                $data['rows'][$user->id]['sick_leave_hours'] = "-";
                $data['rows'][$user->id]['annual_leave_hours'] = "-";
                $data['rows'][$user->id]['public_holidays'] = "8,00";
                $data['rows'][$user->id]['sunday_holidays'] = "16,00";
                $data['rows'][$user->id]['accomodations'] = "-";
                $data['rows'][$user->id]['extra_work'] = "-";
            }
        }


        if ($data['rows'] && count($data['rows']) > 0) {
            try {
                $file_req = Http::withHeaders([
                    'Content-Type' => 'application/json',
                ])->post('http://excel:8000/create-total-excel', json_encode($data));
            } catch (\Exception $ex) {
                dd($ex);
            }

            $uniq_id = uniqid();
            $filePath = 'pdfs/' . $uniq_id . '.pdf';
            Storage::put($filePath, $file_req->body());
            return response()->json(["status" => true, "file" => $uniq_id]);
        } else {
            return response()->json(["status" => false]);
        }




    }

    public function get_finalized(Request $request)
    {
        $data = [
            "year" => "",
            "month" => "",
            "name" => "",
            "id" => "",
            "mail" => "",
            "phone" => "",
            "admin_extra" => 0,
            "left_admin_extra" => 0,
            "done_hours" => 0,
            "current_sick" => 0,
            "rights_sick" => 0,
            "used_annual" => 0,
            "total_annual" => 0,
            "left_annual" => 0,
            "total_hours_req" => 0,
            "total_worked_time" => 0,
            "left_work_time" => 0,
            "rows" => [],
            "totals" => [
                "dates" => "",
                "workhours" => "",
                "guests" => "",
                "breaks" => "",
                "public_holidays" => "",
                "sunday_holidays" => "",
                "midnight_shift" => "",
                "night_shift" => "",
                "accomodations" => "",
            ],
        ];

        $month = $request->month;
        $year = $request->year;
        $user_id = $request->user_id;

        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = Carbon::create($year, $month, 1)->endOfMonth()->addMinute();

        $data['year'] = $year;
        switch ($month) {
            case 1:
                $data['month'] = "Januar";
                break;
            case 2:
                $data['month'] = "Februar";
                break;
            case 3:
                $data['month'] = "März";
                break;
            case 4:
                $data['month'] = "April";
                break;
            case 5:
                $data['month'] = "Mai";
                break;
            case 6:
                $data['month'] = "Juni";
                break;
            case 7:
                $data['month'] = "Juli";
                break;
            case 8:
                $data['month'] = "August";
                break;
            case 9:
                $data['month'] = "September";
                break;
            case 10:
                $data['month'] = "Oktober";
                break;
            case 11:
                $data['month'] = "November";
                break;
            case 12:
                $data['month'] = "Dezember";
                break;
            default:
                $data['month'] = $month;
                break;
        }
        $user = User::where('id', $user_id)->first();

        $data['id'] = sprintf('%03d', $user->driver_id);
        $data['name'] = $user->name ?? "";
        $data['mail'] = $user->email ?? "";
        $data['phone'] = $user->phone ?? "";

        $hour_banks = $user->hourBanks()->whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])->get();
        $total_hours = $hour_banks->where('type', 'withdraw')->sum('hours') - $hour_banks->where('type', 'deposit')->sum('hours') ;
        $data['hour_bank_this_month'] = sprintf('%02d:%02d', floor($total_hours), ($total_hours - floor($total_hours)) * 60);

        



        $hour_banks_this_year = $user->hourBanks()->whereBetween('date', [Carbon::create($year, 1, 1)->startOfDay()->toDateTimeString(), Carbon::create($year, 12, 31)->endOfDay()->toDateTimeString()])->get();
        $total_hours_this_year = $hour_banks_this_year->where('type', 'withdraw')->sum('hours') - $hour_banks_this_year->where('type', 'deposit')->sum('hours');
                
        
        
        $data['hour_bank_this_year'] = $total_hours_this_year > 0 ? '-'. sprintf('%02d:%02d', floor($total_hours_this_year), ($total_hours_this_year - floor($total_hours_this_year)) * 60) : sprintf('%02d:%02d', floor($total_hours_this_year), ($total_hours_this_year - floor($total_hours_this_year)) * 60);
        
        $previousYear = $startDate->copy()->subYear()->year;
       
        $previousYearStart = Carbon::create($previousYear, 1, 1)->toDateString();
        $previousYearEnd   = Carbon::create($previousYear, 12, 31)->toDateString();
       
        $leavesUsedPreviousYear = $user->annualLeaves()
            ->whereBetween('start_date', [$previousYearStart, $previousYearEnd])
            ->get()
            ->map(function($leave) {
                $leaveStart = Carbon::parse($leave->start_date);
                $leaveEnd   = Carbon::parse($leave->end_date);
                return $leaveStart->diffInDays($leaveEnd);
            })
            ->sum();
        $carryOver = max(0, 30 - $leavesUsedPreviousYear);
        
        $startWorkingYear = Carbon::parse($user->start_working_date)->year;
        $totalRights = 0;

        for ($year = $startWorkingYear; $year <= $previousYear; $year++) {
            $previousYearStart = Carbon::create($year, 1, 1)->toDateString();
            $previousYearEnd = Carbon::create($year, 12, 31)->toDateString();

            $leavesUsedPreviousYear = $user->annualLeaves()
                ->whereBetween('start_date', [$previousYearStart, $previousYearEnd])
                ->get()
                ->map(function($leave) {
                    $leaveStart = Carbon::parse($leave->start_date);
                    $leaveEnd = Carbon::parse($leave->end_date);
                    return $leaveStart->diffInDays($leaveEnd);
                })
                ->sum();

            $carryOver = max(0, 30 - $leavesUsedPreviousYear);
            $totalRights += $user->annual_leave_rights + $carryOver;
        }
        $data['annual_leave_rights'] = number_format($totalRights, 2, ',', '');
        $currentYearLeavesUsed = $user->annualLeaves()
            ->whereBetween('start_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->get()
            ->map(function($leave) use ($startDate, $endDate) {
                $leaveStart = Carbon::parse($leave->start_date);
                $leaveEnd   = Carbon::parse($leave->end_date);
                $overlapStart = $leaveStart->greaterThan($startDate) ? $leaveStart : $startDate;
                $overlapEnd   = $leaveEnd->lessThan($endDate) ? $leaveEnd : $endDate;
                return $overlapStart->diffInDays($overlapEnd);
            })
            ->sum();
        $data['annual_leave_days'] = number_format($currentYearLeavesUsed / 8, 2, ',', ''); 
        $data['annual_leave_left'] = number_format($totalRights - $currentYearLeavesUsed, 2, ',', ''); 

        $data['sick_days_this_month'] = 0;
        $sickDays = $user->sickLeaves()->whereBetween('start_date', [$startDate->toDateString(), $endDate->toDateString()])->get();
        foreach($sickDays as $sickDay){
            $data['sick_days_this_month'] += $sickDay->start_date->diffInDays($sickDay->end_date);
        }

        $data['sick_days_this_year'] = 0;
        $sickDays = $user->sickLeaves()->whereBetween('start_date', [Carbon::create($year, 1, 1)->startOfDay()->toDateTimeString(), Carbon::create($year, 12, 31)->endOfDay()->toDateTimeString()])->get();
        foreach($sickDays as $sickDay){
            $data['sick_days_this_year'] += $sickDay->start_date->diffInDays($sickDay->end_date);
        }
        $query = FinalizedJobs::where('user_id', $user->id);
        if ($request->client_id) {
            $query->where('client_id', $request->client_id);
        }
        $query->where('confirmation', 1)->whereBetween('initial_date', [$startDate->toDateString(), $endDate->toDateString()]);

        $finalized_jobs = $query->orderBy('initial_date', 'asc')->get();

        $data['totals']['dates'] = $finalized_jobs->count();
        $public_holidays = ["29/03/2024", "01/04/2024", "01/05/2024", "09/05/2024", "20/05/2024", "03/10/2024", "25/12/2024", "26/12/2024","01/01/2025","01/05/2025","18/04/2025","21/04/2025","29/05/2025","09/06/2025","03/10/2025","25/12/2025","26/12/2025"];
        $total_public_holiday_hours = new DateInterval('PT0H0M');
        $total_work_sum = new DateInterval('PT0H0M') ;
        $total_guest_sum = new DateInterval('PT0H0M');
        $total_break_time = new DateInterval('PT0H0M');
        $total_midnight_shift = new DateInterval('PT0H0M');
        $total_night_shift = new DateInterval('PT0H0M');
        $total_deep_morning_shift = new DateInterval('PT0H0M');
        $total_sunday_holiday_hours = new DateInterval('PT0H0M');

        $i = 0;
        $y = 0;
        $feeding_fee = 0;

        $ausbildung_hours = 0;
        foreach ($finalized_jobs as $index => $finalized_job) {
            try {

                //if($finalized_job->id !=  1072){
                //    continue;
                //}


                if($finalized_job->ausbildung){
                    $ausbildung_hours += 1;
                }
                if($finalized_job->shift_count){
                    $y++;
                }

                $initial_date = $finalized_job->initial_date;
                $finish_date = $initial_date;

                if($finalized_job->id == 567){
                    $finish_date = Carbon::parse($initial_date)->addDay()->toISOString();
                }

                $work_sum = $finalized_job->guest ? "00:00" : $this->hour_diffrence($this->convertTimeToDatetime($initial_date, $finalized_job->work_start_time), $this->convertTimeToDatetime($finish_date, $finalized_job->work_end_time));
                if ($work_sum == "00:00" && !$finalized_job->guest) {
                    $work_sum = "24:00";
                }
                
  
                $guest_start_total = "00:00";
                if ($finalized_job->guest_start_time && $finalized_job->guest_start_end_time) {
                    $guest_start_total = $this->guest_diffrence($finalized_job->guest_start_time, $finalized_job->guest_start_end_time, $initial_date);
                    if ($guest_start_total != "00:00") {
                        $total_guest_sum = $this->calculateTotalSum($guest_start_total, $total_guest_sum);
                    }
                }

                $guest_end_total = "00:00";
                if ($finalized_job->guest_end_time && $finalized_job->guest_end_end_time) {
                    $guest_end_total = $this->guest_diffrence($finalized_job->guest_end_time, $finalized_job->guest_end_end_time, $initial_date);
                    if ($guest_end_total != "00:00") {
                        $total_guest_sum = $this->calculateTotalSum($guest_end_total, $total_guest_sum);
                    }
                }

                $guest_total_tmp = $this->calculateTotalTimesSum($guest_start_total, $guest_end_total);
                $guest_total = sprintf('%02d:%02d', $guest_total_tmp->h, $guest_total_tmp->i);

                $break_total = new DateInterval('PT0S');
                $breaks = json_decode($finalized_job->breaks);
                
                if (gettype($breaks) == "string") {
                    $breaks = json_decode($breaks);
                }
                if ($breaks) {
                    foreach ($breaks as $break) {
                        if(isset($break->start) && isset($break->end)){ 
                            $start = $this->convertTimeToDatetime($initial_date, $break->start);
                            $end = $this->convertTimeToDatetime($initial_date, $break->end);
                            if($end < $start){
                                $end->modify('+1 day');
                            }
                            $diff = $end->diff($start);
                            $break_total->h += $diff->h;
                            $break_total->i += $diff->i;
                            $break_total->s += $diff->s;
                        } else {
                            continue;
                        }
                    }

                    if ($break_total->s >= 60) {
                        $break_total->i += floor($break_total->s / 60);
                        $break_total->s %= 60;
                    }

                    if ($break_total->i >= 60) {
                        $break_total->h += floor($break_total->i / 60);
                        $break_total->i %= 60;
                    }

                    $total_breaks = sprintf('%02d:%02d', $break_total->h, $break_total->i);
                } else {
                    $total_breaks = "00:00";
                }
          

                $work_sum = $this->calculateTotalExtract($work_sum, $total_breaks);
                $total_break_time = $this->calculateTotalSum($total_breaks, $total_break_time);
                $total_work_sum = $this->calculateTotalSum($work_sum, $total_work_sum);
            } catch (\Exception $ex) {
                dd($finalized_job,$ex);
            }
            if ($finalized_job->ausland == 0 && Carbon::parse($finalized_job->initial_date) > Carbon::parse('2024-12-01')) {
                if ($finalized_job->feeding_fee == 16) {
                    $finalized_job->feeding_fee = 14;
                } elseif ($finalized_job->feeding_fee == 32) {
                    $finalized_job->feeding_fee = 28;
                }
            }
            $feeding_fee += $finalized_job->feeding_fee;
            if (!$finalized_job->bereitschaft && !$finalized_job->learning && !$finalized_job->cancel && !$finalized_job->guest) {
                $public_holiday_hours = $this->calculatePublicHolidayHours($finalized_job->work_start_time . " - " . $finalized_job->work_end_time, $public_holidays, $initial_date);
                $total_public_holiday_hours = $this->calculateTotalSum($public_holiday_hours, $total_public_holiday_hours);

                list($pblhrs, $pblmnt) = explode(':', $public_holiday_hours);
                $test_public_holiday = new DateInterval("PT{$pblhrs}H{$pblmnt}M");
                if ($test_public_holiday->h == 0 && $test_public_holiday->i == 0 && $test_public_holiday->s == 0) {
                    $midnight_hours = $this->calculateMidNightHours($finalized_job->work_start_time, $finalized_job->work_end_time, $initial_date);
                    //dd($midnight_hours);
                    if ($midnight_hours != 0) {
                        $total_midnight_shift = $this->calculateTotalSum($midnight_hours, $total_midnight_shift);
                    } else {
                        $total_midnight_shift = $this->calculateTotalSum("00:00", $total_midnight_shift);
                        $midnight_hours = "00:00";
                    }
                    $night_hours = $this->calculateNightHours($finalized_job->work_start_time, $finalized_job->work_end_time, $initial_date);
                    if ($night_hours != 0) {
                        $total_night_shift = $this->calculateTotalSum($night_hours, $total_night_shift);
                    } else {
                        $total_night_shift = $this->calculateTotalSum("00:00", $total_night_shift);
                        $night_hours = "00:00";
                    }

                    $deep_morning_hours = $this->calculateDeepMorningHours($finalized_job->work_start_time, $finalized_job->work_end_time, $initial_date);

                    if ($deep_morning_hours != 0) {
                        $total_deep_morning_shift = $this->calculateTotalSum($deep_morning_hours, $total_deep_morning_shift);
                    } else {
                        $total_deep_morning_shift = $this->calculateTotalSum("00:00", $total_deep_morning_shift);
                        $deep_morning_hours = "00:00";
                    }

                    $sunday_hours = $this->calculateSundayHours($finalized_job->work_start_time . " - " . $finalized_job->work_end_time, $initial_date);

                    $total_sunday_holiday_hours = $this->calculateTotalSum($sunday_hours, $total_sunday_holiday_hours);

                    $total_night_hours = $this->totalNightSum($night_hours, $deep_morning_hours);
                    $self_night_hours = sprintf('%02d:%02d', $total_night_hours->h, $total_night_hours->i);
                } else {
                    $publicHolidayDates = $this->getPublicHolidayDate($finalized_job->work_start_time . " - " . $finalized_job->work_end_time, $public_holidays, $initial_date);
                    $publicStart = DateTime::createFromFormat('d/m/Y H:i:s', $publicHolidayDates['publicStart']);
                    $publicEnd = DateTime::createFromFormat('d/m/Y H:i:s', $publicHolidayDates['publicEnd']);
                    $workStart = $this->convertTimeToDatetime($initial_date, $finalized_job->work_start_time);
                    $workEnd = $this->convertTimeToDatetime($initial_date, $finalized_job->work_end_time);

                    if ($workEnd < $workStart) {
                        $workEnd->modify('+1 day');
                    }
                    if ($workStart < $publicStart) {
                        try {
                            $pbltmpStrt = Carbon::parse($publicStart)->toDateTimeString();
                            $night_hrs_tmpp = $this->calculateNightHours($finalized_job->work_start_time, "00:00", $initial_date);
                            $night_hours_tmp = $night_hrs_tmpp == 0 ? "00:00" : $night_hrs_tmpp;
                        } catch (\Exception $ex) {

                            dd($pbltmpStrt, $ex);
                        }
                    } else {
                        $night_hours_tmp = "00:00";
                    }

                    if ($workEnd > $publicEnd) {
                        $wrktmpStrt = Carbon::parse($this->convertTimeToDatetime(Carbon::parse($initial_date)->addDay(), $finalized_job->work_start_time))->toDateTimeString();
                        $pbltmpStrt = Carbon::parse($publicStart)->toDateTimeString();

                        $midnight_hours = $this->calculateMidNightHours($finalized_job->work_start_time, $finalized_job->work_end_time, $initial_date);
                        $deep_morning_hours_tmp = $this->calculateDeepMorningHours($finalized_job->work_start_time, $finalized_job->work_end_time, $initial_date);
                    } else {
                        $midnight_hours = "00:00";
                        $deep_morning_hours_tmp = "00:00";
                    }

                    $sunday_hours = $this->calculateSundayHours($finalized_job->work_start_time . " - " . $finalized_job->work_end_time, $initial_date);
                    $total_sunday_holiday_hours = $this->calculateTotalSum($sunday_hours, $total_sunday_holiday_hours);
                    if($deep_morning_hours_tmp == 0){
                        $deep_morning_hours_tmp = "00:00";
                    }
                    $night_hours = $this->calculateTotalTimesSum($deep_morning_hours_tmp, $night_hours_tmp);
                    $self_night_hours = sprintf('%02d:%02d', $night_hours->h, $night_hours->i);
                    $total_night_shift = $this->calculateTotalSum($self_night_hours, $total_night_shift);
                    $total_midnight_shift = $this->calculateTotalSum($midnight_hours, $total_midnight_shift);
                }
            } else {
                if (($finalized_job->bereitschaft || $finalized_job->cancel) && !$finalized_job->learning) {
                    $public_holiday_hours = "00:00";
                    $midnight_hours = "00:00";
                    $self_night_hours = "00:00";
                    $sunday_hours = "00:00";
                    $total_breaks = "00:00";
                } else if ($finalized_job->learning && (!$finalized_job->bereitschaft || $finalized_job->cancel)) {
                    $public_holiday_hours = "00:00";
                    $midnight_hours = "00:00";
                    $self_night_hours = "00:00";
                    $sunday_hours = "00:00";
                } else if ($finalized_job->guest) {
                    $public_holiday_hours = "00:00";
                    $midnight_hours = "00:00";
                    $self_night_hours = "00:00";
                    $sunday_hours = "00:00";
                    $total_breaks = "00:00";
                } else {
                    $finalized_job->guest_start_time = "";
                    $finalized_job->guest_start_end_time = "";
                    $finalized_job->guest_end_time = "";
                    $finalized_job->guest_end_end_time = "";
                    $guest_total = "00:00";
                    $public_holiday_hours = "00:00";
                    $midnight_hours = "00:00";
                    $self_night_hours = "00:00";
                    $sunday_hours = "00:00";
                    $total_breaks = "00:00";
                }
            }
          
            $feeding_fee_text =  $finalized_job->feeding_fee > 0 ? $finalized_job->feeding_fee . " €" : $finalized_job->feeding_fee ;

            $from = $finalized_job->work_start_place;
            $to = $finalized_job->work_end_place;

            $from_place = Station::where("id", $from)->first();
            $to_place = Station::where("id", $to)->first();

            $data['rows'][] = [
                "date" => (new DateTime($finalized_job->initial_date))->format('d/m/Y'),
                "times" => $finalized_job->guest ? "GF Tour" : $finalized_job->work_start_time . " - " . $finalized_job->work_end_time,
                "work_sum" => $work_sum ,
                "guest_start_times" => $finalized_job->guest_start_time . " - " . $finalized_job->guest_start_end_time,
                "guest_end_times" => $finalized_job->guest_end_time . " - " . $finalized_job->guest_end_end_time,
                "guest_total" => $guest_total == "00:00" ? "-" : $guest_total,
                "break_total" => $total_breaks == "00:00" ? "-" : $total_breaks,
                "public_holiday_hours" => $public_holiday_hours != "00:00" ? $public_holiday_hours : "-",
                "sunday_holiday_hours" => $sunday_hours != "00:00" ? $sunday_hours : "-",
                "midnight_shift" => $midnight_hours != "00:00" ? $midnight_hours : "-",
                "night_shift" => $self_night_hours != "00:00" ? $self_night_hours : "-",
                "feeding_fee" => $feeding_fee_text,
                "comment" => $finalized_job->comment,
                "places" => $from_place && $to_place ? $from_place->short_name . " - " . $to_place->short_name : $from . " - " . $to,
                "client" => $finalized_job->client->name,
            ];
            if(!$finalized_job->guest){
                $i++;
            }
        }
        $hours = floor(abs($total_hours)) * ($total_hours < 0 ? -1 : 1);
        $minutes = ($total_hours - $hours) * 60;
        $total_work_summary_amount = sprintf('%02d:%02d', $total_work_sum->h, $total_work_sum->i);

        $data['totals']['work_sum_amount'] = $total_work_summary_amount;

        $total_work_sum->h += $hours;
        $total_work_sum->i += $minutes;
        if ($total_work_sum->i < 0) {
            $total_work_sum->h -= 1;
            $total_work_sum->i += 60;
        }
        $data['totals']['workhours'] = sprintf('%02d:%02d', $total_work_sum->h, $total_work_sum->i);


        $data['totals']['dates'] = $i;
        $data['totals']['guests'] = $total_guest_sum != "00:00" ? sprintf('%02d:%02d', $total_guest_sum->h, $total_guest_sum->i) : "00:00";
        $data['totals']['breaks'] = sprintf('%02d:%02d', $total_break_time->h, $total_break_time->i) != "00:00" ? sprintf('%02d:%02d', $total_break_time->h, $total_break_time->i) : "-";
        $data['totals']['midnight_shift'] = sprintf('%02d:%02d', $total_midnight_shift->h, $total_midnight_shift->i) != "00:00" ? sprintf('%02d:%02d', $total_midnight_shift->h, $total_midnight_shift->i) : "-";
        $data['totals']['night_shift'] = sprintf('%02d:%02d', $total_night_shift->h + $total_deep_morning_shift->h, $total_night_shift->i + $total_deep_morning_shift->i) != "00:00" ? sprintf('%02d:%02d', $total_night_shift->h + $total_deep_morning_shift->h, $total_night_shift->i + $total_deep_morning_shift->i) : "-";
        $data['totals']['sub_total'] = sprintf('%02d:%02d', $this->calculateTotalTimesSum(sprintf('%02d:%02d', $total_work_sum->h, $total_work_sum->i), sprintf('%02d:%02d', $total_break_time->h, $total_break_time->i))->h, $this->calculateTotalTimesSum(sprintf('%02d:%02d', $total_work_sum->h, $total_work_sum->i), sprintf('%02d:%02d', $total_break_time->h, $total_break_time->i))->i);
        $data['totals']['public_holidays'] = sprintf('%02d:%02d', $total_public_holiday_hours->h, $total_public_holiday_hours->i) != "00:00" ? sprintf('%02d:%02d', $total_public_holiday_hours->h, $total_public_holiday_hours->i) : "-";
        $data['totals']['sunday_holidays'] = sprintf('%02d:%02d', $total_sunday_holiday_hours->h, $total_sunday_holiday_hours->i) != "00:00" ? sprintf('%02d:%02d', $total_sunday_holiday_hours->h, $total_sunday_holiday_hours->i) : "-";
        $data['totals']['accomodations'] = $feeding_fee . " €";
        $data['totals']['total_work_day_amount'] = $y >= 20 ? 20 * $y : $y * 6;
        $data['totals']['ausbildung_hours'] = $ausbildung_hours != 0 ? $ausbildung_hours * 22 : "-";

        $bahn_card = $user->bahnCard;

        $total_hours_req = $bahn_card ? $bahn_card->class == 1 ? 170 : $user->working_hours : $user->working_hours;
        list($hours, $minutes) = explode(':', $data['totals']['sub_total']);
        $sub_total = $hours + ($minutes / 60);





        $data['total_hours_req'] = sprintf('%03d:00', $total_hours_req );
        $data['total_made_hours'] = sprintf('%03d:%02d', floor($sub_total + $totalRights * 8), (($sub_total + $totalRights * 8) - floor($sub_total + $totalRights * 8)) * 60);
        $data['left_hours'] = $total_hours_req - ($sub_total + $totalRights * 8) < 0 ? "00:00" : sprintf('%02d:%02d', floor($total_hours_req - ($sub_total + $totalRights * 8)), ($total_hours_req - ($sub_total + $totalRights * 8) - floor($total_hours_req - ($sub_total + $totalRights * 8))) * 60);
        if ($data && $finalized_jobs->count() > 0) {
            try {
                $file_req = Http::withHeaders([
                    'Content-Type' => 'application/json',
                ])->post('http://excel:8000/create-excel', json_encode($data));
            } catch (\Exception $ex) {
                dd($ex);
            }

            $uniq_id = uniqid();
            $filePath = 'pdfs/' . $uniq_id . '.pdf';
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

    public function confirmed_jobs(Request $request)
    {
        $query = FinalizedJobs::where("confirmation", true);
        if($request->month && $request->year){
            $startDate = Carbon::createFromDate($request->year, $request->month, 1)->startOfMonth();
            $endDate = Carbon::createFromDate($request->year, $request->month, 1)->endOfMonth()->addMinutes(1);
            $query = $query->whereBetween("initial_date", [$startDate, $endDate]);
        }
        if($request->text){
            $users = User::where("name", "like", "%" . $request->text . "%")->get();
            $query = $query->whereIn("user_id", $users->pluck("id"));
        }
        return response()->json($query->orderBy("initial_date", "asc")->orderBy('user_id', 'asc')->get());
    }

    public function user_confirmed_jobs(Request $request)
    {
        $user_id = $request->user_id ?? "";
        if($user_id){
            $confirmed_jobs = FinalizedJobs::where("user_id", $user_id)->where("confirmation", true)->get();
        }else{
            $confirmed_jobs = FinalizedJobs::where("confirmation", true)->get();
        }
        return response()->json($confirmed_jobs);
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

    public function wait_confirmed_jobs()
    {
        $unconfirmeds = FinalizedJobs::where("confirmation", false)->get();
        return response()->json(["count" => $unconfirmeds->count()]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, FinalizedJobs $finalizedJobs)
    {

        $finalizedJob = FinalizedJobs::find($request->id);
        $finalizedJob->user_id = $request->user_id ? $request->user_id : $request->user()->id;
        $finalizedJob->client_id = $request->client_id;
        $finalizedJob->initial_date = $request->initial_date;
        $finalizedJob->zug_nummer = $request->zug_nummer;
        $finalizedJob->guest = $request->guest;
        $finalizedJob->tour_name = $request->tour_name;
        $finalizedJob->learning = $request->learning;
        $finalizedJob->ausland = $request->ausland;
        $finalizedJob->ausbildung = $request->ausbildung;
        $finalizedJob->ausbilder = $request->ausbilder;
        $finalizedJob->locomotive_number = $request->locomotive_number;
        $finalizedJob->cancel = $request->cancel;
        $finalizedJob->ausbildung = $request->ausbildung;
        $finalizedJob->ausbilder = (int) $request->ausbilder;
        $finalizedJob->extra = $request->extra;
        $finalizedJob->accomodation = $request->accomodation;
        $finalizedJob->bereitschaft = $request->bereitschaft;
        $finalizedJob->comment = $request->comment;
        $finalizedJob->feeding_fee = $request->feeding_fee;
        $finalizedJob->guest_start_place = $request->guest_start_place;
        $finalizedJob->guest_start_time = $request->guest_start_time;
        $finalizedJob->guest_start_end_place = $request->guest_start_end_place;
        $finalizedJob->guest_start_end_time = $request->guest_start_end_time;
        $finalizedJob->early_exit = $request->early_exit;
        $finalizedJob->late_enter = $request->late_enter;
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
        $finalizedJob->shift_count = $request->shift_count;
        $finalizedJob->guest_end_end_place = $request->guest_end_end_place;
        $finalizedJob->guest_end_end_time = $request->guest_end_end_time;
        $finalizedJob->gf_start_status = $request->gf_start_status;
        $finalizedJob->gf_end_status = $request->gf_end_status;
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
        $finalizedJob->learning = $request->learning;
        $finalizedJob->ausbildung = $request->ausbildung;
        $finalizedJob->ausland = $request->ausland;
        $finalizedJob->ausbilder = $request->ausbilder;
        $finalizedJob->extra = $request->extra;
        $finalizedJob->accomodation = $request->accomodation;
        $finalizedJob->bereitschaft = $request->bereitschaft;
        $finalizedJob->early_exit = $request->early_exit;
        $finalizedJob->guest = $request->guest;
        $finalizedJob->late_enter = $request->late_enter;
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
        $finalizedJob->shift_count = $request->shiftZulage;
        $finalizedJob->work_end_place = $request->work_end_place;
        $finalizedJob->work_end_time = $request->work_end_time;
        $finalizedJob->guest_end_place = $request->guest_end_place;
        $finalizedJob->guest_end_time = $request->guest_end_time;
        $finalizedJob->guest_end_end_place = $request->guest_end_end_place;
        $finalizedJob->guest_end_end_time = $request->guest_end_end_time;
        $finalizedJob->confirmation = true;
        $finalizedJob->gf_start_status = $request->gf_start_status;
        $finalizedJob->gf_end_status = $request->gf_end_status;
        $finalizedJob->save();
        return response()->json(["status" => true]);
    }

    public function get_filters()
    {

        $users = User::withoutLeaveWorkingDate()->get();
        $clients = Client::get();

        return response()->json([
            "months" => ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
            "year" => ["2020", "2021", "2022", "2023", "2024", "2025", "2026"],
            "users" => $users,
            "clients" => $clients,
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
    public function destroy(Request $request)
    {

        $finalized_job = FinalizedJobs::where("id", $request->id)->first();
        $finalized_job->delete();
        return response()->json(["status" => true]);
    }
    
}
