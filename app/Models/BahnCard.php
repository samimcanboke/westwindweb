<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BahnCard extends Model
{
    use HasFactory;

    protected $fillable = ['number', 'valid_from', 'valid_to', 'class', 'user_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
