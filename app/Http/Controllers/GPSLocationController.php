<?php

namespace App\Http\Controllers;

use App\Models\GPSLocation;
use Illuminate\Http\Request;

class GPSLocationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $gpsLocations = GPSLocation::all();
        return response()->json($gpsLocations);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $gpsLocations = GPSLocation::all();
        return response()->json($gpsLocations);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        
        $validator = $request->validate([
            'user_id' => 'required',
            'start_location' => 'required',
            'end_location' => 'required',
            'locations' => 'required|array',
            'locations.*.latitude' => 'required',
            'locations.*.longitude' => 'required',
            'locations.*.date' => 'required',
        ]);

        foreach ($request->locations as $location) {
            $existingLocation = GPSLocation::where('latitude', $location['latitude'])
                ->where('user_id', $request->user_id)
                ->where('start_location', $request->start_location)
                ->where('end_location', $request->end_location)
                ->where('longitude', $location['longitude'])
                ->where('created_at',date('Y-m-d H:i:s', strtotime($location['date'])))
                ->first();

            if (!$existingLocation) {
                $userExists = \App\Models\User::where('id', $request->user_id)->exists();
                if ($userExists) {
                    GPSLocation::create([
                        'user_id' => $request->user_id,
                        'start_location' => $request->start_location,
                        'end_location' => $request->end_location,
                        'latitude' => $location['latitude'],
                        'longitude' => $location['longitude'],
                        'created_at' => date('Y-m-d H:i:s', strtotime($location['date'])),
                    ]);
                } else {
                    return response()->json(['error' => 'Gecersiz kullanici ID'], 400);
                }
            } 
        }

        return response()->json(["status" => "success", "message" => 'Kayitlar basarili bir sekilde eklendi'], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(GPSLocation $gPSLocation)
    {
        $gpsLocation = GPSLocation::find($gPSLocation);
        return response()->json($gpsLocation);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(GPSLocation $gPSLocation)
    {
        $gpsLocation = GPSLocation::find($gPSLocation);
        return response()->json($gpsLocation);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, GPSLocation $gPSLocation)
    {
        $gpsLocation = GPSLocation::find($gPSLocation);
        $gpsLocation->update($request->all());
        return response()->json($gpsLocation);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(GPSLocation $gPSLocation, Request $request)
    {
        $gpsLocation = GPSLocation::where('id', $request->id)->delete();
        return response()->json(null, 204);
    }
}
