<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\AnnualLeaves;
use App\Models\SickLeaves;
use App\Models\JobPlans;
use App\Models\FinalizedJobs;
use App\Models\DraftJobs;
use App\Models\AdminExtra;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'driver_id',
        'birth_date',
        'phone',
        'working_hours',
        'sick_holiday',
        'annual_leave_rights',
        'is_admin',
        'start_working_date'
    ];


    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function draftJobs()
    {
        return $this->hasMany(DraftJobs::class);
    }

    public function finalizedJobs()
    {
        return $this->hasMany(finalizedJobs::class);
    }

    public function jobPlans()
    {
        return $this->hasMany(JobPlans::class);
    }

    public function sickLeaves()
    {
        return $this->hasMany(SickLeaves::class);
    }

    public function annualLeaves()
    {
        return $this->hasMany(AnnualLeaves::class);
    }

    public function adminExtras()
    {
        return $this->hasMany(AdminExtra::class);
    }

    public function bahnCard()
    {
        return $this->hasOne(BahnCard::class);
    }
}
