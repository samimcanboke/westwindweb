<?php

namespace App\Http\Controllers;

use App\Models\Station;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class StationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $stations = Station::all();
        return response()->json($stations);     
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        
    }


    public function search(Request $request)
    {
        if($request->input('search') == ""){
            $railwayStations = Station::all()->take(10);
            return response()->json($railwayStations);
        } else {
            $response = Http::get('https://api.openrailwaymap.org/v2/facility?q=' . $request->input('search'));
            $railwayStations = $response->json();    
            if(isset($railwayStations)){
                foreach ($railwayStations as $railwayStation) {
                    if ($railwayStation['railway'] == 'station') {
                        if(isset($railwayStation['railway:ref']) && isset($railwayStation['name'])){
                            $station = Station::where('osm_id', $railwayStation['osm_id'])->first();
                            if(!$station){
                                Station::create([
                                    'osm_id' => $railwayStation['osm_id'],
                                    'name' => $railwayStation['name'],
                                    'short_name' => $railwayStation['railway:ref'],
                                    'latitude' => $railwayStation['latitude'],
                                    'longitude' => $railwayStation['longitude'],
                                ]);
                            }
                        };
                    }
                }
            }
            $response = Http::get('https://api.openrailwaymap.org/v2/ref?q=' . $request->input('search'));
            $railwayStations = $response->json();  
            if(isset($railwayStations)){
                foreach ($railwayStations as $railwayStation) {
                    if ($railwayStation['railway'] == 'station') {
                        if(isset($railwayStation['railway:ref']) && isset($railwayStation['name'])){
                            $station = Station::where('osm_id', $railwayStation['osm_id'])->first();
                            if(!$station){
                                Station::create([
                                    'osm_id' => $railwayStation['osm_id'],
                                    'name' => $railwayStation['name'],
                                    'short_name' => $railwayStation['railway:ref'],
                                    'latitude' => $railwayStation['latitude'],
                                    'longitude' => $railwayStation['longitude'],
                                ]);
                            }
                        };
                    }
                }
            }

            $railwayStations = Station::where('name', 'like', '%'.$request->input('search').'%')->orWhere('short_name', 'like', '%'.$request->input('search').'%')->get();
            return response()->json($railwayStations);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $station = Station::create($request->all());
        return response()->json($station, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $station = Station::where('id', $id)->first();
        return response()->json($station);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Station $station)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $station = Station::where('id', $id)->first();
        $station->update($request->all());
        return response()->json($station);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $station = Station::where('id', $id)->first();
        $station->delete();
        return response()->json(null, 204);
    }
}
