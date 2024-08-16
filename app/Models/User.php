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
use App\Models\UsersBonus;
use App\Models\UsersAdvance;
use App\Models\HourBank;

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
        'start_working_date',
        'salary',
        'leave_working_date',
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
        'street',
        'city',
        'zip',
        'apartment',
        'tax_id',
    ];

    public function scopeWithLeaveWorkingDate($query)
    {
        return $query->whereNotNull('leave_working_date');
    }

    public function scopeWithoutLeaveWorkingDate($query)
    {
        return $query->whereNull('leave_working_date');
    }


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

    public function usersBonus()
    {
        return $this->hasMany(UsersBonus::class);
    }

    public function usersAdvance()
    {
        return $this->hasMany(UsersAdvance::class);
    }

    public function hourBanks()
    {
        return $this->hasMany(HourBank::class);
    }
    public function professions()
    {
        return $this->hasMany(UsersProfession::class);
    }
}
