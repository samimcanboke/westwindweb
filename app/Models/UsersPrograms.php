<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UsersPrograms extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'program_id',
        'name',
        'username',
        'password',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function program()
    {
        return $this->belongsTo(Program::class);
    }
}
