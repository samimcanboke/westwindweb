<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HourBank extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'hours',
        'type',
        'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getFormattedHoursAttribute()
    {
        if ($this->type === 'deposit') {
            return -abs($this->hours);
        } elseif ($this->type === 'withdraw') {
            return abs($this->hours);
        }
    }

    public function getReversedFormattedHoursAttribute()
    {
        if ($this->type === 'deposit') {
            return abs($this->hours);
        } elseif ($this->type === 'withdraw') {
            return -abs($this->hours);
        }
    }

}
