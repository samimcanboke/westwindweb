<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GPSLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'start_location',
        'end_location',
        'latitude',
        'longitude',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }   
}
