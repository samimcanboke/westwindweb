<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $client = Client::get();
        return response()->json($client);
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

        $request->validate([
            'name' => 'required|string|max:255|unique:clients,name',
        ]);
        $client = new Client();
        $client->name = $request->name;
        $client->save();
        return response()->json(['success'=>true, 'message' => 'Client created successfully']);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Client $client)
    {
        $client = Client::where('id', $request->id)->first();
        return response()->json($client);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Client $client)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Client $client)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:clients,name,' . $request->id,
        ]);
        $client = Client::where('id', $request->id)->first();
        $client->name = $request->name;
        $client->save();
        return response()->json(['success'=>true, 'message' => 'Client updated successfully']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Client $client)
    {
        $client = Client::where('id', $request->id)->first();
        $client->delete();
        return response()->json(['success'=>true, 'message' => 'Client deleted successfully']);
    }
}
