<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Http\JsonResponse;

use App\Models\User;
use App\Models\UsersProfession;
use App\Models\Certificate;

class ProfileController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        
        $user = JWTAuth::user();
        $user = User::find($user->id);
        $user->salaryReport = $user->salaryReport()->get();
        $user->userCertificates = $user->userCertificates()->get()->map(function($certificate) {
            return [
                'id' => $certificate->id,
                'name' => $certificate->certificate->name,
                'user_id' => $certificate->user_id,
                'certificate_date' => $certificate->certificate_date,
                'validity_date' => $certificate->validity_date,
                'confirmer' => $certificate->confirmer,
                'creator' => $certificate->creator,
                'reminder_day' => $certificate->reminder_day,
                'file' => $certificate->file,
            ];
        });
        $user->usersPrograms = $user->usersPrograms()->get();
        $user->bahnCard = $user->bahnCard()->get();
        return response()->json($user);
    }

    public function update(Request $request): JsonResponse
    {
        $user = JWTAuth::user();
        return response()->json($user);
    }
}
