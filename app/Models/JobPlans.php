<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobPlans extends Model
{
    use HasFactory;

    protected $fillable = [
        'start_date',
        'end_date',
        'start_time',
        'end_time',
        'zug_nummer',
        'locomotive_nummer',
        'tour_name',
        'description',
        'to',
        'from',
    ];
}
