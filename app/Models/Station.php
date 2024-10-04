<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Station extends Model
{
    use HasFactory;

    protected $fillable = [
        'osm_id',
        'name',
        'short_name',
        'latitude',
        'longitude',
    ];

    public function jobPlans()
    {
        return $this->hasMany(JobPlans::class);
    }
}
