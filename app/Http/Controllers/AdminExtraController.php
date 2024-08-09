<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\AdminExtras;
use App\Models\User;

class AdminExtraController extends Controller
{
    public function index()
    {
        $adminExtras = AdminExtras::all();
        foreach ($adminExtras as $adminExtra) {
            $adminExtra->user = User::where('id', $adminExtra->user_id)->first();
        }
        return response()->json(['adminExtras' => $adminExtras]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'start_time' => 'required',
            'end_date' => 'required|date',
            'end_time' => 'required',
            'user_id' => 'required|exists:users,id',
        ]);

        $adminExtra = new AdminExtras();
        $adminExtra->start_date = $request->start_date;
        $adminExtra->start_time = $request->start_time;
        $adminExtra->end_date = $request->end_date;
        $adminExtra->end_time = $request->end_time;
        $adminExtra->user_id = $request->user_id;
        $adminExtra->save();
        return response()->json(['message' => 'Admin extra created successfully', 'adminExtra' => $adminExtra]);
    }

    public function destroy($id)
    {
        $adminExtra = AdminExtras::find($id);
        $adminExtra->delete();
        return response()->json(['adminExtra' => $adminExtra]);
    }
}
