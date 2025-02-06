<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SickLeaves extends Model
{
    use HasFactory;
    protected $table = 'users_sick_leaves';
    protected $fillable = ['start_date', 'start_time', 'end_date', 'end_time','user_id'];
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    protected $hidden = ['created_at', 'updated_at'];
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function scopeActiveUsers($query)
    {
        return $query->whereHas('user', function ($query) {
            $query->whereNull('leave_working_date');
        });
    }
}

