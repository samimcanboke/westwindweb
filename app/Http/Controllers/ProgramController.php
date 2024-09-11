<?php

namespace App\Http\Controllers;

use App\Models\Program;
use App\Models\UsersPrograms;
use Illuminate\Http\Request;

class ProgramController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $programs = Program::all();
        return response()->json($programs);
    }

    public function user_programs($user_id)
    {
        $programs = UsersPrograms::where('user_id', $user_id)->get();
        return response()->json($programs);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);
        $program = Program::create($request->all());
        return response()->json(["status" => "success", "message" => "Programm erfolgreich erstellt", "program" => $program]);
    }

    public function user_programs_store(Request $request, $user_id)
    {
        $request->validate([
            'program_id' => 'required|integer',
            'username' => 'required|string|max:255',
            'password' => 'required|string|max:255',
        ]);
        $program = UsersPrograms::create([
            'user_id' => $user_id,
            'program_id' => $request->program_id,
            'username' => $request->username,
            'password' => $request->password,
        ]);
        $program = UsersPrograms::where('id', $program->id)->first();
        return response()->json(["success" => true, "message" => "Programminformationen wurden dem Benutzer hinzugefügt", "program" => $program]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Program $program,$id)
    {
        $program = Program::where('id', $id)->first();
        return response()->json($program);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Program $program,$id)
    {
        $program = Program::where('id', $id)->first();
        return response()->json(["status" => "success", "message" => "Programm erfolgreich erstellt", "program" => $program]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Program $program,$id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);
        $program = Program::where('id', $id)->first();
        $program->update($request->all());
        return response()->json(["status" => "success", "message" => "Programm erfolgreich bearbeitet", "program" => $program]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Program $program,$id)
    {
        $program = Program::where('id', $id)->first();
        $program->delete();
        return response()->json(["status" => "success", "message" => "Programm erfolgreich gelöscht", "program" => $program]);
    }

    public function user_programs_destroy($id)
    {
        $program = UsersPrograms::where('id', $id)->first();
        $program->delete();
        return response()->json(["status" => "success", "message" => "Programm erfolgreich gelöscht", "program" => $program]);
    }
}
