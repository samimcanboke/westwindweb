<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Aggreement extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'is_mandatory',
        'reminder_period_days',
    ];



}
