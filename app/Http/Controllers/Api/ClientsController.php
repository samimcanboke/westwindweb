<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\DraftJobs;
use Illuminate\Support\Str;
use App\Models\JobPlans;
use App\Models\Clients;

class ClientsController extends Controller
{
    public function index()
    {
        $clients = Clients::all();
        return response()->json($clients);
    }
}
