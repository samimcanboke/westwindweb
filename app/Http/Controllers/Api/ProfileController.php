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
        //GPS Location ile ilgili bir sayfa açılacak ve işe başladığından bu yana olan gps turları harita üzerinde gösterilecek. 
        //Users client için bir telefon listesi olacak ve burada hızlı araması gereken numaraları gösterilecek. 
        
        // dashboard a  geçen ay toplam saat bu ay toplam saat gösterilecek. 
        // bu hafta planlanan tur sayısı ve adamın onaya gönderdiği tur sayısı gösterilecek.
        // Bu ay kaç tane tur gönderildi içeri
        //Hour banks gösterilecek.

        $user->makeHidden(attributes: [
            'driver_id',
            'birth_date',
            'email_verified_at',
            'phone',
            'password',
            'created_at',
            'updated_at',
            'remember_token',
            'working_hours',
            'sick_holiday',
            'annual_leave',
            'users_bonus',
            'users_advance',
            'users_programs',
            'bahn_card',
            'hour_banks',
            'annual_leave_rights',
            'is_admin',
            'start_working_date',
            'is_active',
            'leave_working_date',
            'salary',
            'private_phone',
            'address',
            'nationality',
            'bank_name',
            'bank_account_number',
            'bank_iban',
            'bank_bic',
            'bank_account_holder',
            'insurance_number',
            'social_security_number',
            'social_security_name',
            'kinder',
            'is_retired',
            'tax_class',
            'identity_number',
            'urgency_contact_name',
            'urgency_contact_phone',
            'tax_id',
            'street',
            'city',
            'apartment',
            'zip',
            'accountant'
        ]);

        $user->makeVisible(['email', 'name']);
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
        $user->annualLeaves = $user->annualLeaves()->get();
        $user->leftAnnualLeaves = $user->leftAnnualLeaves();
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
