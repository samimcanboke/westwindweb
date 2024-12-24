<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Station;

class LocationsController extends Controller
{
    public function index(Request $request)
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
}