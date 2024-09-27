<?php

namespace App\Http\Controllers;

use App\Models\ToDo;
use Illuminate\Http\Request;

class ToDoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $toDos = ToDo::all();
        return response()->json($toDos);    
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $request->validate([
            'from' => 'required',
            'to' => 'required',
            'title' => 'required',
            'is_important' => 'required',
            'is_done' => 'required',
            'user_id' => 'required',
        ]);
        $toDo = ToDo::create($request->all());
        return response()->json($toDo, 201);
    }


    public function get_weekly_todos()
    {
        $toDos = ToDo::where('is_done',0)->whereBetween('from', [now()->startOfWeek(), now()->endOfWeek()])->whereBetween('to', [now()->startOfWeek(), now()->endOfWeek()])->count();
        return response()->json(['count' => $toDos]);
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $toDo = ToDo::create($request->all());
        return response()->json($toDo, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(ToDo $toDo)
    {
        $toDo = ToDo::find($toDo);
        return response()->json($toDo);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ToDo $toDo)
    {
        $toDo = ToDo::find($toDo);
        return response()->json($toDo);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request,$id)
    {
        $toDo = ToDo::where('id', $id)->first();
        $toDo->update([
            'from' => $request->from,
            'to' => $request->to,
            'title' => $request->title,
            'is_important' => $request->is_important == true ? 1 : 0,
            'is_done' => $request->is_done == true ? 1 : 0,
        ]);
        return response()->json($toDo);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $toDo = ToDo::where('id', $id)->first();
        $toDo->delete();
        return response()->json(null, 204);
    }
}
