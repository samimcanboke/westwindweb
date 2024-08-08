<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UsersAdvance extends Model
{
    use HasFactory;

    public $fillable = ['user_id', 'transaction_date', 'amount'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
