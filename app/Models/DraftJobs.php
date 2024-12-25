<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Client;
use App\Models\GPSLocation;

class DraftJobs extends Model
{
    use HasFactory;

    protected $fillable = ['*'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function gpsLocations()
    {
        return $this->hasMany(GPSLocation::class,'tour_id','tour_id');
    }
}
