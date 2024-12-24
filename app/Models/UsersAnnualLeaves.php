<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\AnnualLeaves;

class UsersAnnualLeaves extends Model
{
    use HasFactory;

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function annualLeave()
    {
        return $this->belongsTo(AnnualLeaves::class);
    }

    public function leftAnnualLeaves()
    {
        $user = $this->user;
        $annualLeaveRights = $user->annual_leave_rights;
        $query = $this->where('user_id', $this->user_id)
                      ->whereYear('start_date', date('Y'));
        $usedAnnualLeaves = $query->get()
                                  ->sum(function ($leave) {
                                      $startDateTime = strtotime($leave->start_date . ' ' . $leave->start_time);
                                      $endDateTime = strtotime($leave->end_date . ' ' . $leave->end_time);
                                      $diffInSeconds = $endDateTime - $startDateTime;
                                      return $diffInSeconds / (60 * 60 * 24); 
                                  });
        $leftAnnualLeaves = $annualLeaveRights - $usedAnnualLeaves;
        return $leftAnnualLeaves;
    }
}
