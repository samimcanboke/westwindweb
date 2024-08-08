<?php

namespace App\Http\Controllers;

use App\Models\UsersBonus;
use Illuminate\Http\Request;

class UsersBonusController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
        $bonus = new UsersBonus();
        $bonus->amount = $request->amount;
        $bonus->transaction_date = date('Y-m-d H:i:s', strtotime($request->transaction_date));
        $bonus->user_id = $user_id;
        $bonus->save();

        return response()->json($bonus);
    }

    /**
     * Display the specified resource.
     */
    public function show($user_id)
    {
        $bonus = UsersBonus::where('user_id', $user_id)->get();
        return response()->json($bonus);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(UsersBonus $UsersBonus)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, UsersBonus $UsersBonus)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($bonus_id)
    {
        $bonus = UsersBonus::find($bonus_id);
        $bonus->delete();
        return response()->json($bonus);
    }
}
