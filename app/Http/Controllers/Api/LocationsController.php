<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Station;
use App\Models\GPSLocation;
use App\Models\DraftJobs;
use Tymon\JWTAuth\Facades\JWTAuth;
class LocationsController extends Controller
{
    public function stations(Request $request)
    {
        $query = $request->query('q');
        $exactMatches = Station::where('short_name', $query)->orderBy('short_name', 'asc')->get();
        $partialMatches = Station::where('short_name', 'like', '%'.$query.'%')
                                ->orWhere('name', 'like', '%'.$query.'%')
                                ->where('short_name', '!=', $query)
                                ->orderBy('short_name', 'asc')
                                ->get();
        $locations = $exactMatches->merge($partialMatches);

        return response()->json($locations);
    }

    public function index(Request $request)
    {
        $user = JWTAuth::user();
        $locations = GPSLocation::where('user_id',$user->id)->get();
        return response()->json($locations);
    }

    public function store(Request $request,$tour_id)
    {
        $user = JWTAuth::user();
        $draft = DraftJobs::where('tour_id',$tour_id)->first();

        if(!$draft)
        {
            return response()->json(['message' => 'Draft job not found'], 404);
        }

        $location = new GPSLocation();
        $location->user_id = $user->id;
        $location->tour_id = $tour_id;
        $location->type = $request->type;
        $location->latitude = $request->latitude;
        $location->longitude = $request->longitude;
        $location->save();

        return response()->json(['message' => 'Location saved successfully'], 200);
    }
       
}
