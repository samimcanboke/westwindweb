<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Station;

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
        'start_pause_time',
        'end_pause_time',
    ];
    public function scopeActiveUsers($query)
    {
        return $query->whereHas('user', function ($query) {
            $query->whereNull('leave_working_date');
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function toStation()
    {
        return $this->belongsTo(Station::class, 'to', 'id');
    }

    public function fromStation()
    {
        return $this->belongsTo(Station::class, 'from', 'id');
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}
