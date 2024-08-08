<?php

namespace App\Http\Controllers;

use App\Models\UsersAdvance;
use Illuminate\Http\Request;

class UsersAdvanceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {


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
            'amount' => 'required|numeric',
            'transaction_date' => 'required|date',
        ]);
        $user_id = $request->route('user_id');
        $advance = new UsersAdvance();
        $advance->amount = $request->amount;
        $advance->transaction_date = date('Y-m-d H:i:s', strtotime($request->transaction_date));
        $advance->user_id = $user_id;
        $advance->save();

        return response()->json($advance);
    }

    /**
     * Display the specified resource.
     */
    public function show($user_id)
    {
        $advance = UsersAdvance::where('user_id', $user_id)->get();
        return response()->json($advance);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(users_advance $users_advance)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, users_advance $users_advance)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($advances_id)
    {

        $advance = UsersAdvance::where('id', $advances_id)->first();
        $advance->delete();
        return response()->json($advance);
    }
}
