<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\DraftJobs;
use App\Models\FinalizedJobs;
class GPSLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'start_location',
        'end_location',
        'latitude',
        'longitude',
        'tour_id',
        'type',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }   

    public function draftJobs()
    {
        return $this->belongsTo(DraftJobs::class,'tour_id','tour_id');
    }

    public function finalizedJobs()
    {
        return $this->belongsTo(FinalizedJobs::class,'tour_id','tour_id');
    }
}
