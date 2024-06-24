<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminExtras extends Model
{
    use HasFactory;
    protected $table = 'users_admin_extras';
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
}

