<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSalary extends Model
{
    protected $fillable = [
        'user_id',
        'salary',
        'valid_from',
        'valid_to',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}