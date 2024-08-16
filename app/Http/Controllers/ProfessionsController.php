<?php

namespace App\Http\Controllers;

use App\Models\Professions;
use Illuminate\Http\Request;
use App\Models\UsersProfession;

class ProfessionsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $professions = Professions::all();
        return response()->json($professions);
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
            'name' => 'required|string|max:255',
        ]);

        $profession = Professions::create($request->all());
        return response()->json($profession);
    }


    public function add_user_profession(Request $request)
    {
        $user_id = $request->user_id;
        $profession_id = $request->profession_id;
        $existingRecord = UsersProfession::where('user_id', $user_id)->where('profession_id', $profession_id)->first();
        if (!$existingRecord) {
            $userProfession = UsersProfession::create(['user_id' => $user_id, 'profession_id' => $profession_id]);
        } else {
            return response()->json(['message' => 'Bu kayıt zaten mevcut.'], 400);
        }
        return response()->json($userProfession);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Professions $professions)
    {
        $user_id = $request->user_id;
        $userProfessions = UsersProfession::where('user_id', $user_id)->get();
        return response()->json($userProfessions);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Professions $professions)
    {
        return response()->json($professions);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Professions $professions)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $professions->update($request->all());
        return response()->json($professions);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Professions $professions)
    {
        $professions->delete();
        return response()->json($professions);
    }
}
